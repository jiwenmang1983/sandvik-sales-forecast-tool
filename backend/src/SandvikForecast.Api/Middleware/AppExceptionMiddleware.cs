using System.Text.Json;
using SandvikForecast.Core.Enums;
using SandvikForecast.Core.Exceptions;

namespace SandvikForecast.Api.Middleware;

/// <summary>
/// 全局异常中间件
/// 统一拦截 AppException 异常，返回统一 JSON 格式响应
/// </summary>
public class AppExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AppExceptionMiddleware> _logger;

    public AppExceptionMiddleware(RequestDelegate next, ILogger<AppExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppException ex)
        {
            _logger.LogWarning(ex, "业务异常: {ErrorCode} - {Message}", (int)ex.Code, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "未处理的系统异常");
            await HandleExceptionAsync(context, new AppException(ErrorCode.InternalError, "服务器内部错误"));
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, AppException ex)
    {
        context.Response.StatusCode = GetHttpStatus(ex.Code);
        context.Response.ContentType = "application/json; charset=utf-8";

        var response = new
        {
            code = (int)ex.Code,
            message = ex.Message,
            details = ex.Details
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        await context.Response.WriteAsJsonAsync(response, options);
    }

    /// <summary>
    /// 根据错误码获取对应的 HTTP 状态码
    /// </summary>
    private static int GetHttpStatus(ErrorCode code) => code switch
    {
        ErrorCode.ValidationError or ErrorCode.BadRequest => 400,
        ErrorCode.Unauthorized => 401,
        ErrorCode.Forbidden => 403,
        ErrorCode.NotFound or ErrorCode.RecordNotFound or ErrorCode.ApprovalNodeNotFound => 404,
        ErrorCode.InternalError => 500,
        _ => 500
    };
}

/// <summary>
/// 中间件扩展方法
/// </summary>
public static class AppExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseAppExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<AppExceptionMiddleware>();
    }
}