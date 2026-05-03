namespace SandvikForecast.Core.Entities;
public class Customer : BaseEntity
{
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerNameEn { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Brand { get; set; } = "Sandvik";
    public string? SalesPersonId { get; set; }
    public bool IsActive { get; set; } = true;
}