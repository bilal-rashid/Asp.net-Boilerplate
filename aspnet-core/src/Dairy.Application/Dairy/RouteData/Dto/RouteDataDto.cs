using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.RouteData.Dto
{
    public class RouteDataDto : EntityDto<long>
    {
        public string Name { get; set; }
        public string PendingCustomers { get; set; }
        public string CompleteCustomers { get; set; }
        public long? UserId { get; set; }
        public string Username { get; set; }
        public DateTime CreationTime { get; set; }
    }
}
