using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
namespace SandvikForecast.Api.Services;

/// <summary>
/// T-023: 多设备登录互斥机制 - 登录会话服务实现
/// </summary>
public class LoginSessionService : ILoginSessionService
{
    private readonly SandvikDbContext _db;
    public LoginSessionService(SandvikDbContext db)
    {
        _db = db;
    }

    public async Task<UserLoginSession> CreateSessionAsync(string userId, string deviceId, string? deviceName, string refreshToken)
    {
        // 1. 查询该用户的其他活跃会话（用于互斥：踢出其他设备）
        var otherSessions = await _db.UserLoginSessions
            .Where(s => s.UserId == userId && s.DeviceId != deviceId && s.IsActive)
            .ToListAsync();

        // 2. 将其他会话标记为 IsActive=false（踢出其他设备）
        foreach (var session in otherSessions)
        {
            session.IsActive = false;
        }

        // 3. 创建新会话记录
        var newSession = new UserLoginSession
        {
            UserId = userId,
            DeviceId = deviceId,
            DeviceName = deviceName,
            RefreshToken = refreshToken,
            CreatedAt = DateTime.UtcNow,
            LastActiveAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.UserLoginSessions.Add(newSession);
        await _db.SaveChangesAsync();

        return newSession;
    }

    public async Task<UserLoginSession?> GetSessionByRefreshTokenAsync(string refreshToken)
    {
        return await _db.UserLoginSessions
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && s.IsActive);
    }

    public async Task<UserLoginSession?> GetSessionByUserAndDeviceAsync(string userId, string deviceId)
    {
        return await _db.UserLoginSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.DeviceId == deviceId && s.IsActive);
    }

    public async Task UpdateLastActiveAsync(int sessionId)
    {
        var session = await _db.UserLoginSessions.FindAsync(sessionId);
        if (session != null)
        {
            session.LastActiveAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeactivateSessionAsync(int sessionId)
    {
        var session = await _db.UserLoginSessions.FindAsync(sessionId);
        if (session != null)
        {
            session.IsActive = false;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteSessionAsync(int sessionId)
    {
        var session = await _db.UserLoginSessions.FindAsync(sessionId);
        if (session != null)
        {
            _db.UserLoginSessions.Remove(session);
            await _db.SaveChangesAsync();
        }
    }

    public async Task KickOutOtherSessionsAsync(string userId, string currentDeviceId)
    {
        var otherSessions = await _db.UserLoginSessions
            .Where(s => s.UserId == userId && s.DeviceId != currentDeviceId && s.IsActive)
            .ToListAsync();

        foreach (var session in otherSessions)
        {
            session.IsActive = false;
        }

        await _db.SaveChangesAsync();
    }

    public async Task<bool> ValidateRefreshTokenAsync(string refreshToken)
    {
        var session = await _db.UserLoginSessions
            .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && s.IsActive);
        return session != null;
    }
}
