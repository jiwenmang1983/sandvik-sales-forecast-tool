namespace SandvikForecast.Core.Interfaces;

public interface IEmailQueueService
{
    Task QueueEmailAsync(
        string toEmail,
        string? ccEmail,
        string subject,
        string body,
        int? templateId = null,
        string? templateVariables = null);
}