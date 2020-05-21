import { Component, OnInit } from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    CreateOrEditOrderDto,
    CustomerDto, CustomerDtoPagedResultDto, CustomerServiceProxy, OrderServiceProxy,
    ProductDto,
    ProductDtoPagedResultDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import {AbpSessionService} from '@abp/session/abp-session.service';

class GetProductsRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
    animations: [appModuleAnimation()],
    styles: [
        `
          mat-form-field {
            padding: 10px;
          }
        `
    ]
})
export class CreateOrderComponent extends PagedListingComponentBase<ProductDto> {

    products: ProductDto[] = [];
    customers: CustomerDto[] = [];
    customerId: any;

    keyword = '';

    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private _ordersService: OrderServiceProxy,
        private _dialog: MatDialog,
        private _customerService: CustomerServiceProxy,
        private _sessionService: AbpSessionService
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
                for (let i = 0; i < result.items.length ; i++) {
                    this.products[i]['quantity1'] = this.products[i].quantity;
                }
                for (let i = 0; i < result.items.length ; i++) {
                    this.products[i].quantity = 0.0;
                }
                this.showPaging(result, pageNumber);
            });
        this._customerService
            .getAll('', request.sorting, request.skipCount, 100)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: CustomerDtoPagedResultDto) => {
                this.customers = result.items;
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
    confirmAndCreate(): void {
        abp.message.confirm(
            'Create order for Customer: ' + this.customers.find( p => p.id === this.customerId).name,
            undefined,
            (result: boolean) => {
                if (result) {
                    this.createOrder();
                }
            }
        );
    }
    createOrder(): void {
        const orderDto: CreateOrEditOrderDto = new CreateOrEditOrderDto();
        let totalPrice = 0;
        orderDto.customerId = this.customerId;
        orderDto.userId = this._sessionService.userId;
        orderDto.products = this.products.filter(p => p.quantity > 0);
        for (let i = 0; i < orderDto.products.length; i++) {
            totalPrice = totalPrice + (orderDto.products[i].quantity * orderDto.products[i].price);
            orderDto.products[i].quantity = orderDto.products[i].quantity.valueOf();
        }
        orderDto.totalPrice = totalPrice;
        orderDto.orderItems = JSON.stringify(orderDto.products);
        console.log(orderDto);
        this._ordersService
            .createOrEdit(orderDto)
            .pipe(
                finalize(() => {
                })
            )
            .subscribe(() => {
                // this.notify.info(this.l('SavedSuccessfully'));
                abp.notify.success(this.l('SavedSuccessfully'));
                this.refresh();
            });
    }
    isCartEmpty(): boolean {
        return this.products.filter(p => p.quantity > 0).length === 0;
    }
    add (product): void {
        product.quantity++;
    }
    subtract (product): void {
        if (product.quantity > 0) {
            product.quantity--;
        }
    }
}
