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
        public async Task ChangeMarketingLine(string input)
        {
            await SettingManager.ChangeSettingForApplicationAsync(AppSettingNames.Marketing, input);
        }
        public async Task ChangeFooter(string input)
        {
            await SettingManager.ChangeSettingForApplicationAsync(AppSettingNames.Footer, input);
        }
    }
}
