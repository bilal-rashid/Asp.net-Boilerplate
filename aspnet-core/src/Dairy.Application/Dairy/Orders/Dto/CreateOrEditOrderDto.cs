using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Dairy.Dairy.Products.Dto;

namespace Dairy.Dairy.Orders.Dto
{
    public class CreateOrEditOrderDto : EntityDto<long?>
    {
        public string OrderItems { get; set; }
        public double TotalPrice { get; set; }
        public long UserId { get; set; }
        public int CustomerId { get; set; }
        public List<ProductDto> Products { get; set; }
    }
}
