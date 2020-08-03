﻿using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace Dairy.Authorization
{
    public class DairyAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
            context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
            context.CreatePermission(PermissionNames.Pages_Products, L("Products"));
            context.CreatePermission(PermissionNames.Pages_Orders, L("Orders"));
            context.CreatePermission(PermissionNames.Pages_Routes, L("Routes"));
            context.CreatePermission(PermissionNames.Pages_Customers, L("Customers"));
            context.CreatePermission(PermissionNames.Pages_Customers_Bills, L("CustomersBills"));
            context.CreatePermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, DairyConsts.LocalizationSourceName);
        }
    }
}
