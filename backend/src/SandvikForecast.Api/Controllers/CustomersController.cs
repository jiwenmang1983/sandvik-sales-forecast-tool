using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Api.DTOs;
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

    [HttpPost]
    public async Task<ActionResult> CreateCustomer([FromBody] CreateCustomerDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerCode) || string.IsNullOrWhiteSpace(dto.CustomerName) || string.IsNullOrWhiteSpace(dto.Region))
                return BadRequest(new { success = false, message = "CustomerCode, CustomerName and Region are required" });

            var customer = new Customer
            {
                CustomerCode = dto.CustomerCode,
                CustomerName = dto.CustomerName,
                CustomerNameEn = dto.CustomerNameEn ?? string.Empty,
                Region = dto.Region,
                Brand = dto.Brand,
                SalesPersonId = dto.SalesPersonId,
                IsActive = dto.IsActive
            };

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            return Created($"/api/customers/{customer.Id}", new { success = true, data = customer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCustomer(string id, [FromBody] UpdateCustomerDto dto)
    {
        try
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { success = false, message = "Customer not found" });

            if (dto.CustomerCode != null) customer.CustomerCode = dto.CustomerCode;
            if (dto.CustomerName != null) customer.CustomerName = dto.CustomerName;
            if (dto.CustomerNameEn != null) customer.CustomerNameEn = dto.CustomerNameEn;
            if (dto.Region != null) customer.Region = dto.Region;
            if (dto.Brand != null) customer.Brand = dto.Brand;
            if (dto.SalesPersonId != null) customer.SalesPersonId = dto.SalesPersonId;
            if (dto.IsActive.HasValue) customer.IsActive = dto.IsActive.Value;

            await _db.SaveChangesAsync();

            return Ok(new { success = true, data = customer });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCustomer(string id)
    {
        try
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { success = false, message = "Customer not found" });

            customer.IsDeleted = true;
            customer.UpdatedAt = DateTime.UtcNow;

            var relatedRecords = await _db.ForecastRecords.Where(r => r.CustomerId == id && !r.IsDeleted).ToListAsync();
            foreach (var record in relatedRecords)
            {
                record.IsDeleted = true;
                record.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Customer and related forecast records soft deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}