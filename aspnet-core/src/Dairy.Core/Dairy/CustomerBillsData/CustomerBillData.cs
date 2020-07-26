using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Dairy.Dairy.Customers;

namespace Dairy.Dairy.CustomerBillsData
{
    [Table("Dairy_CustomerBillData")]
    public class CustomerBillData : FullAuditedEntity<long>
    {
        public double BillAmount { get; set; }
        public double CollectedAmount { get; set; }
        public double Difference { get; set; }
        public Customer Customer { get; set; }
    }
}
