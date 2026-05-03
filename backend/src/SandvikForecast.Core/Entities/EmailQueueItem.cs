namespace SandvikForecast.Core.Entities;

public class EmailQueueItem
{
    public int Id { get; set; }
    public string ToEmail { get; set; } = string.Empty;
    public string? CcEmail { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int? TemplateId { get; set; }
    public string? TemplateVariables { get; set; }
    public string Status { get; set; } = "Pending";
    public int RetryCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
}