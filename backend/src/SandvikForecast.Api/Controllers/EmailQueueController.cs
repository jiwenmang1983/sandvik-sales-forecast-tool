using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/email-queue")]
[Authorize(Roles = "SYS_ADMIN")]
public class EmailQueueController : ControllerBase
{
    private readonly SandvikDbContext _db;
    private readonly IEmailQueueService _emailQueueService;

    public EmailQueueController(SandvikDbContext db, IEmailQueueService emailQueueService)
    {
        _db = db;
        _emailQueueService = emailQueueService;
    }

    [HttpGet]
    public async Task<ActionResult> GetEmails([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.EmailQueueItems.OrderByDescending(e => e.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new
            {
                e.Id,
                e.ToEmail,
                e.CcEmail,
                e.Subject,
                e.Body,
                e.Status,
                e.RetryCount,
                CreatedAt = e.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                SentAt = e.SentAt.HasValue ? e.SentAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : null,
                e.ErrorMessage
            })
            .ToListAsync();

        return Ok(new { success = true, data = items, total });
    }

    [HttpPost("{id}/resend")]
    public async Task<ActionResult> ResendEmail(int id)
    {
        var success = await _emailQueueService.ResendEmailAsync(id);
        if (!success)
            return NotFound(new { success = false, message = "Email queue item not found" });

        return Ok(new { success = true, message = "Email queued for resend" });
    }
}
