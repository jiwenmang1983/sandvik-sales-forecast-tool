using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public CustomersController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetCustomers([FromQuery] string? status, [FromQuery] string? keyword)
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

            var query = _db.Customers.Where(c => c.Brand == userBrand);

            if (!string.IsNullOrEmpty(status))
            {
                var isActive = status == "active";
                query = query.Where(c => c.IsActive == isActive);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(c => c.CustomerName.Contains(keyword) || c.CustomerCode.Contains(keyword));
            }

            return Ok(new { success = true, data = await query.ToListAsync() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetCustomer(string id)
    {
        try
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { success = false, message = "Customer not found" });
            return Ok(new { success = true, data = customer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}