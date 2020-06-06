using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace Dairy.Dairy.Customers.Dto
{
    [AutoMap(typeof(Customer))]
    public class CustomerDto : EntityDto<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsTemporary { get; set; }
        public string Address { get; set; }
        public string PrimaryContact { get; set; }
    }
}