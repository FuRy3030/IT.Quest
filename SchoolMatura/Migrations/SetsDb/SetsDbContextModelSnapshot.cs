﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SchoolMatura.Contexts;

#nullable disable

namespace SchoolMatura.Migrations.SetsDb
{
    [DbContext(typeof(SetsDbContext))]
    partial class SetsDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("SchoolMatura.Entities.Exercise", b =>
                {
                    b.Property<int>("ExerciseId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ExerciseId"), 1L, 1);

                    b.Property<string>("AdditionalData")
                        .HasColumnType("nvarchar(1)");

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CorrectAnswer")
                        .HasColumnType("nvarchar(1)");

                    b.Property<string>("ExerciseType")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Hashtags")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("MainOrder")
                        .HasColumnType("int");

                    b.Property<int>("Points")
                        .HasColumnType("int");

                    b.Property<int>("SetId")
                        .HasColumnType("int");

                    b.Property<int?>("SubOrder")
                        .HasColumnType("int");

                    b.HasKey("ExerciseId");

                    b.HasIndex("SetId");

                    b.ToTable("Exercises");
                });

            modelBuilder.Entity("SchoolMatura.Entities.Session", b =>
                {
                    b.Property<int>("SessionId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("SessionId"), 1L, 1);

                    b.Property<DateTime>("ExpirationTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("SessionName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("SetId")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("UniqueSessionCode")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("SessionId");

                    b.HasIndex("SetId");

                    b.ToTable("Sessions");
                });

            modelBuilder.Entity("SchoolMatura.Entities.TakerAnswer", b =>
                {
                    b.Property<int>("AnswerId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("AnswerId"), 1L, 1);

                    b.Property<string>("CodeAnswer")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CodingLanguage")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<int>("ScoredPoints")
                        .HasColumnType("int");

                    b.Property<int?>("TakerId")
                        .HasColumnType("int");

                    b.Property<string>("TeacherComment")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserAnswer")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("AnswerId");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("TakerId");

                    b.ToTable("Answers");
                });

            modelBuilder.Entity("SchoolMatura.Entities.TestTaker", b =>
                {
                    b.Property<int>("TakerId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("TakerId"), 1L, 1);

                    b.Property<int>("GradingStatus")
                        .HasColumnType("int");

                    b.Property<int?>("SessionId")
                        .IsRequired()
                        .HasColumnType("int");

                    b.Property<DateTime?>("TakerAnswerSubmissionDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("TakerFirstName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("TakerIdentifier")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("TakerLastName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("TakerId");

                    b.HasIndex("SessionId");

                    b.ToTable("TestTakers");
                });

            modelBuilder.Entity("SchoolMatura.Entities.UserSet", b =>
                {
                    b.Property<int>("SetId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("SetId"), 1L, 1);

                    b.Property<DateTime>("CreationTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("SetId");

                    b.ToTable("Sets");
                });

            modelBuilder.Entity("SchoolMatura.Entities.Exercise", b =>
                {
                    b.HasOne("SchoolMatura.Entities.UserSet", "Set")
                        .WithMany("Exercises")
                        .HasForeignKey("SetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Set");
                });

            modelBuilder.Entity("SchoolMatura.Entities.Session", b =>
                {
                    b.HasOne("SchoolMatura.Entities.UserSet", "Set")
                        .WithMany("Sessions")
                        .HasForeignKey("SetId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Set");
                });

            modelBuilder.Entity("SchoolMatura.Entities.TakerAnswer", b =>
                {
                    b.HasOne("SchoolMatura.Entities.Exercise", "Exercise")
                        .WithMany("TakerAnswers")
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("SchoolMatura.Entities.TestTaker", "TestTaker")
                        .WithMany("TakerAnswers")
                        .HasForeignKey("TakerId");

                    b.Navigation("Exercise");

                    b.Navigation("TestTaker");
                });

            modelBuilder.Entity("SchoolMatura.Entities.TestTaker", b =>
                {
                    b.HasOne("SchoolMatura.Entities.Session", "Session")
                        .WithMany("TestTakers")
                        .HasForeignKey("SessionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Session");
                });

            modelBuilder.Entity("SchoolMatura.Entities.Exercise", b =>
                {
                    b.Navigation("TakerAnswers");
                });

            modelBuilder.Entity("SchoolMatura.Entities.Session", b =>
                {
                    b.Navigation("TestTakers");
                });

            modelBuilder.Entity("SchoolMatura.Entities.TestTaker", b =>
                {
                    b.Navigation("TakerAnswers");
                });

            modelBuilder.Entity("SchoolMatura.Entities.UserSet", b =>
                {
                    b.Navigation("Exercises");

                    b.Navigation("Sessions");
                });
#pragma warning restore 612, 618
        }
    }
}
