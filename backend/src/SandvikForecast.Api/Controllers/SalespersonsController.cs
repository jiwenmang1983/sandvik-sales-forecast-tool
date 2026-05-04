using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/salespersons")]
[Authorize]
public class SalespersonsController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public SalespersonsController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetSalespersons([FromQuery] string? region, [FromQuery] string? status, [FromQuery] string? keyword)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userBrand = "Sandvik";

            if (!string.IsNullOrEmpty(userIdClaim))
            {
                var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
                if (dbUser != null && !string.IsNullOrEmpty(dbUser.Brand))
                    userBrand = dbUser.Brand;
            }

            var query = _db.Users.Where(u => u.Brand == userBrand && u.Role == "SALES");

            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status == "active";
                query = query.Where(u => u.IsActive == isActive);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                var k = keyword.ToLower();
                query = query.Where(u => u.DisplayName.ToLower().Contains(k) || u.Email.ToLower().Contains(k));
            }

            var result = await query.Select(u => new {
                u.Id,
                u.DisplayName,
                u.Email,
                u.Role,
                u.IsActive,
                Region = (string?)null
            }).ToListAsync();

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}