import { Component } from '@angular/core';
import {AppComponentBase} from '@shared/app-component-base';
import {
    ProductDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialogRef} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
  templateUrl: './create-product-dialog.component.html',
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
export class CreateProductDialogComponent extends AppComponentBase {

    saving = false;
    product: ProductDto = new ProductDto();

    constructor(
        injector: Injector,
        private _productService: ProductServiceProxy,
        private _dialogRef: MatDialogRef<CreateProductDialogComponent>
    ) {
        super(injector);
    }
    save(): void {
        this.saving = true;
        const product_ = new ProductDto();
        product_.init(this.product);
        this._productService
            .create(product_)
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
