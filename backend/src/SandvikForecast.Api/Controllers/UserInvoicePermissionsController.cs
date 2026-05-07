using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/user-invoice-permissions")]
[Authorize]
public class UserInvoicePermissionsController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public UserInvoicePermissionsController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] string? userId, [FromQuery] string? invoiceCompanyId)
    {
        var query = _db.UserInvoiceCompanyPermissions
            .Include(p => p.User)
            .Include(p => p.InvoiceCompany)
            .Where(p => p.RevokedAt == null)
            .AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(p => p.UserId == userId);

        if (!string.IsNullOrEmpty(invoiceCompanyId))
            query = query.Where(p => p.InvoiceCompanyId == invoiceCompanyId);

        var result = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new UserInvoicePermissionDto(
                p.Id,
                p.UserId,
                p.User.DisplayName,
                p.User.Email,
                p.InvoiceCompanyId,
                p.InvoiceCompany.CompanyName,
                p.PermissionType.ToString(),
                p.EffectiveFrom,
                p.EffectiveTo,
                p.GrantedBy,
                p.CreatedAt
            ))
            .ToListAsync();

        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var p = await _db.UserInvoiceCompanyPermissions
            .Include(p => p.User)
            .Include(p => p.InvoiceCompany)
            .FirstOrDefaultAsync(p => p.Id == id && p.RevokedAt == null);

        if (p == null)
            return NotFound(new { success = false, message = "Permission not found" });

        return Ok(new { success = true, data = new UserInvoicePermissionDto(
            p.Id, p.UserId, p.User.DisplayName, p.User.Email,
            p.InvoiceCompanyId, p.InvoiceCompany.CompanyName,
            p.PermissionType.ToString(), p.EffectiveFrom, p.EffectiveTo,
            p.GrantedBy, p.CreatedAt
        )});
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateUserInvoicePermissionRequest dto)
    {
        if (string.IsNullOrWhiteSpace(dto.UserId))
            return BadRequest(new { success = false, message = "UserId is required" });
        if (string.IsNullOrWhiteSpace(dto.InvoiceCompanyId))
            return BadRequest(new { success = false, message = "InvoiceCompanyId is required" });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId && u.IsActive);
        if (user == null)
            return BadRequest(new { success = false, message = "User not found or inactive" });

        var company = await _db.InvoiceCompanies.FirstOrDefaultAsync(c => c.Id == dto.InvoiceCompanyId && !c.IsDeleted && c.IsActive);
        if (company == null)
            return BadRequest(new { success = false, message = "InvoiceCompany not found or inactive" });

        var exists = await _db.UserInvoiceCompanyPermissions
            .AnyAsync(p => p.UserId == dto.UserId && p.InvoiceCompanyId == dto.InvoiceCompanyId && p.RevokedAt == null);
        if (exists)
            return Conflict(new { success = false, message = "Permission already exists" });

        var permType = Enum.TryParse<InvoiceCompanyPermissionType>(dto.PermissionType, true, out var pt) ? pt : InvoiceCompanyPermissionType.VIEW_SUBMIT;
        var grantedBy = User.Identity?.Name ?? string.Empty;

        var permission = new UserInvoiceCompanyPermission
        {
            UserId = dto.UserId,
            InvoiceCompanyId = dto.InvoiceCompanyId,
            PermissionType = permType,
            EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow,
            EffectiveTo = dto.EffectiveTo,
            GrantedBy = grantedBy,
            CreatedAt = DateTime.UtcNow
        };

        _db.UserInvoiceCompanyPermissions.Add(permission);
        await _db.SaveChangesAsync();

        await _db.Entry(permission).Reference(p => p.User).LoadAsync();
        await _db.Entry(permission).Reference(p => p.InvoiceCompany).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = permission.Id }, new { success = true, data = new UserInvoicePermissionDto(
            permission.Id, permission.UserId, permission.User.DisplayName, permission.User.Email,
            permission.InvoiceCompanyId, permission.InvoiceCompany.CompanyName,
            permission.PermissionType.ToString(), permission.EffectiveFrom, permission.EffectiveTo,
            permission.GrantedBy, permission.CreatedAt
        )});
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateUserInvoicePermissionRequest dto)
    {
        var permission = await _db.UserInvoiceCompanyPermissions
            .Include(p => p.User)
            .Include(p => p.InvoiceCompany)
            .FirstOrDefaultAsync(p => p.Id == id && p.RevokedAt == null);

        if (permission == null)
            return NotFound(new { success = false, message = "Permission not found" });

        if (!string.IsNullOrEmpty(dto.PermissionType) && Enum.TryParse<InvoiceCompanyPermissionType>(dto.PermissionType, true, out var permType))
            permission.PermissionType = permType;
        if (dto.EffectiveFrom.HasValue) permission.EffectiveFrom = dto.EffectiveFrom.Value;
        if (dto.EffectiveTo.HasValue) permission.EffectiveTo = dto.EffectiveTo.Value;

        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = new UserInvoicePermissionDto(
            permission.Id, permission.UserId, permission.User.DisplayName, permission.User.Email,
            permission.InvoiceCompanyId, permission.InvoiceCompany.CompanyName,
            permission.PermissionType.ToString(), permission.EffectiveFrom, permission.EffectiveTo,
            permission.GrantedBy, permission.CreatedAt
        )});
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var permission = await _db.UserInvoiceCompanyPermissions
            .FirstOrDefaultAsync(p => p.Id == id && p.RevokedAt == null);

        if (permission == null)
            return NotFound(new { success = false, message = "Permission not found" });

        permission.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Permission revoked" });
    }

    // PUT /api/user-invoice-permissions/by-user/{userId}
    // 批量替换用户的所有开票公司权限（替换而非逐个更新）
    [HttpPut("by-user/{userId}")]
    public async Task<ActionResult> ReplaceByUser(string userId, [FromBody] ReplaceUserInvoicePermissionsRequest dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (user == null)
            return BadRequest(new { success = false, message = "User not found or inactive" });

        // 软删除该用户所有现有权限
        var existing = await _db.UserInvoiceCompanyPermissions
            .Where(p => p.UserId == userId && p.RevokedAt == null)
            .ToListAsync();
        foreach (var p in existing) p.RevokedAt = DateTime.UtcNow;

        // 新增新的权限记录
        if (dto.InvoiceCompanyIds != null)
        {
            var permType = Enum.TryParse<InvoiceCompanyPermissionType>(dto.PermissionType, true, out var pt) ? pt : InvoiceCompanyPermissionType.VIEW_SUBMIT;
            foreach (var companyId in dto.InvoiceCompanyIds)
            {
                var company = await _db.InvoiceCompanies.FirstOrDefaultAsync(c => c.Id == companyId && !c.IsDeleted && c.IsActive);
                if (company == null) continue;

                _db.UserInvoiceCompanyPermissions.Add(new UserInvoiceCompanyPermission
                {
                    UserId = userId,
                    InvoiceCompanyId = companyId,
                    PermissionType = permType,
                    EffectiveFrom = dto.EffectiveFrom ?? DateTime.UtcNow,
                    EffectiveTo = dto.EffectiveTo,
                    GrantedBy = User.Identity?.Name ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "权限已更新" });
    }
}
