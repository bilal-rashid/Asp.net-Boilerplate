import { Component, OnInit } from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    CustomerBillsDataServiceProxy,
    CustomerDto, CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    GetBillDataForView, GetBillDataForViewPagedResultDto, GetOrderForViewDto,
    OrderServiceProxy,
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {ActivatedRoute} from '@node_modules/@angular/router';
import {MatDialog} from '@node_modules/@angular/material';
import * as moment from '@node_modules/moment';
import {finalize} from '@node_modules/rxjs/operators';
class GetBillDataRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
  selector: 'app-customer-bill-data',
  templateUrl: './customer-bill-data.component.html',
  styleUrls: ['./customer-bill-data.component.css']
})
export class CustomerBillDataComponent  extends PagedListingComponentBase<GetBillDataForView> {

    customers: CustomerDto[] = [];
    customerId: any;
    bills: GetBillDataForView[] = [];
    startDate: Date;
    endDate: Date;

    keyword = '';

    constructor(
        injector: Injector,
        private _orderService: OrderServiceProxy,
        private _customerService: CustomerServiceProxy,
        private _billService: CustomerBillsDataServiceProxy,
        private route: ActivatedRoute,
        private _dialog: MatDialog
    ) {
        super(injector);
        const date = new Date();
        this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        this.endDate = new Date();
    }
    public clearFilter(): void {
        this.customerId = undefined;
        this.startDate = undefined;
        this.endDate = undefined;
    }

    list(
        request: GetBillDataRequestDto,
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
                this._billService
                    .getAll(this.customerId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined, request.sorting, request.skipCount, request.maxResultCount)
                    .pipe(
                        finalize(() => {
                            finishedCallback();
                        })
                    )
                    .subscribe((result: GetBillDataForViewPagedResultDto) => {
                        this.bills = result.items;

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
    }
    delete(bill: GetBillDataForView): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage'),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._billService
                        .delete(bill.billData.id)
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
