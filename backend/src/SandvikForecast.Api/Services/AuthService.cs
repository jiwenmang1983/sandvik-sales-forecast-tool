using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
namespace SandvikForecast.Api.Services;
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly SandvikDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILoginSessionService _loginSessionService;
    public AuthService(IUserRepository userRepo, SandvikDbContext db, IConfiguration config, ILoginSessionService loginSessionService)
    {
        _userRepo = userRepo;
        _db = db;
        _config = config;
        _loginSessionService = loginSessionService;
    }
    public async Task<LoginResponse?> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        var passwordHash = HashPassword(request.Password);
        var user = await _userRepo.ValidateCredentialsAsync(request.Email, passwordHash);
        var loginLog = new LoginLog { UserName = request.Email, IpAddress = ipAddress, UserAgent = userAgent };
        if (user == null)
        {
            loginLog.Success = false;
            loginLog.FailureReason = "Invalid credentials";
            await _db.LoginLogs.AddAsync(loginLog);
            await _db.SaveChangesAsync();
            return null;
        }
        loginLog.UserId = user.Id;
        loginLog.Success = true;
        await _db.LoginLogs.AddAsync(loginLog);
        await _db.SaveChangesAsync();

        // Generate tokens
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(8);

        // T-023: 创建登录会话（互斥机制：同一用户其他设备会被踢出）
        await _loginSessionService.CreateSessionAsync(user.Id, request.DeviceId ?? "unknown", request.DeviceName, refreshToken);

        return new LoginResponse(token, refreshToken, user.DisplayName, user.Role, expiresAt);
    }
    public async Task<UserDto?> GetUserByIdAsync(string userId)
    {
        if (string.IsNullOrEmpty(userId)) return null;
        var user = await _userRepo.GetByIdAsync(userId);
        if (user == null) return null;
        return new UserDto(user.Id, user.UserName, user.DisplayName, user.Email, user.Role, user.IsActive);
    }
    public async Task<LoginResponse> GenerateSsoTokenAsync(User user, string ipAddress, string userAgent, string loginMethod)
    {
        var loginLog = new LoginLog 
        { 
            UserId = user.Id,
            UserName = user.Email, 
            IpAddress = ipAddress, 
            UserAgent = userAgent,
            Success = true
        };
        await _db.LoginLogs.AddAsync(loginLog);
        await _db.SaveChangesAsync();
        
        // Generate tokens
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddHours(8);

        // T-023: 创建登录会话（互斥机制）
        await _loginSessionService.CreateSessionAsync(user.Id, "sso", "SSO Device", refreshToken);

        return new LoginResponse(token, refreshToken, user.DisplayName, user.Role, expiresAt);
    }

    /// <summary>
    /// T-023: 刷新Token - 保持会话活跃，不创建新记录
    /// </summary>
    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? deviceId)
    {
        // 验证RefreshToken是否有效
        var session = await _loginSessionService.GetSessionByRefreshTokenAsync(refreshToken);
        if (session == null || !session.IsActive)
        {
            return null; // Token无效或已失效
        }

        // 获取用户信息
        var user = await _userRepo.GetByIdAsync(session.UserId);
        if (user == null || !user.IsActive)
        {
            return null;
        }

        // 生成新Token（但不替换RefreshToken，保持会话一致）
        var newToken = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(8);

        // 更新LastActiveAt - 保持会话活跃
        await _loginSessionService.UpdateLastActiveAsync(session.Id);

        return new LoginResponse(newToken, refreshToken, user.DisplayName, user.Role, expiresAt);
    }

    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    /// <summary>
    /// 生成刷新令牌
    /// </summary>
    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "SandvikForecastSecretKey2026VeryLongSecretKey!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("DisplayName", user.DisplayName)
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "SandvikForecast",
            audience: _config["Jwt:Audience"] ?? "SandvikForecastApp",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
