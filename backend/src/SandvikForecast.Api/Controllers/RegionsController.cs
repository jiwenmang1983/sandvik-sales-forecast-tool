using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/regions")]
[Authorize]
public class RegionsController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public RegionsController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetRegions()
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

            var regions = await _db.Customers
                .Where(c => c.Brand == userBrand && !string.IsNullOrEmpty(c.Region))
                .Select(c => c.Region)
                .Distinct()
                .OrderBy(r => r)
                .Select(r => new { name = r })
                .ToListAsync();

            return Ok(new { success = true, data = regions });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}