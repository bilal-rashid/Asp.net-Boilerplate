using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Dairy.Authorization.Users;
using Dairy.Dairy.Customers;

namespace Dairy.Dairy.Orders
{
    [Table("Dairy_Order")]
    public class Order : FullAuditedEntity<long>
    {
        public string OrderItems { get; set; }
        public User User { get; set; }
        public Customer Customer { get; set; }
        public double TotalPrice { get; set; }
    }
}
