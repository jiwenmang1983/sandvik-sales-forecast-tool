using SandvikForecast.Core.Enums;

namespace SandvikForecast.Core.Exceptions;

/// <summary>
/// 应用程序统一异常类
/// 所有业务层和控制器抛出的异常应使用此类
/// </summary>
public class AppException : Exception
{
    /// <summary>
    /// 错误码
    /// </summary>
    public ErrorCode Code { get; }

    /// <summary>
    /// 错误信息（前端友好提示）
    /// </summary>
    public new string Message { get; }

    /// <summary>
    /// 错误详情（可选，用于传递额外上下文数据）
    /// </summary>
    public object? Details { get; }

    /// <summary>
    /// 构造函数
    /// </summary>
    /// <param name="code">错误码</param>
    /// <param name="message">自定义错误信息（可选，默认使用错误码对应的默认消息）</param>
    /// <param name="details">错误详情对象（可选）</param>
    public AppException(ErrorCode code, string? message = null, object? details = null)
    {
        Code = code;
        Message = message ?? GetDefaultMessage(code);
        Details = details;
    }

    /// <summary>
    /// 根据错误码获取默认错误消息
    /// </summary>
    private static string GetDefaultMessage(ErrorCode code) => code switch
    {
        // 通用错误 (1xxx)
        ErrorCode.ValidationError => "数据校验失败",
        ErrorCode.Unauthorized => "未登录或登录已过期",
        ErrorCode.Forbidden => "无权访问此资源",
        ErrorCode.NotFound => "请求的资源不存在",
        ErrorCode.InternalError => "服务器内部错误",
        ErrorCode.BadRequest => "无效请求",

        // 业务错误 (2xxx)
        ErrorCode.BrandMismatch => "品牌不匹配，无权限操作此客户",
        ErrorCode.ApprovalNodeNotFound => "审批节点不存在",
        ErrorCode.ApprovalNotAllowed => "当前状态不允许审批操作",
        ErrorCode.CannotModifyLockedRecord => "审批中记录不可修改",
        ErrorCode.CycleNotActive => "ForecastCycle 非活跃状态",
        ErrorCode.InsufficientPermission => "权限不足",

        // 数据错误 (3xxx)
        ErrorCode.DuplicateRecord => "重复记录",
        ErrorCode.RecordNotFound => "记录不存在",
        ErrorCode.ForeignKeyViolation => "外键关联错误",

        // 认证错误 (4xxx)
        ErrorCode.TokenExpired => "Token 已过期，请重新登录",
        ErrorCode.TokenInvalid => "Token 无效",
        ErrorCode.DeviceSessionExpired => "设备会话已失效，请重新登录",
        ErrorCode.RefreshTokenInvalid => "RefreshToken 无效",

        _ => "未知错误"
    };
}