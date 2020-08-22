using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Dairy.Dairy.Products.Dto;
using Dairy.Dairy.Utilities;

namespace Dairy.Dairy.Orders.Dto
{
    public class CreateOrEditOtherOrderDto : EntityDto<long?>
    {
        public string OrderItems { get; set; }
        public double TotalPrice { get; set; }
        public long UserId { get; set; }
        public OrderType Type { get; set; }
        public List<ProductDto> Products { get; set; }
    }
}
