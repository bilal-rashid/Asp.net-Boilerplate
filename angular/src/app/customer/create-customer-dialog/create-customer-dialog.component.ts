import { Component } from '@angular/core';
import {AppComponentBase} from '@shared/app-component-base';
import {CustomerDto, CustomerServiceProxy} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialogRef} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
  templateUrl: './create-customer-dialog.component.html',
    styles: [
        `
      mat-form-field {
        width: 100%;
      }
      mat-checkbox {
        padding-bottom: 5px;
      }
    `
    ]
})
export class CreateCustomerDialogComponent extends AppComponentBase {

    saving = false;
    customer: CustomerDto = new CustomerDto();

    constructor(
        injector: Injector,
        private _customerService: CustomerServiceProxy,
        private _dialogRef: MatDialogRef<CreateCustomerDialogComponent>
    ) {
        super(injector);
    }
    save(): void {
        this.saving = true;
        const customer_ = new CustomerDto();
        customer_.init(this.customer);
        this._customerService
            .create(customer_)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close(true);
            });
    }

    close(result: any): void {
        this._dialogRef.close(result);
    }

}
