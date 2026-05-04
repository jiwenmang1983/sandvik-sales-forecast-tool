using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SandvikForecast.Infrastructure.Migrations;

public partial class AddUserInvoiceCompanyPermissions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "user_invoice_company_permissions",
            columns: table => new
            {
                Id = table.Column<int>(type: "int", nullable: false)
                    .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                UserId = table.Column<string>(type: "varchar(255)", nullable: false)
                    .Annotation("MySql:CharSet", "utf8mb4"),
                InvoiceCompanyId = table.Column<string>(type: "varchar(255)", nullable: false)
                    .Annotation("MySql:CharSet", "utf8mb4"),
                PermissionType = table.Column<int>(type: "int", nullable: false),
                EffectiveFrom = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                EffectiveTo = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                GrantedBy = table.Column<string>(type: "varchar(255)", nullable: false)
                    .Annotation("MySql:CharSet", "utf8mb4"),
                CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                RevokedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_user_invoice_company_permissions", x => x.Id);
                table.ForeignKey(
                    name: "FK_user_invoice_company_permissions_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_user_invoice_company_permissions_InvoiceCompanies_InvoiceCompanyId",
                    column: x => x.InvoiceCompanyId,
                    principalTable: "InvoiceCompanies",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            })
            .Annotation("MySql:CharSet", "utf8mb4");

        migrationBuilder.CreateIndex(
            name: "IX_user_invoice_company_permissions_UserId_InvoiceCompanyId",
            table: "user_invoice_company_permissions",
            columns: new[] { "UserId", "InvoiceCompanyId" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_user_invoice_company_permissions_UserId",
            table: "user_invoice_company_permissions",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_user_invoice_company_permissions_InvoiceCompanyId",
            table: "user_invoice_company_permissions",
            column: "InvoiceCompanyId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "user_invoice_company_permissions");
    }
}
