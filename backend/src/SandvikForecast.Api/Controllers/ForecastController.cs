using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using ClosedXML.Excel;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ForecastController : ControllerBase
{
    private readonly IRepository<ForecastPeriod> _periodRepo;
    private readonly IRepository<ForecastRecord> _recordRepo;
    private readonly SandvikDbContext _db;
    private readonly IEmailQueueService _emailQueueService;

    public ForecastController(IRepository<ForecastPeriod> periodRepo, IRepository<ForecastRecord> recordRepo, SandvikDbContext db, IEmailQueueService emailQueueService)
    {
        _periodRepo = periodRepo;
        _recordRepo = recordRepo;
        _db = db;
        _emailQueueService = emailQueueService;
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

    [HttpGet("my")]
    public async Task<ActionResult> GetMyRecords([FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Ok(new { success = true, data = new List<ForecastRecord>() });

        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null)
            return Ok(new { success = true, data = new List<ForecastRecord>() });

        var userBrand = dbUser.Brand ?? "Sandvik";

        // Brand filter: only records where the customer belongs to the user's brand
        var records = await _db.ForecastRecords
            .Where(r => r.CreatedByUserId == userId && !r.IsDeleted)
            .Where(r => _db.Customers.Any(c => c.Id == r.CustomerId && c.Brand == userBrand))
            .ToListAsync();

        if (!string.IsNullOrEmpty(periodId)) records = records.Where(r => r.ForecastPeriodId == periodId).ToList();
        if (year.HasValue) records = records.Where(r => r.Year == year.Value).ToList();
        if (month.HasValue) records = records.Where(r => r.Month == month.Value).ToList();
        return Ok(new { success = true, data = records });
    }

    /// <summary>
    /// Route alias for /api/forecast/records/{id}
    /// </summary>
    [HttpGet("detail/{id}")]
    public async Task<ActionResult> GetRecordDetail(string id)
    {
        var record = await _recordRepo.GetByIdAsync(id);
        if (record == null) return NotFound(new { success = false, message = "Record not found" });

        // Brand check: only allow viewing records whose customer belongs to the user's brand
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (dbUser != null)
            {
                var userBrand = dbUser.Brand ?? "Sandvik";
                var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == record.CustomerId);
                if (customer == null || customer.Brand != userBrand)
                    return NotFound(new { success = false, message = "Record not found" });
            }
        }

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
        var userBrand = dbUser.Brand ?? "Sandvik";
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
                // See only records where Customer.Region matches their region AND Customer.Brand matches user's brand
                if (!string.IsNullOrEmpty(userRegion))
                {
                    var customerIds = _db.Customers
                        .Where(c => c.Region == userRegion && c.Brand == userBrand)
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
                // See records from users in their org subtree AND where Customer.Brand matches user's brand
                var subtreeUserIds = await GetOrgSubtreeUserIdsAsync(dbUser.Id);
                if (subtreeUserIds.Any())
                {
                    var brandCustomerIds = _db.Customers
                        .Where(c => c.Brand == userBrand)
                        .Select(c => c.Id)
                        .ToHashSet();
                    filtered = allRecords.Where(r => subtreeUserIds.Contains(r.CreatedByUserId) && brandCustomerIds.Contains(r.CustomerId)).ToList();
                }
                else
                {
                    var myBrandCustomerIds = _db.Customers
                        .Where(c => c.Brand == userBrand)
                        .Select(c => c.Id)
                        .ToHashSet();
                    filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim && myBrandCustomerIds.Contains(r.CustomerId)).ToList();
                }
                break;

            case "MANAGER":
            case "SALES":
                // See only their own records where Customer.Brand matches their brand
                var userCustomerIds = _db.Customers
                    .Where(c => c.Brand == userBrand)
                    .Select(c => c.Id)
                    .ToHashSet();
                filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim && userCustomerIds.Contains(r.CustomerId)).ToList();
                break;

            default:
                // Unknown role - show only their own records where Customer.Brand matches their brand as safety
                var safeCustomerIds = _db.Customers
                    .Where(c => c.Brand == userBrand)
                    .Select(c => c.Id)
                    .ToHashSet();
                filtered = allRecords.Where(r => r.CreatedByUserId == userIdClaim && safeCustomerIds.Contains(r.CustomerId)).ToList();
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

        // Brand check: only allow creating records for customers of the user's brand
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null)
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var userBrand = dbUser.Brand ?? "Sandvik";
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == req.CustomerId);
        if (customer == null || customer.Brand != userBrand)
            return BadRequest(new { success = false, message = "Invalid customer for this brand" });

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
                OrderQty = req.OrderQty,
                OrderAmount = req.OrderAmount,
                InvoiceQty = req.InvoiceQty,
                InvoiceAmount = req.InvoiceAmount,
                CreatedByUserId = userId,
                Status = "Draft"
            };
            var created = await _recordRepo.AddAsync(record);
            return Ok(new { success = true, data = created });
        }
        catch (DbUpdateException ex)
        {
            Console.WriteLine($"CreateRecord error: {ex.Message} {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = "Failed to create record: " + ex.InnerException?.Message });
        }
    }

    [HttpPut("records/{id}")]
    public async Task<ActionResult> UpdateRecord(string id, [FromBody] UpdateRecordRequest req)
    {
        var record = await _recordRepo.GetByIdAsync(id);
        if (record == null) return NotFound(new { success = false, message = "Record not found" });

        // Brand check
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (dbUser != null)
            {
                var userBrand = dbUser.Brand ?? "Sandvik";
                var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == record.CustomerId);
                if (customer == null || customer.Brand != userBrand)
                    return NotFound(new { success = false, message = "Record not found" });
            }
        }

        record.OrderQty = req.OrderQty;
        record.OrderAmount = req.OrderAmount;
        record.InvoiceQty = req.InvoiceQty;
        record.InvoiceAmount = req.InvoiceAmount;
        record.Notes = req.Notes;
        record.Status = req.Status;
        await _recordRepo.UpdateAsync(record);
        return Ok(new { success = true, data = record });
    }

    [HttpDelete("records/{id}")]
    public async Task<ActionResult> DeleteRecord(string id)
    {
        // Brand check
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (dbUser != null)
            {
                var record = await _recordRepo.GetByIdAsync(id);
                if (record != null)
                {
                    var userBrand = dbUser.Brand ?? "Sandvik";
                    var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == record.CustomerId);
                    if (customer == null || customer.Brand != userBrand)
                        return NotFound(new { success = false, message = "Record not found" });
                }
            }
        }

        await _recordRepo.DeleteAsync(id);
        return Ok(new { success = true, message = "Deleted" });
    }

    [HttpGet("template")]
    public ActionResult GetTemplate()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Forecast Import");

        // Headers matching the import format
        worksheet.Cell(1, 1).Value = "ForecastPeriodId";
        worksheet.Cell(1, 2).Value = "CustomerId";
        worksheet.Cell(1, 3).Value = "InvoiceCompanyId";
        worksheet.Cell(1, 4).Value = "ProductId";
        worksheet.Cell(1, 5).Value = "Year";
        worksheet.Cell(1, 6).Value = "Month";
        worksheet.Cell(1, 7).Value = "OrderQty";
        worksheet.Cell(1, 8).Value = "OrderAmount";
        worksheet.Cell(1, 9).Value = "InvoiceQty";
        worksheet.Cell(1, 10).Value = "InvoiceAmount";
        worksheet.Cell(1, 11).Value = "Notes";

        // Sample data row
        worksheet.Cell(2, 1).Value = "2026FC1";
        worksheet.Cell(2, 2).Value = "CUST001";
        worksheet.Cell(2, 3).Value = "INV001";
        worksheet.Cell(2, 4).Value = "PROD001";
        worksheet.Cell(2, 5).Value = 2026;
        worksheet.Cell(2, 6).Value = 1;
        worksheet.Cell(2, 7).Value = 100;
        worksheet.Cell(2, 8).Value = 50000;
        worksheet.Cell(2, 9).Value = 50;
        worksheet.Cell(2, 10).Value = 25000;
        worksheet.Cell(2, 11).Value = "Sample notes";

        // Style header row
        var headerRow = worksheet.Range(1, 1, 1, 11);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#0D3D92");
        headerRow.Style.Font.FontColor = XLColor.White;
        headerRow.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "forecast_import_template.xlsx");
    }

    [HttpPost("export")]
    public async Task<ActionResult> ExportData([FromQuery] string? forecastPeriodId, [FromQuery] int? year, [FromQuery] string? customerId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userBrand = "Sandvik";
        if (!string.IsNullOrEmpty(userIdClaim))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
            if (dbUser != null) userBrand = dbUser.Brand ?? "Sandvik";
        }

        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        var records = await _recordRepo.GetAllAsync();
        records = records.Where(r => brandCustomerIds.Contains(r.CustomerId)).ToList();

        if (!string.IsNullOrEmpty(forecastPeriodId))
            records = records.Where(r => r.ForecastPeriodId == forecastPeriodId).ToList();
        if (year.HasValue)
            records = records.Where(r => r.Year == year.Value).ToList();
        if (!string.IsNullOrEmpty(customerId))
            records = records.Where(r => r.CustomerId == customerId).ToList();

        // Get customer and period names for display
        var customerIds = records.Select(r => r.CustomerId).Distinct().ToList();
        var periodIds = records.Select(r => r.ForecastPeriodId).Distinct().ToList();
        var customers = _db.Customers.Where(c => customerIds.Contains(c.Id)).ToDictionary(c => c.Id, c => c.CustomerName);
        var periods = _db.ForecastPeriods.Where(p => periodIds.Contains(p.Id)).ToDictionary(p => p.Id, p => p.FcName);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Forecast Data");

        // Headers: Period, Customer, Year, Month, OrderQty, OrderAmount, InvoiceQty, InvoiceAmount, Status
        worksheet.Cell(1, 1).Value = "Period";
        worksheet.Cell(1, 2).Value = "Customer";
        worksheet.Cell(1, 3).Value = "Year";
        worksheet.Cell(1, 4).Value = "Month";
        worksheet.Cell(1, 5).Value = "OrderQty";
        worksheet.Cell(1, 6).Value = "OrderAmount";
        worksheet.Cell(1, 7).Value = "InvoiceQty";
        worksheet.Cell(1, 8).Value = "InvoiceAmount";
        worksheet.Cell(1, 9).Value = "Status";

        var row = 2;
        foreach (var record in records)
        {
            worksheet.Cell(row, 1).Value = periods.GetValueOrDefault(record.ForecastPeriodId, record.ForecastPeriodId);
            worksheet.Cell(row, 2).Value = customers.GetValueOrDefault(record.CustomerId, record.CustomerId);
            worksheet.Cell(row, 3).Value = record.Year;
            worksheet.Cell(row, 4).Value = record.Month;
            worksheet.Cell(row, 5).Value = (double)record.OrderQty;
            worksheet.Cell(row, 6).Value = (double)record.OrderAmount;
            worksheet.Cell(row, 7).Value = (double)record.InvoiceQty;
            worksheet.Cell(row, 8).Value = (double)record.InvoiceAmount;
            worksheet.Cell(row, 9).Value = record.Status;
            row++;
        }

        // Style header row
        var headerRange = worksheet.Range(1, 1, 1, 9);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#0D3D92");
        headerRange.Style.Font.FontColor = XLColor.White;
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // Format number columns
        worksheet.Column(5).Style.NumberFormat.Format = "#,##0";
        worksheet.Column(6).Style.NumberFormat.Format = "#,##0.00";
        worksheet.Column(7).Style.NumberFormat.Format = "#,##0";
        worksheet.Column(8).Style.NumberFormat.Format = "#,##0.00";

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        var fileName = $"forecast_export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    [HttpPost("import")]
    public async Task<ActionResult> ImportData(IFormFile file)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null)
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var userBrand = dbUser.Brand ?? "Sandvik";
        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "No file uploaded" });

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { success = false, message = "Only .xlsx files are supported" });

        var errors = new List<string>();
        var created = 0;
        var updated = 0;

        try
        {
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header row

            foreach (var dataRow in rows)
            {
                try
                {
                    var forecastPeriodId = dataRow.Cell(1).GetString();
                    var customerId = dataRow.Cell(2).GetString();
                    var invoiceCompanyId = dataRow.Cell(3).GetString();
                    var productId = dataRow.Cell(4).GetString();
                    var year = (int)dataRow.Cell(5).GetDouble();
                    var month = (int)dataRow.Cell(6).GetDouble();
                    var orderQty = (decimal)dataRow.Cell(7).GetDouble();
                    var orderAmount = (decimal)dataRow.Cell(8).GetDouble();
                    var invoiceQty = (decimal)dataRow.Cell(9).GetDouble();
                    var invoiceAmount = (decimal)dataRow.Cell(10).GetDouble();
                    var notes = dataRow.Cell(11).GetString();

                    if (string.IsNullOrEmpty(forecastPeriodId) || string.IsNullOrEmpty(customerId) || string.IsNullOrEmpty(productId))
                    {
                        errors.Add($"Row {dataRow.RowNumber()}: Missing required fields (ForecastPeriodId, CustomerId, ProductId)");
                        continue;
                    }

                    if (!brandCustomerIds.Contains(customerId))
                    {
                        errors.Add($"Row {dataRow.RowNumber()}: Customer not accessible for this brand");
                        continue;
                    }

                    // Check for existing record to update
                    var existing = await _db.ForecastRecords
                        .FirstOrDefaultAsync(x =>
                            x.ForecastPeriodId == forecastPeriodId &&
                            x.CustomerId == customerId &&
                            x.ProductId == productId &&
                            x.Year == year &&
                            x.Month == month &&
                            !x.IsDeleted);

                    if (existing != null)
                    {
                        existing.OrderQty = orderQty;
                        existing.OrderAmount = orderAmount;
                        existing.InvoiceQty = invoiceQty;
                        existing.InvoiceAmount = invoiceAmount;
                        existing.Notes = notes;
                        updated++;
                    }
                    else
                    {
                        var record = new ForecastRecord
                        {
                            ForecastPeriodId = forecastPeriodId,
                            CustomerId = customerId,
                            InvoiceCompanyId = invoiceCompanyId,
                            ProductId = productId,
                            Year = year,
                            Month = month,
                            OrderQty = orderQty,
                            OrderAmount = orderAmount,
                            InvoiceQty = invoiceQty,
                            InvoiceAmount = invoiceAmount,
                            Notes = notes,
                            CreatedByUserId = userId,
                            Status = "Draft"
                        };
                        _db.ForecastRecords.Add(record);
                        created++;
                    }
                }
                catch (Exception ex)
                {
                    errors.Add($"Row {dataRow.RowNumber()}: {ex.Message}");
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { success = true, created, updated, errors });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to parse Excel file: " + ex.Message });
        }
    }

    [HttpGet("export")]
    public async Task<ActionResult> ExportDataCsv([FromQuery] string? periodId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userBrand = "Sandvik";
        if (!string.IsNullOrEmpty(userIdClaim))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
            if (dbUser != null) userBrand = dbUser.Brand ?? "Sandvik";
        }

        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        var records = await _recordRepo.GetAllAsync();
        records = records.Where(r => brandCustomerIds.Contains(r.CustomerId)).ToList();
        if (!string.IsNullOrEmpty(periodId))
            records = records.Where(r => r.ForecastPeriodId == periodId).ToList();

        var lines = new List<string> { "Customer,InvoiceCompany,Product,Year,Month,OrderQty,OrderAmount,InvoiceQty,InvoiceAmount,Notes" };
        foreach (var r in records)
        {
            lines.Add($"{r.CustomerId},{r.InvoiceCompanyId},{r.ProductId},{r.Year},{r.Month},{r.OrderQty},{r.OrderAmount},{r.InvoiceQty},{r.InvoiceAmount},{r.Notes ?? ""}");
        }
        var csv = string.Join("\n", lines);
        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"forecast_export_{periodId ?? "all"}.csv");
    }

    [HttpPost("import-json")]
    public async Task<ActionResult> ImportDataJson([FromBody] List<ImportRecordRequest> records)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null)
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var userBrand = dbUser.Brand ?? "Sandvik";
        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        var imported = 0;
        foreach (var req in records)
        {
            if (!brandCustomerIds.Contains(req.CustomerId))
                continue; // Skip records not matching user's brand

            var record = new ForecastRecord
            {
                ForecastPeriodId = req.ForecastPeriodId,
                CustomerId = req.CustomerId,
                InvoiceCompanyId = req.InvoiceCompanyId,
                ProductId = req.ProductId,
                Year = req.Year,
                Month = req.Month,
                OrderQty = req.OrderQty,
                OrderAmount = req.OrderAmount,
                InvoiceQty = req.InvoiceQty,
                InvoiceAmount = req.InvoiceAmount,
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

        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null)
            return Unauthorized(new { success = false, message = "User not authenticated" });

        var userBrand = dbUser.Brand ?? "Sandvik";
        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        int saved = 0;
        foreach (var r in req.Records)
        {
            if (!brandCustomerIds.Contains(r.CustomerId))
                continue; // Skip records not matching user's brand

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
                existing.OrderQty = r.orderQty;
                existing.OrderAmount = r.orderAmount;
                existing.InvoiceQty = r.invoiceQty;
                existing.InvoiceAmount = r.invoiceAmount;
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
                    OrderQty = r.orderQty,
                    OrderAmount = r.orderAmount,
                    InvoiceQty = r.invoiceQty,
                    InvoiceAmount = r.invoiceAmount,
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
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
        var userBrand = "Sandvik";
        if (!string.IsNullOrEmpty(userIdClaim))
        {
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
            if (dbUser != null) userBrand = dbUser.Brand ?? "Sandvik";
        }

        var brandCustomerIds = _db.Customers
            .Where(c => c.Brand == userBrand)
            .Select(c => c.Id)
            .ToHashSet();

        // Extension window check
        var period = await _periodRepo.GetByIdAsync(req.PeriodId);
        if (period != null)
        {
            var now = DateTime.UtcNow;
            var fillTimeEnded = now > period.FillTimeEnd;
            var extensionActive = period.ExtensionEnd.HasValue && now < period.ExtensionEnd.Value;
            if (fillTimeEnded && extensionActive)
            {
                List<string> extUsers;
                try { extUsers = JsonSerializer.Deserialize<List<string>>(period.ExtensionUsers ?? "[]") ?? new(); }
                catch { extUsers = new List<string>(); }
                if (!string.IsNullOrEmpty(userIdClaim) && !extUsers.Contains(userIdClaim))
                    return BadRequest(new { success = false, message = "Submission deadline passed" });
            }
        }

        var allRecords = await _db.ForecastRecords.Where(r => r.ForecastPeriodId == req.PeriodId).ToListAsync();
        var periodRecords = allRecords.Where(r => brandCustomerIds.Contains(r.CustomerId)).ToList();
        foreach (var record in periodRecords)
        {
            record.Status = "Submitted";
        }
        await _db.SaveChangesAsync();

        // Queue email notification to approver
        var submitter = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
        if (submitter != null && !string.IsNullOrEmpty(submitter.Email))
        {
            var orgNode = await _db.OrgNodes
                .Where(o => o.Email == submitter.Email && o.Status == "Active")
                .FirstOrDefaultAsync();

            if (orgNode != null && orgNode.ParentId.HasValue)
            {
                var parentNode = await _db.OrgNodes.FindAsync(orgNode.ParentId.Value);
                if (parentNode != null && !string.IsNullOrEmpty(parentNode.Email))
                {
                    var periodFcName = period?.FcName ?? req.PeriodId;
                    var submitterName = submitter.DisplayName ?? submitter.UserName ?? userIdClaim;
                    var submittedDate = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

                    var subject = $"预测提交待审批 - {periodFcName}";
                    var body = $@"您好，

{submitterName} 已提交预测数据，等待您的审批。

周期：{periodFcName}
提交人：{submitterName}
提交时间：{submittedDate}

请登录 Sandvik Forecast Tool 系统查看详情。

此邮件由系统自动发送，请勿回复。";

                    var templateVars = System.Text.Json.JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "ForecastPeriodName", periodFcName },
                        { "SubmitterName", submitterName },
                        { "SubmittedDate", submittedDate }
                    });

                    await _emailQueueService.QueueEmailAsync(
                        parentNode.Email,
                        null,
                        subject,
                        body,
                        null,
                        templateVars);
                }
            }
        }

        return Ok(new { success = true, submittedCount = periodRecords.Count });
    }
}

public record CreateRecordRequest(string ForecastPeriodId, string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal OrderQty, decimal OrderAmount, decimal InvoiceQty, decimal InvoiceAmount);
public record UpdateRecordRequest(decimal OrderQty, decimal OrderAmount, decimal InvoiceQty, decimal InvoiceAmount, string? Notes, string Status);
public record ImportRecordRequest(string ForecastPeriodId, string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal OrderQty, decimal OrderAmount, decimal InvoiceQty, decimal InvoiceAmount, string? Notes);
public record SaveDraftRequest(string PeriodId, List<SaveDraftRecord> Records);
public record SaveDraftRecord(string CustomerId, string InvoiceCompanyId, string ProductId, int Year, int Month, decimal orderQty, decimal orderAmount, decimal invoiceQty, decimal invoiceAmount);
public record SubmitRequest(string PeriodId);
