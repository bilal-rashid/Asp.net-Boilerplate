import { Component, OnInit } from '@angular/core';
import {AppComponentBase} from '@shared/app-component-base';
import {
    ProductDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Inject, Injector, Optional} from '@node_modules/@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
  templateUrl: './edit-product-dialog.component.html',
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
export class EditProductDialogComponent extends AppComponentBase
    implements OnInit {
    saving = false;
    product: ProductDto = new ProductDto();

    constructor(
        injector: Injector,
        private _productService: ProductServiceProxy,
        private _dialogRef: MatDialogRef<EditProductDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) private _id: number
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this._productService
            .get(this._id)
            .subscribe((result: ProductDto) => {
                this.product.init(result);
            });
    }
    save(): void {
        this.saving = true;
        this._productService
            .update(this.product)
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
