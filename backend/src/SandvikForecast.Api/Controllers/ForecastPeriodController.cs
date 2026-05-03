using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/forecast-periods")]
[Authorize]
public class ForecastPeriodController : ControllerBase
{
    private readonly IRepository<ForecastPeriod> _repo;

    public ForecastPeriodController(IRepository<ForecastPeriod> repo)
    {
        _repo = repo;
    }

    // GET /api/forecast-periods
    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var periods = await _repo.GetAllAsync();
        var dtos = periods.Select(MapToDto).ToList();
        return Ok(new { success = true, data = dtos });
    }

    // GET /api/forecast-periods/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id)
    {
        var period = await _repo.GetByIdAsync(id);
        if (period == null) return NotFound(new { success = false, message = "Period not found" });
        return Ok(new { success = true, data = MapToDto(period) });
    }

    // POST /api/forecast-periods
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePeriodRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FcName))
            return BadRequest(new { success = false, message = "FcName is required" });

        var period = new ForecastPeriod
        {
            FcName = req.FcName,
            FillTimeStart = req.FillTimeStart,
            FillTimeEnd = req.FillTimeEnd,
            PeriodStartYearMonth = req.PeriodStartYearMonth,
            PeriodEndYearMonth = req.PeriodEndYearMonth,
            ExtensionStart = req.ExtensionStart,
            ExtensionEnd = req.ExtensionEnd,
            ExtensionUsers = req.ExtensionUsers ?? "[]",
            Status = req.Status ?? "Draft"
        };

        var created = await _repo.AddAsync(period);
        return StatusCode(201, new { success = true, data = MapToDto(created) });
    }

    // PUT /api/forecast-periods/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] UpdatePeriodRequest req)
    {
        var period = await _repo.GetByIdAsync(id);
        if (period == null) return NotFound(new { success = false, message = "Period not found" });

        if (!string.IsNullOrWhiteSpace(req.FcName)) period.FcName = req.FcName;
        period.FillTimeStart = req.FillTimeStart;
        period.FillTimeEnd = req.FillTimeEnd;
        if (!string.IsNullOrWhiteSpace(req.PeriodStartYearMonth)) period.PeriodStartYearMonth = req.PeriodStartYearMonth;
        if (!string.IsNullOrWhiteSpace(req.PeriodEndYearMonth)) period.PeriodEndYearMonth = req.PeriodEndYearMonth;
        period.ExtensionStart = req.ExtensionStart;
        period.ExtensionEnd = req.ExtensionEnd;
        if (req.ExtensionUsers != null) period.ExtensionUsers = req.ExtensionUsers;
        if (!string.IsNullOrWhiteSpace(req.Status)) period.Status = req.Status;

        await _repo.UpdateAsync(period);
        return Ok(new { success = true, data = MapToDto(period) });
    }

    // DELETE /api/forecast-periods/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var period = await _repo.GetByIdAsync(id);
        if (period == null) return NotFound(new { success = false, message = "Period not found" });

        period.IsDeleted = true;
        await _repo.UpdateAsync(period);
        return Ok(new { success = true, message = "Period deleted" });
    }

    private static object MapToDto(ForecastPeriod p) => new
    {
        p.Id,
        p.FcName,
        p.FillTimeStart,
        p.FillTimeEnd,
        p.PeriodStartYearMonth,
        p.PeriodEndYearMonth,
        p.ExtensionStart,
        p.ExtensionEnd,
        p.ExtensionUsers,
        p.Status,
        p.CreatedAt
    };
}

// Request DTOs kept alongside controller
public record CreatePeriodRequest(
    string FcName,
    DateTime FillTimeStart,
    DateTime FillTimeEnd,
    string PeriodStartYearMonth,
    string PeriodEndYearMonth,
    DateTime? ExtensionStart,
    DateTime? ExtensionEnd,
    string? ExtensionUsers,
    string? Status);

public record UpdatePeriodRequest(
    string FcName,
    DateTime FillTimeStart,
    DateTime FillTimeEnd,
    string PeriodStartYearMonth,
    string PeriodEndYearMonth,
    DateTime? ExtensionStart,
    DateTime? ExtensionEnd,
    string? ExtensionUsers,
    string? Status);