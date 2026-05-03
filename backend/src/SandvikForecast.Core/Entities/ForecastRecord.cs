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

    /// <summary>Order quantity (pieces)</summary>
    public decimal OrderQty { get; set; } = 0;
    /// <summary>Order amount in CNY (yuan)</summary>
    public decimal OrderAmount { get; set; } = 0;
    /// <summary>Invoice quantity (pieces)</summary>
    public decimal InvoiceQty { get; set; } = 0;
    /// <summary>Invoice amount in CNY (yuan)</summary>
    public decimal InvoiceAmount { get; set; } = 0;

    /// <summary>Auto-calculated = OrderAmount / OrderQty (not persisted)</summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public decimal UnitPrice => OrderQty != 0 ? Math.Round(OrderAmount / OrderQty, 2) : 0;

    public string Status { get; set; } = "Draft";
    public string? Notes { get; set; }
}