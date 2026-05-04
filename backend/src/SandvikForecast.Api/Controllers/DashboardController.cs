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

    private static readonly string[] BypassInvoiceCompanyRoles = { "SYS_ADMIN", "CEO", "VP_SALES", "REGION_DIRECTOR", "MANAGER", "SALES" };

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Ok(new { success = true, data = EmptyDashboard() });

            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userIdClaim && u.IsActive);
            if (dbUser == null)
                return Ok(new { success = true, data = EmptyDashboard() });

            OrgNodeInfo? user = null;
            var orgNodeEmail = await _db.OrgNodes
                .Where(o => o.Email == dbUser.Email && o.Status == "Active")
                .Select(o => o.Email)
                .FirstOrDefaultAsync();

            if (orgNodeEmail != null)
            {
                var orgNodeRaw = await _db.OrgNodes
                    .Where(o => o.Email == dbUser.Email && o.Status == "Active")
                    .Select(o => new { o.Id, o.Email, o.Role, o.Name, o.Region, o.ParentId })
                    .FirstOrDefaultAsync();
                if (orgNodeRaw != null)
                {
                    user = new OrgNodeInfo
                    {
                        Id = orgNodeRaw.Id.ToString(),
                        Email = orgNodeRaw.Email,
                        Role = dbUser.Role,
                        Name = orgNodeRaw.Name,
                        Region = orgNodeRaw.Region,
                        ParentId = orgNodeRaw.ParentId.HasValue ? orgNodeRaw.ParentId.Value.ToString() : null
                    };
                }
            }
            else
            {
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
            var userId = dbUser.Id;
            var userRegion = user.Region ?? "";

            var allPeriods = await _db.ForecastPeriods.ToListAsync();
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

            var allRecords = await _db.ForecastRecords.ToListAsync();
            var allRecordIds = allRecords.Where(r => !r.IsDeleted).Select(r => r.Id).ToList();
            List<string>? allowedRecordIds = null;

            switch (role)
            {
                case "SYS_ADMIN":
                case "CEO":
                case "FINANCE_MANAGER":
                    allowedRecordIds = null;
                    break;

                case "VP_SALES":
                case "REGION_DIRECTOR":
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
                    allowedRecordIds = allRecords
                        .Where(r => !r.IsDeleted && r.CreatedByUserId == userId)
                        .Select(r => r.Id)
                        .ToList();
                    break;

                default:
                    allowedRecordIds = allRecords
                        .Where(r => !r.IsDeleted && r.CreatedByUserId == userId)
                        .Select(r => r.Id)
                        .ToList();
                    break;
            }

            var filteredRecords = allowedRecordIds == null
                ? allRecordIds
                : allowedRecordIds;

            if (!BypassInvoiceCompanyRoles.Contains(role))
            {
                filteredRecords = await FilterByInvoiceCompanyPermissionsAsync(userIdClaim, filteredRecords, allRecords);
            }

            var records = await GetForecastRecordsWithDetailsAsync(filteredRecords, allRecords);

            var totalAmount = records.Sum(r => r.Amount);
            var recordCount = records.Count;

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

            var pendingTotal = records.Count(r => r.Status == "Submitted");

            var pendingDirector = 0;
            if (role == "REGION_DIRECTOR" && !string.IsNullOrEmpty(userRegion))
            {
                pendingDirector = records
                    .Count(r => r.Status == "Submitted" && r.CustomerRegion == userRegion);
            }

            var pendingFinance = 0;
            if (role == "FINANCE_MANAGER")
            {
                pendingFinance = records.Count(r => r.Status == "Submitted");
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
            Console.WriteLine($"Dashboard error: {ex.Message} {ex.StackTrace}");
            return Ok(new { success = true, data = EmptyDashboard() });
        }
    }

    private async Task<List<ForecastRecordDetail>> GetForecastRecordsWithDetailsAsync(List<string> recordIds, List<ForecastRecord> allRecords)
    {
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
            string productL1Name = "";
            if (!string.IsNullOrEmpty(r.ProductId) && products.TryGetValue(r.ProductId, out var product))
            {
                if (product.ParentId != null && level1Products.TryGetValue(product.ParentId, out var parentProduct))
                    productL1Name = parentProduct.ProductName;
            }

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

    private async Task<List<string>> FilterByInvoiceCompanyPermissionsAsync(string userId, List<string> recordIds, List<ForecastRecord> allRecords)
    {
        var now = DateTime.UtcNow;
        var permissions = await _db.UserInvoiceCompanyPermissions
            .Where(p => p.UserId == userId && p.EffectiveFrom <= now && (p.EffectiveTo == null || p.EffectiveTo >= now) && p.RevokedAt == null)
            .ToListAsync();

        if (!permissions.Any())
            return new List<string>();

        var allowedCompanyIds = permissions.Select(p => p.InvoiceCompanyId).ToHashSet();
        var maxPermissionType = permissions.Max(p => p.PermissionType);

        if (maxPermissionType == InvoiceCompanyPermissionType.NONE)
            return new List<string>();

        var filteredRecords = allRecords
            .Where(r => recordIds.Contains(r.Id) && allowedCompanyIds.Contains(r.InvoiceCompanyId))
            .Select(r => r.Id)
            .ToList();

        if (maxPermissionType == InvoiceCompanyPermissionType.VIEW_SUBMIT)
        {
            var allowedStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Draft", "Submitted" };
            filteredRecords = filteredRecords
                .Join(allRecords.Where(r => allowedStatuses.Contains(r.Status)),
                      id => id, r => r.Id, (id, _) => id)
                .ToList();
        }

        return filteredRecords;
    }

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

internal class OrgNodeInfo
{
    public string Id { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Region { get; set; }
    public string? ParentId { get; set; }
}
