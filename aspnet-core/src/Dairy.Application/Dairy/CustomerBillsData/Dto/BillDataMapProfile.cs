using System;
using AutoMapper;
namespace Dairy.Dairy.CustomerBillsData.Dto
{
    public class BillDataMapProfile : Profile
    {
        public BillDataMapProfile()
        {

            CreateMap<CustomerBillData, BillDataDto>();
        }
    }
}
