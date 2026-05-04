namespace SandvikForecast.Core.Entities;

/// <summary>
/// 配置每个审批节点是否允许修改明细数据
/// </summary>
public class ApprovalFlowNodeConfig
{
    public int Id { get; set; }
    
    /// <summary>
    /// 关联的周期ID，null表示全局默认配置
    /// </summary>
    public int? ForecastPeriodId { get; set; }
    
    /// <summary>
    /// 节点级别：直线经理 / 区域总监 / 总经理
    /// </summary>
    public string NodeLevel { get; set; } = string.Empty;
    
    /// <summary>
    /// 该节点是否可以修改明细数据
    /// </summary>
    public bool CanModifyData { get; set; }
    
    /// <summary>
    /// 备注说明
    /// </summary>
    public string? Comments { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}