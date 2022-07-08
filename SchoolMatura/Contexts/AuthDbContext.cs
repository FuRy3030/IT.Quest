using EntityFramework.Exceptions.SqlServer;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchoolMatura.Entities;
using SchoolMatura.Models.AuthModels;

namespace SchoolMatura.Contexts
{
    public class AuthDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<PasswordRetrievalRequest> Requessts { get; set; }

        public AuthDbContext() : base()
        {

        }

        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {

        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot Configuration = new ConfigurationBuilder()
                   .SetBasePath(Directory.GetCurrentDirectory())
                   .AddJsonFile("appsettings.json")
                   .Build();
                var ConnectionString = Configuration.GetConnectionString("AuthConnectionString");
                optionsBuilder.UseSqlServer(ConnectionString).UseExceptionProcessor();
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>()
                .Property(e => e.FirstName)
                .HasMaxLength(150);

            modelBuilder.Entity<ApplicationUser>()
                .Property(e => e.LastName)
                .HasMaxLength(150);

            modelBuilder.Entity<ApplicationUser>()
                .Property(e => e.Email)
                .HasMaxLength(250);

            modelBuilder.Entity<PasswordRetrievalRequest>()
                .HasNoKey();
        }
    }
}
