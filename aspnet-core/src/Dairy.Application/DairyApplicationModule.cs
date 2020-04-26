using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Dairy.Authorization;

namespace Dairy
{
    [DependsOn(
        typeof(DairyCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class DairyApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<DairyAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(DairyApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
