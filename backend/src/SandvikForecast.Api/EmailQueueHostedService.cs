using Microsoft.EntityFrameworkCore;
using SandvikForecast.Infrastructure.Data;
using SandvikForecast.Api.Services;

namespace SandvikForecast.Api;

public class EmailQueueHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailQueueHostedService> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(60);

    public EmailQueueHostedService(IServiceProvider serviceProvider, ILogger<EmailQueueHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailQueueHostedService polling started");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessQueueAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email queue");
            }
            await Task.Delay(_pollingInterval, stoppingToken);
        }
    }

    private async Task ProcessQueueAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SandvikDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

        var pendingItems = await db.EmailQueueItems
            .Where(e => e.Status == "Pending" && e.RetryCount < 3)
            .Take(20)
            .ToListAsync(ct);

        if (pendingItems.Count == 0)
            return;

        _logger.LogInformation("Processing {Count} pending email queue items", pendingItems.Count);

        foreach (var item in pendingItems)
        {
            try
            {
                await emailService.SendAsync(item.ToEmail, item.Subject, item.Body, item.CcEmail);

                item.Status = "Sent";
                item.SentAt = DateTime.UtcNow;
                item.ErrorMessage = null;
                _logger.LogInformation("Email sent to {To} (queue item {Id})", item.ToEmail, item.Id);
            }
            catch (Exception ex)
            {
                item.RetryCount++;
                item.ErrorMessage = ex.Message;
                item.Status = item.RetryCount >= 3 ? "Failed" : "Pending";
                _logger.LogWarning("Email send failed for {Id}, retry {Retry}: {Error}",
                    item.Id, item.RetryCount, ex.Message);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}