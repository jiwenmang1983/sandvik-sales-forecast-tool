using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Api.Services;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly EmailService _email;

    public EmailController(EmailService email)
    {
        _email = email;
    }

    [HttpPost("send")]
    public async Task<ActionResult> Send([FromBody] SendEmailRequest req)
    {
        try
        {
            await _email.SendAsync(req.To, req.Subject, req.Body);
            return Ok(new { success = true, message = "Email sent" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public record SendEmailRequest(string To, string Subject, string Body);
