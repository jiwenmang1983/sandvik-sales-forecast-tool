using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
using System.Linq.Expressions;
namespace SandvikForecast.Infrastructure.Repositories;
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly SandvikDbContext _context;
    protected readonly DbSet<T> _dbSet;
    public Repository(SandvikDbContext context) { _context = context; _dbSet = context.Set<T>(); }
    public virtual async Task<T?> GetByIdAsync(string id) => await _dbSet.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    public virtual async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.Where(e => !e.IsDeleted).ToListAsync();
    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) => await _dbSet.Where(e => !e.IsDeleted).Where(predicate).ToListAsync();
    public virtual async Task<T> AddAsync(T entity) { entity.CreatedAt = DateTime.UtcNow; entity.UpdatedAt = DateTime.UtcNow; await _dbSet.AddAsync(entity); await _context.SaveChangesAsync(); return entity; }
    public virtual async Task UpdateAsync(T entity) { entity.UpdatedAt = DateTime.UtcNow; _dbSet.Update(entity); await _context.SaveChangesAsync(); }
    public virtual async Task DeleteAsync(string id) { var entity = await GetByIdAsync(id); if (entity != null) { entity.IsDeleted = true; entity.UpdatedAt = DateTime.UtcNow; await _context.SaveChangesAsync(); } }
    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null) => predicate == null ? await _dbSet.CountAsync(e => !e.IsDeleted) : await _dbSet.CountAsync(e => !e.IsDeleted && predicate.Compile()(e));
}