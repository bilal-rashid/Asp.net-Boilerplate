using System;
using System.Linq;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Dairy.Authorization;
using Dairy.Dairy.Routes.Dto;
namespace Dairy.Dairy.Routes
{
    [AbpAuthorize(PermissionNames.Pages_Routes)]
    public class RouteAppService : AsyncCrudAppService<Route, RouteDto, int, GetAllRoutesInputDto>
    {
        public RouteAppService(IRepository<Route> repository)
        : base(repository)
        {

        }

        protected override IQueryable<Route> CreateFilteredQuery(GetAllRoutesInputDto input)
        {
            return base.CreateFilteredQuery(input)
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter)
                || e.Description.Contains(input.Filter));
        }
    }
}
