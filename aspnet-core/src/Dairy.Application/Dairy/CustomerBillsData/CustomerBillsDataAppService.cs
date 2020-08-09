using System;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Dairy.Authorization;
using Dairy.Dairy.CustomerBillsData.Dto;

using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Dairy.Dairy.CustomerBillsData
{
    [AbpAuthorize(PermissionNames.Pages_Customers_Bills)]
    public class CustomerBillsDataAppService : DairyAppServiceBase, ICustomerBillsDataAppService
    {
        private readonly IRepository<CustomerBillData, long> _billRepository;
        public CustomerBillsDataAppService(IRepository<CustomerBillData, long> billRepository)
        {
            _billRepository = billRepository;
        }

        public async Task Delete(EntityDto input)
        {
            await _billRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<GetBillDataForView>> GetAll(GetAllBillDataDto input)
        {
            var bills = _billRepository.GetAll().WhereIf(input.CustomerId != null, e => e.Customer.Id == input.CustomerId)
                .WhereIf(input.StartDate != null && input.EndDate != null, e => e.CreationTime >= input.StartDate
                && e.CreationTime <= input.EndDate);

            var pagedOrders = bills
                .OrderBy("id desc")
                .PageBy(input);

            var pagedResult = from o in pagedOrders
                              select new GetBillDataForView
                              {
                                  billData = new BillDataDto()
                                  {
                                      BillAmount = o.BillAmount,
                                      CollectedAmount = o.CollectedAmount,
                                      CreationTime = o.CreationTime,
                                      CustomerId = o.Customer.Id,
                                      CustomerName = o.Customer.Name,
                                      Difference = o.Difference,
                                      CustomerArea = o.Customer.Area,
                                      CustomerAddress = o.Customer.Address,
                                      Id = o.Id
                                  }

                              };
            var totalCount = await bills.CountAsync();
            return new PagedResultDto<GetBillDataForView>(
                totalCount,
                await pagedResult.ToListAsync()
            );
        }

        public async Task<GetBillDataForView> GetForView(EntityDto input)
        {
            var billData = await _billRepository.GetAsync(input.Id);
            var output = new GetBillDataForView { billData = ObjectMapper.Map<BillDataDto>(billData) };
            return output;
        }
    }
}
