using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.CustomerBillsData.Dto
{
    public class GetAllBillDataDto : PagedAndSortedResultRequestDto
    {
        public int? CustomerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
