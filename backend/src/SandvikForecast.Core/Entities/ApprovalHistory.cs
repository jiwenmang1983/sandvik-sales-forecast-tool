namespace SandvikForecast.Core.Entities;

public class ApprovalHistory
{
    public int Id { get; set; }
    public int ApprovalRequestId { get; set; }
    public string Action { get; set; } = string.Empty; // SUBMIT / APPROVE / REJECT / ADJUST / RETURNED
    public string OperatorUserId { get; set; }
    public DateTime OperatedAt { get; set; } = DateTime.UtcNow;
    public string? Comments { get; set; }
    public decimal? AdjustOrderAmount { get; set; }
    public decimal? AdjustInvoiceAmount { get; set; }
    public decimal? AdjustOrderQty { get; set; }
    public decimal? AdjustInvoiceQty { get; set; }
    
    /// <summary>
    /// 退回的目标节点级别（用于 RETURNED 动作）
    /// </summary>
    public string? ToLevel { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}