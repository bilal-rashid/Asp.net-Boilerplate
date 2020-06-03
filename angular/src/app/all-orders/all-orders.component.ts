import {Component, OnInit} from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CustomerDto, CustomerDtoPagedResultDto, CustomerServiceProxy,
    GetOrderForViewDto, GetOrderForViewDtoPagedResultDto, IProductDto,
    OrderServiceProxy, UserDto, UserDtoPagedResultDto, UserServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import * as moment from '@node_modules/moment';
import {ActivatedRoute} from '@node_modules/@angular/router';
import {CreateCustomerDialogComponent} from '@app/customer/create-customer-dialog/create-customer-dialog.component';
import {EditCustomerDialogComponent} from '@app/customer/edit-customer-dialog/edit-customer-dialog.component';
import {CustomerBillDialogComponent} from '@app/all-orders/customer-bill/customer-bill-dialog.component';
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

    customers: CustomerDto[] = [];
    customerId: any;
    users: UserDto[] = [];
    userId: any;
    orders: GetOrderForViewDto[] = [];
    startDate: Date;
    endDate: Date;

    keyword = '';

    constructor(
        injector: Injector,
        private _orderService: OrderServiceProxy,
        private _customerService: CustomerServiceProxy,
        private _userService: UserServiceProxy,
        private route: ActivatedRoute,
        private _dialog: MatDialog
    ) {
        super(injector);
        const date = new Date();
        this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        this.endDate = new Date();
    }

    list(
        request: GetOrdersRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;
        console.log(moment(this.startDate).startOf('day'));
        console.log(moment(this.endDate).endOf('day'));
        this.route
            .queryParams
            .subscribe(params => {
                // Defaults to 0 if no query param provided.
                console.log(params);
                if (params.customer) {
                    this.customerId = parseInt(params.customer, 10);
                }
                if (params.user) {
                    this.userId = parseInt(params.user, 10);
                }
                this._orderService
                    .getAll(this.customerId, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined, request.sorting, request.skipCount, request.maxResultCount)
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
            });
        this._customerService
            .getAll('', request.sorting, request.skipCount, 2000)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: CustomerDtoPagedResultDto) => {
                this.customers = result.items;
            });
        this._userService
            .getAll('', true, request.skipCount, 500)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: UserDtoPagedResultDto) => {
                this.users = result.items;
            });
    }
    public clearFilter(): void {
        this.customerId = undefined;
        this.userId = undefined;
        this.startDate = undefined;
        this.endDate = undefined;
    }
    getCustomerBill() {
        this._orderService
            .getAll(this.customerId, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined, undefined, 0, 5000)
            .pipe(
                finalize(() => {
                })
            )
            .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                const orders = result.items.reverse();
                orders.forEach(o => {
                    o['lineItems'] = JSON.parse(o.order.orderItems);
                });
                this.showBillDialog(orders);
            });
    }
    showBillDialog(orders?: GetOrderForViewDto[]): void {
        let billDialog;
        billDialog = this._dialog.open(CustomerBillDialogComponent, {
            data: {orders: orders,
            startDate: this.startDate,
            endDate: this.endDate}
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
