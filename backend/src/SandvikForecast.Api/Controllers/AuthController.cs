using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Api.Services;
namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = Request.Headers.UserAgent.ToString();
            var result = await _authService.LoginAsync(request, ipAddress, userAgent);
            if (result == null) return Unauthorized(ApiResponse<LoginResponse>.Fail("用户名或密码错误"));
            return Ok(ApiResponse<LoginResponse>.Ok(result, "登录成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for user {UserName}", request.UserName);
            return StatusCode(500, new { success = false, message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<UserDto>.Fail("未授权"));
        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null) return NotFound(ApiResponse<UserDto>.Fail("用户不存在"));
        return Ok(ApiResponse<UserDto>.Ok(user));
    }
}
