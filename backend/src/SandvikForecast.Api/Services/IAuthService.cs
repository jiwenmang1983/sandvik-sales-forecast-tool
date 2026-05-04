using SandvikForecast.Api.DTOs;
using SandvikForecast.Core.Entities;
namespace SandvikForecast.Api.Services;
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task<UserDto?> GetUserByIdAsync(string userId);
    Task<LoginResponse> GenerateSsoTokenAsync(User user, string ipAddress, string userAgent, string loginMethod);
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string? deviceId);
}
