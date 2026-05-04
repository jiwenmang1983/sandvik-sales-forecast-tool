using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public PermissionsController(SandvikDbContext db)
    {
        _db = db;
    }

    private static readonly string[] BypassRoles = { "SYS_ADMIN", "CEO", "VP_SALES", "REGION_DIRECTOR", "MANAGER", "SALES" };

    private async Task<bool> UserBypassesInvoiceCompanyRestriction(string userId)
    {
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null) return false;
        return BypassRoles.Contains(dbUser.Role.ToUpperInvariant());
    }

    // GET /api/permissions/invoice-companies - 当前用户有权限的开票公司列表
    [HttpGet("api/permissions/invoice-companies")]
    public async Task<IActionResult> GetMyInvoiceCompanyPermissions()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new { success = true, data = new List<object>() });

            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (dbUser == null)
                return Ok(new { success = true, data = new List<object>() });

            if (BypassRoles.Contains(dbUser.Role.ToUpperInvariant()))
            {
                // bypass: 返回所有激活的开票公司
                var allCompanies = await _db.InvoiceCompanies
                    .Where(c => c.IsActive && !c.IsDeleted)
                    .Select(c => new { id = c.Id, companyCode = c.CompanyCode, companyName = c.CompanyName, permissionType = "ALL" })
                    .ToListAsync();
                return Ok(new { success = true, data = allCompanies });
            }

            var now = DateTime.UtcNow;
            var permissions = await _db.UserInvoiceCompanyPermissions
                .Where(p => p.UserId == userId && p.EffectiveFrom <= now && (p.EffectiveTo == null || p.EffectiveTo >= now) && p.RevokedAt == null)
                .Join(_db.InvoiceCompanies.Where(c => c.IsActive && !c.IsDeleted),
                      p => p.InvoiceCompanyId,
                      c => c.Id,
                      (p, c) => new { p, c })
                .ToListAsync();

            var result = permissions.Select(x => new
            {
                id = x.c.Id,
                companyCode = x.c.CompanyCode,
                companyName = x.c.CompanyName,
                permissionType = x.p.PermissionType.ToString(),
                effectiveFrom = x.p.EffectiveFrom,
                effectiveTo = x.p.EffectiveTo
            }).ToList();

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetMyInvoiceCompanyPermissions error: {ex.Message}");
            return Ok(new { success = true, data = new List<object>() });
        }
    }

    // GET /api/permissions/invoice-companies/{userId} - 获取指定用户的开票公司权限
    [HttpGet("api/permissions/invoice-companies/{userId}")]
    public async Task<IActionResult> GetUserInvoiceCompanyPermissions(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
                return Ok(new { success = false, message = "UserId is required" });

            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            if (dbUser == null)
                return Ok(new { success = false, message = "User not found" });

            if (BypassRoles.Contains(dbUser.Role.ToUpperInvariant()))
            {
                // bypass: 返回所有激活的开票公司
                var allCompanies = await _db.InvoiceCompanies
                    .Where(c => c.IsActive && !c.IsDeleted)
                    .Select(c => new { id = c.Id, companyCode = c.CompanyCode, companyName = c.CompanyName, permissionType = "ALL" })
                    .ToListAsync();
                return Ok(new { success = true, data = allCompanies });
            }

            var now = DateTime.UtcNow;
            var permissions = await _db.UserInvoiceCompanyPermissions
                .Where(p => p.UserId == userId && p.EffectiveFrom <= now && (p.EffectiveTo == null || p.EffectiveTo >= now) && p.RevokedAt == null)
                .Join(_db.InvoiceCompanies.Where(c => c.IsActive && !c.IsDeleted),
                      p => p.InvoiceCompanyId,
                      c => c.Id,
                      (p, c) => new { p, c })
                .ToListAsync();

            var result = permissions.Select(x => new
            {
                id = x.c.Id,
                companyCode = x.c.CompanyCode,
                companyName = x.c.CompanyName,
                permissionType = x.p.PermissionType.ToString(),
                effectiveFrom = x.p.EffectiveFrom,
                effectiveTo = x.p.EffectiveTo
            }).ToList();

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetUserInvoiceCompanyPermissions error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    // GET /api/permissions/invoice-companies/{companyId}/forecast-records
    [HttpGet("api/permissions/invoice-companies/{companyId}/forecast-records")]
    public async Task<IActionResult> GetInvoiceCompanyForecastRecords(string companyId, [FromQuery] string? periodId, [FromQuery] int? year, [FromQuery] int? month)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new { success = false, message = "Unauthorized" });

            // Bypass check
            if (await UserBypassesInvoiceCompanyRestriction(userId))
            {
                return await GetForecastRecordsForCompany(companyId, periodId, year, month);
            }

            // Check permission table
            var now = DateTime.UtcNow;
            var permission = await _db.UserInvoiceCompanyPermissions
                .FirstOrDefaultAsync(p => p.UserId == userId && p.InvoiceCompanyId == companyId
                    && p.EffectiveFrom <= now && (p.EffectiveTo == null || p.EffectiveTo >= now) && p.RevokedAt == null);

            if (permission == null)
                return Ok(new { success = false, message = "No access to this invoice company" });

            return await GetForecastRecordsForCompany(companyId, periodId, year, month, permission.PermissionType);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetInvoiceCompanyForecastRecords error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    private async Task<IActionResult> GetForecastRecordsForCompany(string companyId, string? periodId, int? year, int? month, InvoiceCompanyPermissionType? permissionType = null)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == currentUserId && u.IsActive);
        if (dbUser == null)
            return Ok(new { success = false, message = "User not found" });

        var userBrand = dbUser.Brand ?? "Sandvik";

        var records = await _db.ForecastRecords
            .Where(r => r.InvoiceCompanyId == companyId && !r.IsDeleted)
            .Where(r => _db.Customers.Any(c => c.Id == r.CustomerId && c.Brand == userBrand))
            .ToListAsync();

        if (!string.IsNullOrEmpty(periodId)) records = records.Where(r => r.ForecastPeriodId == periodId).ToList();
        if (year.HasValue) records = records.Where(r => r.Year == year.Value).ToList();
        if (month.HasValue) records = records.Where(r => r.Month == month.Value).ToList();

        // Apply permission type filter on status
        if (permissionType.HasValue)
        {
            var allowedStatuses = PermissionTypeAllowedStatuses(permissionType.Value);
            records = records.Where(r => allowedStatuses.Contains(r.Status.ToUpperInvariant())).ToList();
        }

        return Ok(new { success = true, data = records });
    }

    // GET /api/permissions/invoice-companies/{companyId}/summary
    [HttpGet("api/permissions/invoice-companies/{companyId}/summary")]
    public async Task<IActionResult> GetInvoiceCompanySummary(string companyId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Ok(new { success = false, message = "Unauthorized" });

            if (!await UserBypassesInvoiceCompanyRestriction(userId))
            {
                var now = DateTime.UtcNow;
                var permission = await _db.UserInvoiceCompanyPermissions
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.InvoiceCompanyId == companyId
                        && p.EffectiveFrom <= now && (p.EffectiveTo == null || p.EffectiveTo >= now) && p.RevokedAt == null);

                if (permission == null)
                    return Ok(new { success = false, message = "No access to this invoice company" });
            }

            var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
            var userBrand = dbUser?.Brand ?? "Sandvik";

            var records = await _db.ForecastRecords
                .Where(r => r.InvoiceCompanyId == companyId && !r.IsDeleted)
                .Where(r => _db.Customers.Any(c => c.Id == r.CustomerId && c.Brand == userBrand))
                .ToListAsync();

            var totalOrderAmount = records.Sum(r => r.OrderAmount);
            var totalInvoiceAmount = records.Sum(r => r.InvoiceAmount);
            var totalOrderQty = records.Sum(r => r.OrderQty);
            var totalInvoiceQty = records.Sum(r => r.InvoiceQty);
            var recordCount = records.Count;
            var pendingCount = records.Count(r => r.Status == "Submitted");

            var company = await _db.InvoiceCompanies.FirstOrDefaultAsync(c => c.Id == companyId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    invoiceCompanyId = companyId,
                    invoiceCompanyName = company?.CompanyName ?? "",
                    totalOrderAmount,
                    totalInvoiceAmount,
                    totalOrderQty,
                    totalInvoiceQty,
                    recordCount,
                    pendingCount,
                    byStatus = records.GroupBy(r => r.Status).Select(g => new { status = g.Key, count = g.Count(), amount = g.Sum(r => r.OrderAmount + r.InvoiceAmount) }).ToList()
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetInvoiceCompanySummary error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    // ========== Admin endpoints ==========

    // GET /api/admin/permissions/invoice-company - 列出所有权限记录
    [HttpGet("api/admin/permissions/invoice-company")]
    public async Task<IActionResult> GetAllPermissions([FromQuery] string? userId, [FromQuery] string? companyId)
    {
        try
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!await IsAdminUser(currentUserId))
                return Ok(new { success = false, message = "Admin role required" });

            var query = _db.UserInvoiceCompanyPermissions
                .Include(p => p.User)
                .Include(p => p.InvoiceCompany)
                .AsQueryable();

            if (!string.IsNullOrEmpty(userId))
                query = query.Where(p => p.UserId == userId);
            if (!string.IsNullOrEmpty(companyId))
                query = query.Where(p => p.InvoiceCompanyId == companyId);

            var permissions = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    id = p.Id,
                    userId = p.UserId,
                    userName = p.User.DisplayName,
                    userEmail = p.User.Email,
                    invoiceCompanyId = p.InvoiceCompanyId,
                    invoiceCompanyName = p.InvoiceCompany.CompanyName,
                    permissionType = p.PermissionType.ToString(),
                    effectiveFrom = p.EffectiveFrom,
                    effectiveTo = p.EffectiveTo,
                    grantedBy = p.GrantedBy,
                    createdAt = p.CreatedAt,
                    revokedAt = p.RevokedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = permissions });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllPermissions error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    // POST /api/admin/permissions/invoice-company - 授予用户开票公司权限
    [HttpPost("api/admin/permissions/invoice-company")]
    public async Task<IActionResult> GrantPermission([FromBody] GrantInvoiceCompanyPermissionRequest request)
    {
        try
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!await IsAdminUser(adminUserId))
                return Ok(new { success = false, message = "Admin role required" });

            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.InvoiceCompanyId))
                return Ok(new { success = false, message = "UserId and InvoiceCompanyId are required" });

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId && u.IsActive);
            if (user == null)
                return Ok(new { success = false, message = "User not found" });

            var company = await _db.InvoiceCompanies.FirstOrDefaultAsync(c => c.Id == request.InvoiceCompanyId && c.IsActive && !c.IsDeleted);
            if (company == null)
                return Ok(new { success = false, message = "Invoice company not found" });

            // Check for existing active permission
            var now = DateTime.UtcNow;
            var existing = await _db.UserInvoiceCompanyPermissions
                .FirstOrDefaultAsync(p => p.UserId == request.UserId && p.InvoiceCompanyId == request.InvoiceCompanyId && p.RevokedAt == null);

            if (existing != null)
            {
                return Ok(new { success = false, message = "Active permission already exists for this user and company" });
            }

            var permission = new UserInvoiceCompanyPermission
            {
                UserId = request.UserId,
                InvoiceCompanyId = request.InvoiceCompanyId,
                PermissionType = request.PermissionType,
                EffectiveFrom = request.EffectiveFrom,
                EffectiveTo = request.EffectiveTo,
                GrantedBy = adminUserId ?? "",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserInvoiceCompanyPermissions.Add(permission);
            await _db.SaveChangesAsync();

            return Ok(new { success = true, data = new { id = permission.Id, message = "Permission granted" } });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GrantPermission error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/admin/permissions/invoice-company/{id} - 撤销权限
    [HttpDelete("api/admin/permissions/invoice-company/{id}")]
    public async Task<IActionResult> RevokePermission(int id)
    {
        try
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!await IsAdminUser(adminUserId))
                return Ok(new { success = false, message = "Admin role required" });

            var permission = await _db.UserInvoiceCompanyPermissions.FirstOrDefaultAsync(p => p.Id == id);
            if (permission == null)
                return Ok(new { success = false, message = "Permission not found" });

            permission.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, data = new { id, message = "Permission revoked" } });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RevokePermission error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    // PUT /api/admin/permissions/invoice-company/{id} - 更新权限
    [HttpPut("api/admin/permissions/invoice-company/{id}")]
    public async Task<IActionResult> UpdatePermission(int id, [FromBody] UpdateInvoiceCompanyPermissionRequest request)
    {
        try
        {
            var adminUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!await IsAdminUser(adminUserId))
                return Ok(new { success = false, message = "Admin role required" });

            var permission = await _db.UserInvoiceCompanyPermissions.FirstOrDefaultAsync(p => p.Id == id);
            if (permission == null)
                return Ok(new { success = false, message = "Permission not found" });

            if (request.PermissionType.HasValue)
                permission.PermissionType = request.PermissionType.Value;
            if (request.EffectiveFrom.HasValue)
                permission.EffectiveFrom = request.EffectiveFrom.Value;
            if (request.EffectiveTo.HasValue)
                permission.EffectiveTo = request.EffectiveTo;

            await _db.SaveChangesAsync();
            return Ok(new { success = true, data = new { id, message = "Permission updated" } });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdatePermission error: {ex.Message}");
            return Ok(new { success = false, message = ex.Message });
        }
    }

    private async Task<bool> IsAdminUser(string? userId)
    {
        if (string.IsNullOrEmpty(userId)) return false;
        var dbUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (dbUser == null) return false;
        var role = dbUser.Role.ToUpperInvariant();
        return role == "SYS_ADMIN" || role == "ADMIN";
    }

    private static HashSet<string> PermissionTypeAllowedStatuses(InvoiceCompanyPermissionType type)
    {
        return type switch
        {
            InvoiceCompanyPermissionType.VIEW_SUBMIT => new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Draft", "Submitted" },
            InvoiceCompanyPermissionType.VIEW_APPROVE => new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Draft", "Submitted", "Approved", "Rejected" },
            InvoiceCompanyPermissionType.VIEW_ALL => new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Draft", "Submitted", "Approved", "Rejected" },
            InvoiceCompanyPermissionType.NONE => new HashSet<string>(),
            _ => new HashSet<string>()
        };
    }
}

public class GrantInvoiceCompanyPermissionRequest
{
    public string UserId { get; set; } = string.Empty;
    public string InvoiceCompanyId { get; set; } = string.Empty;
    public InvoiceCompanyPermissionType PermissionType { get; set; } = InvoiceCompanyPermissionType.VIEW_SUBMIT;
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
}

public class UpdateInvoiceCompanyPermissionRequest
{
    public InvoiceCompanyPermissionType? PermissionType { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}
