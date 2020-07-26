using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using Dairy.Authorization.Roles;
using Dairy.Authorization.Users;
using Dairy.MultiTenancy;
using Dairy.Dairy.Products;
using Dairy.Dairy.Customers;
using Dairy.Dairy.Orders;
using Dairy.Dairy.Routes;
using Dairy.Dairy.RouteData;
using Dairy.Dairy.CustomerBills;
using Dairy.Dairy.CustomerBillsData;

namespace Dairy.EntityFrameworkCore
{
    public class DairyDbContext : AbpZeroDbContext<Tenant, Role, User, DairyDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<Customer> Customers { get; set; }
        public virtual DbSet<Order> Orders { get; set; }
        public virtual DbSet<Route> Routes { get; set; }
        public virtual DbSet<RouteData> RouteData { get; set; }
        public virtual DbSet<CustomerBill> CustomerBills { get; set; }
        public virtual DbSet<CustomerBillData> CustomerBillsData { get; set; }

        public DairyDbContext(DbContextOptions<DairyDbContext> options)
            : base(options)
        {
        }
    }
}
