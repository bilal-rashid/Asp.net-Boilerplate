using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace Dairy.Dairy.Products
{
    [Table("Dairy_Product")]
    public class Product : FullAuditedEntity<long>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Unit { get; set; }
        public double Price { get; set; }
        public double Quantity { get; set; }
    }
}
