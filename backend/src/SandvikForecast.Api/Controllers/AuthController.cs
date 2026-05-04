using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Api.Services;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using System.Security.Claims;
namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILoginSessionService _loginSessionService;
    private readonly IUserRepository _userRepo;
    private readonly SandvikDbContext _dbContext;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _config;
    public AuthController(IAuthService authService, ILoginSessionService loginSessionService, IUserRepository userRepo, SandvikDbContext dbContext, ILogger<AuthController> logger, IConfiguration config)
    {
        _authService = authService;
        _loginSessionService = loginSessionService;
        _userRepo = userRepo;
        _dbContext = dbContext;
        _logger = logger;
        _config = config;
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
            _logger.LogError(ex, "Login failed for user {Email}", request.Email);
            return StatusCode(500, new { success = false, message = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<object>>> Logout([FromBody] LogoutRequest? request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Fail("未授权"));
            }

            var deviceId = request?.DeviceId ?? "unknown";

            // 获取当前用户的当前设备会话
            var session = await _loginSessionService.GetSessionByUserAndDeviceAsync(userId, deviceId);
            if (session != null)
            {
                // 删除当前设备会话
                await _loginSessionService.DeleteSessionAsync(session.Id);
            }

            return Ok(ApiResponse<object>.Ok(null, "登出成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(ApiResponse<LoginResponse>.Fail("RefreshToken不能为空"));
            }

            var result = await _authService.RefreshTokenAsync(request.RefreshToken, request.DeviceId);
            if (result == null)
            {
                return Unauthorized(ApiResponse<LoginResponse>.Fail("RefreshToken无效或已过期"));
            }

            return Ok(ApiResponse<LoginResponse>.Ok(result, "Token刷新成功"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RefreshToken failed");
            return StatusCode(500, new { success = false, message = ex.Message });
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

    /// <summary>
    /// Initiates Microsoft SSO login - redirects to Microsoft identity platform
    /// </summary>
    [HttpGet("microsoft")]
    public IActionResult InitiateMicrosoftLogin([FromQuery] string? returnUrl = null)
    {
        var clientId = _config["AzureAd:ClientId"];
        var tenantId = _config["AzureAd:TenantId"];

        // If Azure AD is not configured, return error
        if (string.IsNullOrEmpty(clientId) || clientId.StartsWith("${") || string.IsNullOrEmpty(tenantId) || tenantId.StartsWith("${"))
        {
            return BadRequest(new { success = false, message = "Azure AD SSO 未配置，请使用本地登录" });
        }

        // Store return URL in cookie for redirect after SSO
        if (!string.IsNullOrEmpty(returnUrl))
        {
            Response.Cookies.Append("SsoReturnUrl", returnUrl, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                MaxAge = TimeSpan.FromMinutes(10)
            });
        }

        // Build callback URL - points to frontend callback page
        var frontendCallbackUrl = $"{Request.Scheme}://{Request.Host}/auth/microsoft-callback";
        var state = Guid.NewGuid().ToString();

        // Store state in cookie for CSRF protection
        Response.Cookies.Append("MsftAuthState", state, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            MaxAge = TimeSpan.FromMinutes(10)
        });

        // Build Microsoft authorization URL
        var authUrl = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize?" +
            $"client_id={clientId}" +
            $"&response_type=code" +
            $"&redirect_uri={Uri.EscapeDataString(frontendCallbackUrl)}" +
            $"&response_mode=query" +
            $"&scope=openid%20profile%20email" +
            $"&state={state}";

        return Redirect(authUrl);
    }

    /// <summary>
    /// Frontend calls this endpoint with the auth code to complete SSO login
    /// POST /api/auth/microsoft/callback
    /// </summary>
    [HttpPost("microsoft/callback")]
    public async Task<IActionResult> HandleMicrosoftCallback([FromBody] MicrosoftCallbackRequest request)
    {
        var code = request.Code;
        var state = request.State;

        // Validate state for CSRF protection
        var storedState = Request.Cookies["MsftAuthState"];
        if (string.IsNullOrEmpty(storedState) || storedState != state)
        {
            _logger.LogWarning("Microsoft SSO state mismatch");
            return Unauthorized(new { success = false, message = "SSO验证失败，请重试" });
        }

        // Clear state cookie
        Response.Cookies.Delete("MsftAuthState");

        if (string.IsNullOrEmpty(code))
        {
            return BadRequest(new { success = false, message = "未收到授权码" });
        }

        try
        {
            var clientId = _config["AzureAd:ClientId"]!;
            var tenantId = _config["AzureAd:TenantId"]!;

            // Use MSAL to exchange code for token
            var confidentialClient = ConfidentialClientApplicationBuilder
                .Create(clientId)
                .WithAuthority($"https://login.microsoftonline.com/{tenantId}")
                .WithRedirectUri($"https://{Request.Host}/auth/microsoft-callback")
                .Build();

            var result = await confidentialClient.AcquireTokenByAuthorizationCode(
                new[] { "openid", "profile", "email" },
                code
            ).ExecuteAsync();

            // Extract user info from the token
            var claims = result.ClaimsPrincipal.Claims;
            var email = claims.FirstOrDefault(c => c.Type == "email")?.Value 
                ?? claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
                ?? claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value;
            var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value
                ?? claims.FirstOrDefault(c => c.Type == "name")?.Value
                ?? claims.FirstOrDefault(c => c.Type == "displayName")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("No email claim found in Microsoft token");
                return Unauthorized(new { success = false, message = "无法从Microsoft账户获取邮箱信息" });
            }

            // Find or create user by email
            var user = await _userRepo.GetByEmailAsync(email);
            if (user == null)
            {
                // Create new user from Microsoft account
                user = new User
                {
                    UserName = email.Split('@')[0],
                    Email = email,
                    DisplayName = name ?? email.Split('@')[0],
                    PasswordHash = "", // No password for SSO users
                    Role = "员工", // Default role
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _userRepo.AddAsync(user);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Created new user from Microsoft SSO: {Email}", email);
            }

            // Generate our own JWT token
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = Request.Headers.UserAgent.ToString();
            var loginResponse = await _authService.GenerateSsoTokenAsync(user, ipAddress, userAgent, "Microsoft SSO");

            // Get return URL from cookie if exists
            var returnUrl = Request.Cookies["SsoReturnUrl"];
            Response.Cookies.Delete("SsoReturnUrl");

            // Return JWT token to frontend
            return Ok(new
            {
                success = true,
                message = "SSO登录成功",
                data = loginResponse,
                returnUrl = returnUrl ?? "/dashboard"
            });
        }
        catch (MsalException ex)
        {
            _logger.LogError(ex, "MSAL error during Microsoft SSO callback");
            return Unauthorized(new { success = false, message = "SSO登录失败，请重试" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Microsoft SSO callback");
            return StatusCode(500, new { success = false, message = "登录处理失败" });
        }
    }
}
