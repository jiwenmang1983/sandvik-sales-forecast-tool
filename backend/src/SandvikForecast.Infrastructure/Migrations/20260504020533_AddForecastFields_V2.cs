using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SandvikForecast.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddForecastFields_V2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ForecastPeriods_PeriodYear_PeriodMonth_PeriodType",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "PeriodMonth",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "PeriodType",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "PeriodYear",
                table: "ForecastPeriods");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "ForecastRecords",
                newName: "OrderQty");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "ForecastPeriods",
                newName: "FillTimeStart");

            migrationBuilder.RenameColumn(
                name: "SubmitDeadline",
                table: "ForecastPeriods",
                newName: "ExtensionStart");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "ForecastPeriods",
                newName: "FillTimeEnd");

            migrationBuilder.RenameColumn(
                name: "ApproveDeadline",
                table: "ForecastPeriods",
                newName: "ExtensionEnd");

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Users",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "InvoiceAmount",
                table: "ForecastRecords",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "InvoiceQty",
                table: "ForecastRecords",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OrderAmount",
                table: "ForecastRecords",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "ForecastPeriods",
                type: "varchar(36)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ExtensionUsers",
                table: "ForecastPeriods",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "FcName",
                table: "ForecastPeriods",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PeriodEndYearMonth",
                table: "ForecastPeriods",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PeriodStartYearMonth",
                table: "ForecastPeriods",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Customers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "approval_histories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    approval_request_id = table.Column<int>(type: "int", nullable: false),
                    action = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operator_user_id = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    comments = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    adjust_order_amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    adjust_invoice_amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    adjust_order_qty = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    adjust_invoice_qty = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_histories", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "approval_requests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    forecast_period_id = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_id = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    region_id = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Comments = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_requests", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EmailQueueItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ToEmail = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CcEmail = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Body = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    TemplateVariables = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ErrorMessage = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailQueueItems", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "message_templates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Body = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Placeholders = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_templates", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "OrgNodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    Region = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Company = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgNodes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_OrgNodes_Email",
                table: "OrgNodes",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "approval_histories");

            migrationBuilder.DropTable(
                name: "approval_requests");

            migrationBuilder.DropTable(
                name: "EmailQueueItems");

            migrationBuilder.DropTable(
                name: "message_templates");

            migrationBuilder.DropTable(
                name: "OrgNodes");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "InvoiceAmount",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "InvoiceQty",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "OrderAmount",
                table: "ForecastRecords");

            migrationBuilder.DropColumn(
                name: "ExtensionUsers",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "FcName",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "PeriodEndYearMonth",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "PeriodStartYearMonth",
                table: "ForecastPeriods");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Customers");

            migrationBuilder.RenameColumn(
                name: "OrderQty",
                table: "ForecastRecords",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "FillTimeStart",
                table: "ForecastPeriods",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "FillTimeEnd",
                table: "ForecastPeriods",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "ExtensionStart",
                table: "ForecastPeriods",
                newName: "SubmitDeadline");

            migrationBuilder.RenameColumn(
                name: "ExtensionEnd",
                table: "ForecastPeriods",
                newName: "ApproveDeadline");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "ForecastRecords",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "ForecastPeriods",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(36)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ForecastPeriods",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
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

            migrationBuilder.AddColumn<int>(
                name: "PeriodMonth",
                table: "ForecastPeriods",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PeriodType",
                table: "ForecastPeriods",
                type: "varchar(255)",
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "PeriodYear",
                table: "ForecastPeriods",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ForecastPeriods_PeriodYear_PeriodMonth_PeriodType",
                table: "ForecastPeriods",
                columns: new[] { "PeriodYear", "PeriodMonth", "PeriodType" },
                unique: true);
        }
    }
}
