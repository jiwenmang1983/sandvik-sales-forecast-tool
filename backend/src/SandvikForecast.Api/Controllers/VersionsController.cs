using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/versions")]
[Authorize]
public class VersionsController : ControllerBase
{
    // In-memory list for forecast versions
    private static readonly List<ForecastVersionDto> _versions = new()
    {
        new ForecastVersionDto 
        { 
            Id = "v1", 
            VersionNumber = "2026FC3", 
            VersionName = "2026年第三季度预测", 
            Description = "2026 Q3 Forecast", 
            Status = "open", 
            CreatedBy = "admin", 
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        },
        new ForecastVersionDto 
        { 
            Id = "v2", 
            VersionNumber = "2026FC2", 
            VersionName = "2026年第二季度预测", 
            Description = "2026 Q2 Forecast", 
            Status = "closed", 
            CreatedBy = "admin", 
            CreatedAt = DateTime.UtcNow.AddDays(-90),
            UpdatedAt = DateTime.UtcNow.AddDays(-60)
        },
        new ForecastVersionDto 
        { 
            Id = "v3", 
            VersionNumber = "2026FC1", 
            VersionName = "2026年第一季度预测", 
            Description = "2026 Q1 Forecast", 
            Status = "closed", 
            CreatedBy = "admin", 
            CreatedAt = DateTime.UtcNow.AddDays(-180),
            UpdatedAt = DateTime.UtcNow.AddDays(-150)
        }
    };

    private static int _nextId = 4;

    // GET /api/versions - returns all forecast versions
    // Returns: [{id, versionNumber, versionName, description, status, createdBy, createdAt, updatedAt}]
    [HttpGet]
    public ActionResult GetVersions()
    {
        try
        {
            return Ok(new { success = true, data = _versions });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/versions/{id} - returns a single version
    [HttpGet("{id}")]
    public ActionResult GetVersion(string id)
    {
        try
        {
            var version = _versions.FirstOrDefault(v => v.Id == id);
            if (version == null)
                return NotFound(new { success = false, message = "Version not found" });
            return Ok(new { success = true, data = version });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // POST /api/versions - creates new version
    // Body: {versionNumber, versionName, description, status}
    [HttpPost]
    public ActionResult CreateVersion([FromBody] CreateVersionRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.VersionNumber) || string.IsNullOrEmpty(request.VersionName))
            {
                return BadRequest(new { success = false, message = "VersionNumber and VersionName are required" });
            }

            var version = new ForecastVersionDto
            {
                Id = "v" + _nextId++,
                VersionNumber = request.VersionNumber,
                VersionName = request.VersionName,
                Description = request.Description ?? "",
                Status = request.Status ?? "open",
                CreatedBy = "admin", // In a real app, get from JWT token
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _versions.Add(version);
            return StatusCode(201, new { success = true, data = version, message = "Version created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // PUT /api/versions/{id} - updates version
    [HttpPut("{id}")]
    public ActionResult UpdateVersion(string id, [FromBody] UpdateVersionRequest request)
    {
        try
        {
            var version = _versions.FirstOrDefault(v => v.Id == id);
            if (version == null)
                return NotFound(new { success = false, message = "Version not found" });

            if (!string.IsNullOrEmpty(request.VersionNumber))
                version.VersionNumber = request.VersionNumber;
            if (!string.IsNullOrEmpty(request.VersionName))
                version.VersionName = request.VersionName;
            if (request.Description != null)
                version.Description = request.Description;
            if (!string.IsNullOrEmpty(request.Status))
                version.Status = request.Status;
            version.UpdatedAt = DateTime.UtcNow;

            return Ok(new { success = true, data = version, message = "Version updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/versions/{id} - deletes version
    [HttpDelete("{id}")]
    public ActionResult DeleteVersion(string id)
    {
        try
        {
            var version = _versions.FirstOrDefault(v => v.Id == id);
            if (version == null)
                return NotFound(new { success = false, message = "Version not found" });

            _versions.Remove(version);
            return Ok(new { success = true, message = "Version deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public class ForecastVersionDto
{
    public string Id { get; set; } = string.Empty;
    public string VersionNumber { get; set; } = string.Empty;
    public string VersionName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "open";
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public record CreateVersionRequest(string VersionNumber, string VersionName, string? Description, string? Status);
public record UpdateVersionRequest(string? VersionNumber, string? VersionName, string? Description, string? Status);
