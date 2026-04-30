namespace SandvikForecast.Core.Entities;
public class LoginLog : BaseEntity
{
    public string? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public bool Success { get; set; } = false;
    public string? FailureReason { get; set; }
}