using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;
using System.Text.Json;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/approval-flow")]
[Authorize]
public class ApprovalFlowController : ControllerBase
{
    private readonly SandvikDbContext _db;
    private readonly IEmailQueueService _emailQueueService;

    public ApprovalFlowController(SandvikDbContext db, IEmailQueueService emailQueueService)
    {
        _db = db;
        _emailQueueService = emailQueueService;
    }

    [HttpPost("start")]
    public async Task<ActionResult> StartApproval([FromBody] StartApprovalRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        try
        {
            var approval = new ApprovalRequest
            {
                ForecastPeriodId = req.ForecastPeriodId,
                UserId = userId,
                RegionId = req.RegionId ?? "",
                Status = "Pending"
            };
            _db.ApprovalRequests.Add(approval);
            await _db.SaveChangesAsync();

            return Ok(new { success = true, approvalId = approval.Id });
        }
        catch (Exception ex)
        {
            var inner = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(500, new { success = false, message = inner });
        }
    }

    [HttpGet("my")]
    public async Task<ActionResult> GetMyApprovals()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var approvals = await _db.ApprovalRequests
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new {
                a.Id,
                a.ForecastPeriodId,
                a.RegionId,
                a.Status,
                a.Comments,
                CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            })
            .ToListAsync();

        return Ok(new { success = true, data = approvals });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetApprovalDetail(int id)
    {
        var approval = await _db.ApprovalRequests
            .FirstOrDefaultAsync(a => a.Id == id);

        if (approval == null)
            return NotFound(new { success = false, message = "Approval request not found" });

        var histories = await _db.ApprovalHistories
            .Where(h => h.ApprovalRequestId == id)
            .OrderBy(h => h.OperatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = new { approval, histories } });
    }

    [HttpGet("{id}/history")]
    public async Task<ActionResult> GetApprovalHistory(int id)
    {
        var histories = await _db.ApprovalHistories
            .Where(h => h.ApprovalRequestId == id)
            .OrderByDescending(h => h.OperatedAt)
            .ToListAsync();

        var stringUserIds = histories.Select(h => h.OperatorUserId).Distinct().ToList();
        var userMap = await _db.Users
            .Where(u => stringUserIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.DisplayName);

        var result = histories.Select(h => new {
            h.Id,
            h.ApprovalRequestId,
            h.Action,
            h.OperatorUserId,
            OperatorName = userMap.GetValueOrDefault(h.OperatorUserId, $"User {h.OperatorUserId}"),
            OperatedAt = h.OperatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            h.Comments,
            h.AdjustOrderAmount,
            h.AdjustInvoiceAmount,
            h.AdjustOrderQty,
            h.AdjustInvoiceQty
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    [HttpPost("submit")]
    public async Task<ActionResult> SubmitApproval([FromBody] ApprovalActionRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var approval = await _db.ApprovalRequests.FindAsync(req.ApprovalRequestId);
        if (approval == null)
            return NotFound(new { success = false, message = "Approval request not found" });

        var user = await _db.Users.FindAsync(userId);
        var period = await _db.ForecastPeriods.FindAsync(approval.ForecastPeriodId);

        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "SUBMIT",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments
        };
        _db.ApprovalHistories.Add(history);
        approval.Status = "Pending";
        await _db.SaveChangesAsync();

        var nextApproverEmail = await GetNextApproverEmailAsync(approval);
        if (!string.IsNullOrEmpty(nextApproverEmail))
        {
            var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
            var operatorName = user?.UserName ?? userId;
            var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                { "periodName", periodFcName },
                { "submitter", operatorName },
                { "action", "SUBMIT" },
                { "comments", req.Comments ?? "" }
            });
            await _emailQueueService.QueueEmailAsync(
                nextApproverEmail,
                null,
                $"审批请求 - {periodFcName}",
                $"{operatorName} 提交了预测数据，等待您的审批",
                null,
                templateVars);
        }

        return Ok(new { success = true, message = "Submitted for approval" });
    }

    [HttpPost("approve")]
    public async Task<ActionResult> ApproveApproval([FromBody] ApprovalActionRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var approval = await _db.ApprovalRequests.FindAsync(req.ApprovalRequestId);
        if (approval == null)
            return NotFound(new { success = false, message = "Approval request not found" });

        var user = await _db.Users.FindAsync(userId);
        var period = await _db.ForecastPeriods.FindAsync(approval.ForecastPeriodId);

        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "APPROVE",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments
        };
        _db.ApprovalHistories.Add(history);
        approval.Status = "Approved";
        approval.Comments = req.Comments;
        await _db.SaveChangesAsync();

        var submitter = await _db.Users.FindAsync(approval.UserId);
        if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
        {
            var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
            var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                { "periodName", periodFcName },
                { "submitter", submitter.UserName ?? approval.UserId },
                { "action", "APPROVE" },
                { "comments", req.Comments ?? "" }
            });
            await _emailQueueService.QueueEmailAsync(
                submitter.Email,
                null,
                $"审批通过 - {periodFcName}",
                $"您的预测数据已通过审批",
                null,
                templateVars);
        }

        return Ok(new { success = true, message = "Approved" });
    }

    [HttpPost("reject")]
    public async Task<ActionResult> RejectApproval([FromBody] ApprovalActionRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var approval = await _db.ApprovalRequests.FindAsync(req.ApprovalRequestId);
        if (approval == null)
            return NotFound(new { success = false, message = "Approval request not found" });

        var user = await _db.Users.FindAsync(userId);
        var period = await _db.ForecastPeriods.FindAsync(approval.ForecastPeriodId);

        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "REJECT",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments
        };
        _db.ApprovalHistories.Add(history);
        approval.Status = "Rejected";
        approval.Comments = req.Comments;
        await _db.SaveChangesAsync();

        var submitter = await _db.Users.FindAsync(approval.UserId);
        if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
        {
            var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
            var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                { "periodName", periodFcName },
                { "submitter", submitter.UserName ?? approval.UserId },
                { "action", "REJECT" },
                { "comments", req.Comments ?? "" }
            });
            await _emailQueueService.QueueEmailAsync(
                submitter.Email,
                null,
                $"审批驳回 - {periodFcName}",
                $"您的预测数据被驳回，原因：{req.Comments ?? "无"}",
                null,
                templateVars);
        }

        return Ok(new { success = true, message = "Rejected" });
    }

    [HttpPost("adjust")]
    public async Task<ActionResult> AdjustApproval([FromBody] AdjustApprovalRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var approval = await _db.ApprovalRequests.FindAsync(req.ApprovalRequestId);
        if (approval == null)
            return NotFound(new { success = false, message = "Approval request not found" });

        var user = await _db.Users.FindAsync(userId);
        var period = await _db.ForecastPeriods.FindAsync(approval.ForecastPeriodId);

        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "ADJUST",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments,
            AdjustOrderAmount = req.AdjustOrderAmount,
            AdjustInvoiceAmount = req.AdjustInvoiceAmount,
            AdjustOrderQty = req.AdjustOrderQty,
            AdjustInvoiceQty = req.AdjustInvoiceQty
        };
        _db.ApprovalHistories.Add(history);
        approval.Status = "Adjusted";
        approval.Comments = req.Comments;
        await _db.SaveChangesAsync();

        var submitter = await _db.Users.FindAsync(approval.UserId);
        if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
        {
            var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
            var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                { "periodName", periodFcName },
                { "submitter", submitter.UserName ?? approval.UserId },
                { "action", "ADJUST" },
                { "comments", req.Comments ?? "" }
            });
            await _emailQueueService.QueueEmailAsync(
                submitter.Email,
                null,
                $"数据调整 - {periodFcName}",
                "您的预测数据已被调整",
                null,
                templateVars);
        }

        return Ok(new { success = true, message = "Adjusted" });
    }

    private async Task<string?> GetNextApproverEmailAsync(ApprovalRequest approval)
    {
        var submitter = await _db.Users.FindAsync(approval.UserId);
        if (submitter == null || string.IsNullOrEmpty(submitter.Email))
            return null;

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == submitter.Email && o.Status == "Active")
            .FirstOrDefaultAsync();

        if (orgNode == null || !orgNode.ParentId.HasValue)
            return null;

        var parentNode = await _db.OrgNodes.FindAsync(orgNode.ParentId.Value);
        return parentNode?.Email;
    }
}

public record StartApprovalRequest(string ForecastPeriodId, string? RegionId = null);
public record ApprovalActionRequest(int ApprovalRequestId, string? Comments = null);
public record AdjustApprovalRequest(int ApprovalRequestId, string? Comments = null,
    decimal? AdjustOrderAmount = null, decimal? AdjustInvoiceAmount = null,
    decimal? AdjustOrderQty = null, decimal? AdjustInvoiceQty = null);
