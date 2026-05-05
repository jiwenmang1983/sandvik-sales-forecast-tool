using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/invoice-companies")]
[Authorize]
public class InvoiceCompanyController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public InvoiceCompanyController(SandvikDbContext db) => _db = db;

    // GET /api/invoice-companies
    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var companies = await _db.InvoiceCompanies
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderBy(c => c.CompanyName)
            .ToListAsync();

        return Ok(new { success = true, data = companies });
    }

    // GET /api/invoice-companies/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id)
    {
        var company = await _db.InvoiceCompanies
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (company == null)
            return NotFound(new { success = false, message = "Invoice company not found" });

        return Ok(new { success = true, data = company });
    }
}