using Abp.Application.Services;
using Dairy.MultiTenancy.Dto;

namespace Dairy.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

