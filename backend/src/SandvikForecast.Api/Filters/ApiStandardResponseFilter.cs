using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace SandvikForecast.Api.Filters;

/// <summary>
/// 统一响应包装过滤器
/// 所有 Controller 的返回值统一包装为：
///   { "code": 0, "data": {...}, "message": "success" }
/// 异常由 AppExceptionMiddleware 拦截，格式为：
///   { "code": N, "message": "...", "details": null }
/// </summary>
public class ApiStandardResponseFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next();

        // 跳过没有返回值或已处理结果的请求（如重定向、文件下载）
        if (executedContext.Result == null)
            return;

        // 仅包装 Controller 返回值
        if (executedContext.Result is ObjectResult objectResult && objectResult.Value != null)
        {
            var (statusCode, data) = GetStatusCodeAndData(objectResult);
            var wrapped = new ApiStandardResponse
            {
                Code = statusCode >= 400 ? statusCode : 0,
                Data = data,
                Message = statusCode >= 400 ? "error" : "success"
            };

            executedContext.Result = new ObjectResult(wrapped)
            {
                StatusCode = statusCode
            };
        }
    }

    private static (int, object?) GetStatusCodeAndData(ObjectResult result)
    {
        var statusCode = result.StatusCode ?? 200;
        var value = result.Value;

        // 跳过已包装的标准响应（避免双重包装）
        if (value is ApiStandardResponse)
            return (statusCode, null);

        // 原始 IActionResult 可能是匿名对象，需要提取 Data 字段
        if (value != null)
        {
            var data = ExtractData(value);
            return (statusCode, data);
        }

        return (statusCode, null);
    }

    private static object? ExtractData(object value)
    {
        // 处理 ValueTask<T>/Task<T> 的结果
        if (value.GetType().IsGenericType &&
            value.GetType().GetGenericTypeDefinition() == typeof(ValueTask<>))
        {
            var taskProperty = value.GetType().GetProperty("Result");
            if (taskProperty != null)
                value = taskProperty.GetValue(value)!;
        }
        else if (value is System.Threading.Tasks.Task task && task.GetType().IsGenericType)
        {
            var resultProperty = task.GetType().GetProperty("Result");
            if (resultProperty != null)
                value = resultProperty.GetValue(task)!;
        }

        var type = value.GetType();

        // 处理 ApiResponse<T>（包含 Success/Message/Data）
        if (TryGetApiResponseData(value, out var apiResponseData))
        {
            return apiResponseData;
        }

        // 处理匿名对象或自定义对象（提取 .data/.Data 字段）
        if (IsAnonymousType(type) || (type.IsClass && type != typeof(string) && !type.IsPrimitive))
        {
            var dataProp = type.GetProperty("data") ?? type.GetProperty("Data");
            if (dataProp != null)
            {
                var raw = dataProp.GetValue(value);
                // 若 .data 也是匿名对象再提取一层
                if (raw != null && IsAnonymousType(raw.GetType()))
                {
                    var innerData = type.GetProperty("data")?.GetValue(raw)
                                 ?? type.GetProperty("Data")?.GetValue(raw);
                    return innerData ?? raw;
                }
                return raw;
            }
        }

        return value;
    }

    private static bool TryGetApiResponseData(object value, out object? result)
    {
        result = null;
        var type = value.GetType();
        // 匹配 ApiResponse<T> 或包含 Success/Message/Data 的类型
        var successProp = type.GetProperty("Success") ?? type.GetProperty("success");
        var dataProp = type.GetProperty("Data") ?? type.GetProperty("data");
        var messageProp = type.GetProperty("Message") ?? type.GetProperty("message");

        if (successProp == null || dataProp == null)
            return false;

        // 检查类型是否为 record 或有对应的值类型属性
        var isRecord = type.IsClass && (
            type.Name.Contains("ApiResponse") ||
            type.GetProperties().Length <= 4); // 典型的 record ApiResponse<T> 有 3 属性

        if (!isRecord) return false;

        result = dataProp.GetValue(value);
        return true;
    }

    private static bool IsAnonymousType(Type type)
    {
        return type.Name.Contains("AnonymousType", StringComparison.OrdinalIgnoreCase)
            || (type.Namespace == null
                && type.Name.StartsWith("<>")
                && type.Name.Contains("Anonymous"));
    }
}

public class ApiStandardResponse
{
    [JsonPropertyName("code")]
    public int Code { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = "success";

    [JsonPropertyName("data")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public object? Data { get; set; }
}