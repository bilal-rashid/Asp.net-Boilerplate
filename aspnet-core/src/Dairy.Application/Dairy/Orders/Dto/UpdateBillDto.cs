using System;
namespace Dairy.Dairy.Orders.Dto
{
    public class UpdateBillDto
    {
        public int CustomerId { get; set; }
        public double Amount { get; set; }
    }
}
