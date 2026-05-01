using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using System.Linq.Expressions;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/logs")]
[Authorize]
public class LogsController : ControllerBase
{
    private readonly IRepository<OpLog> _opLogRepo;
    private readonly IRepository<LoginLog> _loginLogRepo;
    private readonly SandvikDbContext _context;

    public LogsController(
        IRepository<OpLog> opLogRepo,
        IRepository<LoginLog> loginLogRepo,
        SandvikDbContext context)
    {
        _opLogRepo = opLogRepo;
        _loginLogRepo = loginLogRepo;
        _context = context;
    }

    // GET /api/logs/system - returns system operation logs (OpLogs table)
    // Query params: ?page=1&pageSize=20&keyword=&startDate=&endDate=&type=
    [HttpGet("system")]
    public async Task<ActionResult> GetSystemLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? keyword = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] string? type = null)
    {
        try
        {
            var query = _context.OpLogs.Where(o => !o.IsDeleted);

            // Filter by keyword (searches in Action, Detail, UserId)
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(o => 
                    (o.Action != null && o.Action.ToLower().Contains(keyword)) ||
                    (o.Detail != null && o.Detail.ToLower().Contains(keyword)) ||
                    (o.UserId != null && o.UserId.ToLower().Contains(keyword)));
            }

            // Filter by type (action)
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(o => o.Action == type);
            }

            // Filter by date range
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
            {
                query = query.Where(o => o.CreatedAt >= start);
            }
            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
            {
                query = query.Where(o => o.CreatedAt <= end.AddDays(1));
            }

            // Get total count
            var total = await query.CountAsync();

            // Apply pagination
            var logs = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    id = o.Id,
                    userId = o.UserId,
                    userName = o.UserId, // Using UserId as display name since OpLog doesn't have UserName
                    action = o.Action,
                    type = o.Action,
                    module = o.EntityType,
                    details = o.Detail,
                    ipAddress = o.IpAddress,
                    createdAt = o.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    success = true // OpLog doesn't have success field, default to true
                })
                .ToListAsync();

            return Ok(new { success = true, data = logs, total });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/logs/login - returns login history (LoginLogs table)
    // Query params: ?page=1&pageSize=20&keyword=
    [HttpGet("login")]
    public async Task<ActionResult> GetLoginLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? keyword = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] bool? success = null)
    {
        try
        {
            var query = _context.LoginLogs.Where(l => !l.IsDeleted);

            // Filter by keyword (searches in UserName, UserId, IpAddress)
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(l => 
                    (l.UserName != null && l.UserName.ToLower().Contains(keyword)) ||
                    (l.UserId != null && l.UserId.ToLower().Contains(keyword)) ||
                    (l.IpAddress != null && l.IpAddress.ToLower().Contains(keyword)));
            }

            // Filter by date range
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
            {
                query = query.Where(l => l.CreatedAt >= start);
            }
            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
            {
                query = query.Where(l => l.CreatedAt <= end.AddDays(1));
            }

            // Filter by success status
            if (success.HasValue)
            {
                query = query.Where(l => l.Success == success.Value);
            }

            // Get total count
            var total = await query.CountAsync();

            // Get success and fail counts for summary
            var successCount = await query.CountAsync(l => l.Success);
            var failCount = total - successCount;

            // Apply pagination
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new
                {
                    id = l.Id,
                    userId = l.UserId,
                    userName = l.UserName,
                    account = l.UserName, // Frontend uses 'account' field
                    email = l.UserId + "@sandvik.com", // Placeholder email
                    loginTime = l.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    ip = l.IpAddress,
                    status = l.Success ? "success" : "fail",
                    success = l.Success,
                    browser = l.UserAgent,
                    failReason = l.FailureReason,
                    createdAt = l.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                })
                .ToListAsync();

            return Ok(new { 
                success = true, 
                data = logs, 
                total,
                successCount,
                failCount
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/logs/system/{id} - deletes a system log entry
    [HttpDelete("system/{id}")]
    public async Task<ActionResult> DeleteSystemLog(string id)
    {
        try
        {
            var log = await _opLogRepo.GetByIdAsync(id);
            if (log == null)
                return NotFound(new { success = false, message = "System log not found" });

            await _opLogRepo.DeleteAsync(id);
            return Ok(new { success = true, message = "System log deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/logs/login/{id} - deletes a login log entry
    [HttpDelete("login/{id}")]
    public async Task<ActionResult> DeleteLoginLog(string id)
    {
        try
        {
            var log = await _loginLogRepo.GetByIdAsync(id);
            if (log == null)
                return NotFound(new { success = false, message = "Login log not found" });

            await _loginLogRepo.DeleteAsync(id);
            return Ok(new { success = true, message = "Login log deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}
