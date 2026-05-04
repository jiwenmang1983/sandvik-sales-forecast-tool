using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SandvikForecast.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class T024_ApprovalChainEnhancement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "current_approver_email",
                table: "approval_requests",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "current_node_level",
                table: "approval_requests",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "returned_to_node_level",
                table: "approval_requests",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "to_level",
                table: "approval_histories",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "current_approver_email",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "current_node_level",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "returned_to_node_level",
                table: "approval_requests");

            migrationBuilder.DropColumn(
                name: "to_level",
                table: "approval_histories");
        }
    }
}
