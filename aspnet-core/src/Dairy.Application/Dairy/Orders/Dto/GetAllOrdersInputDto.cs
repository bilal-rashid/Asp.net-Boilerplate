using System;
using Abp.Application.Services.Dto;
using Dairy.Dairy.Utilities;

namespace Dairy.Dairy.Orders.Dto
{
    public class GetAllOrdersInputDto : PagedAndSortedResultRequestDto
    {
        public int? CustomerId { get; set; }
        public long? UserId { get; set; }
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        public OrderType? Type { get; set; }
    }
}
