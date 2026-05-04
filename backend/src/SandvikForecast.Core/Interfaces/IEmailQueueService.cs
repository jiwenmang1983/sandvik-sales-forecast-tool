using SandvikForecast.Core.Entities;

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

    Task<List<EmailQueueItem>> GetPendingEmailsAsync(int limit = 100);

    Task<bool> ResendEmailAsync(int id);
}
