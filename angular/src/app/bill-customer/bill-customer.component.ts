import {Component, Inject, OnInit} from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    CustomerDto,
    CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    OrderServiceProxy,
    UpdateBillDto
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {Router} from '@node_modules/@angular/router';
import {MatDialog} from '@node_modules/@angular/material';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from '@node_modules/rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
    amount: number;
    name: string;
}

class GetCustomersRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    animations: [appModuleAnimation()],
  selector: 'app-bill-customer',
  templateUrl: './bill-customer.component.html',
  styleUrls: ['./bill-customer.component.css']
})
export class BillCustomerComponent  extends PagedListingComponentBase<CustomerDto>{

    customers: CustomerDto[] = [];

    keyword = '';
    customerBills = {};
    name: string;
    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy,
        private _orderService: OrderServiceProxy,
        private _router: Router,
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {
        super(injector);
    }
    list(
        request: GetCustomersRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;

        this._customerService
            .getAll(request.keyword, request.sorting, request.skipCount, request.maxResultCount)
            .pipe(
                finalize(() => {
                    finishedCallback();
                })
            )
            .subscribe((result: CustomerDtoPagedResultDto) => {
                this.customers = result.items;
                this.customers.forEach(customer => {
                    if (!this.customerBills[customer.id]) {
                        this.getBill(customer.id);
                    }
                });
                this.showPaging(result, pageNumber);
            });
    }
    getBill(id) {
        this._orderService.getCustomerBill(id).subscribe((result: number) => {
            this.customerBills[id.toString()] = result;
            console.log(this.customerBills);
        });

    }
    updateCustomerBill(id: number, amount: number) {
        let billDto = new UpdateBillDto();
        billDto.amount = amount;
        billDto.customerId = id;
        this._orderService.updateCustomerBill(billDto).subscribe((result) => {
            abp.notify.success(this.l('Success'));
            this.customerBills[id.toString()] = null;
            this.refresh();
        });
    }
    delete(customer: CustomerDto): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage', customer.name),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._customerService
                        .delete(customer.id)
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
    showArea(area) {
        this._snackBar.open(area, null, {
            duration: 2000,
        });
    }
    openDialog(customer): void {
        const dialogRef = this._dialog.open(BillDialog, {
            width: '250px',
            data: {name: customer.name}
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result !== 0) {
                    this.updateCustomerBill(customer.id, result);
                }
            }
        });
    }

}
@Component({
    selector: 'bill-dialog',
    templateUrl: './bill-dialog.component.html',
})
export class BillDialog {

    constructor(
        public dialogRef: MatDialogRef<BillDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

}
