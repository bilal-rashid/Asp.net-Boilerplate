
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
namespace Dairy.Dairy.Products
{
    [Table("Dairy_Product")]
    public class Product : FullAuditedEntity<int>, IMustHaveTenant
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
        public string TenantName { get; set; }
        public int TenantId { get; set; }
    }
}
