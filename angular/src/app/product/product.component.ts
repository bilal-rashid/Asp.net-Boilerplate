import { Component } from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    ProductDto,
    ProductDtoPagedResultDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import {CreateProductDialogComponent} from '@app/product/create-product-dialog/create-product-dialog.component';
import {EditProductDialogComponent} from '@app/product/edit-product-dialog/edit-product-dialog.component';

class GetProductsRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    selector: 'app-product',
    animations: [appModuleAnimation()],
    templateUrl: './product.component.html',
    styles: [
        `
          mat-form-field {
            padding: 10px;
          }
        `
    ]
})
export class ProductComponent extends PagedListingComponentBase<ProductDto> {

    products: ProductDto[] = [];

    keyword = '';

    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private _dialog: MatDialog
    ) {
        super(injector);
    }
    list(
        request: GetProductsRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;

        this._productsService
            .getAll(request.keyword, request.sorting, request.skipCount, request.maxResultCount)
            .pipe(
                finalize(() => {
                    finishedCallback();
                })
            )
            .subscribe((result: ProductDtoPagedResultDto) => {
                this.products = result.items;
                this.showPaging(result, pageNumber);
            });
    }
    delete(product: ProductDto): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage', product.name),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._productsService
                        .delete(product.id)
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
    createProduct(): void {
        this.showCreateOrEditRoleDialog();
    }

    editProduct(role: ProductDto): void {
        this.showCreateOrEditRoleDialog(role.id);
    }

    showCreateOrEditRoleDialog(id?: number): void {
        let createOrEditProductDialog;
        if (id === undefined || id <= 0) {
            createOrEditProductDialog = this._dialog.open(CreateProductDialogComponent);
        } else {
            createOrEditProductDialog = this._dialog.open(EditProductDialogComponent, {
                data: id
            });
        }

        createOrEditProductDialog.afterClosed().subscribe(result => {
            if (result) {
                this.refresh();
            }
        });
    }
}
