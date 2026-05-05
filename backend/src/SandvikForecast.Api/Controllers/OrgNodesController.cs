using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/org-nodes")]
[Authorize]
public class OrgNodesController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public OrgNodesController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetOrgNodes([FromQuery] string? region, [FromQuery] string? keyword)
    {
        try
        {
            var query = _db.OrgNodes.Where(o => o.Status == "Active");

            if (!string.IsNullOrEmpty(keyword))
            {
                var k = keyword.ToLower();
                query = query.Where(o => o.Name.ToLower().Contains(k) || o.Email.ToLower().Contains(k));
            }

            var result = await query.Select(o => new {
                id = o.Id.ToString(),
                o.Name,
                o.Email,
                o.Role,
                o.Region,
                o.Company,
                o.SalesRegion,
                o.SalesDistrict,
                parentId = o.ParentId.HasValue ? o.ParentId.Value.ToString() : null,
                status = o.Status.ToLower()
            }).ToListAsync();

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetOrgNode(string id)
    {
        try
        {
            if (!int.TryParse(id, out var intId))
                return BadRequest(new { success = false, message = "Invalid id format" });

            var node = await _db.OrgNodes.FindAsync(intId);
            if (node == null)
                return NotFound(new { success = false, message = "Org node not found" });

            return Ok(new { success = true, data = new {
                id = node.Id.ToString(),
                node.Name,
                node.Email,
                node.Role,
                node.Region,
                node.Company,
                parentId = node.ParentId.HasValue ? node.ParentId.Value.ToString() : null,
                status = node.Status.ToLower()
            }});
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private static readonly HashSet<string> ValidRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        "SYS_ADMIN", "CEO", "VP_SALES", "REGION_DIRECTOR",
        "DIRECTOR", "MANAGER", "SALES", "FINANCE_MANAGER"
    };

    private object ToDto(OrgNode node) => new
    {
        id = node.Id.ToString(),
        node.Name,
        node.Email,
        node.Role,
        node.Region,
        node.SalesRegion,
        node.SalesDistrict,
        node.Company,
        parentId = node.ParentId.HasValue ? node.ParentId.Value.ToString() : null,
        status = node.Status.ToLower()
    };

    [HttpPost]
    public async Task<ActionResult> CreateOrgNode([FromBody] CreateOrgNodeDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { success = false, message = "Name and email are required" });

            if (!ValidRoles.Contains(dto.Role ?? ""))
                return BadRequest(new { success = false, message = "Invalid role. Must be one of: SYS_ADMIN, CEO, VP_SALES, REGION_DIRECTOR, DIRECTOR, MANAGER, SALES, FINANCE_MANAGER" });

            if (dto.ParentId != null)
            {
                if (!int.TryParse(dto.ParentId, out var parentIntId))
                    return BadRequest(new { success = false, message = "Invalid parentId format" });

                var parent = await _db.OrgNodes.FindAsync(parentIntId);
                if (parent == null)
                    return NotFound(new { success = false, message = "Parent org node not found" });
            }

            var node = new OrgNode
            {
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role!,
                ParentId = int.TryParse(dto.ParentId, out var pid) ? pid : null,
                Region = dto.Region,
                SalesRegion = dto.SalesRegion,
                SalesDistrict = dto.SalesDistrict,
                Company = dto.Company,
                Status = "Active"
            };

            _db.OrgNodes.Add(node);
            await _db.SaveChangesAsync();

            return Created($"/api/org-nodes/{node.Id}", new { success = true, data = ToDto(node) });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateOrgNode(string id, [FromBody] UpdateOrgNodeDto dto)
    {
        try
        {
            if (!int.TryParse(id, out var intId))
                return BadRequest(new { success = false, message = "Invalid id format" });

            var node = await _db.OrgNodes.FindAsync(intId);
            if (node == null)
                return NotFound(new { success = false, message = "Org node not found" });

            if (!string.IsNullOrWhiteSpace(dto.Role) && !ValidRoles.Contains(dto.Role))
                return BadRequest(new { success = false, message = "Invalid role. Must be one of: SYS_ADMIN, CEO, VP_SALES, REGION_DIRECTOR, DIRECTOR, MANAGER, SALES, FINANCE_MANAGER" });

            if (dto.ParentId != null)
            {
                if (!int.TryParse(dto.ParentId, out var parentIntId))
                    return BadRequest(new { success = false, message = "Invalid parentId format" });

                if (parentIntId == intId)
                    return BadRequest(new { success = false, message = "A node cannot be its own parent" });

                var parent = await _db.OrgNodes.FindAsync(parentIntId);
                if (parent == null)
                    return NotFound(new { success = false, message = "Parent org node not found" });

                node.ParentId = parentIntId;
            }

            if (!string.IsNullOrWhiteSpace(dto.Name)) node.Name = dto.Name;
            if (!string.IsNullOrWhiteSpace(dto.Email)) node.Email = dto.Email;
            if (!string.IsNullOrWhiteSpace(dto.Role)) node.Role = dto.Role;
            if (dto.Region != null) node.Region = dto.Region;
            if (dto.SalesRegion != null) node.SalesRegion = dto.SalesRegion;
            if (dto.SalesDistrict != null) node.SalesDistrict = dto.SalesDistrict;
            if (dto.Company != null) node.Company = dto.Company;

            await _db.SaveChangesAsync();

            return Ok(new { success = true, data = ToDto(node) });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteOrgNode(string id)
    {
        try
        {
            if (!int.TryParse(id, out var intId))
                return BadRequest(new { success = false, message = "Invalid id format" });

            var node = await _db.OrgNodes.FindAsync(intId);
            if (node == null)
                return NotFound(new { success = false, message = "Org node not found" });

            node.Status = "Inactive";

            var children = await _db.OrgNodes.Where(o => o.ParentId == intId && o.Status == "Active").ToListAsync();
            foreach (var child in children)
                child.Status = "Inactive";

            await _db.SaveChangesAsync();

            return Ok(new { success = true, message = "Org node and all children soft-deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}