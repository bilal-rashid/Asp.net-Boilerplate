using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.RouteData.Dto
{
    public class CreateOrEditRouteDataDto : EntityDto<long?>
    {
        public long UserId { get; set; }
        public string PendingCustomers { get; set; }
        public string Name { get; set; }
    }
}
