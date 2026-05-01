using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/permissions")]
[Authorize]
public class PermissionsController : ControllerBase
{
    // Hardcoded roles and permissions structure
    private static readonly List<RoleDto> _roles = new()
    {
        new RoleDto { Id = "1", Name = "管理员", Description = "系统全部权限", IsDefault = false },
        new RoleDto { Id = "2", Name = "区域总监", Description = "区域内预测管理审批", IsDefault = true },
        new RoleDto { Id = "3", Name = "财务", Description = "财务审核权限", IsDefault = true },
        new RoleDto { Id = "4", Name = "销售", Description = "填报和查看本人数据", IsDefault = true }
    };

    // Default permissions for each role
    private static readonly Dictionary<string, List<string>> _defaultPermissions = new()
    {
        ["1"] = new List<string> // 管理员 - all permissions
        {
            "forecast_view", "forecast_edit", "forecast_submit", "forecast_add", "forecast_delete", "forecast_export", "forecast_approve",
            "approval_view", "approval_approve", "approval_reject",
            "basedata_view", "basedata_product", "basedata_customer", "basedata_add", "basedata_edit", "basedata_delete", "basedata_export",
            "users_view", "users_add", "users_edit", "users_delete", "users_export",
            "system_period", "system_flow", "system_log"
        },
        ["2"] = new List<string> // 区域总监
        {
            "forecast_view", "forecast_edit", "forecast_submit", "forecast_export",
            "approval_view", "approval_approve", "approval_reject",
            "basedata_view", "basedata_export",
            "system_period", "system_flow"
        },
        ["3"] = new List<string> // 财务
        {
            "forecast_view", "forecast_export",
            "approval_view", "approval_approve", "approval_reject",
            "basedata_view", "basedata_export"
        },
        ["4"] = new List<string> // 销售
        {
            "forecast_view", "forecast_edit", "forecast_submit"
        }
    };

    // Current permissions (would be stored in DB in real app)
    private static readonly Dictionary<string, List<string>> _userPermissions = new()
    {
        ["1"] = new List<string>(), // Will be populated from _defaultPermissions["1"]
        ["2"] = new List<string>(),
        ["3"] = new List<string>(),
        ["4"] = new List<string>()
    };

    // Initialize with defaults
    static PermissionsController()
    {
        foreach (var role in _defaultPermissions)
        {
            _userPermissions[role.Key] = new List<string>(role.Value);
        }
    }

    // GET /api/permissions/{userId} - returns permissions for a user
    // Returns: {userId, role, permissions: [...]}
    [HttpGet("{userId}")]
    public ActionResult GetUserPermissions(string userId)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == userId);
            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            var permissions = _userPermissions.ContainsKey(userId) 
                ? _userPermissions[userId] 
                : new List<string>();

            return Ok(new { success = true, data = permissions });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // PUT /api/permissions/{userId} - updates permissions
    // Body: {role, permissions: [...]}
    [HttpPut("{userId}")]
    public ActionResult UpdateUserPermissions(string userId, [FromBody] UpdatePermissionsRequest request)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == userId);
            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            _userPermissions[userId] = request.Permissions ?? new List<string>();

            return Ok(new { success = true, message = "Permissions updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/permissions/roles - returns all available roles and their default permissions
    [HttpGet("roles")]
    public ActionResult GetRoles()
    {
        try
        {
            return Ok(new { success = true, data = _roles });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // POST /api/permissions/{userId}/reset - reset permissions to default
    [HttpPost("{userId}/reset")]
    public ActionResult ResetPermissions(string userId)
    {
        try
        {
            var role = _roles.FirstOrDefault(r => r.Id == userId);
            if (role == null)
                return NotFound(new { success = false, message = "Role not found" });

            if (_defaultPermissions.ContainsKey(userId))
            {
                _userPermissions[userId] = new List<string>(_defaultPermissions[userId]);
            }

            return Ok(new { success = true, message = "Permissions reset to default" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public record UpdatePermissionsRequest(List<string>? Permissions);
