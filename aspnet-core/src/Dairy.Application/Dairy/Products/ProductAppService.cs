using System;
using Abp.Application.Services;
using Abp.Domain.Repositories;
using Dairy.Dairy.Products.Dto;

namespace Dairy.Dairy.Products
{
    public class ProductAppService : AsyncCrudAppService<Product, ProductDto>
    {
        public ProductAppService(IRepository<Product> repository)
        : base(repository)
        {

        }
    }
}
