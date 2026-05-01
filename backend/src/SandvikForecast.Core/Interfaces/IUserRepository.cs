using SandvikForecast.Core.Entities;
namespace SandvikForecast.Core.Interfaces;
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUserNameAsync(string userName);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> ValidateCredentialsAsync(string email, string passwordHash);
}