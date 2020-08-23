import { Component, OnInit } from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CustomerDto, CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    GetOrderForViewDto, GetOrderForViewDtoPagedResultDto,
    OrderServiceProxy, OrderType,
    UserDto, UserDtoPagedResultDto,
    UserServiceProxy
} from '@shared/service-proxies/service-proxies';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {Injector} from '@node_modules/@angular/core';
import {ActivatedRoute} from '@node_modules/@angular/router';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import * as moment from '@node_modules/moment';
class GetOrdersRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}

@Component({
    selector: 'app-all-samples',
    templateUrl: './all-samples.component.html',
    styleUrls: ['./all-samples.component.css'],
    animations: [appModuleAnimation()],
})
export class AllSamplesComponent extends PagedListingComponentBase<GetOrderForViewDto> {
    customers: CustomerDto[] = [];
    selectedType: any;
    users: UserDto[] = [];
    userId: any;
    orders: GetOrderForViewDto[] = [];
    startDate: Date;
    endDate: Date;
    Data = [];
    Stats = [];
    GroupedData: any;
    orderEnum = OrderType;

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
        this.pageSize = 50000;
    }
    public clearFilter(): void {
        this.userId = undefined;
        this.startDate = undefined;
        this.endDate = undefined;
        this.selectedType = undefined;
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
                if (params.user) {
                    this.userId = parseInt(params.user, 10);
                }
                this._orderService
                    .getAllOther(undefined, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined,this.selectedType, request.sorting, request.skipCount, request.maxResultCount)
                    .pipe(
                        finalize(() => {
                            finishedCallback();
                        })
                    )
                    .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                        this.orders = result.items;
                        console.log(this.orders);
                        this.orders.forEach(o => {
                            o['expanded'] = false;
                            o['lineItems'] = JSON.parse(o.order.orderItems);
                        });
                        console.log(this.orders);
                        this.showPaging(result, pageNumber);
                        this.Stats = [];
                        this.Data = [];
                        this.orders.forEach(order => {
                            order['lineItems'].forEach(lineItem => {
                                this.Data.push({
                                    date: order.order.creationTime,
                                    product: lineItem.name,
                                    totalPrice: lineItem.price,
                                    rate: lineItem.price/lineItem.quantity,
                                    unit: lineItem.unit,
                                    quantity: lineItem.quantity
                                });
                            });
                        });
                        this.GroupedData = this.groupBy(this.Data, 'product');
                        Object.keys(this.GroupedData).forEach(key => {
                            let name = key;
                            let unit = this.GroupedData[key][0].unit;
                            let totalPrice = 0;
                            let totalQty = 0;
                            this.GroupedData[key].forEach(item => {
                                totalPrice = totalPrice + item.totalPrice;
                                totalQty = totalQty + item.quantity;
                            });
                            this.Stats.push({name: name, unit: unit, totalPrice: totalPrice, totalQty: totalQty});
                        });
                        console.log('Group', this.GroupedData);
                        console.log('Stat', this.Stats);
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
    groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

}
