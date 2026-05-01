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

    [HttpGet("template")]
    public async Task<ActionResult> GetTemplate()
    {
        var csv = "Customer,InvoiceCompany,Product,Amount,Notes\n";
        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", "forecast_template.csv");
    }

    [HttpGet("export")]
    public async Task<ActionResult> ExportData([FromQuery] string? periodId)
    {
        var records = await _recordRepo.GetAllAsync();
        if (!string.IsNullOrEmpty(periodId))
            records = records.Where(r => r.ForecastPeriodId == periodId).ToList();

        var lines = new List<string> { "Customer,InvoiceCompany,Product,Year,Month,Amount,Notes" };
        foreach (var r in records)
        {
            lines.Add($"{r.CustomerId},{r.InvoiceCompanyId},{r.ProductId},{r.Year},{r.Month},{r.Amount},{r.Notes ?? ""}");
        }
        var csv = string.Join("\n", lines);
        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"forecast_export_{periodId ?? "all"}.csv");
    }

    [HttpPost("import")]
    public async Task<ActionResult> ImportData([FromBody] List<ImportRecordRequest> records)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var imported = 0;
        foreach (var req in records)
        {
            var record = new ForecastRecord
            {
                ForecastPeriodId = req.ForecastPeriodId,
                CustomerId = req.CustomerId,
                InvoiceCompanyId = req.InvoiceCompanyId,
                ProductId = req.ProductId,
                Year = req.Year,
                Month = req.Month,
                Amount = req.Amount,
                Notes = req.Notes,
                CreatedByUserId = userId,
                Status = "Draft"
            };
            await _recordRepo.AddAsync(record);
            imported++;
        }
        return Ok(new { success = true, importedCount = imported });
    }

    [HttpPost("submit")]
    public async Task<ActionResult> SubmitForecast([FromBody] SubmitRequest req)
    {
        var records = await _recordRepo.GetAllAsync();
        var periodRecords = records.Where(r => r.ForecastPeriodId == req.PeriodId).ToList();
        foreach (var record in periodRecords)
        {
            record.Status = "Submitted";
        }
        // Note: In a real app, you'd create an approval workflow record here
        return Ok(new { success = true, submittedCount = periodRecords.Count });
    }
}

public record CreateRecordRequest(string ForecastPeriodId, string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal Amount);
public record UpdateRecordRequest(decimal Amount, string? Notes, string Status);
public record ImportRecordRequest(string ForecastPeriodId, string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal Amount, string? Notes);
public record SubmitRequest(string PeriodId);
