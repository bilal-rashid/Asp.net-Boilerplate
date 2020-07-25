using System;
using System.Threading.Tasks;
using Dairy.Dairy.RouteData.Dto;

namespace Dairy.Dairy.RouteData
{
    public interface IRouteDataAppService
    {

        Task<RouteDataResultDto> GetRouteData(long userId);

        Task CreateOrEdit(CreateOrEditRouteDataDto input);
    }
}
