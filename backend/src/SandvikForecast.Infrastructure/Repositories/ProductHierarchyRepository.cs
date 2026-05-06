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

    /// <summary>
    /// Fuzzy search products by code or name (both left and right fuzzy)
    /// </summary>
    public async Task<IEnumerable<ProductHierarchy>> SearchAsync(string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Enumerable.Empty<ProductHierarchy>();

        var all = await _dbSet
            .Where(p => !p.IsDeleted)
            .ToListAsync();

        var pattern = keyword.ToLower();
        return all
            .Where(p => (p.ProductCode != null && p.ProductCode.ToLower().Contains(pattern))
                     || (p.ProductName != null && p.ProductName.ToLower().Contains(pattern)))
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.ProductCode);
    }

    /// <summary>
    /// Auto-generate product code: PROD-{yyyyMMdd}-{NNNN}, reset daily
    /// </summary>
    public async Task<string> GenerateProductCodeAsync()
    {
        var today = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"PROD-{today}-";

        var todayProducts = await _dbSet
            .Where(p => p.ProductCode.StartsWith(prefix) && !p.IsDeleted)
            .Select(p => p.ProductCode)
            .ToListAsync();

        int maxSeq = 0;
        foreach (var code in todayProducts)
        {
            var parts = code.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int seq))
            {
                if (seq > maxSeq) maxSeq = seq;
            }
        }

        return $"{prefix}{(maxSeq + 1):D4}";
    }
}