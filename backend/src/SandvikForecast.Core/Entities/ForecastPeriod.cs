namespace SandvikForecast.Core.Entities;
public class ForecastPeriod : BaseEntity
{
    public int PeriodYear { get; set; }
    public int PeriodMonth { get; set; }
    public string PeriodType { get; set; } = "Monthly";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = "Draft";
    public DateTime? SubmitDeadline { get; set; }
    public DateTime? ApproveDeadline { get; set; }
}