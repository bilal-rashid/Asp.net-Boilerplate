using System;
using AutoMapper;

namespace Dairy.Dairy.Orders.Dto
{
    public class OrderMapProfile : Profile
    {
        public OrderMapProfile()
        {
            CreateMap<CreateOrEditOrderDto, Order>();

            CreateMap<CreateOrEditOtherOrderDto, Order>();

            CreateMap<Order, OrderDto>();
        }
    }
}
