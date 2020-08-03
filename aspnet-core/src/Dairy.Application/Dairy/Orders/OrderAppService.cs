using System;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Dairy.Authorization.Users;
using Dairy.Dairy.Customers;
using Dairy.Dairy.Orders.Dto;
using Dairy.Dairy.Products;
using Dairy.Dairy.Products.Dto;
using System.Linq.Dynamic.Core;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Abp.Authorization;
using Dairy.Authorization;
using Dairy.Dairy.CustomerBills;
using Dairy.Dairy.CustomerBillsData;

namespace Dairy.Dairy.Orders
{
    [AbpAuthorize(PermissionNames.Pages_Orders)]
    public class OrderAppService : DairyAppServiceBase, IOrderAppService
    {
        private readonly IRepository<Order, long> _orderRepository;
        private readonly IRepository<Product, int> _productRepository;
        private readonly IRepository<Customer, int> _customerRepository;
        private readonly IRepository<CustomerBill, long> _customerBillRepo;
        private readonly IRepository<CustomerBillData, long> _billDataRepository;
        private readonly UserManager _userManager;
        private readonly IAbpSession _session;
        public OrderAppService(IRepository<Order, long> orderRepository,
            IRepository<Product, int> productRepository,
            IRepository<Customer, int> customerRepository,
            IRepository<CustomerBill, long> customerBillRepo,
            UserManager userManager,
            IRepository<CustomerBillData, long> billRepository,
            IAbpSession session)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _customerRepository = customerRepository;
            _userManager = userManager;
            _session = session;
            _customerBillRepo = customerBillRepo;
            _billDataRepository = billRepository;
        }

        public async Task CreateOrEdit(CreateOrEditOrderDto input)
        {
            await Create(input);
        }

        protected virtual async Task Create(CreateOrEditOrderDto input)
        {
            User user;
            Customer customer;
            customer = await _customerRepository.GetAsync(input.CustomerId);
            CustomerBill customerBill;
            var customerBills = _customerBillRepo.GetAll().Where(p => p.Customer.Id == input.CustomerId);
            if (customerBills.Count() > 0)
            {
                customerBill = await customerBills.FirstAsync();
                customerBill.PendingAmount += input.TotalPrice;
                await _customerBillRepo.UpdateAsync(customerBill);
            }
            else
            {
                customerBill = new CustomerBill
                {
                    Customer = customer,
                    PendingAmount = input.TotalPrice
                };
                await _customerBillRepo.InsertAsync(customerBill);
            }

            var order = ObjectMapper.Map<Order>(input);
            user = await _userManager.GetUserByIdAsync(input.UserId);
            order.User = user;
            order.Customer = customer;
            foreach(ProductDto item in input.Products) {
                var product = await _productRepository.GetAsync(item.Id);
                product.Quantity = product.Quantity - item.Quantity;
                await _productRepository.UpdateAsync(product);
            }
            await _orderRepository.InsertAsync(order);
        }


        public async Task Delete(EntityDto input)
        {
            await _orderRepository.DeleteAsync(input.Id);
        }

        public async Task<PagedResultDto<GetOrderForViewDto>> GetAll(GetAllOrdersInputDto input)
        {
            var orders = _orderRepository.GetAll().WhereIf(input.CustomerId != null, e => e.Customer.Id == input.CustomerId)
                .WhereIf(input.UserId != null, e => e.User.Id == input.UserId)
                .WhereIf(input.StartDate != null && input.EndDate != null, e => e.CreationTime >= input.StartDate
                && e.CreationTime <= input.EndDate);

            var pagedOrders = orders
                .OrderBy("id desc")
                .PageBy(input);

            var pagedResult = from o in pagedOrders
                            select new GetOrderForViewDto
                            {
                                Order = new OrderDto()
                                {
                                    UserId = o.User.Id,
                                    Id = o.Id,
                                    CreationTime = o.CreationTime,
                                    CustomerId = o.Customer.Id,
                                    CustomerName = o.Customer.Name,
                                    Username = o.User.FullName,
                                    TotalPrice = o.TotalPrice,
                                    OrderItems = o.OrderItems
                                }
                                                              
                            };
            var totalCount = await orders.CountAsync();
            return new PagedResultDto<GetOrderForViewDto>(
                totalCount,
                await pagedResult.ToListAsync()
            );
        }

        public async Task<GetOrderForViewDto> GetForView(EntityDto input)
        {
            var order = await _orderRepository.GetAsync(input.Id);
            var output = new GetOrderForViewDto { Order = ObjectMapper.Map<OrderDto>(order) };
            return output;
        }
        public async Task<double> GetCustomerBill(int CustomerId)
        {
            var customerBills = _customerBillRepo.GetAll().Where(p => p.Customer.Id == CustomerId);
            if (customerBills.Count() > 0)
            {
                var bill = await customerBills.FirstAsync();
                return bill.PendingAmount;
            }
            else
            {
                return 0;
            }
        }
        public async Task UpdateCustomerBill(UpdateBillDto Input)
        {
            var customerBills = _customerBillRepo.GetAll().Where(p => p.Customer.Id == Input.CustomerId);
            if (customerBills.Count() > 0)
            {
                var bill = await customerBills.FirstAsync();
                double pendingBillAmount = bill.PendingAmount;
                bill.PendingAmount -= Input.Amount;
                await _customerBillRepo.UpdateAsync(bill);
                CustomerBillData billData = new CustomerBillData
                {
                    CreationTime = DateTime.Now,
                    BillAmount = pendingBillAmount,
                    CollectedAmount = Input.Amount,
                    Difference = pendingBillAmount - Input.Amount,
                    Customer = bill.Customer
                };
                await _billDataRepository.InsertAsync(billData);

            }
        }
    }
}
