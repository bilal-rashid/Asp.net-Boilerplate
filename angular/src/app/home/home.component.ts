import { Component, Injector, AfterViewInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
    CreateOrEditOrderDto,
    CustomerDto, CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    OrderServiceProxy,
    ProductDto, ProductDtoPagedResultDto,
    ProductServiceProxy
} from '@shared/service-proxies/service-proxies';
import {MatDialog} from '@node_modules/@angular/material';
import {AbpSessionService} from '@abp/session/abp-session.service';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
    templateUrl: './home.component.html',
    animations: [appModuleAnimation()]
})
export class HomeComponent extends AppComponentBase implements AfterViewInit {

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
    getProducts(): void {
        this._productsService
            .getAll(this.keyword, undefined, 0, 20)
            .pipe(
                finalize(() => {
                    // finishedCallback();
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
        this._customerService
            .getAll('', undefined, 0, 2000)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: CustomerDtoPagedResultDto) => {
                this.customers = result.items;
            });
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
            orderDto.products[i].price = orderDto.products[i].quantity * orderDto.products[i].price;
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
                this.getProducts();
            });
    }
    isCartEmpty(): boolean {
        return this.products.filter(p => p.quantity > 0).length === 0;
    }
    add (product): void {
        product.quantity = product.quantity + 0.5;
    }
    subtract (product): void {
        if (product.quantity > 0) {
            product.quantity = product.quantity - 0.5;
        }
    }

    // ngAfterViewInit(): void {
    //
    //     $(function () {
    //         // Widgets count
    //         $('.count-to').countTo();
    //
    //         // Sales count to
    //         $('.sales-count-to').countTo({
    //             formatter: function (value, options) {
    //                 return '$' + value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, ' ').replace('.', ',');
    //             }
    //         });
    //
    //         initRealTimeChart();
    //         initDonutChart();
    //         initSparkline();
    //     });
    //
    //     let realtime = 'on';
    //     function initRealTimeChart() {
    //         // Real time ==========================================================================================
    //         const plot = ($ as any).plot('#real_time_chart', [getRandomData()], {
    //             series: {
    //                 shadowSize: 0,
    //                 color: 'rgb(0, 188, 212)'
    //             },
    //             grid: {
    //                 borderColor: '#f3f3f3',
    //                 borderWidth: 1,
    //                 tickColor: '#f3f3f3'
    //             },
    //             lines: {
    //                 fill: true
    //             },
    //             yaxis: {
    //                 min: 0,
    //                 max: 100
    //             },
    //             xaxis: {
    //                 min: 0,
    //                 max: 100
    //             }
    //         });
    //
    //         function updateRealTime() {
    //             plot.setData([getRandomData()]);
    //             plot.draw();
    //
    //             let timeout;
    //             if (realtime === 'on') {
    //                 timeout = setTimeout(updateRealTime, 320);
    //             } else {
    //                 clearTimeout(timeout);
    //             }
    //         }
    //
    //         updateRealTime();
    //
    //         $('#realtime').on('change', function () {
    //             realtime = (this as any).checked ? 'on' : 'off';
    //             updateRealTime();
    //         });
    //         // ====================================================================================================
    //     }
    //
    //     function initSparkline() {
    //         $('.sparkline').each(function () {
    //             const $this = $(this);
    //             $this.sparkline('html', $this.data());
    //         });
    //     }
    //
    //     function initDonutChart() {
    //         ((window as any).Morris).Donut({
    //             element: 'donut_chart',
    //             data: [{
    //                     label: 'Chrome',
    //                     value: 37
    //                 }, {
    //                     label: 'Firefox',
    //                     value: 30
    //                 }, {
    //                     label: 'Safari',
    //                     value: 18
    //                 }, {
    //                     label: 'Opera',
    //                     value: 12
    //                 },
    //                 {
    //                     label: 'Other',
    //                     value: 3
    //                 }],
    //             colors: ['rgb(233, 30, 99)', 'rgb(0, 188, 212)', 'rgb(255, 152, 0)', 'rgb(0, 150, 136)', 'rgb(96, 125, 139)'],
    //             formatter: function (y) {
    //                 return y + '%';
    //             }
    //         });
    //     }
    //
    //     let data = [];
    //     const totalPoints = 110;
    //
    //     function getRandomData() {
    //         if (data.length > 0) { data = data.slice(1); }
    //
    //         while (data.length < totalPoints) {
    //             const prev = data.length > 0 ? data[data.length - 1] : 50;
    //             let y = prev + Math.random() * 10 - 5;
    //             if (y < 0) { y = 0; } else if (y > 100) { y = 100; }
    //
    //             data.push(y);
    //         }
    //
    //         const res = [];
    //         for (let i = 0; i < data.length; ++i) {
    //             res.push([i, data[i]]);
    //         }
    //
    //         return res;
    //     }
    // }
}
