using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace Dairy.Dairy.Products.Dto
{
    [AutoMap(typeof(Product))]
    public class ProductDto : EntityDto<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
    }
}