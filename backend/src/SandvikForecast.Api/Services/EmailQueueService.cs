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

    public async Task<List<EmailQueueItem>> GetPendingEmailsAsync(int limit = 100)
    {
        return await _db.EmailQueueItems
            .OrderByDescending(e => e.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<bool> ResendEmailAsync(int id)
    {
        var item = await _db.EmailQueueItems.FindAsync(id);
        if (item == null) return false;

        item.Status = "Pending";
        item.RetryCount = 0;
        item.ErrorMessage = null;
        await _db.SaveChangesAsync();
        return true;
    }
}
