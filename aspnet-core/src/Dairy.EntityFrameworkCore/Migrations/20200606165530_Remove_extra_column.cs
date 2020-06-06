using Microsoft.EntityFrameworkCore.Migrations;

namespace Dairy.Migrations
{
    public partial class Remove_extra_column : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantName",
                table: "Dairy_Product");

            migrationBuilder.DropColumn(
                name: "TenantName",
                table: "Dairy_Customer");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TenantName",
                table: "Dairy_Product",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantName",
                table: "Dairy_Customer",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
