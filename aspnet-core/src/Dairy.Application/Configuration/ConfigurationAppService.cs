using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Dairy.Configuration.Dto;

namespace Dairy.Configuration
{
    [AbpAuthorize]
    public class ConfigurationAppService : DairyAppServiceBase, IConfigurationAppService
    {
        public async Task ChangeUiTheme(ChangeUiThemeInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
        }
        public async Task ChangeBrandName(string input)
        {
            await SettingManager.ChangeSettingForTenantAsync((int)AbpSession.TenantId, AppSettingNames.Brand, input);
        }
        public async Task ChangeTagLine(string input)
        {
            await SettingManager.ChangeSettingForTenantAsync((int)AbpSession.TenantId, AppSettingNames.Tagline, input);
        }
        public async Task ChangeFooter(string input)
        {
            await SettingManager.ChangeSettingForTenantAsync((int)AbpSession.TenantId, AppSettingNames.Footer, input);
        }
        public async Task ChangeAddress(string input)
        {
            await SettingManager.ChangeSettingForTenantAsync((int)AbpSession.TenantId, AppSettingNames.Address, input);
        }
    }
}
