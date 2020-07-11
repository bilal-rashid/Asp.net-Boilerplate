using System;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Dairy.Authorization.Users;
namespace Dairy.Dairy.RouteData
{
    [Table("Dairy_RouteData")]
    public class RouteData : FullAuditedEntity<long>
    {
        public string Name { get; set; }
        public string PendingCustomers { get; set; }
        public string CompleteCustomers { get; set; }
        public User User { get; set; }
    }
}
