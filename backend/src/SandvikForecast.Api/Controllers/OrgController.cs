using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/org")]
[Authorize]
public class OrgController : ControllerBase
{
    private readonly IRepository<User> _userRepo;

    public OrgController(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    // GET /api/org/chart - returns org hierarchy for org chart view
    // Returns: [{id, name, email, role, department, title, children: []}]
    [HttpGet("chart")]
    public async Task<ActionResult> GetOrgChart([FromQuery] string? region, [FromQuery] string? keyword)
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            var userList = users.ToList();
            
            // Filter by region and keyword if provided
            if (!string.IsNullOrEmpty(keyword))
            {
                var k = keyword.ToLower();
                userList = userList.Where(u => 
                    u.DisplayName.ToLower().Contains(k) || 
                    u.Email.ToLower().Contains(k) ||
                    u.Role.ToLower().Contains(k)).ToList();
            }
            
            // Build tree structure - since we don't have parent/child relationships in User entity,
            // we'll return a flat list that the frontend can display as a tree
            var chartData = userList.Select(u => new
            {
                id = u.Id,
                name = u.DisplayName,
                email = u.Email,
                type = u.Role.ToLower(),
                region = "", // Not available in User entity
                company = "", // Not available in User entity
                parentId = (string?)null,
                status = u.IsActive ? "active" : "inactive",
                children = new List<object>()
            }).ToList();
            
            return Ok(new { success = true, data = chartData });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/org/members - returns flat list of all users with their managers
    // Returns: [{id, name, email, role, managerId, managerName}]
    [HttpGet("members")]
    public async Task<ActionResult> GetOrgMembers()
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            var userList = users.ToList();
            
            // Since User entity doesn't have ManagerId, return flat list without manager info
            var membersData = userList.Select(u => new
            {
                id = u.Id,
                name = u.DisplayName,
                email = u.Email,
                role = u.Role,
                managerId = (string?)null,
                managerName = (string?)null
            }).ToList();
            
            return Ok(new { success = true, data = membersData });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/org/tree - returns org hierarchy for tree view (used by frontend)
    [HttpGet("tree")]
    public async Task<ActionResult> GetOrgTree([FromQuery] string? region, [FromQuery] string? keyword)
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            var userList = users.ToList();
            
            // Filter by region and keyword if provided
            if (!string.IsNullOrEmpty(keyword))
            {
                var k = keyword.ToLower();
                userList = userList.Where(u => 
                    u.DisplayName.ToLower().Contains(k) || 
                    u.Email.ToLower().Contains(k) ||
                    u.Role.ToLower().Contains(k)).ToList();
            }
            
            // Build tree structure - since we don't have parent/child relationships in User entity,
            // we'll return a flat list that the frontend can display
            var treeData = userList.Select(u => new
            {
                id = u.Id,
                name = u.DisplayName,
                email = u.Email,
                type = u.Role.ToLower(),
                region = "", // Not available in User entity
                company = "", // Not available in User entity
                parentId = (string?)null,
                status = u.IsActive ? "active" : "inactive",
                children = new List<object>()
            }).ToList();
            
            return Ok(new { success = true, data = treeData });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // POST /api/org/nodes - creates a new org node (user)
    [HttpPost("nodes")]
    public async Task<ActionResult> CreateNode([FromBody] CreateOrgNodeRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { success = false, message = "Name and Email are required" });
            }

            var user = new User
            {
                DisplayName = request.Name,
                Email = request.Email,
                Role = MapNodeTypeToRole(request.Type),
                IsActive = request.Status == "active"
            };

            var created = await _userRepo.AddAsync(user);
            return StatusCode(201, new { success = true, data = new
            {
                id = created.Id,
                name = created.DisplayName,
                email = created.Email,
                type = created.Role.ToLower(),
                region = request.Region ?? "",
                company = request.Company ?? "",
                parentId = request.ParentId,
                status = created.IsActive ? "active" : "inactive"
            }, message = "Node created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // PUT /api/org/nodes/{id} - updates an org node
    [HttpPut("nodes/{id}")]
    public async Task<ActionResult> UpdateNode(string id, [FromBody] UpdateOrgNodeRequest request)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "Node not found" });

            if (!string.IsNullOrEmpty(request.Name))
                user.DisplayName = request.Name;
            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Type))
                user.Role = MapNodeTypeToRole(request.Type);
            if (request.Status != null)
                user.IsActive = request.Status == "active";

            await _userRepo.UpdateAsync(user);

            return Ok(new { success = true, data = new
            {
                id = user.Id,
                name = user.DisplayName,
                email = user.Email,
                type = user.Role.ToLower(),
                status = user.IsActive ? "active" : "inactive"
            }, message = "Node updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/org/nodes/{id} - deletes an org node
    [HttpDelete("nodes/{id}")]
    public async Task<ActionResult> DeleteNode(string id)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "Node not found" });

            // Soft delete by deactivating
            user.IsActive = false;
            await _userRepo.UpdateAsync(user);

            return Ok(new { success = true, message = "Node deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private static string MapNodeTypeToRole(string? type)
    {
        return type?.ToLower() switch
        {
            "sales" => "SALES",
            "manager" => "MANAGER",
            "director" => "DIRECTOR",
            "regionowner" => "REGION_OWNER",
            "finalapprover" => "FINAL_APPROVER",
            _ => "SALES"
        };
    }
}

public record CreateOrgNodeRequest(string Name, string Email, string? Type, string? Region, string? Company, string? ParentId, string Status);
public record UpdateOrgNodeRequest(string? Name, string? Email, string? Type, string? Region, string? Company, string? Status);

