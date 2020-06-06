using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Dairy.Authorization;
using Dairy.Dairy.Customers.Dto;

namespace Dairy.Dairy.Customers
{
    [AbpAuthorize(PermissionNames.Pages_Customers)]
    public class CustomerAppService : AsyncCrudAppService<Customer, CustomerDto, int, GetAllCustomersInputDto>
    {

        public CustomerAppService(IRepository<Customer> repository)
        : base(repository)
        {

        }

        protected override IQueryable<Customer> CreateFilteredQuery(GetAllCustomersInputDto input)
        {
            return base.CreateFilteredQuery(input)
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter)
                || e.Address.Contains(input.Filter) || e.PrimaryContact.Contains(input.Filter)
                || e.Description.Contains(input.Filter));
        }
    }
}