namespace SandvikForecast.Core.Enums;

/// <summary>
/// 统一错误码枚举
/// - 1xxx: 通用错误
/// - 2xxx: 业务错误
/// - 3xxx: 数据错误
/// - 4xxx: 认证错误
/// </summary>
public enum ErrorCode
{
    // ========== 通用错误 (1xxx) ==========
    /// <summary>数据校验失败</summary>
    ValidationError = 1001,
    /// <summary>未登录或登录已过期</summary>
    Unauthorized = 1002,
    /// <summary>无权访问此资源</summary>
    Forbidden = 1003,
    /// <summary>请求的资源不存在</summary>
    NotFound = 1004,
    /// <summary>服务器内部错误</summary>
    InternalError = 1005,
    /// <summary>无效请求</summary>
    BadRequest = 1006,

    // ========== 业务错误 (2xxx) ==========
    /// <summary>品牌不匹配，无权限操作此客户</summary>
    BrandMismatch = 2001,
    /// <summary>审批节点不存在</summary>
    ApprovalNodeNotFound = 2002,
    /// <summary>当前状态不允许审批操作</summary>
    ApprovalNotAllowed = 2003,
    /// <summary>审批中记录不可修改</summary>
    CannotModifyLockedRecord = 2004,
    /// <summary>ForecastCycle 非活跃状态</summary>
    CycleNotActive = 2005,
    /// <summary>权限不足</summary>
    InsufficientPermission = 2006,

    // ========== 数据错误 (3xxx) ==========
    /// <summary>重复记录</summary>
    DuplicateRecord = 3001,
    /// <summary>记录不存在</summary>
    RecordNotFound = 3002,
    /// <summary>外键关联错误</summary>
    ForeignKeyViolation = 3003,

    // ========== 认证错误 (4xxx) ==========
    /// <summary>Token 已过期</summary>
    TokenExpired = 4001,
    /// <summary>Token 无效</summary>
    TokenInvalid = 4002,
    /// <summary>设备会话已失效（多设备互斥踢出）</summary>
    DeviceSessionExpired = 4003,
    /// <summary>RefreshToken 无效</summary>
    RefreshTokenInvalid = 4004,
}