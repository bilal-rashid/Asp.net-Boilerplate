using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
namespace Dairy.Dairy.Routes
{
    [Table("Dairy_Route")]
    public class Route : FullAuditedEntity<long>
    {
        public string Name { get; set; }
        public string Customers { get; set; }
        public string Description { get; set; }
    }
}
