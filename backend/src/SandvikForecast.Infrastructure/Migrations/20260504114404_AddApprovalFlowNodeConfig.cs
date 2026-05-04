using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SandvikForecast.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddApprovalFlowNodeConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "OrgNodes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "OrgNodes",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "OrgNodes",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ExtensionEnd",
                table: "ForecastRecords",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExtensionStart",
                table: "ForecastRecords",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ForecastPeriods",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ForecastPeriods",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "ForecastPeriods",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "approval_requests",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "approval_requests",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "approval_requests",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "approval_histories",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "approval_histories",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "approval_flow_node_configs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ForecastPeriodId = table.Column<int>(type: "int", nullable: true),
                    NodeLevel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CanModifyData = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Comments = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_flow_node_configs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

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
                        name: "FK_user_invoice_company_permissions_InvoiceCompanies_InvoiceCom~",
                        column: x => x.InvoiceCompanyId,
                        principalTable: "InvoiceCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_invoice_company_permissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_approval_flow_node_configs_ForecastPeriodId_NodeLevel",
                table: "approval_flow_node_configs",
                columns: new[] { "ForecastPeriodId", "NodeLevel" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_invoice_company_permissions_InvoiceCompanyId",
                table: "user_invoice_company_permissions",
                column: "InvoiceCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_user_invoice_company_permissions_UserId_InvoiceCompanyId",
                table: "user_invoice_company_permissions",
                columns: new[] { "UserId", "InvoiceCompanyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "approval_flow_node_configs");

            migrationBuilder.DropTable(
                name: "user_invoice_company_permissions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "OrgNodes");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "OrgNodes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "OrgNodes");

            migrationBuilder.DropColumn(
                name: "ExtensionEnd",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "ExtensionStart",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "approval_histories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "approval_histories");
        }
    }
}
