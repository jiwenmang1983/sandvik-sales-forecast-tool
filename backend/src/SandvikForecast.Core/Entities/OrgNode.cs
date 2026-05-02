namespace SandvikForecast.Core.Entities;

public class OrgNode : BaseEntity
{
    // Shadow BaseEntity.Id with the actual DB int auto-inc
    public new int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // SYS_ADMIN, CEO, VP_SALES, REGION_DIRECTOR, DIRECTOR, MANAGER, SALES, FINANCE_MANAGER
    public int? ParentId { get; set; }
    public string? Region { get; set; } // e.g., 华东大区, 华南大区
    public string? Company { get; set; }
    public string Status { get; set; } = "Active"; // matches table column: Active/Inactive
}
