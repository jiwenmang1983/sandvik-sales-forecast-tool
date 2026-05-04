namespace SandvikForecast.Api.DTOs;
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string DisplayName, string Role, DateTime ExpiresAt);
public record ApiResponse<T>(bool Success, string? Message, T? Data)
{
    public static ApiResponse<T> Ok(T data, string? message = null) => new(true, message, data);
    public static ApiResponse<T> Fail(string message) => new(false, message, default);
}
public record UserDto(string Id, string UserName, string DisplayName, string Email, string Role, bool IsActive);
public record MicrosoftCallbackRequest(string Code, string State);