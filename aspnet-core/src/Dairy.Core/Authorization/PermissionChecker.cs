using Abp.Authorization;
using Dairy.Authorization.Roles;
using Dairy.Authorization.Users;

namespace Dairy.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}
