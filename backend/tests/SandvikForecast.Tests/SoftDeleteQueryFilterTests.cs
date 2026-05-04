using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;
using SandvikForecast.Infrastructure.Data;
using Xunit;

namespace SandvikForecast.Tests;

/// <summary>
/// T-025: EF Core Global Query Filter 统一软删除拦截 - 单元测试
/// </summary>
public class SoftDeleteQueryFilterTests : IDisposable
{
    private readonly SandvikDbContext _context;

    public SoftDeleteQueryFilterTests()
    {
        var options = new DbContextOptionsBuilder<SandvikDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new SandvikDbContext(options);
        _context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task QueryFilter_Default_ExcludesSoftDeletedRecords()
    {
        // Arrange
        var activeUser = new User { Id = Guid.NewGuid().ToString(), UserName = "active_user", IsDeleted = false };
        var deletedUser = new User { Id = Guid.NewGuid().ToString(), UserName = "deleted_user", IsDeleted = true };

        _context.Users.AddRange(activeUser, deletedUser);
        await _context.SaveChangesAsync();

        // Act
        var users = await _context.Users.ToListAsync();

        // Assert
        Assert.Single(users);
        Assert.Equal("active_user", users[0].UserName);
        Assert.False(users[0].IsDeleted);
    }

    [Fact]
    public async Task QueryFilter_IgnoreQueryFilters_IncludesSoftDeletedRecords()
    {
        // Arrange
        var activeUser = new User { Id = Guid.NewGuid().ToString(), UserName = "active_user", IsDeleted = false };
        var deletedUser = new User { Id = Guid.NewGuid().ToString(), UserName = "deleted_user", IsDeleted = true };

        _context.Users.AddRange(activeUser, deletedUser);
        await _context.SaveChangesAsync();

        // Act
        var allUsers = await _context.Users.IgnoreQueryFilters().ToListAsync();

        // Assert
        Assert.Equal(2, allUsers.Count);
        Assert.Contains(allUsers, u => u.UserName == "active_user" && !u.IsDeleted);
        Assert.Contains(allUsers, u => u.UserName == "deleted_user" && u.IsDeleted);
    }

    [Fact]
    public async Task QueryFilter_AllBaseEntityTypes_ExcludesSoftDeletedRecords()
    {
        // Arrange - Test with Customer entity
        var activeCustomer = new Customer { Id = Guid.NewGuid().ToString(), CustomerCode = "C001", IsDeleted = false };
        var deletedCustomer = new Customer { Id = Guid.NewGuid().ToString(), CustomerCode = "C002", IsDeleted = true };

        _context.Customers.AddRange(activeCustomer, deletedCustomer);
        await _context.SaveChangesAsync();

        // Act
        var customers = await _context.Customers.ToListAsync();

        // Assert
        Assert.Single(customers);
        Assert.Equal("C001", customers[0].CustomerCode);
    }

    [Fact]
    public async Task QueryFilter_AdminBypass_UsesIgnoreQueryFilters()
    {
        // Arrange
        var activeUser = new User { Id = Guid.NewGuid().ToString(), UserName = "active_user", IsDeleted = false };
        var deletedUser = new User { Id = Guid.NewGuid().ToString(), UserName = "deleted_user", IsDeleted = true };

        _context.Users.AddRange(activeUser, deletedUser);
        await _context.SaveChangesAsync();

        // Act - Simulate admin query with IgnoreQueryFilters
        var adminQuery = _context.Users.IgnoreQueryFilters();
        var allUsers = await adminQuery.ToListAsync();

        // Assert
        Assert.Equal(2, allUsers.Count);
    }
}
