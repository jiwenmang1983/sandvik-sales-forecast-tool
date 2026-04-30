using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Core.Interfaces;
using SandvikForecast.Infrastructure.Data;
namespace SandvikForecast.Infrastructure.Repositories;
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(SandvikDbContext context) : base(context) { }
    public async Task<User?> GetByUserNameAsync(string userName) => await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName && !u.IsDeleted);
    public async Task<User?> ValidateCredentialsAsync(string userName, string passwordHash) => await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName && u.PasswordHash == passwordHash && u.IsActive && !u.IsDeleted);
}