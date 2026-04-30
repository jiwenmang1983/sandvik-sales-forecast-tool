using SandvikForecast.Core.Entities;
namespace SandvikForecast.Core.Interfaces;
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUserNameAsync(string userName);
    Task<User?> ValidateCredentialsAsync(string userName, string passwordHash);
}