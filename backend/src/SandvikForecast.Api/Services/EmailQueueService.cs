using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Services;

public class EmailQueueService : IEmailQueueService
{
    private readonly SandvikDbContext _db;
    public EmailQueueService(SandvikDbContext db) => _db = db;

    public async Task QueueEmailAsync(
        string toEmail,
        string? ccEmail,
        string subject,
        string body,
        int? templateId = null,
        string? templateVariables = null)
    {
        var item = new EmailQueueItem
        {
            ToEmail = toEmail,
            CcEmail = ccEmail,
            Subject = subject,
            Body = body,
            TemplateId = templateId,
            TemplateVariables = templateVariables,
            Status = "Pending",
            RetryCount = 0,
            CreatedAt = DateTime.UtcNow
        };
        _db.EmailQueueItems.Add(item);
        await _db.SaveChangesAsync();
    }
}