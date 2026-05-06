using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Api.DTOs;
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

    // POST /api/invoice-companies
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateInvoiceCompanyDto dto)
    {
        var company = new InvoiceCompany
        {
            CompanyCode = dto.CompanyCode,
            CompanyName = dto.CompanyName,
            TaxNumber = dto.TaxNumber,
            BankAccount = dto.BankAccount ?? string.Empty,
            Address = dto.Address ?? string.Empty,
            Phone = dto.Phone ?? string.Empty,
            IsActive = dto.IsActive
        };

        _db.InvoiceCompanies.Add(company);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = company.Id }, new { success = true, data = company });
    }

    // PUT /api/invoice-companies/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] UpdateInvoiceCompanyDto dto)
    {
        var company = await _db.InvoiceCompanies
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (company == null)
            return NotFound(new { success = false, message = "Invoice company not found" });

        if (dto.CompanyCode != null) company.CompanyCode = dto.CompanyCode;
        if (dto.CompanyName != null) company.CompanyName = dto.CompanyName;
        if (dto.TaxNumber != null) company.TaxNumber = dto.TaxNumber;
        if (dto.BankAccount != null) company.BankAccount = dto.BankAccount;
        if (dto.Address != null) company.Address = dto.Address;
        if (dto.Phone != null) company.Phone = dto.Phone;
        if (dto.IsActive.HasValue) company.IsActive = dto.IsActive.Value;
        company.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = company });
    }

    // DELETE /api/invoice-companies/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var company = await _db.InvoiceCompanies
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (company == null)
            return NotFound(new { success = false, message = "Invoice company not found" });

        company.IsDeleted = true;
        company.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Invoice company deleted" });
    }
}