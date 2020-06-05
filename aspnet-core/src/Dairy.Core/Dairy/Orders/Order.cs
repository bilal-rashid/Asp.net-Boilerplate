using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Dairy.Authorization.Users;
using Dairy.Dairy.Customers;
namespace Dairy.Dairy.Orders
{
    [Table("Dairy_Order")]
    public class Order : FullAuditedEntity<long>, IMustHaveTenant
    {
        public string OrderItems { get; set; }
        public User User { get; set; }
        public Customer Customer { get; set; }
        public double TotalPrice { get; set; }
        public string TenantName { get; set; }
        public int TenantId { get; set; }
    }
}
