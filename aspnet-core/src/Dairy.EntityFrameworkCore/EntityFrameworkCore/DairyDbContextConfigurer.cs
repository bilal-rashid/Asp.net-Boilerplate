using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace Dairy.EntityFrameworkCore
{
    public static class DairyDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<DairyDbContext> builder, string connectionString)
        {
            builder.UseSqlServer(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<DairyDbContext> builder, DbConnection connection)
        {
            builder.UseSqlServer(connection);
        }
    }
}
