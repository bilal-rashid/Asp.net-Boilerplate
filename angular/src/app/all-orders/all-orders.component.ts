import { Component } from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    GetOrderForViewDto, GetOrderForViewDtoPagedResultDto, IProductDto,
    OrderServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
class GetOrdersRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    animations: [appModuleAnimation()],
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent extends PagedListingComponentBase<GetOrderForViewDto> {

    orders: GetOrderForViewDto[] = [];

    keyword = '';

    constructor(
        injector: Injector,
        private _orderService: OrderServiceProxy,
        private _dialog: MatDialog
    ) {
        super(injector);
    }

    list(
        request: GetOrdersRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;

        this._orderService
            .getAll(undefined, undefined, undefined, undefined, request.sorting, request.skipCount, request.maxResultCount)
            .pipe(
                finalize(() => {
                    finishedCallback();
                })
            )
            .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                this.orders = result.items.reverse();
                console.log(this.orders);
                this.orders.forEach(o => {
                    o['expanded'] = false;
                    o['lineItems'] = JSON.parse(o.order.orderItems);
                });
                console.log(this.orders);
                this.showPaging(result, pageNumber);
            });
    }
    delete(order: GetOrderForViewDto): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage'),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._orderService
                        .delete(order.order.id)
                        .pipe(
                            finalize(() => {
                                abp.notify.success(this.l('SuccessfullyDeleted'));
                                this.refresh();
                            })
                        )
                        .subscribe(() => { });
                }
            }
        );
    }

}
