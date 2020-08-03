using System;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Dairy.Dairy.CustomerBillsData.Dto;

namespace Dairy.Dairy.CustomerBillsData
{
    public interface ICustomerBillsDataAppService
    {
        Task<PagedResultDto<GetBillDataForView>> GetAll(GetAllBillDataDto input);

        Task<GetBillDataForView> GetForView(EntityDto input);

        Task Delete(EntityDto input);
    }
}
