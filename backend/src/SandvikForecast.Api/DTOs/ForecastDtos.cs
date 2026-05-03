namespace SandvikForecast.Api.DTOs;

public record ForecastPeriodDto(
    string Id,
    string FcName,
    DateTime FillTimeStart,
    DateTime FillTimeEnd,
    string PeriodStartYearMonth,
    string PeriodEndYearMonth,
    DateTime? ExtensionStart,
    DateTime? ExtensionEnd,
    string ExtensionUsers,
    DateTime CreatedAt
);

public record CreateForecastPeriodRequest(
    string FcName,
    DateTime FillTimeStart,
    DateTime FillTimeEnd,
    string PeriodStartYearMonth,
    string PeriodEndYearMonth,
    DateTime? ExtensionStart,
    DateTime? ExtensionEnd,
    string? ExtensionUsers
);

public record UpdateForecastPeriodRequest(
    string FcName,
    DateTime FillTimeStart,
    DateTime FillTimeEnd,
    string PeriodStartYearMonth,
    string PeriodEndYearMonth,
    DateTime? ExtensionStart,
    DateTime? ExtensionEnd,
    string? ExtensionUsers
);

public record ForecastRecordDto(
    Guid Id,
    Guid ForecastPeriodId,
    Guid CustomerId,
    Guid InvoiceCompanyId,
    Guid ProductId,
    int Year,
    int Month,
    decimal OrderQty,
    decimal OrderAmount,
    decimal InvoiceQty,
    decimal InvoiceAmount,
    decimal UnitPrice,
    string Status,
    string? Notes);

public record CreateForecastRecordRequest(
    Guid CustomerId,
    Guid InvoiceCompanyId,
    Guid ProductId,
    int Year,
    int Month,
    decimal OrderQty,
    decimal OrderAmount,
    decimal InvoiceQty,
    decimal InvoiceAmount,
    string? Notes);

public record UpdateForecastRecordRequest(
    decimal OrderQty,
    decimal OrderAmount,
    decimal InvoiceQty,
    decimal InvoiceAmount,
    string? Notes,
    string Status);