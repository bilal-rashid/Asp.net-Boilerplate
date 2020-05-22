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

namespace Dairy.Dairy.Orders
{
    [AbpAuthorize(PermissionNames.Pages_Orders)]
    public class OrderAppService : DairyAppServiceBase, IOrderAppService
    {
        private readonly IRepository<Order, long> _orderRepository;
        private readonly IRepository<Product, int> _productRepository;
        private readonly IRepository<Customer, int> _customerRepository;
        private readonly UserManager _userManager;
        private readonly IAbpSession _session;
        public OrderAppService(IRepository<Order, long> orderRepository,
            IRepository<Product, int> productRepository,
            IRepository<Customer, int> customerRepository,
            UserManager userManager,
            IAbpSession session)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _customerRepository = customerRepository;
            _userManager = userManager;
            _session = session;
        }

        public async Task CreateOrEdit(CreateOrEditOrderDto input)
        {
            await Create(input);
        }

        protected virtual async Task Create(CreateOrEditOrderDto input)
        {
            User user;
            Customer customer;
            var order = ObjectMapper.Map<Order>(input);
            user = await _userManager.GetUserByIdAsync(input.UserId);
            order.User = user;
            customer = await _customerRepository.GetAsync(input.CustomerId);
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
    }
}
