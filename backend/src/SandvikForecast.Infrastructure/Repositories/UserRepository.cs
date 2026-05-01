using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
namespace SandvikForecast.Infrastructure.Repositories;
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(SandvikDbContext context) : base(context) { }
    public async Task<User?> GetByUserNameAsync(string userName) => await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName && !u.IsDeleted);
    public async Task<User?> GetByEmailAsync(string email) => await _dbSet.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    public async Task<User?> ValidateCredentialsAsync(string email, string passwordHash) => await _dbSet.FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == passwordHash && u.IsActive && !u.IsDeleted);
}