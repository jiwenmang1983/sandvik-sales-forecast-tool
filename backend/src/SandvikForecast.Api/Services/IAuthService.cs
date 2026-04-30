using SandvikForecast.Api.DTOs;
namespace SandvikForecast.Api.Services;
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task<UserDto?> GetUserByIdAsync(string userId);
}