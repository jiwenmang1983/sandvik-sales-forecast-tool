using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Services;

public class ApprovalEmailService
{
    private readonly SandvikDbContext _db;
    private readonly IEmailQueueService _emailQueue;

    public ApprovalEmailService(SandvikDbContext db, IEmailQueueService emailQueue)
    {
        _db = db;
        _emailQueue = emailQueue;
    }

    public async Task SendApprovalNotificationAsync(
        string approverEmail,
        string approverName,
        string action,
        string periodName,
        string submitterName,
        string? comments,
        DateTime timestamp)
    {
        var template = await _db.MessageTemplates
            .Where(t => t.IsActive)
            .FirstOrDefaultAsync();

        string subject;
        string body;

        if (template != null)
        {
            subject = ReplacePlaceholders(template.Subject, periodName, submitterName, action, comments, timestamp);
            body = ReplacePlaceholders(template.Body, periodName, submitterName, action, comments, timestamp);
        }
        else
        {
            subject = GetDefaultSubject(action, periodName);
            body = GetDefaultBody(action, periodName, submitterName, comments, timestamp);
        }

        var variables = System.Text.Json.JsonSerializer.Serialize(new
        {
            periodName,
            submitter = submitterName,
            action,
            comments,
            timestamp = timestamp.ToString("yyyy-MM-dd HH:mm:ss")
        });

        await _emailQueue.QueueEmailAsync(
            approverEmail,
            null,
            subject,
            body,
            template?.Id,
            variables);
    }

    private string ReplacePlaceholders(string text, string periodName, string submitterName, string action, string? comments, DateTime timestamp)
    {
        return text
            .Replace("{periodName}", periodName)
            .Replace("{submitter}", submitterName)
            .Replace("{action}", action)
            .Replace("{comments}", comments ?? "")
            .Replace("{timestamp}", timestamp.ToString("yyyy-MM-dd HH:mm:ss"));
    }

    private string GetDefaultSubject(string action, string periodName)
    {
        return action.ToUpperInvariant() switch
        {
            "SUBMIT" => $"审批请求 - {periodName}",
            "APPROVE" => $"审批通过 - {periodName}",
            "REJECT" => $"审批驳回 - {periodName}",
            "ADJUST" => $"审批调整 - {periodName}",
            _ => $"审批通知 - {periodName}"
        };
    }

    private string GetDefaultBody(string action, string periodName, string submitterName, string? comments, DateTime timestamp)
    {
        var actionLabel = action.ToUpperInvariant() switch
        {
            "SUBMIT" => "已提交",
            "APPROVE" => "已通过",
            "REJECT" => "已驳回",
            "ADJUST" => "已调整",
            _ => "已处理"
        };

        return $@"您好，

您有一条来自 {submitterName} 的预测数据需要审批。

周期：{periodName}
操作：{actionLabel}
时间：{timestamp:yyyy-MM-dd HH:mm:ss}
{(string.IsNullOrEmpty(comments) ? "" : $"备注：{comments}")}

请登录 Sandvik Forecast Tool 系统查看详情。

此邮件由系统自动发送，请勿回复。";
    }
}