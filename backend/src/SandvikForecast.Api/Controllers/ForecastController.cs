using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ForecastController : ControllerBase
{
    private readonly IRepository<ForecastPeriod> _periodRepo;
    private readonly IRepository<ForecastRecord> _recordRepo;

    public ForecastController(IRepository<ForecastPeriod> periodRepo, IRepository<ForecastRecord> recordRepo)
    {
        _periodRepo = periodRepo;
        _recordRepo = recordRepo;
    }

    [HttpGet("periods")]
    public async Task<ActionResult> GetPeriods()
    {
        var periods = await _periodRepo.GetAllAsync();
        return Ok(new { success = true, data = periods });
    }

    [HttpGet("periods/{id}")]
    public async Task<ActionResult> GetPeriod(string id)
    {
        var period = await _periodRepo.GetByIdAsync(id);
        if (period == null) return NotFound(new { success = false, message = "Period not found" });
        return Ok(new { success = true, data = period });
    }

    [HttpPost("periods")]
    public async Task<ActionResult> CreatePeriod([FromBody] ForecastPeriod period)
    {
        var created = await _periodRepo.AddAsync(period);
        return Ok(new { success = true, data = created });
    }

    [HttpGet("records")]
    public async Task<ActionResult> GetRecords([FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        var records = await _recordRepo.GetAllAsync();
        var filtered = records.AsEnumerable();
        if (!string.IsNullOrEmpty(periodId)) filtered = filtered.Where(r => r.ForecastPeriodId == periodId);
        if (year.HasValue) filtered = filtered.Where(r => r.Year == year.Value);
        if (month.HasValue) filtered = filtered.Where(r => r.Month == month.Value);
        return Ok(new { success = true, data = filtered.ToList() });
    }

    [HttpPost("records")]
    public async Task<ActionResult> CreateRecord([FromBody] CreateRecordRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var record = new ForecastRecord
        {
            ForecastPeriodId = req.ForecastPeriodId,
            CustomerId = req.CustomerId,
            InvoiceCompanyId = req.InvoiceCompanyId,
            ProductId = req.ProductId,
            Year = req.Year,
            Month = req.Month,
            Amount = req.Amount,
            CreatedByUserId = userId,
            Status = "Draft"
        };
        var created = await _recordRepo.AddAsync(record);
        return Ok(new { success = true, data = created });
    }

    [HttpPut("records/{id}")]
    public async Task<ActionResult> UpdateRecord(string id, [FromBody] UpdateRecordRequest req)
    {
        var record = await _recordRepo.GetByIdAsync(id);
        if (record == null) return NotFound(new { success = false, message = "Record not found" });
        record.Amount = req.Amount;
        record.Notes = req.Notes;
        record.Status = req.Status;
        await _recordRepo.UpdateAsync(record);
        return Ok(new { success = true, data = record });
    }

    [HttpDelete("records/{id}")]
    public async Task<ActionResult> DeleteRecord(string id)
    {
        await _recordRepo.DeleteAsync(id);
        return Ok(new { success = true, message = "Deleted" });
    }
}

public record CreateRecordRequest(string ForecastPeriodId, string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal Amount);
public record UpdateRecordRequest(decimal Amount, string? Notes, string Status);
