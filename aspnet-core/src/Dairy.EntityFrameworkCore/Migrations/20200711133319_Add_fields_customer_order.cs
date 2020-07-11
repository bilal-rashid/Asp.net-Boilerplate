using Microsoft.EntityFrameworkCore.Migrations;

namespace Dairy.Migrations
{
    public partial class Add_fields_customer_order : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Dairy_Order",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Dairy_Customer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Dairy_Order");

            migrationBuilder.DropColumn(
                name: "Area",
                table: "Dairy_Customer");
        }
    }
}
