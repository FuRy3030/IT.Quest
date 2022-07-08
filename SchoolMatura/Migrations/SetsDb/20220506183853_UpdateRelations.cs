using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolMatura.Migrations.SetsDb
{
    public partial class UpdateRelations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_Sets_UserSetSetId",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_UserSetSetId",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "UserSetSetId",
                table: "Exercises");

            migrationBuilder.AddColumn<int>(
                name: "SetId",
                table: "Exercises",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_SetId",
                table: "Exercises",
                column: "SetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_Sets_SetId",
                table: "Exercises",
                column: "SetId",
                principalTable: "Sets",
                principalColumn: "SetId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_Sets_SetId",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_SetId",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "SetId",
                table: "Exercises");

            migrationBuilder.AddColumn<int>(
                name: "UserSetSetId",
                table: "Exercises",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_UserSetSetId",
                table: "Exercises",
                column: "UserSetSetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_Sets_UserSetSetId",
                table: "Exercises",
                column: "UserSetSetId",
                principalTable: "Sets",
                principalColumn: "SetId");
        }
    }
}
