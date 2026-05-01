using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IRepository<Core.Entities.ForecastPeriod> _periodRepo;
    private readonly IRepository<Core.Entities.ForecastRecord> _recordRepo;

    public DashboardController(
        IRepository<Core.Entities.ForecastPeriod> periodRepo,
        IRepository<Core.Entities.ForecastRecord> recordRepo)
    {
        _periodRepo = periodRepo;
        _recordRepo = recordRepo;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        int totalRecords = 0, totalPeriods = 0, pendingApprovals = 0, approvedRecords = 0;

        try
        {
            var records = await _recordRepo.GetAllAsync();
            totalRecords = records.Count();
            pendingApprovals = records.Count(r => r.Status == "Submitted");
            approvedRecords = records.Count(r => r.Status == "Approved");
        }
        catch { }

        try
        {
            var periods = await _periodRepo.GetAllAsync();
            totalPeriods = periods.Count();
        }
        catch { }

        return Ok(new
        {
            totalRecords,
            totalPeriods,
            pendingApprovals,
            approvedRecords,
            recentActivity = new object[] { }
        });
    }
}
