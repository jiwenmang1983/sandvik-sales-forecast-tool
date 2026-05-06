namespace SandvikForecast.Api.DTOs;

public record CreateCustomerDto(
    string CustomerCode,
    string CustomerName,
    string? CustomerNameEn,
    string Region,
    string Brand = "Sandvik",
    string? SalesPersonId = null,
    bool IsActive = true
);

public record UpdateCustomerDto(
    string? CustomerCode = null,
    string? CustomerName = null,
    string? CustomerNameEn = null,
    string? Region = null,
    string? Brand = null,
    string? SalesPersonId = null,
    bool? IsActive = null
);