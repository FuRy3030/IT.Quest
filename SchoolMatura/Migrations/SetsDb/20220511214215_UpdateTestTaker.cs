using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolMatura.Migrations.SetsDb
{
    public partial class UpdateTestTaker : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TakerIdentifier",
                table: "TestTakers",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TakerIdentifier",
                table: "TestTakers");
        }
    }
}
