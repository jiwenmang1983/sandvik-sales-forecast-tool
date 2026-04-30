namespace SandvikForecast.Core.Entities;
public class ProductHierarchy : BaseEntity
{
    public int ProductLevel { get; set; } // 1=PA, 2=SubPA1, 3=SubPA2, 4=SKU
    public string? ParentId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}