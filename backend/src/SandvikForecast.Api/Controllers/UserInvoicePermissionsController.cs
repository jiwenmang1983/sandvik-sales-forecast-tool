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

    // GET /api/user-invoice-permissions?userId=&invoiceCompanyId=
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

    // GET /api/user-invoice-permissions/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var p = await _db.UserInvoiceCompanyPermissions
            .Include(p => p.User)
            .Include(p => p.InvoiceCompany)
            .FirstOrDefaultAsync(p => p.Id == id && p.RevokedAt == null);

        if (p == null)
            return NotFound(new { success = false, message = "Permission not found" });

        return Ok(new
        {
            success = true,
            data = new UserInvoicePermissionDto(
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
            )
        });
    }

    // POST /api/user-invoice-permissions
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
            return Conflict(new { success = false, message = "Permission already exists for this user and company" });

        if (!Enum.TryParse<InvoiceCompanyPermissionType>(dto.PermissionType, true, out var permType))
            permType = InvoiceCompanyPermissionType.VIEW_SUBMIT;

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

        // reload with nav props for response
        await _db.Entry(permission).Reference(p => p.User).LoadAsync();
        await _db.Entry(permission).Reference(p => p.InvoiceCompany).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = permission.Id }, new
        {
            success = true,
            data = new UserInvoicePermissionDto(
                permission.Id,
                permission.UserId,
                permission.User.DisplayName,
                permission.User.Email,
                permission.InvoiceCompanyId,
                permission.InvoiceCompany.CompanyName,
                permission.PermissionType.ToString(),
                permission.EffectiveFrom,
                permission.EffectiveTo,
                permission.GrantedBy,
                permission.CreatedAt
            )
        });
    }

    // PUT /api/user-invoice-permissions/{id}
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

        if (dto.EffectiveFrom.HasValue)
            permission.EffectiveFrom = dto.EffectiveFrom.Value;

        if (dto.EffectiveTo.HasValue)
            permission.EffectiveTo = dto.EffectiveTo.Value;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            data = new UserInvoicePermissionDto(
                permission.Id,
                permission.UserId,
                permission.User.DisplayName,
                permission.User.Email,
                permission.InvoiceCompanyId,
                permission.InvoiceCompany.CompanyName,
                permission.PermissionType.ToString(),
                permission.EffectiveFrom,
                permission.EffectiveTo,
                permission.GrantedBy,
                permission.CreatedAt
            )
        });
    }

    // DELETE /api/user-invoice-permissions/{id}
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
}
