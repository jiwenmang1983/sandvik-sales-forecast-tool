namespace SandvikForecast.Api.DTOs;

public record UserInvoicePermissionDto(
    int Id,
    string UserId,
    string UserName,
    string Email,
    string InvoiceCompanyId,
    string InvoiceCompanyName,
    string PermissionType,
    DateTime EffectiveFrom,
    DateTime? EffectiveTo,
    string GrantedBy,
    DateTime CreatedAt
);

public record CreateUserInvoicePermissionRequest(
    string UserId,
    string InvoiceCompanyId,
    string PermissionType = "VIEW_SUBMIT",
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null
);

public record UpdateUserInvoicePermissionRequest(
    string? PermissionType = null,
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null
);

public record ReplaceUserInvoicePermissionsRequest(
    List<string> InvoiceCompanyIds,
    string PermissionType = "VIEW_SUBMIT",
    DateTime? EffectiveFrom = null,
    DateTime? EffectiveTo = null
);
