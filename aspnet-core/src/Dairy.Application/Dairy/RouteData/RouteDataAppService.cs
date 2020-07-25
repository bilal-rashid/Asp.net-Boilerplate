using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Dairy.Authorization.Users;
using System.Linq.Dynamic.Core;
using Dairy.Dairy.RouteData.Dto;
using Microsoft.EntityFrameworkCore;

using Abp.Runtime.Session;

using Dairy.Dairy.Customers;
using Dairy.Dairy.Orders.Dto;
using Dairy.Dairy.Products;
using Dairy.Dairy.Products.Dto;
using Abp.Authorization;
using Dairy.Authorization;

namespace Dairy.Dairy.RouteData
{
    public class RouteDataAppService : DairyAppServiceBase, IRouteDataAppService
    {
        private readonly IRepository<RouteData, long> _routeDataRepository;
        private readonly UserManager _userManager;
        public RouteDataAppService(IRepository<RouteData, long> routeDataRepo,
            UserManager userManager)
        {
            _routeDataRepository = routeDataRepo;
            _userManager = userManager;
        }

        public async Task CreateOrEdit(CreateOrEditRouteDataDto input)
        {
            if (input.Id == null)
            {
                await Delete(input);
                await Create(input);
            }
            else
            {
                await Update(input);
            }
        }
        protected virtual async Task Delete(CreateOrEditRouteDataDto input)
        {
            await _routeDataRepository.DeleteAsync(p => p.User.Id == input.UserId);
        }
        protected virtual async Task Create(CreateOrEditRouteDataDto input)
        {
            User user = await _userManager.GetUserByIdAsync(input.UserId);
            RouteData routeData = new RouteData();
            routeData.User = user;
            routeData.Name = input.Name;
            routeData.PendingCustomers = input.PendingCustomers;
            await _routeDataRepository.InsertAsync(routeData);
        }


        protected virtual async Task Update(CreateOrEditRouteDataDto input)
        {
            var routeData = await _routeDataRepository.FirstOrDefaultAsync((long)input.Id);
            routeData.PendingCustomers = input.PendingCustomers;
            await _routeDataRepository.UpdateAsync(routeData);
        }
        public async Task<PagedResultDto<RouteDataDto>> GetAll(GetAllDto input)
        {
            var routeData = _routeDataRepository.GetAll();

            var pagedData = routeData
                .OrderBy("id desc")
                .PageBy(input);

            var pagedResult = from o in pagedData
                              select new RouteDataDto
                              {
                                 CompleteCustomers = o.CompleteCustomers,
                                 Id = o.Id,
                                 Name = o.Name,
                                 UserId = o.User.Id,
                                 PendingCustomers = o.PendingCustomers,
                                 Username = o.User.Name,
                                 CreationTime = o.CreationTime
                              };
            var totalCount = await routeData.CountAsync();
            return new PagedResultDto<RouteDataDto>(
                totalCount,
                await pagedResult.ToListAsync()
            );
        }

        public async Task<RouteDataResultDto> GetRouteData(long userId)
        {
            var currentDate = DateTime.Now.Date;
            var result = _routeDataRepository.GetAll().WhereIf(true, e => e.User.Id == userId && e.CreationTime.Date.Equals(currentDate));
            RouteDataResultDto routeDataResultDto = new RouteDataResultDto();
            routeDataResultDto.RouteData = new RouteDataDto();
            if (result.Count() > 0)
            {
                var routeData = await result.FirstAsync();
                routeDataResultDto.RouteData.Name = routeData.Name;
                if (routeData.User != null)
                {
                    routeDataResultDto.RouteData.UserId = routeData.User.Id;
                    routeDataResultDto.RouteData.Username = routeData.User.Name;
                }
                else
                {
                    routeDataResultDto.RouteData.UserId = 0;
                    routeDataResultDto.RouteData.Username = "null";
                }
                routeDataResultDto.RouteData.Id = routeData.Id;
                routeDataResultDto.RouteData.PendingCustomers = routeData.PendingCustomers;
                routeDataResultDto.Error = false;
                routeDataResultDto.RouteData.CreationTime = routeData.CreationTime;
                return routeDataResultDto;
            }
            else
            {
                routeDataResultDto.Error = true;
                return routeDataResultDto;
            }
        }
    }
}
