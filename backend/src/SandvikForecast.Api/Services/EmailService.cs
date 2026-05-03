using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SandvikForecast.Api.Services;

public class EmailService
{
    private readonly IConfiguration _cfg;
    public EmailService(IConfiguration cfg) => _cfg = cfg;

    public async Task SendAsync(string to, string subject, string htmlBody, string? cc = null)
    {
        var host = _cfg["Smtp:Host"] ?? "smtp.qq.com";
        var port = int.Parse(_cfg["Smtp:Port"] ?? "587");
        var user = _cfg["Smtp:User"]!;
        var password = _cfg["Smtp:Password"]!;

        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress("Sandvik Forecast", user));
        msg.To.Add(MailboxAddress.Parse(to));
        if (!string.IsNullOrWhiteSpace(cc))
            msg.Cc.Add(MailboxAddress.Parse(cc));
        msg.Subject = subject;
        msg.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(user, password);
        await client.SendAsync(msg);
        await client.DisconnectAsync(true);
    }
}