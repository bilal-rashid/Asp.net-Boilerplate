import {Component, OnInit} from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CustomerDto, CustomerDtoPagedResultDto, CustomerServiceProxy,
    GetOrderForViewDto, GetOrderForViewDtoPagedResultDto, IProductDto,
    OrderServiceProxy, UserDto, UserDtoPagedResultDto, UserServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {MatDialog, ThemePalette} from '@node_modules/@angular/material';
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
// export enum OrderType {
//     Normal = 1,
//     Sample = 2,
//     Waste = 3,
//     Charity = 4,
//     Cash_Sale = 5,
// }
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
    marketing: string;
    footer: string;
    loading = false;

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
        this.marketing = this.setting.get('App.Tenant.Marketing');
        this.footer = this.setting.get('App.Tenant.Footer');
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
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined,undefined, request.sorting, request.skipCount, request.maxResultCount)
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
        this.loading = true;
        this.Data = [];
        this._customerService.get(this.customerId).subscribe((customerResult: CustomerDto) => {
            this._orderService.getCustomerBill(this.customerId).subscribe((resultTotal: number) => {
                this._orderService
                    .getAll(this.customerId, this.userId, (this.startDate) ? moment(this.startDate).startOf('day').utc(true) : undefined,
                        (this.startDate) ? moment(this.endDate).endOf('day').utc(true) : undefined,undefined, undefined, 0, 5000)
                    .pipe(
                        finalize(() => {
                        })
                    )
                    .subscribe((result: GetOrderForViewDtoPagedResultDto) => {
                        const orders = result.items;
                        this.loading = false;
                        orders.forEach(o => {
                            o['lineItems'] = JSON.parse(o.order.orderItems);
                        });
                        if (result.items.length === 0) {
                            this.notify.info('No orders in selected period');
                        } else {
                            this.showBillDialog(orders, resultTotal, customerResult);
                        }
                    });
            });
        });
    }
    showBillDialog(orders: GetOrderForViewDto[], totalBill:number,customerResult: CustomerDto): void {
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
        this.generatePdf('download', totalBill, customerResult);
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
    getSvgIcon(): string {
        return '<svg version="1.0" xmlns="http://www.w3.org/2000/svg"\n' +
            ' width="1702.000000pt" height="1269.000000pt" viewBox="0 0 1702.000000 1269.000000"\n' +
            ' preserveAspectRatio="xMidYMid meet">\n' +
            '<metadata>\n' +
            'Created by potrace 1.16, written by Peter Selinger 2001-2019\n' +
            '</metadata>\n' +
            '<g transform="translate(0.000000,1269.000000) scale(0.100000,-0.100000)"\n' +
            'fill="#373435" stroke="none">\n' +
            '<path d="M5778 10618 c-220 -20 -436 -166 -541 -367 l-49 -92 59 -62 c32 -35\n' +
            '130 -145 218 -246 146 -166 161 -186 167 -229 8 -60 10 -746 2 -833 l-7 -66\n' +
            '-337 -168 -337 -168 -89 55 c-186 115 -271 166 -290 172 -16 5 -22 -2 -35 -37\n' +
            '-9 -23 -57 -139 -106 -257 -50 -118 -183 -438 -296 -711 l-206 -496 -188 -185\n' +
            'c-103 -102 -203 -198 -221 -213 l-34 -28 -284 77 c-157 43 -288 76 -290 73 -3\n' +
            '-3 30 -108 73 -233 l78 -228 124 -47 c68 -26 132 -56 142 -66 9 -10 44 -106\n' +
            '78 -213 33 -107 166 -530 296 -940 130 -410 238 -755 241 -767 l6 -23 -871 0\n' +
            '-871 0 0 -205 0 -205 6340 0 6340 0 0 205 0 205 -832 0 -833 0 -52 228 c-52\n' +
            '225 -317 1369 -458 1972 -40 173 -85 359 -99 414 -14 54 -26 123 -26 153 0 30\n' +
            '27 248 60 486 33 238 116 839 185 1337 69 498 128 925 132 950 5 41 1 51 -38\n' +
            '110 -58 88 -254 281 -362 357 -106 75 -296 173 -399 207 -240 78 -378 89\n' +
            '-1049 80 l-535 -7 308 -800 c169 -439 308 -803 308 -808 0 -5 -169 -9 -396 -9\n' +
            'l-397 0 -34 37 c-37 39 -156 182 -536 647 -132 160 -323 392 -425 515 -103\n' +
            '124 -217 261 -253 305 -37 45 -79 92 -94 106 l-27 25 -1591 0 c-876 0 -1626\n' +
            '-3 -1669 -7z m2997 -2263 l294 -760 -241 -3 c-239 -2 -242 -2 -266 20 -26 24\n' +
            '-40 41 -442 533 -139 171 -321 391 -405 490 -129 154 -357 432 -388 473 -8 10\n' +
            '106 12 573 10 l582 -3 293 -760z m2203 -1832 c331 -335 607 -616 612 -625 6\n' +
            '-10 10 -302 10 -791 l0 -774 -232 -6 c-128 -4 -545 -7 -925 -7 l-693 0 0 430\n' +
            '0 430 -290 0 -290 0 0 -430 0 -430 -1155 0 -1155 0 0 790 0 790 1198 0 1197 0\n' +
            '446 498 c246 273 493 550 549 615 56 64 107 117 114 117 6 0 282 -273 614\n' +
            '-607z m389 355 c-4 -128 -7 -303 -7 -388 l0 -155 -200 200 -200 200 0 187 0\n' +
            '188 207 0 206 0 -6 -232z m-6255 -189 c223 -65 285 -86 276 -94 -3 -3 -666\n' +
            '-348 -679 -353 -7 -3 -193 347 -187 353 1 1 35 19 73 38 39 19 106 56 150 81\n' +
            '44 25 90 46 102 46 13 0 132 -32 265 -71z m832 -276 c26 -115 143 -631 259\n' +
            '-1148 l213 -940 -423 -3 c-233 -1 -614 -1 -847 0 l-425 3 60 110 c33 61 85\n' +
            '155 116 210 49 89 230 417 410 745 l63 115 0 375 0 375 147 105 c219 156 367\n' +
            '259 374 260 3 0 27 -93 53 -207z m-1901 -466 c38 -61 39 -63 33 -137 -4 -41\n' +
            '-10 -88 -14 -103 -7 -27 -9 -26 -55 51 -51 86 -55 115 -40 241 7 63 3 66 76\n' +
            '-52z m8655 -1219 l149 -408 -402 0 -402 0 149 483 c82 265 165 534 184 597\n' +
            'l36 115 68 -190 c38 -105 135 -373 218 -597z"/>\n' +
            '<path d="M7800 5175 l0 -235 230 0 230 0 0 235 0 235 -230 0 -230 0 0 -235z"/>\n' +
            '<path d="M10570 5176 l0 -234 27 -7 c15 -3 119 -3 230 1 l203 7 0 233 0 234\n' +
            '-230 0 -230 0 0 -234z"/>\n' +
            '<path d="M13145 7698 c-7 -24 -63 -206 -138 -445 l-45 -142 92 -290 c80 -254\n' +
            '108 -327 118 -310 2 2 24 65 50 139 25 74 71 205 102 290 31 85 56 165 56 177\n' +
            '0 12 -45 147 -100 300 -56 153 -103 284 -105 291 -7 19 -23 14 -30 -10z"/>\n' +
            '<path d="M14341 3425 c-142 -31 -250 -108 -300 -215 -22 -46 -26 -69 -26 -145\n' +
            '0 -78 4 -97 28 -147 57 -116 142 -162 445 -243 170 -45 223 -68 267 -116 30\n' +
            '-34 35 -46 35 -90 0 -122 -92 -188 -272 -197 -155 -7 -291 29 -411 110 l-58\n' +
            '39 -36 -78 -35 -77 28 -24 c46 -37 136 -80 231 -108 77 -24 106 -27 238 -28\n' +
            '166 -1 222 10 328 66 70 38 121 92 155 166 34 75 35 194 3 267 -55 124 -140\n' +
            '173 -429 249 -236 62 -301 98 -323 178 -25 94 36 183 148 218 128 40 306 21\n' +
            '438 -45 38 -19 72 -32 76 -28 8 9 59 133 59 144 0 11 -60 44 -126 69 -132 49\n' +
            '-328 64 -463 35z"/>\n' +
            '<path d="M2250 2776 l0 -657 403 3 c383 3 405 5 467 26 174 58 261 183 247\n' +
            '354 -11 125 -68 217 -167 266 l-58 30 37 28 c86 64 126 160 119 282 -9 155\n' +
            '-94 247 -275 299 -47 13 -125 17 -415 20 l-358 5 0 -656z m649 484 c35 -6 80\n' +
            '-19 101 -30 134 -68 143 -251 17 -324 -66 -38 -132 -46 -362 -46 l-215 0 0\n' +
            '205 0 205 198 0 c108 0 226 -5 261 -10z m122 -578 c129 -43 187 -177 126 -293\n' +
            '-50 -94 -154 -119 -509 -119 l-198 0 0 216 0 215 273 -4 c172 -2 285 -8 308\n' +
            '-15z"/>\n' +
            '<path d="M3745 2785 c-159 -355 -292 -650 -293 -656 -3 -6 32 -9 98 -7 l103 3\n' +
            '67 155 67 155 343 0 343 0 67 -155 67 -155 106 -3 106 -3 -113 248 c-62 136\n' +
            '-195 431 -296 656 l-184 407 -96 0 -95 -1 -290 -644z m519 -183 c-74 -1 -194\n' +
            '-1 -268 0 l-134 3 114 260 c62 143 123 280 135 304 l21 45 133 -305 133 -304\n' +
            '-134 -3z"/>\n' +
            '<path d="M5000 2775 l0 -655 445 0 445 0 0 85 0 85 -350 0 -350 0 0 570 0 570\n' +
            '-95 0 -95 0 0 -655z"/>\n' +
            '<path d="M6481 3403 c-7 -15 -137 -302 -288 -638 -151 -335 -279 -618 -284\n' +
            '-627 -9 -17 -2 -18 94 -18 l104 0 69 160 69 160 341 0 341 0 69 -160 69 -160\n' +
            '102 0 c57 0 103 2 103 4 0 2 -132 296 -293 652 l-293 649 -95 3 -95 3 -13 -28z\n' +
            'm242 -498 c70 -160 127 -294 127 -298 0 -4 -120 -7 -266 -7 -228 0 -265 2\n' +
            '-261 14 42 109 262 595 267 589 3 -4 63 -139 133 -298z"/>\n' +
            '<path d="M7450 2775 l0 -655 100 0 100 0 0 655 0 655 -100 0 -100 0 0 -655z"/>\n' +
            '<path d="M8520 2775 l0 -655 100 0 100 0 0 260 0 260 325 0 325 0 0 85 0 85\n' +
            '-325 0 -325 0 0 225 0 225 365 0 365 0 0 85 0 85 -465 0 -465 0 0 -655z"/>\n' +
            '<path d="M10027 3423 c-5 -9 -551 -1218 -573 -1270 l-14 -33 102 0 103 0 69\n' +
            '160 69 160 341 0 341 -1 69 -159 68 -160 104 0 103 0 -18 43 c-18 42 -537\n' +
            '1187 -561 1240 -13 27 -15 27 -106 27 -51 0 -95 -3 -97 -7z m228 -508 c70\n' +
            '-159 129 -296 132 -302 4 -10 -52 -13 -261 -13 -146 0 -266 4 -266 8 0 5 52\n' +
            '127 116 273 64 145 122 279 130 298 8 19 16 32 18 30 2 -2 61 -134 131 -294z"/>\n' +
            '<path d="M10990 2776 l0 -656 95 0 95 0 0 195 0 195 201 -2 202 -3 135 -192\n' +
            '136 -193 109 0 109 0 -34 48 c-123 170 -270 384 -267 386 2 2 26 14 53 27 157\n' +
            '77 241 257 215 460 -11 93 -46 166 -108 232 -62 65 -124 101 -228 129 -70 19\n' +
            '-112 21 -395 26 l-318 4 0 -656z m568 474 c183 -21 279 -107 290 -261 9 -129\n' +
            '-45 -222 -160 -275 -63 -29 -64 -29 -285 -32 l-223 -4 0 291 0 291 148 0 c81\n' +
            '0 185 -4 230 -10z"/>\n' +
            '<path d="M12330 2775 l0 -655 95 0 95 0 2 457 3 457 228 -382 228 -383 47 3\n' +
            '47 3 225 379 225 379 3 -456 2 -457 95 0 95 0 0 655 0 655 -79 0 -79 0 -263\n' +
            '-450 c-144 -248 -266 -449 -270 -448 -5 2 -127 203 -272 448 l-263 445 -82 3\n' +
            '-82 3 0 -656z"/>\n' +
            '<path d="M5970 1548 c-29 -48 -76 -173 -95 -253 -36 -158 -37 -414 0 -570 17\n' +
            '-76 66 -206 95 -253 19 -30 23 -32 81 -32 33 0 59 3 57 8 -100 193 -138 349\n' +
            '-138 562 0 190 45 389 116 519 13 24 24 45 24 47 0 2 -27 4 -60 4 -57 0 -61\n' +
            '-2 -80 -32z"/>\n' +
            '<path d="M8240 1571 c0 -5 16 -42 35 -82 133 -284 135 -668 4 -948 -21 -46\n' +
            '-39 -88 -39 -92 0 -5 26 -9 59 -9 l59 0 35 73 c142 291 142 703 0 995 l-35 72\n' +
            '-59 0 c-33 0 -59 -4 -59 -9z"/>\n' +
            '<path d="M10720 1410 l0 -170 -45 34 c-101 77 -270 71 -382 -13 -34 -26 -58\n' +
            '-56 -82 -104 -31 -61 -35 -76 -35 -150 0 -113 22 -176 88 -242 62 -64 137 -95\n' +
            '229 -95 78 0 120 12 180 50 l47 30 0 -35 0 -35 60 0 60 0 0 450 0 450 -60 0\n' +
            '-60 0 0 -170z m-111 -220 c118 -60 148 -234 58 -337 -131 -149 -367 -54 -367\n' +
            '148 0 163 164 263 309 189z"/>\n' +
            '<path d="M6260 1105 l0 -425 65 0 65 0 0 124 0 124 163 4 c136 4 171 8 217 26\n' +
            '122 48 180 133 180 262 0 42 -7 96 -15 121 -31 91 -132 161 -258 180 -34 5\n' +
            '-142 9 -239 9 l-178 0 0 -425z m432 295 c44 -13 93 -52 113 -91 20 -38 19\n' +
            '-123 -2 -166 -34 -73 -125 -103 -315 -103 l-98 0 0 185 0 185 133 0 c72 0 149\n' +
            '-5 169 -10z"/>\n' +
            '<path d="M9060 1105 l0 -425 290 0 290 0 0 55 0 55 -225 0 -225 0 0 370 0 370\n' +
            '-65 0 -65 0 0 -425z"/>\n' +
            '<path d="M7820 1390 l0 -70 -55 0 -55 0 0 -50 0 -50 55 0 55 0 0 -182 c0 -101\n' +
            '5 -203 11 -227 21 -94 86 -140 197 -141 66 0 129 20 138 43 3 8 -2 31 -10 52\n' +
            '-14 32 -19 36 -38 30 -56 -18 -113 -17 -138 3 -25 20 -25 21 -28 221 l-3 201\n' +
            '90 0 91 0 0 50 0 50 -90 0 -90 0 0 70 0 70 -65 0 -65 0 0 -70z"/>\n' +
            '<path d="M9770 1390 l0 -70 -55 0 -55 0 0 -50 0 -50 55 0 55 0 0 -197 c1 -253\n' +
            '13 -292 105 -334 66 -31 204 -21 235 16 10 13 9 23 -5 56 -16 34 -22 39 -39\n' +
            '33 -12 -3 -42 -9 -68 -11 -40 -4 -51 -1 -73 21 l-25 25 0 196 0 195 90 0 90 0\n' +
            '0 50 0 50 -90 0 -90 0 0 70 0 70 -65 0 -65 0 0 -70z"/>\n' +
            '<path d="M7000 1317 c0 -2 62 -146 138 -318 l138 -314 68 0 67 0 110 250 c61\n' +
            '138 123 280 139 318 l29 67 -63 0 -63 0 -109 -249 c-78 -178 -111 -245 -117\n' +
            '-233 -4 9 -52 121 -106 247 l-98 230 -67 3 c-36 2 -66 1 -66 -1z"/>\n' +
            '<path d="M11030 820 c-27 -27 -35 -65 -20 -101 15 -36 37 -49 83 -49 47 0 77\n' +
            '34 77 86 0 29 -6 47 -23 62 -30 29 -89 30 -117 2z"/>\n' +
            '</g>\n' +
            '</svg>';
    }

    getTables(totalBill: number, customerResult: CustomerDto) {
        let array = [];
        array.push({
            svg: this.getSvgIcon(),
            height: 126,
            width: 170,
            alignment: 'center'
        });
        array.push({
            text: '100% Pure Milk',
            bold: false,
            fontSize: 12,
            alignment: 'center',
            margin: [0, 0, 0, 7]
        });
        array.push({
            text: customerResult.name,
            bold: true,
            fontSize: 14,
            alignment: 'center',
            margin: [0, 0, 0, 3]
        });
        array.push({
            text: customerResult.area,
            bold: false,
            fontSize: 13,
            alignment: 'center',
            margin: [0, 0, 0, 3]
        });
        let grandTotal = 0;
        let bodygrandTotal = [];
        let bodyPending = [];
        let bodyFooter = [];
        let bodyFooterContact = [];
        let bodyMarketing = [];
        Object.keys(this.GroupedData).forEach((key, index) => {
            let body = [];
            let totalQty = 0;
            let totalPrice = 0;
            body.push([{text: key, bold: true, style: 'filledHeaderProduct'},
                {text: '', bold: true},
                {text: '', bold: true}, {text: '', bold: true}]);
            body.push([{text: 'Date', bold: true, style: 'filledHeader'},
                {text: 'Quantity', bold: true, style: 'filledHeader'},
                {text: 'Rate', bold: true, style: 'filledHeader'}, {text: 'Total in Rs', bold: true, style: 'filledHeader'}]);
            this.GroupedData[key].forEach(data => {
                body.push([{text: new Date(data.date).toLocaleDateString(), style: 'filledRows'},
                    {text: data.quantity + ' ' + data.unit, style: 'filledRows'},
                    {text: data.rate, style: 'filledRows'},
                    {text: data.totalPrice, style: 'filledRows'}]);
                totalQty = totalQty + data.quantity;
                totalPrice = totalPrice + data.totalPrice;
                /// extra
            });
            grandTotal = grandTotal + totalPrice;
            body.push([{text: 'Total', style: 'totalRow'}, {text: totalQty.toString(), style: 'totalRow'}, {
                text: '',
                style: 'totalRow'
            }, {text: totalPrice.toString(), style: 'totalRow'}]);
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
                    widths: ['*', '*', '*', '*'],

                    body: body
                }
            });
        });
        let remainingLast = totalBill - grandTotal;
        bodyMarketing.push([{text: this.marketing, bold: false, style: 'styleMarketing'}]);
        bodyFooter.push([{text: 'If you require any further information, feel free to contact us.', bold: false, style: 'styleFooter'}]);
        bodyFooterContact.push([{text: this.footer, bold: false, style: 'styleFooter'}]);

        bodyPending.push([{text: 'Remaining Last Month', bold: true, style: 'stylePendingRight'},
            {text: '', bold: true, style: 'stylePendingCenter'},
            {text: '', bold: true, style: 'stylePendingCenter'},
            {text: (remainingLast).toString(), bold: true, style: 'stylePendingCenter'}]);

        bodygrandTotal.push([{text: 'Grand Total', bold: true, style: 'styleGrandTotalRight'},
            {text: '', bold: true, style: 'styleGrandTotalCenter'},
            {text: '', bold: true, style: 'styleGrandTotalCenter'},
            {text: (grandTotal + remainingLast).toString(), bold: true, style: 'styleGrandTotalCenter'}]);
        array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});

        array.push({
            layout: 'lightHorizontalLines', // optional
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 0,
                widths: [170, '*', '*', '*'],

                body: bodyPending
            }
        });
        array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});

        array.push({
            layout: 'lightHorizontalLines', // optional
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 0,
                widths: [170, '*', '*', '*'],

                body: bodygrandTotal
            }
        });
        array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});
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
        if (this.marketing && this.marketing.length > 2) {
            array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});
            array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});
            array.push({
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 0,
                    widths: ['*'],

                    body: bodyMarketing
                }
            });
        }
        array.push({text: 'wwwww', bold: true, fontSize: 16, color: 'white', alignment: 'center', margin: [20, 0, 0, 0]});
        array.push({
            layout: 'lightHorizontalLines', // optional
            table: {
                // headers are automatically repeated if the table spans over multiple pages
                // you can declare how many rows should be treated as headers
                headerRows: 0,
                widths: ['*'],

                body: bodyFooter
            }
        });
        if (this.footer && this.footer.length > 2) {
            array.push({
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 0,
                    widths: ['*'],

                    body: bodyFooterContact
                }
            });
        }
        return array;

    }
    generatePdf(action = 'download',  totalBill:number, customerResult: CustomerDto) {
        console.log(action);
        const documentDefinition = this.docDefinition(totalBill, customerResult);
        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }
    docDefinition(totalBill:number, customerResult: CustomerDto) {
        return {
            content: this.getTables(totalBill, customerResult),
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
                    alignment: 'right',
                },
                styleMarketing: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    fillColor: '#9fccf1',
                    alignment: 'center'
                },
                styleFooter: {
                    bold: false,
                    fontSize: 12,
                    color: 'black',
                    alignment: 'center'
                }
            }
        }
    }

}
