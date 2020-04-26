using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Dairy.Configuration;
using Dairy.Web;

namespace Dairy.EntityFrameworkCore
{
    /* This class is needed to run "dotnet ef ..." commands from command line on development. Not used anywhere else */
    public class DairyDbContextFactory : IDesignTimeDbContextFactory<DairyDbContext>
    {
        public DairyDbContext CreateDbContext(string[] args)
        {
            var builder = new DbContextOptionsBuilder<DairyDbContext>();
            var configuration = AppConfigurations.Get(WebContentDirectoryFinder.CalculateContentRootFolder());

            DairyDbContextConfigurer.Configure(builder, configuration.GetConnectionString(DairyConsts.ConnectionStringName));

            return new DairyDbContext(builder.Options);
        }
    }
}
