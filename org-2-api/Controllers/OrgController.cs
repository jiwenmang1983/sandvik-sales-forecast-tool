using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using org2_api.Data;
using org2_api.Models;
using System.Net;
using System.Net.Mail;

namespace org2_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrgController : ControllerBase
{
    private readonly OrgDbContext _context;

    public OrgController(OrgDbContext context)
    {
        _context = context;
    }

    // GET /api/org — 获取完整树形组织架构
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrgNode>>> GetAll()
    {
        var nodes = await _context.OrgNodes.AsNoTracking().ToListAsync();
        return Ok(nodes);
    }

    // GET /api/org/:id — 获取单个节点
    [HttpGet("{id}")]
    public async Task<ActionResult<OrgNode>> GetById(int id)
    {
        var node = await _context.OrgNodes.AsNoTracking().FirstOrDefaultAsync(n => n.Id == id);
        if (node == null)
            return NotFound(new { message = $"OrgNode with id {id} not found" });
        return Ok(node);
    }

    // POST /api/org — 创建节点
    [HttpPost]
    public async Task<ActionResult<OrgNode>> Create([FromBody] OrgNode node)
    {
        if (string.IsNullOrEmpty(node.Name) || string.IsNullOrEmpty(node.Email))
            return BadRequest(new { message = "Name and Email are required" });

        _context.OrgNodes.Add(node);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = node.Id }, node);
    }

    // PUT /api/org/:id — 更新节点
    [HttpPut("{id}")]
    public async Task<ActionResult<OrgNode>> Update(int id, [FromBody] OrgNode node)
    {
        var existing = await _context.OrgNodes.FindAsync(id);
        if (existing == null)
            return NotFound(new { message = $"OrgNode with id {id} not found" });

        existing.Name = node.Name;
        existing.Email = node.Email;
        existing.Role = node.Role;
        existing.ParentId = node.ParentId;
        existing.Region = node.Region;
        existing.Company = node.Company;
        existing.Status = node.Status;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE /api/org/:id — 删除节点
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var node = await _context.OrgNodes.FindAsync(id);
        if (node == null)
            return NotFound(new { message = $"OrgNode with id {id} not found" });

        // Check if node has children
        var hasChildren = await _context.OrgNodes.AnyAsync(n => n.ParentId == id);
        if (hasChildren)
            return BadRequest(new { message = "Cannot delete node with children. Delete children first." });

        _context.OrgNodes.Remove(node);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/org/send-email — 发送邮件通知
    [HttpPost("send-email")]
    public async Task<ActionResult> SendEmail([FromBody] EmailRequest request)
    {
        try
        {
            var smtpHost = "smtp.qq.com";
            var smtpPort = 587;
            var smtpUser = "93891594@qq.com";
            var smtpPassword = "your_smtp_password"; // 从 appsettings.json 读取

            var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPassword)
            };

            var mail = new MailMessage(smtpUser, request.To, request.Subject, request.Body);
            await client.SendMailAsync(mail);

            return Ok(new { message = "Email sent successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Failed to send email: {ex.Message}" });
        }
    }
}

public class EmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}
