using System;
using Abp.Application.Services.Dto;

namespace Dairy.Dairy.Orders.Dto
{
    public class OrderDto : EntityDto<long>
    {
        public string OrderItems { get; set; }
        public double TotalPrice { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public long? UserId { get; set; }
        public string Username { get; set; }
        public DateTime? CreationTime { get; set; }
    }
}
