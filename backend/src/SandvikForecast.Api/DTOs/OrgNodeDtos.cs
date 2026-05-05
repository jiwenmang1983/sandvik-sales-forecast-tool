namespace SandvikForecast.Api.DTOs;

public record CreateOrgNodeDto(
    string? Name,
    string? Email,
    string? Role,
    string? ParentId,
    string? Region,
    string? SalesRegion,
    string? SalesDistrict,
    string? Company
);

public record UpdateOrgNodeDto(
    string? Name,
    string? Email,
    string? Role,
    string? ParentId,
    string? Region,
    string? SalesRegion,
    string? SalesDistrict,
    string? Company
);