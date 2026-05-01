using Microsoft.EntityFrameworkCore;
using org2_api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure MySQL with EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<OrgDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed data on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrgDbContext>();
    context.Database.EnsureCreated();

    // Use AsNoTracking to avoid circular reference stack overflow during materialization
    if (!context.OrgNodes.AsNoTracking().Any())
    {
        var seedData = SeedData.GetSeedData();
        context.OrgNodes.AddRange(seedData);
        context.SaveChanges();
    }
}

// Configure HTTP pipeline
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run("http://0.0.0.0:5001");
