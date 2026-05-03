using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/message-templates")]
[Authorize(Roles = "SYS_ADMIN")]
public class MessageTemplateController : ControllerBase
{
    private readonly SandvikDbContext _db;

    public MessageTemplateController(SandvikDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetTemplates()
    {
        var templates = await _db.MessageTemplates
            .OrderByDescending(t => t.IsActive)
            .ThenBy(t => t.Name)
            .Select(t => new {
                t.Id,
                t.Name,
                t.Subject,
                t.Body,
                t.Placeholders,
                t.IsActive,
                CreatedAt = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            })
            .ToListAsync();

        return Ok(new { success = true, data = templates });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetTemplate(int id)
    {
        var template = await _db.MessageTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, message = "Template not found" });

        return Ok(new { success = true, data = template });
    }

    [HttpPost]
    public async Task<ActionResult> CreateTemplate([FromBody] CreateTemplateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { success = false, message = "Template name is required" });

        var template = new MessageTemplate
        {
            Name = req.Name.Trim(),
            Subject = req.Subject?.Trim() ?? "",
            Body = req.Body?.Trim() ?? "",
            Placeholders = req.Placeholders,
            IsActive = req.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.MessageTemplates.Add(template);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = template });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTemplate(int id, [FromBody] UpdateTemplateRequest req)
    {
        var template = await _db.MessageTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, message = "Template not found" });

        if (!string.IsNullOrWhiteSpace(req.Name))
            template.Name = req.Name.Trim();
        if (req.Subject != null)
            template.Subject = req.Subject.Trim();
        if (req.Body != null)
            template.Body = req.Body.Trim();
        if (req.Placeholders != null)
            template.Placeholders = req.Placeholders;
        if (req.IsActive.HasValue)
            template.IsActive = req.IsActive.Value;

        await _db.SaveChangesAsync();

        return Ok(new { success = true, data = template });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTemplate(int id)
    {
        var template = await _db.MessageTemplates.FindAsync(id);
        if (template == null)
            return NotFound(new { success = false, message = "Template not found" });

        _db.MessageTemplates.Remove(template);
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Template deleted" });
    }

    [HttpPut("{id}/activate")]
    public async Task<ActionResult> ActivateTemplate(int id)
    {
        // Deactivate all templates first
        var allTemplates = await _db.MessageTemplates.ToListAsync();
        foreach (var t in allTemplates)
            t.IsActive = false;

        var template = allTemplates.FirstOrDefault(t => t.Id == id);
        if (template == null)
            return NotFound(new { success = false, message = "Template not found" });

        template.IsActive = true;
        await _db.SaveChangesAsync();

        return Ok(new { success = true, message = "Template activated" });
    }
}

public record CreateTemplateRequest(
    string Name,
    string? Subject = null,
    string? Body = null,
    string? Placeholders = null,
    bool IsActive = false);

public record UpdateTemplateRequest(
    string? Name = null,
    string? Subject = null,
    string? Body = null,
    string? Placeholders = null,
    bool? IsActive = null);