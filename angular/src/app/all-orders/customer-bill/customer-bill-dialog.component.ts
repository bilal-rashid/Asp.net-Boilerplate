import { Component, OnInit } from '@angular/core';
import {AppComponentBase} from '@shared/app-component-base';
import {ElementRef, Inject, Injector, Optional, ViewChild} from '@node_modules/@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@node_modules/@angular/material';
import * as jsPDF from 'jspdf';
import html2canvas from '@node_modules/html2canvas';
@Component({
    templateUrl: './customer-bill-dialog.component.html',
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
export class CustomerBillDialogComponent extends AppComponentBase
    implements OnInit {
    startDate: Date;
    endDate: Date;
    customerName: string;

    @ViewChild('content', {static: true}) content: ElementRef;

    Data = [];
    totalBill = 0;
    constructor(
        injector: Injector,
        private _dialogRef: MatDialogRef<CustomerBillDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) private _orders: any
    ) {
        super(injector);
    }
    //lineItems: Array(1)
    // 0:
    // description: null
    // id: 4
    // name: "Goat Milk"
    // price: 300
    // quantity: 2
    // unit: "litre"
    ngOnInit(): void {
        console.log(this._orders);
        this.startDate = this._orders.startDate;
        this.endDate = this._orders.endDate;
        this.customerName = this._orders.orders[0].order.customerName;
        this._orders.orders.forEach(order => {
            order.lineItems.forEach(lineItem => {
                this.Data.push({
                    date: order.order.creationTime,
                    product: lineItem.name,
                    totalPrice: lineItem.price,
                    rate: lineItem.price/lineItem.quantity,
                    unit: lineItem.unit,
                    quantity: lineItem.quantity
                });
                this.totalBill = this.totalBill + lineItem.price;
            });
        });
        console.log('Data',this.Data);
    }

    close(result: any): void {
        this._dialogRef.close(result);
    }
    public SavePDF(): void {
        const content = this.content.nativeElement;
        const doc = new jsPDF();
        const _elementHandlers = {
            '#editor': function(element, renderer) {
                return true;
            }
        };
        doc.fromHTML(content.innerHTML, 10, 10, {

            'width': 290,
            'elementHandlers': _elementHandlers
        });

        doc.save('test.pdf');
    }
    generarPDF() {

        const options = {
            background: 'white',
            scale: 3
        };
        var currentPosition = document.getElementById("content").scrollTop;
        document.getElementById("content").style.height="auto";
        html2canvas(document.getElementById("content"), options).then((canvas) => {

            var img = canvas.toDataURL("image/PNG");
            var doc = new jsPDF('p', 'mm', 'a4', 1);

            // Add image Canvas to PDF
            const bufferX = 5;
            const bufferY = 5;
            const imgProps = (<any>doc).getImageProperties(img);
            const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');

            return doc;
        }).then((doc) => {
            doc.save('postres.pdf');
            document.getElementById("content").style.height = '600px';
        });
    }
}
