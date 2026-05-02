using Microsoft.EntityFrameworkCore;
using SandvikForecast.Core.Entities;

namespace SandvikForecast.Infrastructure.Data;

public class SandvikDbContext : DbContext
{
    public SandvikDbContext(DbContextOptions<SandvikDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<InvoiceCompany> InvoiceCompanies => Set<InvoiceCompany>();
    public DbSet<ProductHierarchy> ProductHierarchies => Set<ProductHierarchy>();
    public DbSet<ForecastPeriod> ForecastPeriods => Set<ForecastPeriod>();
    public DbSet<ForecastRecord> ForecastRecords => Set<ForecastRecord>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<OrgNode> OrgNodes => Set<OrgNode>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();
    public DbSet<LoginLog> LoginLogs => Set<LoginLog>();
    public DbSet<OpLog> OpLogs => Set<OpLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.HasIndex(u => u.UserName).IsUnique();
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("Customers");
            e.HasIndex(c => c.CustomerCode).IsUnique();
        });

        modelBuilder.Entity<InvoiceCompany>(e =>
        {
            e.ToTable("InvoiceCompanies");
            e.HasIndex(i => i.CompanyCode).IsUnique();
        });

        modelBuilder.Entity<ProductHierarchy>(e =>
        {
            e.ToTable("ProductHierarchy");
            e.HasIndex(p => p.ProductCode);
        });

        modelBuilder.Entity<ForecastPeriod>(e =>
        {
            e.ToTable("ForecastPeriods");
            e.HasIndex(f => new { f.PeriodYear, f.PeriodMonth, f.PeriodType }).IsUnique();
        });

        modelBuilder.Entity<ForecastRecord>(e =>
        {
            e.ToTable("ForecastRecords");
            e.HasIndex(f => new { f.ForecastPeriodId, f.CustomerId, f.ProductId }).IsUnique();
        });

        modelBuilder.Entity<Approval>(e => e.ToTable("Approvals"));
        modelBuilder.Entity<OrgNode>(e =>
        {
            e.ToTable("OrgNodes");
            e.HasIndex(o => o.Email).IsUnique();
            // OrgNodes table uses int auto-inc Id, not string — tell EF to avoid string→int cast crash on materialization
            e.Property(o => o.Id).HasColumnType("int");
            // OrgNodes table uses Status (varchar), not IsActive (bool), and no CreatedAt/UpdatedAt/IsDeleted columns
            e.Ignore(o => o.CreatedAt);
            e.Ignore(o => o.UpdatedAt);
            e.Ignore(o => o.IsDeleted);
            // Map Status column (table has Status, entity has Status as string)
        });
        modelBuilder.Entity<LoginLog>(e => e.ToTable("LoginLogs"));
        modelBuilder.Entity<OpLog>(e => e.ToTable("OpLogs"));
        modelBuilder.Entity<ApprovalRequest>(e =>
        {
            e.ToTable("approval_requests");
            e.Property(a => a.Id).HasColumnType("int");
            e.Property(a => a.ForecastPeriodId).HasColumnName("forecast_period_id");
            e.Property(a => a.UserId).HasColumnName("user_id");
            e.Property(a => a.RegionId).HasColumnName("region_id");
            e.Ignore(a => a.CreatedAt);
            e.Ignore(a => a.UpdatedAt);
            e.Ignore(a => a.IsDeleted);
        });
    }
}
