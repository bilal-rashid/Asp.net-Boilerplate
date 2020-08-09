using System;
using Abp.Application.Services.Dto;
namespace Dairy.Dairy.CustomerBillsData.Dto
{
    public class BillDataDto : EntityDto<long>
    {
        public double BillAmount { get; set; }
        public double CollectedAmount { get; set; }
        public double Difference { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerArea { get; set; }
        public string CustomerAddress { get; set; }
        public DateTime? CreationTime { get; set; }
    }
}
