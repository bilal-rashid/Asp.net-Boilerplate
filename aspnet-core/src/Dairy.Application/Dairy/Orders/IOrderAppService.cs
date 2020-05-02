using System;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Dairy.Dairy.Orders.Dto;

namespace Dairy.Dairy.Orders
{
    public interface IOrderAppService
    {
        Task<PagedResultDto<GetOrderForViewDto>> GetAll(GetAllOrdersInputDto input);

        Task<GetOrderForViewDto> GetForView(EntityDto input);

        Task CreateOrEdit(CreateOrEditOrderDto input);

        Task Delete(EntityDto input);
    }
}
