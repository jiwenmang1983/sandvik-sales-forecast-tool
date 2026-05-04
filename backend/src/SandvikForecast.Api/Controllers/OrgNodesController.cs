using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
}