using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ForecastController : ControllerBase
{
    private readonly IRepository<ForecastPeriod> _periodRepo;
    private readonly IRepository<ForecastRecord> _recordRepo;
    private readonly SandvikDbContext _db;

    public ForecastController(IRepository<ForecastPeriod> periodRepo, IRepository<ForecastRecord> recordRepo, SandvikDbContext db)
    {
        _periodRepo = periodRepo;
        _recordRepo = recordRepo;
        _db = db;
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

    /// <summary>
    /// Route alias for /api/forecast/records - same endpoint
    /// </summary>
    [HttpGet("list")]
    public async Task<ActionResult> GetRecordsList([FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        return await GetRecords(periodId, year, month);
    }

    /// <summary>
    /// Route alias - returns only records created by the current user
    /// </summary>
    [HttpGet("my")]
    public async Task<ActionResult> GetMyRecords([FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Ok(new { success = true, data = new List<ForecastRecord>() });

        var records = await _recordRepo.GetAllAsync();
        var filtered = records.Where(r => r.CreatedByUserId == userId);
        if (!string.IsNullOrEmpty(periodId)) filtered = filtered.Where(r => r.ForecastPeriodId == periodId);
        if (year.HasValue) filtered = filtered.Where(r => r.Year == year.Value);
        if (month.HasValue) filtered = filtered.Where(r => r.Month == month.Value);
        return Ok(new { success = true, data = filtered.ToList() });
    }

    /// <summary>
    /// Route alias for /api/forecast/records/{id}
    /// </summary>
    [HttpGet("detail/{id}")]
    public async Task<ActionResult> GetRecordDetail(string id)
    {
        var record = await _recordRepo.GetByIdAsync(id);
        if (record == null) return NotFound(new { success = false, message = "Record not found" });
        return Ok(new { success = true, data = record });
    }

    [HttpGet("records")]
    public async Task<ActionResult> GetRecords([FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        // Get current user ID and role for filtering
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            return Ok(new { success = true, data = new List<ForecastRecord>() });

        // Look up user in database to get role
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
        if (dbUser == null)
            return Ok(new { success = true, data = new List<ForecastRecord>() });

        var role = dbUser.Role?.ToUpperInvariant() ?? "";
        var userRegion = "";
        
        // Get user's region from OrgNode if available
        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == dbUser.Email && o.Status == "Active")
            .Select(o => new { o.Region })
            .FirstOrDefaultAsync();
        if (orgNode != null)
            userRegion = orgNode.Region ?? "";

        // Load all records for filtering
        var allRecords = await _db.ForecastRecords.Where(r => !r.IsDeleted).ToListAsync();
        List<ForecastRecord> filtered;

        switch (role)
        {
            case "SYS_ADMIN":
            case "CEO":
            case "FINANCE_MANAGER":
                // No filter - see all records
                filtered = allRecords;
                break;

            case "VP_SALES":
            case "REGION_DIRECTOR":
                // See only records where Customer.Region matches their region
                if (!string.IsNullOrEmpty(userRegion))
                {
                    var customerIds = _db.Customers
                        .Where(c => c.Region == userRegion)
                        .Select(c => c.Id)
                        .ToList();
                    filtered = allRecords.Where(r => customerIds.Contains(r.CustomerId)).ToList();
                }
                else
                {
                    filtered = new List<ForecastRecord>();
                }
                break;

            case "DIRECTOR":
                // See records from users in their org subtree
                var subtreeUserIds = await GetOrgSubtreeUserIdsAsync(dbUser.Id);
                if (subtreeUserIds.Any())
                {
                    filtered = allRecords.Where(r => subtreeUserIds.Contains(r.CreatedByUserId)).ToList();
                }
                else
                {
                    filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim).ToList();
                }
                break;

            case "MANAGER":
            case "SALES":
                // See only their own records
                filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim).ToList();
                break;

            default:
                // Unknown role - show only their own records as safety
                filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim).ToList();
                break;
        }

        // Apply additional filters
        if (!string.IsNullOrEmpty(periodId)) filtered = filtered.Where(r => r.ForecastPeriodId == periodId).ToList();
        if (year.HasValue) filtered = filtered.Where(r => r.Year == year.Value).ToList();
        if (month.HasValue) filtered = filtered.Where(r => r.Month == month.Value).ToList();
        
        return Ok(new { success = true, data = filtered });
    }

    /// <summary>
    /// Recursively gets all user IDs (from Users table) in the org subtree under the given orgNodeId.
    /// </summary>
    private async Task<List<string>> GetOrgSubtreeUserIdsAsync(string userId)
    {
        // Find the OrgNode for this user by email
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (dbUser == null) return new List<string>();

        var orgNode = await _db.OrgNodes
            .Where(o => o.Email == dbUser.Email && o.Status == "Active")
            .FirstOrDefaultAsync();
        if (orgNode == null) return new List<string>();

        if (!int.TryParse(orgNode.Id.ToString(), out var orgId))
            return new List<string>();

        var result = new List<string>();
        var visited = new HashSet<int>();
        var queue = new Queue<int>();
        queue.Enqueue(orgId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            if (visited.Contains(currentId)) continue;
            visited.Add(currentId);

            var childOrgNodes = await _db.OrgNodes
                .Where(o => o.ParentId.HasValue && o.ParentId.Value == currentId && o.Status == "Active")
                .Select(o => new { o.Id, o.Email })
                .ToListAsync();

            foreach (var child in childOrgNodes)
            {
                if (!result.Contains(child.Email))
                {
                    var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == child.Email);
                    if (user != null && !result.Contains(user.Id))
                    {
                        result.Add(user.Id);
                    }
                    queue.Enqueue(child.Id);
                }
            }
        }

        return result;
    }

    [HttpPost("records")]
    public async Task<ActionResult> CreateRecord([FromBody] CreateRecordRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        // Check for duplicate record (same ForecastPeriodId, CustomerId, ProductId)
        var existingRecord = await _db.ForecastRecords
            .FirstOrDefaultAsync(r => 
                r.ForecastPeriodId == req.ForecastPeriodId && 
                r.CustomerId == req.CustomerId && 
                r.ProductId == req.ProductId &&
                !r.IsDeleted);
        
        if (existingRecord != null)
            return BadRequest(new { success = false, message = "A record with the same ForecastPeriodId, CustomerId, and ProductId already exists" });

        try
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
                CreatedByUserId = userId,
                Status = "Draft"
            };
            var created = await _recordRepo.AddAsync(record);
            return Ok(new { success = true, data = created });
        }
        catch (DbUpdateException ex)
        {
            // Handle unique constraint violations or other DB errors
            Console.WriteLine($"CreateRecord error: {ex.Message} {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = "Failed to create record: " + ex.InnerException?.Message });
        }
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

    [HttpPost("save-draft")]
    public async Task<ActionResult> SaveDraft([FromBody] SaveDraftRequest req)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        int saved = 0;
        foreach (var r in req.Records)
        {
            var existing = await _db.ForecastRecords
                .FirstOrDefaultAsync(x =>
                    x.ForecastPeriodId == req.PeriodId &&
                    x.CustomerId == r.CustomerId &&
                    x.ProductId == r.ProductId &&
                    x.Year == r.Year &&
                    x.Month == r.Month &&
                    !x.IsDeleted);

            if (existing != null)
            {
                existing.Amount = r.orderAmount;
                existing.Status = "Draft";
            }
            else
            {
                var record = new ForecastRecord
                {
                    ForecastPeriodId = req.PeriodId,
                    CustomerId = r.CustomerId,
                    InvoiceCompanyId = r.InvoiceCompanyId,
                    ProductId = r.ProductId,
                    Year = r.Year,
                    Month = r.Month,
                    Amount = r.orderAmount,
                    Status = "Draft",
                    CreatedByUserId = userId
                };
                _db.ForecastRecords.Add(record);
            }
            saved++;
        }
        await _db.SaveChangesAsync();
        return Ok(new { success = true, savedCount = saved });
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
public record SaveDraftRequest(string PeriodId, List<SaveDraftRecord> Records);
public record SaveDraftRecord(string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal orderAmount);
public record SubmitRequest(string PeriodId);
