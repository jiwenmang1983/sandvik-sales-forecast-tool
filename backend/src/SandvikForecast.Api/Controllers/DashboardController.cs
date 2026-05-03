using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public DashboardController(SandvikDbContext db)
    {
        _db = db;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        try
        {
            // 1. Get current user ID from JWT NameIdentifier claim
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Ok(new { success = true, data = EmptyDashboard() });

            // 2. Look up user by ID
            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
            if (dbUser == null)
                return Ok(new { success = true, data = EmptyDashboard() });

            // 3. Look up OrgNode by email — do a targeted select only Email/Role/Name/Region/ParentId
            // (ParentId is nullable int; we avoid loading full entity to prevent int→string cast crash on .Id)
            OrgNodeInfo? user = null;
            var orgNodeEmail = await _db.OrgNodes
                .Where(o => o.Email == dbUser.Email && o.Status == "Active")
                .Select(o => o.Email)
                .FirstOrDefaultAsync();

            if (orgNodeEmail != null)
            {
                // Re-query with explicit fields (ParentId as int? then convert to string in C#)
                var orgNodeRaw = await _db.OrgNodes
                    .Where(o => o.Email == dbUser.Email && o.Status == "Active")
                    .Select(o => new { o.Id, o.Email, o.Role, o.Name, o.Region, o.ParentId })
                    .FirstOrDefaultAsync();
                if (orgNodeRaw != null)
                {
                    // NOTE: Use Role from Users table (dbUser.Role), NOT OrgNode.Role,
                    // because OrgNode.Role may not match the system user role (e.g. OrgNode has "Sales" but User has "MANAGER")
                    user = new OrgNodeInfo
                    {
                        Id = orgNodeRaw.Id.ToString(), // OrgNode int Id as string (used for subtree traversal in DIRECTOR case)
                        Email = orgNodeRaw.Email,
                        Role = dbUser.Role, // Always use Users table role for permission logic
                        Name = orgNodeRaw.Name,
                        Region = orgNodeRaw.Region,
                        ParentId = orgNodeRaw.ParentId.HasValue ? orgNodeRaw.ParentId.Value.ToString() : null
                    };
                }
            }
            else
            {
                // No OrgNode — use User table data directly
                user = new OrgNodeInfo
                {
                    Id = dbUser.Id,
                    Email = dbUser.Email,
                    Role = dbUser.Role,
                    Name = dbUser.DisplayName,
                    Region = null,
                    ParentId = null
                };
            }

            var role = user.Role?.ToUpperInvariant() ?? "";
            // Use Users table Id (GUID) for record filtering — OrgNode.Id (int) is only for subtree traversal
            var userId = dbUser.Id;
            var userRegion = user.Region ?? "";

            // 3. Get current period info (most recent ForecastPeriod with Status='Active')
            // Load into memory to parse PeriodStartYearMonth (EF can't translate string parsing to SQL)
            var allPeriods = await _db.ForecastPeriods.Where(p => !p.IsDeleted).ToListAsync();
            var currentPeriod = allPeriods
                .Where(p => p.Status == "Active")
                .OrderByDescending(p => int.TryParse(p.PeriodStartYearMonth.Split('-').FirstOrDefault(), out var y) ? y : 0)
                .ThenByDescending(p => int.TryParse(p.PeriodStartYearMonth.Split('-').Skip(1).FirstOrDefault(), out var m) ? m : 0)
                .FirstOrDefault();

            string currentPeriodName = "";
            string currentPeriodTime = "";
            if (currentPeriod != null)
            {
                var parts = currentPeriod.PeriodStartYearMonth.Split('-');
                var py = parts.Length > 0 && int.TryParse(parts[0], out var y) ? y : 0;
                var pm = parts.Length > 1 && int.TryParse(parts[1], out var m) ? m : 0;
                currentPeriodName = $"{py}年{pm}月";
                currentPeriodTime = $"{currentPeriod.FillTimeStart:yyyy-MM-dd} ~ {currentPeriod.FillTimeEnd:yyyy-MM-dd}";
            }

            // 4. Build the filtered forecast record IDs based on role
            // Load all records into memory first to avoid MySQL EF type-mapping issues
            var allRecords = await _db.ForecastRecords.ToListAsync();
            var allRecordIds = allRecords.Where(r => !r.IsDeleted).Select(r => r.Id).ToList();
            List<string>? allowedRecordIds = null;

            switch (role)
            {
                case "SYS_ADMIN":
                case "CEO":
                case "FINANCE_MANAGER":
                    // No filter - see all records
                    allowedRecordIds = null; // null means all
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
                        allowedRecordIds = allRecords
                            .Where(r => !r.IsDeleted && customerIds.Contains(r.CustomerId))
                            .Select(r => r.Id)
                            .ToList();
                    }
                    else
                    {
                        allowedRecordIds = new List<string>();
                    }
                    break;

                case "DIRECTOR":
                    // See records from users in their org subtree
                    var subtreeUserIds = await GetOrgSubtreeUserIdsAsync(user.Id);
                    if (subtreeUserIds.Any())
                    {
                        allowedRecordIds = allRecords
                            .Where(r => !r.IsDeleted && subtreeUserIds.Contains(r.CreatedByUserId))
                            .Select(r => r.Id)
                            .ToList();
                    }
                    else
                    {
                        allowedRecordIds = allRecords
                            .Where(r => !r.IsDeleted && r.CreatedByUserId == userId)
                            .Select(r => r.Id)
                            .ToList();
                    }
                    break;

                case "MANAGER":
                case "SALES":
                    // See only their own records
                    allowedRecordIds = allRecords
                        .Where(r => !r.IsDeleted && r.CreatedByUserId == userId)
                        .Select(r => r.Id)
                        .ToList();
                    break;

                default:
                    // Unknown role - show only their own records as safety
                    allowedRecordIds = allRecords
                        .Where(r => !r.IsDeleted && r.CreatedByUserId == userId)
                        .Select(r => r.Id)
                        .ToList();
                    break;
            }

            // Get the filtered records
            var filteredRecords = allowedRecordIds == null
                ? allRecordIds
                : allowedRecordIds;

            // Get all forecast records with their related data
            var records = await GetForecastRecordsWithDetailsAsync(filteredRecords, allRecords);

            // 5. Build dashboard data
            var totalAmount = records.Sum(r => r.Amount);
            var recordCount = records.Count;

            // Monthly: sum Amount grouped by ForecastPeriodId (map to period name)
            var monthly = records
                .GroupBy(r => r.ForecastPeriodId)
                .Select(g => new
                {
                    periodId = g.Key,
                    periodName = g.First().ForecastPeriodName,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(m => m.periodId)
                .Take(12)
                .ToList();

            // Regions: sum Amount grouped by Customer.Region
            var regions = records
                .Where(r => !string.IsNullOrEmpty(r.CustomerRegion))
                .GroupBy(r => r.CustomerRegion)
                .Select(g => new
                {
                    name = g.Key,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(r => r.amount)
                .ToList();

            // ProductLines: sum Amount grouped by ProductHierarchy (ProductLevel=1 name)
            var productLines = records
                .Where(r => !string.IsNullOrEmpty(r.ProductLevel1Name))
                .GroupBy(r => r.ProductLevel1Name)
                .Select(g => new
                {
                    name = g.Key,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(p => p.amount)
                .ToList();

            // Industries: since Customer has no Industry field, use Region as fallback
            var industries = records
                .Where(r => !string.IsNullOrEmpty(r.CustomerRegion))
                .GroupBy(r => r.CustomerRegion)
                .Select(g => new
                {
                    name = g.Key,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(i => i.amount)
                .ToList();

            // Customers: top 5 by total Amount
            var customers = records
                .Where(r => !string.IsNullOrEmpty(r.CustomerName))
                .GroupBy(r => r.CustomerId)
                .Select(g => new
                {
                    id = g.Key,
                    name = g.First().CustomerName,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(c => c.amount)
                .Take(5)
                .ToList();

            // InvoiceCompanies: top 5 by total Amount
            var invoiceCompanies = records
                .Where(r => !string.IsNullOrEmpty(r.InvoiceCompanyName))
                .GroupBy(r => r.InvoiceCompanyId)
                .Select(g => new
                {
                    id = g.Key,
                    name = g.First().InvoiceCompanyName,
                    amount = g.Sum(r => r.Amount)
                })
                .OrderByDescending(i => i.amount)
                .Take(5)
                .ToList();

            // Pending counts
            var pendingTotal = records.Count(r => r.Status == "Submitted");

            // pendingDirector: for REGION_DIRECTOR - submitted records in their region
            var pendingDirector = 0;
            if (role == "REGION_DIRECTOR" && !string.IsNullOrEmpty(userRegion))
            {
                pendingDirector = records
                    .Count(r => r.Status == "Submitted" && r.CustomerRegion == userRegion);
            }

            // pendingFinance: for FINANCE_MANAGER - all submitted records
            var pendingFinance = 0;
            if (role == "FINANCE_MANAGER")
            {
                pendingFinance = await _db.ForecastRecords
                    .CountAsync(r => r.Status == "Submitted" && !r.IsDeleted);
            }

            var dashboardData = new
            {
                currentPeriodName,
                currentPeriodTime,
                monthly,
                regions,
                productLines,
                industries,
                customers,
                invoiceCompanies,
                totalAmount,
                recordCount,
                pendingTotal,
                pendingDirector,
                pendingFinance
            };

            return Ok(new { success = true, data = dashboardData });
        }
        catch (Exception ex)
        {
            // Return empty dashboard on error (don't expose exception details)
            Console.WriteLine($"Dashboard error: {ex.Message} {ex.StackTrace}");
            return Ok(new { success = true, data = EmptyDashboard() });
        }
    }

    /// <summary>
    /// Gets forecast records with all related data using in-memory joins on pre-loaded records
    /// </summary>
    private async Task<List<ForecastRecordDetail>> GetForecastRecordsWithDetailsAsync(List<string> recordIds, List<ForecastRecord> allRecords)
    {
        // Apply filter in memory
        var filtered = recordIds == null
            ? allRecords
            : allRecords.Where(r => recordIds.Contains(r.Id)).ToList();

        if (!filtered.Any())
            return new List<ForecastRecordDetail>();

        var customerIds = filtered.Select(r => r.CustomerId).Distinct().ToList();
        var productIds = filtered.Select(r => r.ProductId).Distinct().ToList();
        var invoiceCompanyIds = filtered.Select(r => r.InvoiceCompanyId).Distinct().ToList();
        var periodIds = filtered.Select(r => r.ForecastPeriodId).Distinct().ToList();

        var customers = await _db.Customers.Where(c => customerIds.Contains(c.Id)).ToDictionaryAsync(c => c.Id);
        var products = await _db.ProductHierarchies.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);
        var invoiceCompanies = await _db.InvoiceCompanies.Where(i => invoiceCompanyIds.Contains(i.Id)).ToDictionaryAsync(i => i.Id);
        var periods = await _db.ForecastPeriods.Where(p => periodIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);
        var level1Products = await _db.ProductHierarchies.Where(p => p.ProductLevel == 1).ToDictionaryAsync(p => p.Id);

        var result = new List<ForecastRecordDetail>();
        foreach (var r in filtered)
        {
            // Get product line (level 1 parent name)
            string productL1Name = "";
            if (!string.IsNullOrEmpty(r.ProductId) && products.TryGetValue(r.ProductId, out var product))
            {
                if (product.ParentId != null && level1Products.TryGetValue(product.ParentId, out var parentProduct))
                    productL1Name = parentProduct.ProductName;
            }

            // Get period name
            string periodName = "";
            if (periods.TryGetValue(r.ForecastPeriodId, out var period))
                periodName = period.PeriodStartYearMonth ?? "";

            customers.TryGetValue(r.CustomerId, out var customer);
            invoiceCompanies.TryGetValue(r.InvoiceCompanyId, out var invoiceCompany);

                var periodParts = period?.PeriodStartYearMonth?.Split('-') ?? Array.Empty<string>();
                var pYear = periodParts.Length > 0 && int.TryParse(periodParts[0], out var py2) ? py2 : 0;
                var pMonth = periodParts.Length > 1 && int.TryParse(periodParts[1], out var pm2) ? pm2 : 0;
                result.Add(new ForecastRecordDetail
                {
                    Id = r.Id,
                    Amount = r.OrderAmount + r.InvoiceAmount,
                    Status = r.Status,
                    ForecastPeriodId = r.ForecastPeriodId,
                    CustomerId = r.CustomerId,
                    ProductId = r.ProductId,
                    InvoiceCompanyId = r.InvoiceCompanyId,
                    CreatedByUserId = r.CreatedByUserId,
                    CustomerName = customer?.CustomerName ?? "",
                    CustomerRegion = customer?.Region ?? "",
                    PeriodYear = pYear,
                    PeriodMonth = pMonth,
                    ForecastPeriodName = periodName,
                    InvoiceCompanyName = invoiceCompany?.CompanyName ?? "",
                    ProductLevel1Name = productL1Name
                });
        }

        return result;
    }

    /// <summary>
    /// Recursively gets all user IDs (from Users table) in the org subtree under the given orgNodeId.
    /// Returns list of user IDs (CreatedByUserId values) for users under the given org node.
    /// </summary>
    private async Task<List<string>> GetOrgSubtreeUserIdsAsync(string orgNodeId)
    {
        if (!int.TryParse(orgNodeId, out var orgId))
            return new List<string>();

        var result = new List<string>();
        var visited = new HashSet<int>();
        var queue = new Queue<int>();
        queue.Enqueue(orgId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            if (visited.Contains(currentId))
                continue;
            visited.Add(currentId);

            // Find all child org nodes with ParentId = currentId (int)
            var childOrgNodes = await _db.OrgNodes
                .Where(o => o.ParentId.HasValue && o.ParentId.Value == currentId && o.Status == "Active")
                .Select(o => new { o.Id, o.Email })
                .ToListAsync();

            foreach (var child in childOrgNodes)
            {
                // Get user ID from Users table using email
                if (!result.Contains(child.Email))
                {
                    var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == child.Email);
                    if (user != null && !result.Contains(user.Id))
                    {
                        result.Add(user.Id);
                    }
                    // Add child org node to queue to explore its children
                    queue.Enqueue(child.Id);
                }
            }
        }

        return result;
    }

    /// <summary>
    /// Returns empty dashboard structure
    /// </summary>
    private static object EmptyDashboard()
    {
        return new
        {
            currentPeriodName = "",
            currentPeriodTime = "",
            monthly = new List<object>(),
            regions = new List<object>(),
            productLines = new List<object>(),
            industries = new List<object>(),
            customers = new List<object>(),
            invoiceCompanies = new List<object>(),
            totalAmount = 0m,
            recordCount = 0,
            pendingTotal = 0,
            pendingDirector = 0,
            pendingFinance = 0
        };
    }
}

/// <summary>
/// Internal class for holding forecast record details from joined query
/// </summary>
internal class ForecastRecordDetail
{
    public string Id { get; set; } = "";
    public decimal Amount { get; set; }
    public string Status { get; set; } = "";
    public string ForecastPeriodId { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string InvoiceCompanyId { get; set; } = "";
    public string CreatedByUserId { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string CustomerRegion { get; set; } = "";
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public string ForecastPeriodName { get; set; } = "";
    public string InvoiceCompanyName { get; set; } = "";
    public string ProductLevel1Name { get; set; } = "";
}

/// <summary>
/// Internal class for holding OrgNode info
/// </summary>
internal class OrgNodeInfo
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Region { get; set; }
    public string? ParentId { get; set; }
}
