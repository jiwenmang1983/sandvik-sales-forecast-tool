using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;

namespace SandvikForecast.Infrastructure.Repositories;

/// <summary>
/// ForecastPeriod table V2 schema no longer has IsDeleted column.
/// The base Repository's soft-delete filter would fail, so this override
/// removes the filter for this specific entity.
/// </summary>
public class ForecastPeriodRepository : Repository<ForecastPeriod>
{
    public ForecastPeriodRepository(SandvikDbContext context) : base(context) { }

    public override async Task<IEnumerable<ForecastPeriod>> GetAllAsync()
    {
        // V2 migration dropped IsDeleted column from ForecastPeriods.
        // Use base query without the soft-delete filter.
        return await _dbSet.ToListAsync();
    }

    public override async Task<ForecastPeriod?> GetByIdAsync(string id)
    {
        // No soft-delete filter since IsDeleted column doesn't exist.
        return await _dbSet.FirstOrDefaultAsync(e => e.Id == id);
    }

    public override async Task<IEnumerable<ForecastPeriod>> FindAsync(System.Linq.Expressions.Expression<Func<ForecastPeriod, bool>> predicate)
    {
        // No soft-delete filter since IsDeleted column doesn't exist.
        return await _dbSet.Where(predicate).ToListAsync();
    }
}
