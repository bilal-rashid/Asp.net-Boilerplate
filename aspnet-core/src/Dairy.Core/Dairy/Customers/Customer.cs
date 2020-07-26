using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Dairy.Dairy.CustomerBills;
using Dairy.Dairy.CustomerBillsData;
using Dairy.Dairy.Orders;

namespace Dairy.Dairy.Customers
{
    [Table("Dairy_Customer")]
    public class Customer : FullAuditedEntity<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsTemporary { get; set; }
        public string Address { get; set; }
        public string Area { get; set; }
        public string PrimaryContact { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<CustomerBill> CustomerBills { get; set; }
        public ICollection<CustomerBillData> CustomerBillData { get; set; }
    }
}
