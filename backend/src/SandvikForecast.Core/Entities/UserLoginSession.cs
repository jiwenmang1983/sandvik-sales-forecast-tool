namespace SandvikForecast.Core.Entities;

/// <summary>
/// T-023: 多设备登录互斥机制 - 用户登录设备记录表
/// 记录每个用户当前活跃的登录设备和Token，用于实现多设备登录互斥
/// </summary>
public class UserLoginSession
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // 用户ID（与User.Id对应）
    public string DeviceId { get; set; } = string.Empty;          // 设备标识
    public string? DeviceName { get; set; }        // 设备名称（可选）
    public string RefreshToken { get; set; } = string.Empty;      // Refresh Token
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActiveAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;            // 是否有效
}
