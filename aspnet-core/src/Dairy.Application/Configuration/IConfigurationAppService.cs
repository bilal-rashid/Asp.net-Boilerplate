﻿using System.Threading.Tasks;
using Dairy.Configuration.Dto;

namespace Dairy.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}
