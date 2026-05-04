using SandvikForecast.Core.Entities;

namespace SandvikForecast.Api.Services;

/// <summary>
/// T-023: 多设备登录互斥机制 - 登录会话服务接口
/// </summary>
public interface ILoginSessionService
{
    /// <summary>
    /// 创建新会话并踢出同一用户的其他活跃会话（互斥登录）
    /// </summary>
    /// <param name="userId">用户ID</param>
    /// <param name="deviceId">设备ID</param>
    /// <param name="deviceName">设备名称</param>
    /// <param name="refreshToken">刷新令牌</param>
    /// <returns>创建的会话</returns>
    Task<UserLoginSession> CreateSessionAsync(string userId, string deviceId, string? deviceName, string refreshToken);

    /// <summary>
    /// 根据RefreshToken获取会话
    /// </summary>
    Task<UserLoginSession?> GetSessionByRefreshTokenAsync(string refreshToken);

    /// <summary>
    /// 根据用户ID和设备ID获取会话
    /// </summary>
    Task<UserLoginSession?> GetSessionByUserAndDeviceAsync(string userId, string deviceId);

    /// <summary>
    /// 更新会话的LastActiveAt时间戳
    /// </summary>
    Task UpdateLastActiveAsync(int sessionId);

    /// <summary>
    /// 使会话失效（踢出设备）
    /// </summary>
    Task DeactivateSessionAsync(int sessionId);

    /// <summary>
    /// 删除会话（登出）
    /// </summary>
    Task DeleteSessionAsync(int sessionId);

    /// <summary>
    /// 踢出用户的所有其他设备会话（除了当前设备）
    /// </summary>
    Task KickOutOtherSessionsAsync(string userId, string currentDeviceId);

    /// <summary>
    /// 验证RefreshToken是否有效
    /// </summary>
    Task<bool> ValidateRefreshTokenAsync(string refreshToken);
}
