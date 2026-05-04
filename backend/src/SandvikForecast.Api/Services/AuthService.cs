using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
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
    public AuthService(IUserRepository userRepo, SandvikDbContext db, IConfiguration config)
    {
        _userRepo = userRepo;
        _db = db;
        _config = config;
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
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(8);
        return new LoginResponse(token, user.DisplayName, user.Role, expiresAt);
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
        
        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(8);
        return new LoginResponse(token, user.DisplayName, user.Role, expiresAt);
    }
    private string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
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