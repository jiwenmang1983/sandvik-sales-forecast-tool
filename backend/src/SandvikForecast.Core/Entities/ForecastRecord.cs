namespace SandvikForecast.Core.Entities;
public class ForecastRecord : BaseEntity
{
    public string ForecastPeriodId { get; set; }
    public string CustomerId { get; set; }
    public string InvoiceCompanyId { get; set; }
    public string ProductId { get; set; }
    public string CreatedByUserId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Amount { get; set; } = 0;
    public string Currency { get; set; } = "CNY";
    public string Status { get; set; } = "Draft";
    public string? Notes { get; set; }
}