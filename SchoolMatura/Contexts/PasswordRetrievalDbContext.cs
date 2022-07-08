using EntityFramework.Exceptions.SqlServer;
using Microsoft.EntityFrameworkCore;
using SchoolMatura.Entities;

namespace SchoolMatura.Contexts
{
    public class PasswordRetrievalDbContext : DbContext
    {
        public DbSet<PasswordRetrievalRequest> Requests { get; set; }

        public PasswordRetrievalDbContext() : base()
        {
            this.ChangeTracker.LazyLoadingEnabled = false;
        }

        public PasswordRetrievalDbContext(DbContextOptions<PasswordRetrievalDbContext> options) : base(options)
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
                var ConnectionString = Configuration.GetConnectionString("AuthExtraConnectionString");
                optionsBuilder.UseSqlServer(ConnectionString).UseExceptionProcessor();
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PasswordRetrievalRequest>()
                .HasNoKey();
        }
    }
}
