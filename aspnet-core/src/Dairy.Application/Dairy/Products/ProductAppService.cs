using System;
using System.Linq;
using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Dairy.Dairy.Products.Dto;

namespace Dairy.Dairy.Products
{
    public class ProductAppService : AsyncCrudAppService<Product, ProductDto,int, GetAllProductsInputDto>
    {
        public ProductAppService(IRepository<Product> repository)
        : base(repository)
        {

        }

        protected override IQueryable<Product> CreateFilteredQuery(GetAllProductsInputDto input)
        {
            return base.CreateFilteredQuery(input)
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter), e => false || e.Name.Contains(input.Filter)
                || e.Description.Contains(input.Filter));
        }
    }
}
