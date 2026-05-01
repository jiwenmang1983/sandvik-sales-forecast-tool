using Microsoft.EntityFrameworkCore;
using org2_api.Models;

namespace org2_api.Data;

public class OrgDbContext : DbContext
{
    public OrgDbContext(DbContextOptions<OrgDbContext> options) : base(options) { }

    public DbSet<OrgNode> OrgNodes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OrgNode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Region).HasMaxLength(100);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.HasOne(e => e.Parent)
                  .WithMany()
                  .HasForeignKey(e => e.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}
