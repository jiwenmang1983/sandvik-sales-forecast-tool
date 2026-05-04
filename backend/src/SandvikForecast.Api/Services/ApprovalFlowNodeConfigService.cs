using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Services;

public interface IApprovalFlowNodeConfigService
{
    /// <summary>
    /// 获取某周期的节点配置列表（包含全局默认配置）
    /// </summary>
    Task<List<ApprovalFlowNodeConfig>> GetConfigsForPeriodAsync(int? periodId);
    
    /// <summary>
    /// 获取某周期特定节点的配置（优先取周期配置，找不到则取全局默认）
    /// </summary>
    Task<ApprovalFlowNodeConfig?> GetConfigForNodeAsync(int? periodId, string nodeLevel);
    
    /// <summary>
    /// 设置或更新某周期的节点配置
    /// </summary>
    Task<ApprovalFlowNodeConfig> SetConfigAsync(int? periodId, string nodeLevel, bool canModifyData, string? comments = null);
    
    /// <summary>
    /// 检查某用户在某节点是否允许修改数据
    /// </summary>
    Task<bool> CanModifyDataAsync(int? periodId, string nodeLevel);
}

public class ApprovalFlowNodeConfigService : IApprovalFlowNodeConfigService
{
    private readonly SandvikDbContext _db;

    public ApprovalFlowNodeConfigService(SandvikDbContext db)
    {
        _db = db;
    }

    public async Task<List<ApprovalFlowNodeConfig>> GetConfigsForPeriodAsync(int? periodId)
    {
        // 获取该周期的配置和全局默认配置
        var configs = await _db.ApprovalFlowNodeConfigs
            .Where(c => c.ForecastPeriodId == periodId || c.ForecastPeriodId == null)
            .OrderBy(c => c.ForecastPeriodId == null) // 全局默认排在后面
            .ThenBy(c => c.NodeLevel)
            .ToListAsync();
        return configs;
    }

    public async Task<ApprovalFlowNodeConfig?> GetConfigForNodeAsync(int? periodId, string nodeLevel)
    {
        // 优先查找周期特定的配置
        var config = await _db.ApprovalFlowNodeConfigs
            .FirstOrDefaultAsync(c => c.ForecastPeriodId == periodId && c.NodeLevel == nodeLevel);
        
        if (config != null)
            return config;
        
        // 找不到则取全局默认
        return await _db.ApprovalFlowNodeConfigs
            .FirstOrDefaultAsync(c => c.ForecastPeriodId == null && c.NodeLevel == nodeLevel);
    }

    public async Task<ApprovalFlowNodeConfig> SetConfigAsync(int? periodId, string nodeLevel, bool canModifyData, string? comments = null)
    {
        var existing = await _db.ApprovalFlowNodeConfigs
            .FirstOrDefaultAsync(c => c.ForecastPeriodId == periodId && c.NodeLevel == nodeLevel);

        if (existing != null)
        {
            existing.CanModifyData = canModifyData;
            existing.Comments = comments;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return existing;
        }

        var newConfig = new ApprovalFlowNodeConfig
        {
            ForecastPeriodId = periodId,
            NodeLevel = nodeLevel,
            CanModifyData = canModifyData,
            Comments = comments,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.ApprovalFlowNodeConfigs.Add(newConfig);
        await _db.SaveChangesAsync();
        return newConfig;
    }

    public async Task<bool> CanModifyDataAsync(int? periodId, string nodeLevel)
    {
        var config = await GetConfigForNodeAsync(periodId, nodeLevel);
        return config?.CanModifyData ?? false; // 默认不允许修改
    }
}