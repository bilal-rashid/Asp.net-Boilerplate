using System;
using Abp.Application.Services.Dto;

namespace Dairy.Dairy.Customers.Dto
{
    public class GetAllCustomersInputDto : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}