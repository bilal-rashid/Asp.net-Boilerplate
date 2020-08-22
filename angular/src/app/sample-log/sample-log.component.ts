import {Component} from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {AppComponentBase} from '@shared/app-component-base';
import {AfterViewInit, Injector} from '@node_modules/@angular/core';
import {
    CreateOrEditOtherOrderDto,
    OrderServiceProxy,
    OrderType,
    ProductDto,
    ProductDtoPagedResultDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {MatDialog, ThemePalette} from '@node_modules/@angular/material';
import {AbpSessionService} from '@abp/session/abp-session.service';
import {Router} from '@node_modules/@angular/router';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
    selector: 'app-sample-log',
    templateUrl: './sample-log.component.html',
    styleUrls: ['./sample-log.component.css'],
    animations: [appModuleAnimation()]
})
export class SampleLogComponent extends AppComponentBase implements AfterViewInit {

    products: ProductDto[] = [];
    keyword = '';
    loading = false;
    orderEnum = OrderType;
    color: ThemePalette = 'primary';
    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private _ordersService: OrderServiceProxy,
        private _dialog: MatDialog,
        private _sessionService: AbpSessionService,
        private _router: Router,
    ) {
        super(injector);
    }
    getProducts(): void {
        this.loading = true;
        this._productsService
            .getAll(this.keyword, undefined, 0, 200)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                    this.loading = false;
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
            });
    }
    ngAfterViewInit(): void {
        this.getProducts();
    }
    confirmAndCreate(type: OrderType): void {
        let message = '';
        if (type === OrderType.Sample) {
            message = 'Create Sample Order?';
        } else if (type === OrderType.Waste) {
            message = 'Log Waste?';
        } else {
            message = 'Log Charity?';
        }
        abp.message.confirm(
            message,
            undefined,
            (result: boolean) => {
                if (result) {
                    this.createOrder(type);
                }
            }
        );
    }
    isCartEmpty(): boolean {
        return this.products.filter(p => p.quantity > 0).length === 0;
    }
    add (product): void {
        product.quantity = product.quantity + 1;
    }
    subtract (product): void {
        if (product.quantity > 0) {
            product.quantity = product.quantity - 1;
        }
    }
    createOrder(type: OrderType): void {
        const orderDto: CreateOrEditOtherOrderDto = new CreateOrEditOtherOrderDto();
        let totalPrice = 0;
        orderDto.userId = this._sessionService.userId;
        orderDto.products = this.products.filter(p => p.quantity > 0);
        for (let i = 0; i < orderDto.products.length; i++) {
            totalPrice = totalPrice + (orderDto.products[i].quantity * orderDto.products[i].price);
            orderDto.products[i].quantity = orderDto.products[i].quantity.valueOf();
            orderDto.products[i].price = orderDto.products[i].quantity * orderDto.products[i].price;
        }
        orderDto.totalPrice = totalPrice;
        orderDto.orderItems = JSON.stringify(orderDto.products);
        orderDto.type = type;
        this._ordersService
            .createOrEditOther(orderDto)
            .pipe(
                finalize(() => {
                })
            )
            .subscribe(() => {
                // this.notify.info(this.l('SavedSuccessfully'));
                abp.notify.success(this.l('SavedSuccessfully'));
                this.getProducts();
            });
    }

}
