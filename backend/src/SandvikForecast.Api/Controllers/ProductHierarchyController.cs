using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SandvikForecast.Api.DTOs;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Repositories;

namespace SandvikForecast.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductHierarchyController : ControllerBase
{
    private readonly ProductHierarchyRepository _repository;
    private readonly ILogger<ProductHierarchyController> _logger;

    public ProductHierarchyController(ProductHierarchyRepository repository, ILogger<ProductHierarchyController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Get products at level 1 (L1 - root level)
    /// GET /api/products/levels/1
    /// </summary>
    [HttpGet("levels/1")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductHierarchyDto>>>> GetLevel1()
    {
        try
        {
            var products = await _repository.GetRootProductsAsync();
            var dtos = products.Select(p => new ProductHierarchyDto(
                p.Id,
                p.ProductCode,
                p.ProductName,
                p.ProductLevel,
                p.ParentId
            ));
            return Ok(ApiResponse<IEnumerable<ProductHierarchyDto>>.Ok(dtos));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting L1 products");
            return StatusCode(500, ApiResponse<IEnumerable<ProductHierarchyDto>>.Fail("获取L1产品失败：" + ex.Message));
        }
    }

    /// <summary>
    /// Get children of a parent product (for L2-L5 cascade)
    /// GET /api/products/levels/{parentId}
    /// </summary>
    [HttpGet("levels/{parentId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductHierarchyDto>>>> GetChildren(string parentId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(parentId))
            {
                return BadRequest(ApiResponse<IEnumerable<ProductHierarchyDto>>.Fail("parentId不能为空"));
            }

            var products = await _repository.GetChildrenAsync(parentId);
            var dtos = products.Select(p => new ProductHierarchyDto(
                p.Id,
                p.ProductCode,
                p.ProductName,
                p.ProductLevel,
                p.ParentId
            ));
            return Ok(ApiResponse<IEnumerable<ProductHierarchyDto>>.Ok(dtos));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting children for parent {ParentId}", parentId);
            return StatusCode(500, ApiResponse<IEnumerable<ProductHierarchyDto>>.Fail("获取子产品失败：" + ex.Message));
        }
    }
}

/// <summary>
/// DTO for product hierarchy data
/// </summary>
public record ProductHierarchyDto(string Id, string ProductCode, string ProductName, int ProductLevel, string? ParentId);