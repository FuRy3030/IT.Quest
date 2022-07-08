using EntityFramework.Exceptions.SqlServer;
using Microsoft.EntityFrameworkCore;
using SchoolMatura.Entities;

namespace SchoolMatura.Contexts
{
    public class SetsDbContext : DbContext
    {
        public DbSet<UserSet> Sets { get; set; }
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<TestTaker> TestTakers { get; set; }
        public DbSet<TakerAnswer> Answers { get; set; }

        public SetsDbContext() : base()
        {
            this.ChangeTracker.LazyLoadingEnabled = false;
        }

        public SetsDbContext(DbContextOptions<SetsDbContext> options) : base(options)
        {
            this.ChangeTracker.LazyLoadingEnabled = false;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot Configuration = new ConfigurationBuilder()
                   .SetBasePath(Directory.GetCurrentDirectory())
                   .AddJsonFile("appsettings.json")
                   .Build();
                var ConnectionString = Configuration.GetConnectionString("DataConnectionString");
                optionsBuilder.UseSqlServer(ConnectionString).UseExceptionProcessor();
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserSet>()
               .HasMany(Set => Set.Exercises)
               .WithOne(Exercise => Exercise.Set)
               .IsRequired();

            modelBuilder.Entity<UserSet>()
               .HasMany(Set => Set.Sessions)
               .WithOne(Session => Session.Set)
               .HasForeignKey(Session => Session.SetId)
               .IsRequired();

            modelBuilder.Entity<Session>()
               .HasMany(Session => Session.TestTakers)
               .WithOne(TestTaker => TestTaker.Session)
               .HasForeignKey(TestTaker => TestTaker.SessionId)
               .IsRequired();

            modelBuilder.Entity<TestTaker>()
               .HasMany(TestTaker => TestTaker.TakerAnswers)
               .WithOne(Answer => Answer.TestTaker)
               .HasForeignKey(Answer => Answer.TakerId)
               .OnDelete(DeleteBehavior.ClientSetNull);

            modelBuilder.Entity<TakerAnswer>()
               .HasOne(TakerAnswer => TakerAnswer.Exercise)
               .WithMany(Exercise => Exercise.TakerAnswers)
               .HasForeignKey(TakerAnswer => TakerAnswer.ExerciseId)
               .IsRequired();
        }
    }
}
