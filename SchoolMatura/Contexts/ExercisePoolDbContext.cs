using EntityFramework.Exceptions.SqlServer;
using Microsoft.EntityFrameworkCore;
using SchoolMatura.Entities;

namespace SchoolMatura.Contexts
{
    public class ExercisePoolDbContext : DbContext
    {
        public DbSet<IndependentExercise> IndependentExercises { get; set; }

        public ExercisePoolDbContext() : base()
        {
            this.ChangeTracker.LazyLoadingEnabled = false;
        }

        public ExercisePoolDbContext(DbContextOptions<ExercisePoolDbContext> options) : base(options)
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
        }
    }
}
