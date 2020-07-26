using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Dairy.Dairy.Customers;

namespace Dairy.Dairy.CustomerBills
{
    [Table("Dairy_CustomerBill")]
    public class CustomerBill : FullAuditedEntity<long>
    {
        public double PendingAmount { get; set; }
        public Customer Customer { get; set; }
    }
}
