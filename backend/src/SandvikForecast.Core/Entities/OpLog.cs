namespace SandvikForecast.Core.Entities;
public class OpLog : BaseEntity
{
    public string? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Detail { get; set; }
    public string IpAddress { get; set; } = string.Empty;
}