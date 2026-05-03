namespace SandvikForecast.Core.Entities;
public class ForecastPeriod : BaseEntity
{
    public string FcName { get; set; } = string.Empty;
    public DateTime FillTimeStart { get; set; }
    public DateTime FillTimeEnd { get; set; }
    public string PeriodStartYearMonth { get; set; } = string.Empty;
    public string PeriodEndYearMonth { get; set; } = string.Empty;
    public DateTime? ExtensionStart { get; set; }
    public DateTime? ExtensionEnd { get; set; }
    public string ExtensionUsers { get; set; } = "[]";
    public string Status { get; set; } = "Draft";
}