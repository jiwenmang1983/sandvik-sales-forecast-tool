using System.ComponentModel.DataAnnotations;

namespace SandvikForecast.Core.Entities;

public class ApprovalRequest : BaseEntity
{
    [Key]
    public new int Id { get; set; }
    public string ForecastPeriodId { get; set; }
    public string UserId { get; set; }
    public string? RegionId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? Comments { get; set; }
}
