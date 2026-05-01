using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepo;

    public UsersController(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<ActionResult> GetUsers([FromQuery] string? role, [FromQuery] string? status, [FromQuery] string? keyword)
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            
            if (!string.IsNullOrEmpty(role))
            {
                users = users.Where(u => u.Role == role);
            }
            
            if (!string.IsNullOrEmpty(status))
            {
                var isEnabled = status == "enabled";
                users = users.Where(u => u.IsActive == isEnabled);
            }
            
            if (!string.IsNullOrEmpty(keyword))
            {
                users = users.Where(u => 
                    u.DisplayName.Contains(keyword) || 
                    u.UserName.Contains(keyword) || 
                    u.Email.Contains(keyword));
            }
            
            // Exclude password from response
            var result = users.Select(u => new {
                u.Id,
                u.UserName,
                u.DisplayName,
                u.Email,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt
            }).ToList();
            
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetUser(string id)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });
            
            var result = new {
                user.Id,
                user.UserName,
                user.DisplayName,
                user.Email,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            };
            
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            // Check if username or email already exists
            var existing = await _userRepo.FindAsync(u => u.UserName == request.Account || u.Email == request.Email);
            if (existing.Any())
            {
                return BadRequest(new { success = false, message = "Username or email already exists" });
            }
            
            var user = new User
            {
                UserName = request.Account,
                DisplayName = request.Name,
                Email = request.Email,
                Role = request.Role,
                PasswordHash = HashPassword(request.Password ?? "123456"),
                IsActive = request.Status == "enabled"
            };
            
            var created = await _userRepo.AddAsync(user);
            
            var result = new {
                created.Id,
                created.UserName,
                created.DisplayName,
                created.Email,
                created.Role,
                created.IsActive,
                created.CreatedAt,
                created.UpdatedAt
            };
            
            return StatusCode(201, new { success = true, data = result, message = "User created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });
            
            if (!string.IsNullOrEmpty(request.Name))
                user.DisplayName = request.Name;
            if (!string.IsNullOrEmpty(request.Account))
                user.UserName = request.Account;
            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Role))
                user.Role = request.Role;
            if (!string.IsNullOrEmpty(request.Password))
                user.PasswordHash = HashPassword(request.Password);
            if (request.Status != null)
                user.IsActive = request.Status == "enabled";
            
            await _userRepo.UpdateAsync(user);
            
            var result = new {
                user.Id,
                user.UserName,
                user.DisplayName,
                user.Email,
                user.Role,
                user.IsActive,
                user.CreatedAt,
                user.UpdatedAt
            };
            
            return Ok(new { success = true, data = result, message = "User updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(string id)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });
            
            // Deactivate instead of hard delete
            user.IsActive = false;
            await _userRepo.UpdateAsync(user);
            
            return Ok(new { success = true, message = "User deactivated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("{id}/toggle-status")]
    public async Task<ActionResult> ToggleUserStatus(string id)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { success = false, message = "User not found" });
            
            user.IsActive = !user.IsActive;
            await _userRepo.UpdateAsync(user);
            
            return Ok(new { success = true, data = new { user.Id, user.IsActive }, message = $"User {(user.IsActive ? "enabled" : "disabled")}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}

public record CreateUserRequest(string Account, string Name, string Email, string Role, string? Password, string? Region, string? Status);
public record UpdateUserRequest(string? Account, string? Name, string? Email, string? Role, string? Password, string? Region, string? Status);