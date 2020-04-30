using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;

namespace Dairy.Dairy.Customers
{
    [Table("Dairy_Customer")]
    public class Customer : FullAuditedEntity<int>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsTemporary { get; set; }
        public string Address { get; set; }
        public string PrimaryContact { get; set; }
    }
}
