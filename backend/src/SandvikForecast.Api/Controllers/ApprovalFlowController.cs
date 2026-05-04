using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Api.Services;
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
    private readonly IApprovalFlowNodeConfigService _nodeConfigService;

    // 审批节点级别定义
    private const string LEVEL_SALES = "销售";        // 提交者
    private const string LEVEL_MANAGER = "直线经理";   // 第一级审批
    private const string LEVEL_REGION_DIRECTOR = "区域总监"; // 第二级审批
    private const string LEVEL_CEO = "总经理";        // 最高级审批

    public ApprovalFlowController(SandvikDbContext db, IEmailQueueService emailQueueService, IApprovalFlowNodeConfigService nodeConfigService)
    {
        _db = db;
        _emailQueueService = emailQueueService;
        _nodeConfigService = nodeConfigService;
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

        try
        {
            var approvals = await _db.ApprovalRequests
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Id)
                .Select(a => new {
                    a.Id,
                    a.ForecastPeriodId,
                    a.RegionId,
                    a.Status,
                    a.CurrentNodeLevel,
                    a.Comments
                })
                .ToListAsync();

            return Ok(new { success = true, data = approvals });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message, type = ex.GetType().Name });
        }
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

    [HttpGet("history/{id}")]
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
            h.AdjustInvoiceQty,
            h.ToLevel
        }).ToList();

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// T-024: 提交审批 - 从退回节点继续或从直线经理开始
    /// Q16: 提交后自动推进到上一层审批人
    /// Q19: 重新提交从退回节点继续
    /// </summary>
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

        // 检查是否是重新提交（从退回恢复）
        bool isResubmit = approval.Status == "PendingReview" && !string.IsNullOrEmpty(approval.ReturnedToNodeLevel);
        
        string currentLevel;
        string? nextApproverEmail;

        if (isResubmit)
        {
            // Q19: 从被退回的节点继续往上走
            currentLevel = approval.ReturnedToNodeLevel!;
            approval.ReturnedToNodeLevel = null; // 清除退回标记
            nextApproverEmail = await GetNextApproverEmailByLevelAsync(approval.UserId, currentLevel);
        }
        else
        {
            // 首次提交：从直线经理开始
            currentLevel = LEVEL_MANAGER;
            nextApproverEmail = await GetFirstApproverEmailAsync(approval.UserId);
        }

        // 记录提交历史
        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "SUBMIT",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = isResubmit ? $"重新提交（从{currentLevel}继续）" : req.Comments
        };
        _db.ApprovalHistories.Add(history);

        // 更新审批请求状态
        approval.Status = "Pending";
        approval.CurrentNodeLevel = currentLevel;
        approval.CurrentApproverEmail = nextApproverEmail;

        await _db.SaveChangesAsync();

        // 发送邮件通知当前审批人
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
                $"{operatorName} 提交了预测数据，等待您的审批（{currentLevel}）",
                null,
                templateVars);
        }

        return Ok(new { success = true, message = "Submitted for approval", currentLevel, nextApproverEmail });
    }

    /// <summary>
    /// T-024: 审批通过 - 自动推进到上一层审批人
    /// Q16: 审批通过后自动推进到上一层，无需手动
    /// </summary>
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

        // 记录审批通过历史
        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "APPROVE",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments,
            ToLevel = approval.CurrentNodeLevel // 记录当前节点级别
        };
        _db.ApprovalHistories.Add(history);

        // Q16: 自动推进到上一层审批人
        var currentLevel = approval.CurrentNodeLevel ?? LEVEL_MANAGER;
        var (nextLevel, nextApproverEmail) = await GetNextLevelAndApproverAsync(approval.UserId, currentLevel);

        if (string.IsNullOrEmpty(nextApproverEmail) || nextLevel == LEVEL_CEO)
        {
            // 已是最高级别，审批完成
            approval.Status = "Approved";
            approval.CurrentNodeLevel = LEVEL_CEO;
            approval.CurrentApproverEmail = null;
        }
        else
        {
            // 推进到下一级审批人
            approval.Status = "Pending";
            approval.CurrentNodeLevel = nextLevel;
            approval.CurrentApproverEmail = nextApproverEmail;
        }

        await _db.SaveChangesAsync();

        // 通知下一级审批人或申请人（审批完成）
        if (approval.Status == "Approved")
        {
            // 通知申请人审批通过
            var submitter = await _db.Users.FindAsync(approval.UserId);
            if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
            {
                var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
                var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    { "periodName", periodFcName },
                    { "submitter", submitter.UserName ?? approval.UserId },
                    { "action", "APPROVED" },
                    { "comments", req.Comments ?? "" }
                });
                await _emailQueueService.QueueEmailAsync(
                    submitter.Email,
                    null,
                    $"审批通过 - {periodFcName}",
                    $"您的预测数据已通过全部审批",
                    null,
                    templateVars);
            }
        }
        else
        {
            // 通知下一级审批人
            var submitter = await _db.Users.FindAsync(approval.UserId);
            if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
            {
                var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
                var operatorName = user?.UserName ?? userId;
                var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    { "periodName", periodFcName },
                    { "submitter", submitter.UserName ?? approval.UserId },
                    { "action", "APPROVE" },
                    { "comments", req.Comments ?? "" },
                    { "approvedBy", operatorName }
                });
                await _emailQueueService.QueueEmailAsync(
                    nextApproverEmail!,
                    null,
                    $"审批请求 - {periodFcName}",
                    $"{operatorName} 已审批通过，等待您的审批（{nextLevel}）",
                    null,
                    templateVars);
            }
        }

        return Ok(new { success = true, message = "Approved and auto-advanced", currentLevel = approval.CurrentNodeLevel, status = approval.Status });
    }

    /// <summary>
    /// T-024: 审批退回 - 一层一层往回退
    /// Q18: 退回是一层一层往回退（不是跳级退到原点）
    /// </summary>
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

        var currentLevel = approval.CurrentNodeLevel ?? LEVEL_MANAGER;

        // Q18: 退回是一层一层往回退 - 找到下一级（更低层级）的审批人
        var (previousLevel, previousApproverEmail) = await GetPreviousLevelAndApproverAsync(approval.UserId, currentLevel);

        // 记录退回历史，包含退回的目标层级
        var history = new ApprovalHistory
        {
            ApprovalRequestId = req.ApprovalRequestId,
            Action = "RETURNED",
            OperatorUserId = userId,
            OperatedAt = DateTime.UtcNow,
            Comments = req.Comments,
            ToLevel = previousLevel // 退回的目标层级
        };
        _db.ApprovalHistories.Add(history);

        if (string.IsNullOrEmpty(previousApproverEmail) || previousLevel == LEVEL_SALES)
        {
            // 退回到销售（原点）- 需要销售重新修改后提交
            approval.Status = "PendingReview";
            approval.CurrentNodeLevel = null;
            approval.CurrentApproverEmail = null;
            approval.ReturnedToNodeLevel = LEVEL_SALES; // 退回到销售节点
        }
        else
        {
            // Q18: 一层一层退 - 退到直线经理
            approval.Status = "PendingReview";
            approval.CurrentNodeLevel = previousLevel;
            approval.CurrentApproverEmail = previousApproverEmail;
            approval.ReturnedToNodeLevel = previousLevel; // 记录被退回到的节点
        }

        await _db.SaveChangesAsync();

        // 通知被退回的人
        if (previousLevel == LEVEL_SALES)
        {
            // 退回到销售，通知销售
                var submitter = await _db.Users.FindAsync(approval.UserId);
            if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
            {
                var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
                var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
                {
                    { "periodName", periodFcName },
                    { "submitter", submitter.UserName ?? approval.UserId },
                    { "action", "RETURNED" },
                    { "comments", req.Comments ?? "" },
                    { "returnedBy", user?.UserName ?? userId }
                });
                await _emailQueueService.QueueEmailAsync(
                    submitter.Email,
                    null,
                    $"审批驳回 - {periodFcName}",
                    $"您的预测数据被驳回，请修改后重新提交",
                    null,
                    templateVars);
            }
        }
        else
        {
            // 退回到直线经理，通知直线经理
            var periodFcName = period?.FcName ?? approval.ForecastPeriodId;
            var submitter = await _db.Users.FindAsync(approval.UserId);
            var templateVars = JsonSerializer.Serialize(new Dictionary<string, string>
            {
                { "periodName", periodFcName },
                { "submitter", submitter?.UserName ?? approval.UserId },
                { "action", "RETURNED" },
                { "comments", req.Comments ?? "" },
                { "returnedBy", user?.UserName ?? userId }
            });
            if (!string.IsNullOrEmpty(previousApproverEmail))
            {
                await _emailQueueService.QueueEmailAsync(
                    previousApproverEmail,
                    null,
                    $"审批退回 - {periodFcName}",
                    $"预测数据被退回给您（{previousLevel}），请审批后继续或再次退回",
                    null,
                    templateVars);
            }
        }

        return Ok(new { success = true, message = "Returned to previous level", returnedToLevel = previousLevel, status = approval.Status });
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

        // T-022: Check if user can modify data at their approval node level
        var hasDataChanges = req.AdjustOrderAmount.HasValue || req.AdjustInvoiceAmount.HasValue 
            || req.AdjustOrderQty.HasValue || req.AdjustInvoiceQty.HasValue;
        if (hasDataChanges)
        {
            var userNodeLevel = await GetUserNodeLevelAsync(userId);
            if (userNodeLevel != null)
            {
                var canModify = await _nodeConfigService.CanModifyDataAsync(null, userNodeLevel); // null = global config
                if (!canModify)
                    return StatusCode(403, new { success = false, message = "该审批节点不允许修改明细数据" });
            }
        }

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

    /// <summary>
    /// T-022: 根据用户的OrgNode Role获取对应的审批节点级别
    /// </summary>
    private async Task<string?> GetUserNodeLevelAsync(string userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null || string.IsNullOrEmpty(user.Email))
            return null;

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == user.Email && o.Status == "Active")
            .FirstOrDefaultAsync();

        if (orgNode == null)
            return null;

        // OrgNode.Role映射到NodeLevel
        // MANAGER -> 直线经理, REGION_DIRECTOR -> 区域总监, CEO -> 总经理
        return orgNode.Role switch
        {
            "MANAGER" or "DIRECTOR" => LEVEL_MANAGER,
            "REGION_DIRECTOR" or "VP_SALES" => LEVEL_REGION_DIRECTOR,
            "CEO" or "SYS_ADMIN" => LEVEL_CEO,
            _ => null
        };
    }

    /// <summary>
    /// 获取提交者的第一个审批人（直线经理）的邮箱
    /// </summary>
    private async Task<string?> GetFirstApproverEmailAsync(string userId)
    {
        var submitter = await _db.Users.FindAsync(userId);
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

    /// <summary>
    /// 根据当前级别获取下一级审批人和节点
    /// Q16: 审批通过后自动推进到上一层
    /// </summary>
    private async Task<(string level, string? email)> GetNextLevelAndApproverAsync(string userId, string currentLevel)
    {
        var submitter = await _db.Users.FindAsync(userId);
        if (submitter == null || string.IsNullOrEmpty(submitter.Email))
            return (currentLevel, null);

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == submitter.Email && o.Status == "Active")
            .FirstOrDefaultAsync();

        if (orgNode == null)
            return (currentLevel, null);

        switch (currentLevel)
        {
            case LEVEL_MANAGER:
                // 直线经理 -> 区域总监
                var regionDirectorNode = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "REGION_DIRECTOR", "VP_SALES" });
                if (regionDirectorNode != null)
                    return (LEVEL_REGION_DIRECTOR, regionDirectorNode.Email);
                // 没有区域总监，直接到CEO
                var ceoNode1 = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "CEO", "SYS_ADMIN" });
                if (ceoNode1 != null)
                    return (LEVEL_CEO, ceoNode1.Email);
                break;

            case LEVEL_REGION_DIRECTOR:
                // 区域总监 -> 总经理/CEO
                var ceoNode2 = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "CEO", "SYS_ADMIN" });
                if (ceoNode2 != null)
                    return (LEVEL_CEO, ceoNode2.Email);
                break;
        }

        return (currentLevel, null);
    }

    /// <summary>
    /// 根据当前级别获取上一级（退回目标）审批人和节点
    /// Q18: 退回是一层一层往回退（不是跳级退到原点）
    /// </summary>
    private async Task<(string level, string? email)> GetPreviousLevelAndApproverAsync(string userId, string currentLevel)
    {
        var submitter = await _db.Users.FindAsync(userId);
        if (submitter == null || string.IsNullOrEmpty(submitter.Email))
            return (LEVEL_SALES, null);

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == submitter.Email && o.Status == "Active")
            .FirstOrDefaultAsync();

        if (orgNode == null)
            return (LEVEL_SALES, null);

        switch (currentLevel)
        {
            case LEVEL_REGION_DIRECTOR:
                // 区域总监 -> 直线经理
                var managerNode = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "MANAGER", "DIRECTOR" });
                if (managerNode != null)
                    return (LEVEL_MANAGER, managerNode.Email);
                // 没有直线经理，退回到销售
                break;

            case LEVEL_MANAGER:
                // 直线经理 -> 销售（原点）
                break;

            case LEVEL_CEO:
                // CEO -> 区域总监
                var regionDirectorNode = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "REGION_DIRECTOR", "VP_SALES" });
                if (regionDirectorNode != null)
                    return (LEVEL_REGION_DIRECTOR, regionDirectorNode.Email);
                // 没有区域总监，退回到直线经理
                var managerNode2 = await GetParentNodeRecursivelyAsync(orgNode.Id, new[] { "MANAGER", "DIRECTOR" });
                if (managerNode2 != null)
                    return (LEVEL_MANAGER, managerNode2.Email);
                break;
        }

        return (LEVEL_SALES, null);
    }

    /// <summary>
    /// 根据特定级别获取审批人邮箱（用于重新提交时继续）
    /// </summary>
    private async Task<string?> GetNextApproverEmailByLevelAsync(string userId, string targetLevel)
    {
        var submitter = await _db.Users.FindAsync(userId);
        if (submitter == null || string.IsNullOrEmpty(submitter.Email))
            return null;

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == submitter.Email && o.Status == "Active")
            .FirstOrDefaultAsync();

        if (orgNode == null)
            return null;

        return targetLevel switch
        {
            LEVEL_MANAGER => await GetDirectManagerEmailAsync(orgNode),
            LEVEL_REGION_DIRECTOR => await GetParentNodeEmailByRoleAsync(orgNode.Id, new[] { "REGION_DIRECTOR", "VP_SALES" }),
            LEVEL_CEO => await GetParentNodeEmailByRoleAsync(orgNode.Id, new[] { "CEO", "SYS_ADMIN" }),
            _ => null
        };
    }

    /// <summary>
    /// 递归向上找到具有指定角色的父节点
    /// </summary>
    private async Task<OrgNode?> GetParentNodeRecursivelyAsync(int nodeId, string[] targetRoles)
    {
        var node = await _db.OrgNodes.FindAsync(nodeId);
        if (node == null || !node.ParentId.HasValue)
            return null;

        var parentNode = await _db.OrgNodes.FindAsync(node.ParentId.Value);
        if (parentNode == null)
            return null;

        if (targetRoles.Contains(parentNode.Role))
            return parentNode;

        return await GetParentNodeRecursivelyAsync(parentNode.Id, targetRoles);
    }

    /// <summary>
    /// 获取直属经理的邮箱
    /// </summary>
    private async Task<string?> GetDirectManagerEmailAsync(OrgNode node)
    {
        if (!node.ParentId.HasValue)
            return null;

        var parentNode = await _db.OrgNodes.FindAsync(node.ParentId.Value);
        return parentNode?.Email;
    }

    /// <summary>
    /// 根据角色获取父节点邮箱
    /// </summary>
    private async Task<string?> GetParentNodeEmailByRoleAsync(int nodeId, string[] targetRoles)
    {
        var node = await _db.OrgNodes.FindAsync(nodeId);
        if (node == null || !node.ParentId.HasValue)
            return null;

        var parentNode = await _db.OrgNodes.FindAsync(node.ParentId.Value);
        if (parentNode == null)
            return null;

        if (targetRoles.Contains(parentNode.Role))
            return parentNode.Email;

        // 递归向上查找
        var foundNode = await GetParentNodeRecursivelyAsync(node.Id, targetRoles);
        return foundNode?.Email;
    }
}

public record StartApprovalRequest(string ForecastPeriodId, string? RegionId = null);
public record ApprovalActionRequest(int ApprovalRequestId, string? Comments = null);
public record AdjustApprovalRequest(int ApprovalRequestId, string? Comments = null,
    decimal? AdjustOrderAmount = null, decimal? AdjustInvoiceAmount = null,
    decimal? AdjustOrderQty = null, decimal? AdjustInvoiceQty = null);
