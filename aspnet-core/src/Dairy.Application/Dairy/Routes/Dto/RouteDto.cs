using System;
using Abp.AutoMapper;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.Routes.Dto
{
    [AutoMap(typeof(Route))]
    public class RouteDto : EntityDto<int>
    {
        public string Name { get; set; }
        public string Customers { get; set; }
        public string Description { get; set; }
        public DateTime? CreationTime { get; set; }
    }
}
