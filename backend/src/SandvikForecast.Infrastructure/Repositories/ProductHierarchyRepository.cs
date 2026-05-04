using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using System.Linq.Expressions;

namespace SandvikForecast.Infrastructure.Repositories;

public class ProductHierarchyRepository : Repository<ProductHierarchy>
{
    public ProductHierarchyRepository(SandvikDbContext context) : base(context) { }

    /// <summary>
    /// Get products by level (1-5)
    /// </summary>
    public async Task<IEnumerable<ProductHierarchy>> GetByLevelAsync(int level)
    {
        return await _dbSet
            .Where(p => p.ProductLevel == level && !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.ProductCode)
            .ToListAsync();
    }

    /// <summary>
    /// Get children of a parent product
    /// </summary>
    public async Task<IEnumerable<ProductHierarchy>> GetChildrenAsync(string parentId)
    {
        return await _dbSet
            .Where(p => p.ParentId == parentId && !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.ProductCode)
            .ToListAsync();
    }

    /// <summary>
    /// Get products at level 1 (root level - no parent)
    /// </summary>
    public async Task<IEnumerable<ProductHierarchy>> GetRootProductsAsync()
    {
        return await _dbSet
            .Where(p => p.ProductLevel == 1 && !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.ProductCode)
            .ToListAsync();
    }
}