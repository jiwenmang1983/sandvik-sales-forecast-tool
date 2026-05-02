using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/approval-flow")]
[Authorize]
public class ApprovalFlowController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public ApprovalFlowController(SandvikDbContext db)
    {
        _db = db;
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
}

public record StartApprovalRequest(string ForecastPeriodId, string? RegionId = null);
