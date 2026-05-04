namespace SandvikForecast.Core.Entities;

public class UserInvoiceCompanyPermission
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string InvoiceCompanyId { get; set; } = string.Empty;
    public InvoiceCompanyPermissionType PermissionType { get; set; } = InvoiceCompanyPermissionType.VIEW_SUBMIT;
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string GrantedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }

    public User User { get; set; } = null!;
    public InvoiceCompany InvoiceCompany { get; set; } = null!;
}

public enum InvoiceCompanyPermissionType
{
    NONE = 0,
    VIEW_SUBMIT = 1,
    VIEW_APPROVE = 2,
    VIEW_ALL = 3
}
