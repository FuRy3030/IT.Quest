using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolMatura.Migrations.SetsDb
{
    public partial class UpdateAnswers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodeAnswer",
                table: "Answers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodingLanguage",
                table: "Answers",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodeAnswer",
                table: "Answers");

            migrationBuilder.DropColumn(
                name: "CodingLanguage",
                table: "Answers");
        }
    }
}
