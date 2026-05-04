using System.Linq.Expressions;
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
    public DbSet<ApprovalHistory> ApprovalHistories => Set<ApprovalHistory>();
    public DbSet<LoginLog> LoginLogs => Set<LoginLog>();
    public DbSet<OpLog> OpLogs => Set<OpLog>();
    public DbSet<EmailQueueItem> EmailQueueItems => Set<EmailQueueItem>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<UserInvoiceCompanyPermission> UserInvoiceCompanyPermissions => Set<UserInvoiceCompanyPermission>();
    public DbSet<ApprovalFlowNodeConfig> ApprovalFlowNodeConfigs => Set<ApprovalFlowNodeConfig>();
    public DbSet<UserLoginSession> UserLoginSessions => Set<UserLoginSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // T-025: Global Query Filter for soft delete - filter out IsDeleted records by default
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, "IsDeleted");
                var condition = Expression.Not(property);
                var lambda = Expression.Lambda(condition, parameter);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

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
            e.HasKey(f => f.Id);
            e.Property(f => f.Id).HasColumnType("varchar(36)");
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
            e.Property(a => a.CurrentApproverEmail).HasColumnName("current_approver_email").HasMaxLength(255);
            e.Property(a => a.CurrentNodeLevel).HasColumnName("current_node_level").HasMaxLength(50);
            e.Property(a => a.ReturnedToNodeLevel).HasColumnName("returned_to_node_level").HasMaxLength(50);
        });
        modelBuilder.Entity<ApprovalHistory>(e =>
        {
            e.ToTable("approval_histories");
            e.Property(h => h.Id).HasColumnType("int");
            e.Property(h => h.ApprovalRequestId).HasColumnName("approval_request_id");
            e.Property(h => h.Action).HasColumnName("action").HasMaxLength(20);
            e.Property(h => h.OperatorUserId).HasColumnName("operator_user_id");
            e.Property(h => h.OperatedAt).HasColumnName("operated_at");
            e.Property(h => h.Comments).HasColumnName("comments").HasMaxLength(500);
            e.Property(h => h.AdjustOrderAmount).HasColumnName("adjust_order_amount").HasPrecision(18, 2);
            e.Property(h => h.AdjustInvoiceAmount).HasColumnName("adjust_invoice_amount").HasPrecision(18, 2);
            e.Property(h => h.AdjustOrderQty).HasColumnName("adjust_order_qty").HasPrecision(18, 2);
            e.Property(h => h.AdjustInvoiceQty).HasColumnName("adjust_invoice_qty").HasPrecision(18, 2);
            e.Property(h => h.CreatedAt).HasColumnName("created_at");
            e.Property(h => h.ToLevel).HasColumnName("to_level").HasMaxLength(50);
        });
        modelBuilder.Entity<MessageTemplate>(e =>
        {
            e.ToTable("message_templates");
            e.Property(m => m.Id).HasColumnType("int");
            e.Property(m => m.Name).HasMaxLength(100);
            e.Property(m => m.Subject).HasMaxLength(500);
            e.Property(m => m.Placeholders).HasMaxLength(1000);
        });
        modelBuilder.Entity<UserInvoiceCompanyPermission>(e =>
        {
            e.ToTable("user_invoice_company_permissions");
            e.Property(p => p.Id).HasColumnType("int");
            e.Property(p => p.UserId).HasColumnType("varchar(255)");
            e.Property(p => p.InvoiceCompanyId).HasColumnType("varchar(255)");
            e.Property(p => p.PermissionType).HasColumnType("int");
            e.Property(p => p.EffectiveFrom).HasColumnType("datetime(6)");
            e.Property(p => p.EffectiveTo).HasColumnType("datetime(6)");
            e.Property(p => p.GrantedBy).HasColumnType("varchar(255)");
            e.Property(p => p.CreatedAt).HasColumnType("datetime(6)");
            e.Property(p => p.RevokedAt).HasColumnType("datetime(6)");
            e.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.InvoiceCompany)
                .WithMany()
                .HasForeignKey(p => p.InvoiceCompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(p => new { p.UserId, p.InvoiceCompanyId }).IsUnique();
        });
        modelBuilder.Entity<ApprovalFlowNodeConfig>(e =>
        {
            e.ToTable("approval_flow_node_configs");
            e.Property(c => c.Id).HasColumnType("int").ValueGeneratedOnAdd();
            e.Property(c => c.ForecastPeriodId).HasColumnType("int");
            e.Property(c => c.NodeLevel).HasMaxLength(50).IsRequired();
            e.Property(c => c.CanModifyData).HasDefaultValue(false);
            e.Property(c => c.Comments).HasMaxLength(500);
            e.Property(c => c.CreatedAt).HasColumnType("datetime(6)");
            e.Property(c => c.UpdatedAt).HasColumnType("datetime(6)");
            // 每个周期+节点级别组合唯一
            e.HasIndex(c => new { c.ForecastPeriodId, c.NodeLevel }).IsUnique();
        });
        modelBuilder.Entity<UserLoginSession>(e =>
        {
            e.ToTable("user_login_sessions");
            e.HasIndex(s => new { s.UserId, s.IsActive });
            e.HasIndex(s => s.RefreshToken).IsUnique();
            e.Property(s => s.DeviceId).HasMaxLength(255).IsRequired();
            e.Property(s => s.DeviceName).HasMaxLength(255);
            e.Property(s => s.RefreshToken).HasMaxLength(512).IsRequired();
        });
    }
}
