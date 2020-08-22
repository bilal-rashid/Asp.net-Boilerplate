import {Component, OnInit} from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CustomerDto, CustomerDtoPagedResultDto, CustomerServiceProxy,
    GetOrderForViewDto, GetOrderForViewDtoPagedResultDto, IProductDto,
    OrderServiceProxy, UserDto, UserDtoPagedResultDto, UserServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import * as moment from '@node_modules/moment';
import {ActivatedRoute} from '@node_modules/@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
class GetOrdersRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    animations: [appModuleAnimation()],
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent extends PagedListingComponentBase<GetOrderForViewDto> { // GetBillDataForView

    customers: CustomerDto[] = [];
    customerId: any;
    users: UserDto[] = [];
    userId: any;
    orders: GetOrderForViewDto[] = [];
    startDate: Date;
    endDate: Date;
    Data = [];
    GroupedData: any;

    keyword = '';

    constructor(
        injector: Injector,
        private _orderService: OrderServiceProxy,
        private _customerService: CustomerServiceProxy,
        private _userService: UserServiceProxy,
        private route: ActivatedRoute,
        private _dialog: MatDialog
    ) {
        super(injector);
        const date = new Date();
        this.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        this.endDate = new Date();
    }

    list(
        request: GetOrdersRequestDto,
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
                if (params.user) {
                    this.userId = parseInt(params.user, 10);
                }
                this._orderService
                    .getAll(this.customerId, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined,null, request.sorting, request.skipCount, request.maxResultCount)
                    .pipe(
                        finalize(() => {
                            finishedCallback();
                        })
                    )
                    .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                        this.orders = result.items;
                        console.log(this.orders);
                        this.orders.forEach(o => {
                            o['expanded'] = false;
                            o['lineItems'] = JSON.parse(o.order.orderItems);
                        });
                        console.log(this.orders);
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
        this._userService
            .getAll('', true, request.skipCount, 500)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: UserDtoPagedResultDto) => {
                this.users = result.items;
            });
    }
    public clearFilter(): void {
        this.customerId = undefined;
        this.userId = undefined;
        this.startDate = undefined;
        this.endDate = undefined;
    }
    getCustomerBill() {
        this._orderService.getCustomerBill(this.customerId).subscribe((resultTotal: number) => {
            this._orderService
                .getAll(this.customerId, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                    (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined,null, undefined, 0, 5000)
                .pipe(
                    finalize(() => {
                    })
                )
                .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                    const orders = result.items;
                    orders.forEach(o => {
                        o['lineItems'] = JSON.parse(o.order.orderItems);
                    });
                    if (result.items.length === 0) {
                        this.notify.info('No orders in selected period');
                    } else {
                        this.showBillDialog(orders, resultTotal);
                    }
                });
        });
    }
    showBillDialog(orders: GetOrderForViewDto[], totalBill:number): void {
        orders.forEach(order => {
            order['lineItems'].forEach(lineItem => {
                this.Data.push({
                    date: order.order.creationTime,
                    product: lineItem.name,
                    totalPrice: lineItem.price,
                    rate: lineItem.price/lineItem.quantity,
                    unit: lineItem.unit,
                    quantity: lineItem.quantity
                });
            });
        });
        this.GroupedData = this.groupBy(this.Data, 'product');
        this.generatePdf('open', totalBill);
        // let billDialog;
        // billDialog = this._dialog.open(CustomerBillDialogComponent, {
        //     data: {orders: orders,
        //     startDate: this.startDate,
        //     endDate: this.endDate}
        // });
    }
    delete(order: GetOrderForViewDto): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage'),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._orderService
                        .delete(order.order.id)
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

    groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    getTables(totalBill:number) {
        let array = [];
        array.push({
            text: 'BALAI FARMS',
            bold: true,
            color:'#00b0e4',
            fontSize: 20,
            alignment: 'center',
            margin: [0, 0, 0, 20]
        });
        array.push({
            text: '100% pure milk',
            bold: true,
            fontSize: 16,
            alignment: 'center',
            margin: [0, 0, 0, 20]
        });
        array.push({
            text: 'Ali Irfan G9/3',
            bold: true,
            fontSize: 16,
            alignment: 'center',
            margin: [0, 0, 0, 20]
        });
        let grandTotal = 0;
        let bodygrandTotal = [];
        let bodyPending = [];
        Object.keys(this.GroupedData).forEach((key,index) => {
            let body = [];
            let totalQty = 0;
            let totalPrice = 0;
            body.push([ { text: key, bold: true, style: 'filledHeaderProduct'},
                { text: '', bold: true},
                { text: '', bold: true},{ text: '', bold: true} ]);
            body.push([ { text: 'Date', bold: true, style: 'filledHeader'},
                { text: 'Quantity', bold: true, style: 'filledHeader'},
                { text: 'Rate', bold: true, style: 'filledHeader'},{ text: 'Total in Rs', bold: true, style: 'filledHeader'} ]);
            this.GroupedData[key].forEach(data => {
                body.push([ {text: new Date(data.date).toLocaleDateString(), style: 'filledRows'},
                    {text: data.quantity + ' ' + data.unit, style: 'filledRows'},
                    {text: data.rate, style: 'filledRows'},
                    {text: data.totalPrice, style: 'filledRows'} ]);
                totalQty = totalQty + data.quantity;
                totalPrice = totalPrice + data.totalPrice;
                /// extra
            });
            grandTotal = grandTotal + totalPrice;
            body.push([ {text: 'Total', style: 'totalRow'}, {text: totalQty.toString(), style: 'totalRow'}, {text: '', style: 'totalRow'}, {text: totalPrice.toString(), style: 'totalRow'} ]);
            if (index !== Object.keys(this.GroupedData).length - 1) {
                body.push([{text: '21', style: 'hiddenRow'}, {text: '22', style: 'hiddenRow'}, {
                    text: '34',
                    style: 'hiddenRow'
                }, {text: '44', style: 'hiddenRow'}]);
            }
            array.push({
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 2,
                    widths: [ '*', '*', '*', '*' ],

                    body: body
                }
            });
        });
        let remainingLast = totalBill - grandTotal;

        bodyPending.push([ { text: '', bold: true, style: 'stylePendingCenter'},
            { text: '', bold: true, style: 'stylePendingCenter'},
            { text: 'Remaining Last Month', bold: true, style: 'stylePendingRight'},
            { text: (remainingLast).toString(), bold: true, style: 'stylePendingCenter'} ]);

        bodygrandTotal.push([ { text: '', bold: true, style: 'styleGrandTotalCenter'},
            { text: '', bold: true, style: 'styleGrandTotalCenter'},
            { text: 'Grand Total', bold: true, style: 'styleGrandTotalRight'},
            { text: (grandTotal + remainingLast).toString(), bold: true, style: 'styleGrandTotalCenter'} ]);
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});

        array.push({
            layout: 'lightHorizontalLines', // optional
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 0,
                widths: [ '*', '*', 200, '*' ],

                body: bodyPending
            }
        });
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});

        array.push({
            layout: 'lightHorizontalLines', // optional
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 0,
                widths: [ '*', '*', 200, '*' ],

                body: bodygrandTotal
            }
        });
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({text: 'wwwww', bold: true, fontSize: 16, color:'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({
            text: '__________                                                          ____________',
            bold: true,
            fontSize: 16,
            alignment: 'center',
            margin: [0, 0, 0, 0]
        });
        array.push({
            text: 'Date                                                                                           Received',
            bold: false,
            fontSize: 12,
            alignment: 'center',
            margin: [0, 0, 0, 0]
        });
        return array;

    }
    generatePdf(action = 'open',  totalBill:number) {
        const documentDefinition = this.docDefinition(totalBill);
        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }
    docDefinition(totalBill:number) {
        return {
            content: this.getTables(totalBill),
            styles: {
                filledHeader: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#00b0e4',
                    alignment: 'center'
                },
                filledHeaderProduct: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#97dcc2',
                    alignment: 'center'
                },
                filledRows: {
                    bold: false,
                    fontSize: 10,
                    color: 'black',
                    fillColor: '#e9e9ea',
                    alignment: 'center'
                },
                hiddenRow: {
                    bold: false,
                    fontSize: 20,
                    color: 'white',
                    fillColor: 'white',
                    alignment: 'center'
                },
                totalRow: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#00b0e4',
                    alignment: 'center'
                },
                styleGrandTotalCenter: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#fac3cb',
                    alignment: 'center'
                },
                styleGrandTotalRight: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#fac3cb',
                    alignment: 'right'
                },
                stylePendingCenter: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#efb773',
                    alignment: 'center'
                },
                stylePendingRight: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#efb773',
                    alignment: 'right'
                }
            }
        }
    }

}
