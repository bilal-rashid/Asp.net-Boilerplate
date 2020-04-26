using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace Dairy.Controllers
{
    public abstract class DairyControllerBase: AbpController
    {
        protected DairyControllerBase()
        {
            LocalizationSourceName = DairyConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
