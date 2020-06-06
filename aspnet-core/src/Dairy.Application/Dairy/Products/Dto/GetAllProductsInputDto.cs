using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.Products.Dto
{
    public class GetAllProductsInputDto : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}