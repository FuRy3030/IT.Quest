using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolMatura.Migrations.SetsDb
{
    public partial class UpdateAnswerTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ScoredPoints",
                table: "Answers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TeacherComment",
                table: "Answers",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScoredPoints",
                table: "Answers");

            migrationBuilder.DropColumn(
                name: "TeacherComment",
                table: "Answers");
        }
    }
}
