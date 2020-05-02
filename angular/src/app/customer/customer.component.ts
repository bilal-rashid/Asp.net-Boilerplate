import { Component } from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    CustomerDto, CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    ProductDto
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import {EditCustomerDialogComponent} from '@app/customer/edit-customer-dialog/edit-customer-dialog.component';
import {CreateCustomerDialogComponent} from '@app/customer/create-customer-dialog/create-customer-dialog.component';
import {appModuleAnimation} from '@shared/animations/routerTransition';
class GetCustomersRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    animations: [appModuleAnimation()],
  selector: 'app-customer',
  templateUrl: './customer.component.html',
    styles: [
        `
          mat-form-field {
            padding: 10px;
          }
        `
    ]
})
export class CustomerComponent extends PagedListingComponentBase<CustomerDto> {

    customers: CustomerDto[] = [];

    keyword = '';

    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy,
        private _dialog: MatDialog
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
                this.showPaging(result, pageNumber);
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
    createCustomer(): void {
        this.showCreateOrEditRoleDialog();
    }

    editCustomer(role: CustomerDto): void {
        this.showCreateOrEditRoleDialog(role.id);
    }
    showCreateOrEditRoleDialog(id?: number): void {
        let createOrEditCustomerDialog;
        if (id === undefined || id <= 0) {
            createOrEditCustomerDialog = this._dialog.open(CreateCustomerDialogComponent);
        } else {
            createOrEditCustomerDialog = this._dialog.open(EditCustomerDialogComponent, {
                data: id
            });
        }

        createOrEditCustomerDialog.afterClosed().subscribe(result => {
            if (result) {
                this.refresh();
            }
        });
    }

}
