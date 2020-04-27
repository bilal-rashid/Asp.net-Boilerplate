using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using Dairy.Authorization.Roles;
using Dairy.Authorization.Users;
using Dairy.MultiTenancy;
using Dairy.Dairy.Products;

namespace Dairy.EntityFrameworkCore
{
    public class DairyDbContext : AbpZeroDbContext<Tenant, Role, User, DairyDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public virtual DbSet<Product> Products { get; set; }

        public DairyDbContext(DbContextOptions<DairyDbContext> options)
            : base(options)
        {
        }
    }
}
