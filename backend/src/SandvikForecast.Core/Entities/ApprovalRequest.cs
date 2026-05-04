using System.ComponentModel.DataAnnotations;

namespace SandvikForecast.Core.Entities;

public class ApprovalRequest : BaseEntity
{
    [Key]
    public new int Id { get; set; }
    public string ForecastPeriodId { get; set; }
    public string UserId { get; set; }
    public string? RegionId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, PendingReview
    
    /// <summary>
    /// 当前审批人邮箱（用于追踪审批链）
    /// </summary>
    public string? CurrentApproverEmail { get; set; }
    
    /// <summary>
    /// 当前审批节点级别：直线经理 / 区域总监 / 总经理
    /// </summary>
    public string? CurrentNodeLevel { get; set; }
    
    /// <summary>
    /// 被退回的目标节点级别（用于重新提交时继续推进）
    /// </summary>
    public string? ReturnedToNodeLevel { get; set; }
    
    public string? Comments { get; set; }
}
