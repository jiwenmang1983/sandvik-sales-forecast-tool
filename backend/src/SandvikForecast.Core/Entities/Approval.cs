namespace SandvikForecast.Core.Entities;
public class Approval : BaseEntity
{
    public string ForecastRecordId { get; set; }
    public string ApproverUserId { get; set; }
    public string Level { get; set; } = "L1";
    public string Result { get; set; } = "Pending";
    public string? Comment { get; set; }
    public DateTime? ApprovedAt { get; set; }
}