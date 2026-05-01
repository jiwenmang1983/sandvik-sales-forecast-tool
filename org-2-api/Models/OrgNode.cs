using System.Text.Json.Serialization;

namespace org2_api.Models;

public class OrgNode
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public string? Region { get; set; }
    public string? Company { get; set; }
    public string Status { get; set; } = "Active";

    // Navigation — excluded from JSON to prevent circular reference
    [JsonIgnore]
    public OrgNode? Parent { get; set; }

    [JsonIgnore]
    public List<OrgNode> Children { get; set; } = [];
}
