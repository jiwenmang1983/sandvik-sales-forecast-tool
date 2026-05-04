using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Api.Services;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/approval-flow")]
[Authorize]
public class ApprovalFlowConfigController : ControllerBase
{
    private readonly IApprovalFlowNodeConfigService _configService;

    public ApprovalFlowConfigController(IApprovalFlowNodeConfigService configService)
    {
        _configService = configService;
    }

    /// <summary>
    /// 获取某周期的节点配置（含全局默认）
    /// GET /api/approval-flow/node-config/{periodId}
    /// </summary>
    [HttpGet("node-config/{periodId}")]
    public async Task<ActionResult> GetNodeConfigs(string periodId)
    {
        // periodId can be "global" or a numeric value
        int? parsedPeriodId = null;
        if (!string.Equals(periodId, "global", StringComparison.OrdinalIgnoreCase))
        {
            if (int.TryParse(periodId, out var id))
                parsedPeriodId = id;
            else
                return BadRequest(new { success = false, message = "Invalid periodId format" });
        }

        var configs = await _configService.GetConfigsForPeriodAsync(parsedPeriodId);
        return Ok(new { success = true, data = configs });
    }

    /// <summary>
    /// 设置某周期的节点配置
    /// PUT /api/approval-flow/node-config
    /// </summary>
    [HttpPut("node-config")]
    public async Task<ActionResult> SetNodeConfig([FromBody] SetNodeConfigRequest req)
    {
        if (string.IsNullOrEmpty(req.NodeLevel))
            return BadRequest(new { success = false, message = "NodeLevel is required" });

        var validLevels = new[] { "直线经理", "区域总监", "总经理" };
        if (!validLevels.Contains(req.NodeLevel))
            return BadRequest(new { success = false, message = $"NodeLevel must be one of: {string.Join(", ", validLevels)}" });

        var config = await _configService.SetConfigAsync(req.PeriodId, req.NodeLevel, req.CanModifyData, req.Comments);
        return Ok(new { success = true, data = config });
    }

    /// <summary>
    /// 检查某节点是否允许修改数据
    /// GET /api/approval-flow/node-config/check?periodId=xxx&nodeLevel=直线经理
    /// </summary>
    [HttpGet("node-config/check")]
    public async Task<ActionResult> CheckCanModify([FromQuery] int? periodId, [FromQuery] string nodeLevel)
    {
        if (string.IsNullOrEmpty(nodeLevel))
            return BadRequest(new { success = false, message = "nodeLevel is required" });

        var canModify = await _configService.CanModifyDataAsync(periodId, nodeLevel);
        return Ok(new { success = true, data = new { canModify } });
    }
}

public record SetNodeConfigRequest(int? PeriodId, string NodeLevel, bool CanModifyData, string? Comments = null);