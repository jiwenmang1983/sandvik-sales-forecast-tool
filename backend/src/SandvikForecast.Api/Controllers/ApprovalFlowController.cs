using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/approval-flow")]
[Authorize]
public class ApprovalFlowController : ControllerBase
{
    private static readonly List<ApprovalStep> _approvalSteps = new()
    {
        new ApprovalStep 
        { 
            Id = "1", 
            StepName = "区域总监审批", 
            ApproverId = "user_001", 
            ApproverName = "张伟", 
            ApproverEmail = "zhang.wei@sandvik.com", 
            StepOrder = 1, 
            IsActive = true 
        },
        new ApprovalStep 
        { 
            Id = "2", 
            StepName = "财务审核", 
            ApproverId = "user_002", 
            ApproverName = "李娜", 
            ApproverEmail = "li.na@sandvik.com", 
            StepOrder = 2, 
            IsActive = true 
        },
        new ApprovalStep 
        { 
            Id = "3", 
            StepName = "财务总监终审", 
            ApproverId = "user_003", 
            ApproverName = "王强", 
            ApproverEmail = "wang.qiang@sandvik.com", 
            StepOrder = 3, 
            IsActive = true 
        }
    };

    private static readonly List<ApprovalFlowConfig> _approvalFlows = new()
    {
        new ApprovalFlowConfig
        {
            Id = 1,
            Name = "标准预测审批流程",
            Active = true,
            Scope = "全区域",
            Condition = "手动提交",
            Creator = "陈明",
            CreateTime = "2026-01-15",
            Steps = new List<FlowStepInfo>
            {
                new FlowStepInfo { Name = "区域总监审批", Approver = "张伟" },
                new FlowStepInfo { Name = "财务审核", Approver = "李娜" }
            }
        },
        new ApprovalFlowConfig
        {
            Id = 2,
            Name = "大金额自动审批",
            Active = true,
            Scope = "全区域",
            Condition = "金额≥100万",
            Creator = "陈明",
            CreateTime = "2026-02-20",
            Steps = new List<FlowStepInfo>
            {
                new FlowStepInfo { Name = "区域总监审批", Approver = "张伟" },
                new FlowStepInfo { Name = "财务初审", Approver = "李娜" },
                new FlowStepInfo { Name = "财务总监终审", Approver = "王强" }
            }
        },
        new ApprovalFlowConfig
        {
            Id = 3,
            Name = "华东区快速流程",
            Active = false,
            Scope = "华东大区",
            Condition = "手动提交",
            Creator = "张伟",
            CreateTime = "2026-03-10",
            Steps = new List<FlowStepInfo>
            {
                new FlowStepInfo { Name = "华东区总监", Approver = "张伟" }
            }
        }
    };

    // GET /api/approval-flow/steps - returns approval workflow steps
    [HttpGet("steps")]
    public ActionResult GetApprovalSteps()
    {
        return Ok(new { success = true, data = _approvalSteps });
    }

    // PUT /api/approval-flow/steps - updates approval steps
    [HttpPut("steps")]
    public ActionResult UpdateApprovalSteps([FromBody] UpdateStepsRequest request)
    {
        try
        {
            if (request?.Steps == null)
                return BadRequest(new { success = false, message = "Invalid request body" });

            // Update existing steps or add new ones
            foreach (var step in request.Steps)
            {
                var existing = _approvalSteps.FirstOrDefault(s => s.Id == step.Id);
                if (existing != null)
                {
                    existing.StepName = step.StepName;
                    existing.ApproverId = step.ApproverId;
                    existing.ApproverName = step.ApproverName;
                    existing.ApproverEmail = step.ApproverEmail;
                    existing.StepOrder = step.StepOrder;
                    existing.IsActive = step.IsActive;
                }
                else
                {
                    _approvalSteps.Add(step);
                }
            }

            return Ok(new { success = true, data = _approvalSteps, message = "Approval steps updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // GET /api/approval-flow/approvers - returns list of available approvers
    [HttpGet("approvers")]
    public ActionResult GetApprovers()
    {
        // Return a list of users who can be approvers
        var approvers = new List<ApproverInfo>
        {
            new ApproverInfo { Id = "user_001", Name = "张伟", Email = "zhang.wei@sandvik.com", Role = "区域总监" },
            new ApproverInfo { Id = "user_002", Name = "李娜", Email = "li.na@sandvik.com", Role = "财务" },
            new ApproverInfo { Id = "user_003", Name = "王强", Email = "wang.qiang@sandvik.com", Role = "财务总监" },
            new ApproverInfo { Id = "user_004", Name = "赵敏", Email = "zhao.min@sandvik.com", Role = "销售总监" },
            new ApproverInfo { Id = "user_005", Name = "孙磊", Email = "sun.lei@sandvik.com", Role = "运营总监" }
        };

        return Ok(new { success = true, data = approvers });
    }

    // GET /api/approval-flow/flows - returns all approval flow configurations
    [HttpGet("flows")]
    public ActionResult GetApprovalFlows()
    {
        return Ok(new { success = true, data = _approvalFlows });
    }

    // POST /api/approval-flow/flows - creates a new approval flow
    [HttpPost("flows")]
    public ActionResult CreateApprovalFlow([FromBody] ApprovalFlowConfig flow)
    {
        try
        {
            if (string.IsNullOrEmpty(flow.Name))
                return BadRequest(new { success = false, message = "Flow name is required" });

            var newId = _approvalFlows.Any() ? _approvalFlows.Max(f => f.Id) + 1 : 1;
            flow.Id = newId;
            flow.CreateTime = DateTime.Now.ToString("yyyy-MM-dd");
            _approvalFlows.Add(flow);

            return StatusCode(201, new { success = true, data = flow, message = "Flow created" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // PUT /api/approval-flow/flows/{id} - updates an approval flow
    [HttpPut("flows/{id}")]
    public ActionResult UpdateApprovalFlow(int id, [FromBody] ApprovalFlowConfig flow)
    {
        try
        {
            var existing = _approvalFlows.FirstOrDefault(f => f.Id == id);
            if (existing == null)
                return NotFound(new { success = false, message = "Flow not found" });

            existing.Name = flow.Name;
            existing.Active = flow.Active;
            existing.Scope = flow.Scope;
            existing.Condition = flow.Condition;
            existing.Steps = flow.Steps;

            return Ok(new { success = true, data = existing, message = "Flow updated" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    // DELETE /api/approval-flow/flows/{id} - deletes an approval flow
    [HttpDelete("flows/{id}")]
    public ActionResult DeleteApprovalFlow(int id)
    {
        try
        {
            var flow = _approvalFlows.FirstOrDefault(f => f.Id == id);
            if (flow == null)
                return NotFound(new { success = false, message = "Flow not found" });

            _approvalFlows.Remove(flow);
            return Ok(new { success = true, message = "Flow deleted" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

// DTOs
public class ApprovalStep
{
    public string Id { get; set; } = string.Empty;
    public string StepName { get; set; } = string.Empty;
    public string ApproverId { get; set; } = string.Empty;
    public string ApproverName { get; set; } = string.Empty;
    public string ApproverEmail { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateStepsRequest
{
    public List<ApprovalStep> Steps { get; set; } = new();
}

public class ApproverInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class ApprovalFlowConfig
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
    public string Scope { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string Creator { get; set; } = string.Empty;
    public string CreateTime { get; set; } = string.Empty;
    public List<FlowStepInfo> Steps { get; set; } = new();
}

public class FlowStepInfo
{
    public string Name { get; set; } = string.Empty;
    public string Approver { get; set; } = string.Empty;
}
