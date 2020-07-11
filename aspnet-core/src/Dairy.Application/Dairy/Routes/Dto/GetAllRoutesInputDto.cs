using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.Routes.Dto
{
    public class GetAllRoutesInputDto : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
    }
}
