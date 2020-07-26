using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Dairy.Migrations
{
    public partial class Add_billing_tables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Dairy_CustomerBill",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    PendingAmount = table.Column<double>(nullable: false),
                    CustomerId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dairy_CustomerBill", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dairy_CustomerBill_Dairy_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Dairy_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Dairy_CustomerBillData",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    BillAmount = table.Column<double>(nullable: false),
                    CollectedAmount = table.Column<double>(nullable: false),
                    Difference = table.Column<double>(nullable: false),
                    CustomerId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dairy_CustomerBillData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dairy_CustomerBillData_Dairy_Customer_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Dairy_Customer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dairy_CustomerBill_CustomerId",
                table: "Dairy_CustomerBill",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Dairy_CustomerBillData_CustomerId",
                table: "Dairy_CustomerBillData",
                column: "CustomerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Dairy_CustomerBill");

            migrationBuilder.DropTable(
                name: "Dairy_CustomerBillData");
        }
    }
}
