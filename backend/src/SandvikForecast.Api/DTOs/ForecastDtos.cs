namespace SandvikForecast.Api.DTOs;
public record ForecastPeriodDto(Guid Id, int Year, int Month, string PeriodType, string Status, DateTime StartDate, DateTime EndDate, DateTime? SubmitDeadline, DateTime? ApproveDeadline);
public record ForecastRecordDto(Guid Id, Guid ForecastPeriodId, Guid CustomerId, Guid InvoiceCompanyId, Guid ProductId, int Year, int Month, decimal Amount, string Currency, string Status, string? Notes);
public record CreateForecastRecordRequest(Guid CustomerId, Guid InvoiceCompanyId, Guid ProductId, decimal Amount, string? Notes);
public record UpdateForecastRecordRequest(decimal Amount, string? Notes, string Status);