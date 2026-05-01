using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly IUserRepository _userRepo;

    public SeedController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    /// <summary>
    /// 重置所有用户密码为 Password123，并创建种子数据（如果不存在）
    /// </summary>
    [HttpPost("reset-users")]
    public async Task<ActionResult> ResetUsers()
    {
        // SHA256("Password123") = AIxwOS46v70PpHu8LtlqqZvUnhWXJ/y6Dy5qvrOp1gE=
        var passwordHash = "AIxwOS46v70PpHu8LtlqqZvUnhWXJ/y6Dy5qvrOp1gE=";

        var users = new[]
        {
            new { Id = "00000001-0000-0000-0000-000000000001", UserName = "admin", DisplayName = "系统管理员", Email = "admin@sandvik.com", Role = "SYS_ADMIN" },
            new { Id = "00000002-0000-0000-0000-000000000002", UserName = "sales_dir", DisplayName = "张总监", Email = "director@sandvik.com", Role = "SALES_DIRECTOR" },
            new { Id = "00000003-0000-0000-0000-000000000003", UserName = "region_dir", DisplayName = "李区域总监", Email = "region@sandvik.com", Role = "REGION_DIRECTOR" },
            new { Id = "00000004-0000-0000-0000-000000000004", UserName = "finance", DisplayName = "王财务", Email = "finance@sandvik.com", Role = "FINANCE_MANAGER" },
            new { Id = "00000005-0000-0000-0000-000000000005", UserName = "sales_wang", DisplayName = "王销售", Email = "wang@sandvik.com", Role = "SALES" },
            new { Id = "00000006-0000-0000-0000-000000000006", UserName = "sales_li", DisplayName = "李销售", Email = "li@sandvik.com", Role = "SALES" },
            new { Id = "00000007-0000-0000-0000-000000000007", UserName = "mark", DisplayName = "Mark", Email = "mark@sandvik.com", Role = "SYS_ADMIN" },
            new { Id = "00000008-0000-0000-0000-000000000008", UserName = "frank.tao", DisplayName = "Frank Tao", Email = "frank.tao@sandvik.com", Role = "CEO" },
            new { Id = "00000009-0000-0000-0000-000000000009", UserName = "zhou.ting", DisplayName = "Zhou Ting", Email = "zhou.ting@sandvik.com", Role = "MANAGER" },
            new { Id = "0000000a-0000-0000-0000-00000000000a", UserName = "zhang.wei", DisplayName = "Zhang Wei", Email = "zhang.wei@sandvik.com", Role = "SALES" },
            new { Id = "0000000b-0000-0000-0000-00000000000b", UserName = "li.na", DisplayName = "Li Na", Email = "li.na@sandvik.com", Role = "DIRECTOR" },
        };

        foreach (var u in users)
        {
            var existing = await _userRepo.GetByIdAsync(u.Id);
            if (existing != null)
            {
                existing.PasswordHash = passwordHash;
                existing.IsActive = true;
                existing.IsDeleted = false;
                await _userRepo.UpdateAsync(existing);
            }
            else
            {
                await _userRepo.AddAsync(new User
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    PasswordHash = passwordHash,
                    DisplayName = u.DisplayName,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = true
                });
            }
        }

        return Ok(new { success = true, message = $"已创建/更新 {users.Length} 个用户，密码均为 Password123" });
    }
}
