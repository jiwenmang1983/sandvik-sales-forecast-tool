namespace SandvikForecast.Core.Entities;

/// <summary>
/// Approval request history (for new approval flow)
/// Tracks: Submit / Approve / Reject / Adjust actions per request
/// Uses snake_case table name: approval_request_histories
/// </summary>
public class ApprovalRequestHistory
{
    public int Id { get; set; }
    public int ApprovalRequestId { get; set; }
    public string? ActorEmail { get; set; }
    public string Action { get; set; }  // "Submit" / "Approve" / "Reject" / "Adjust"
    public string? Comment { get; set; }
    public decimal? AdjustOrderAmount { get; set; }
    public decimal? AdjustInvoiceAmount { get; set; }
    public int? AdjustOrderQty { get; set; }
    public int? AdjustInvoiceQty { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}