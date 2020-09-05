import { Component } from '@angular/core';
import {AngularFireDatabase} from '@node_modules/@angular/fire/database';
@Component({
    selector: 'app-root',
    styles: [
        `
            body { text-align: center; padding: 150px; }
            h1 { font-size: 50px; }
            body { font: 20px Helvetica, sans-serif; color: #333; }
            article { display: block; text-align: left; width: 650px; margin: 0 auto; }
            a { color: #dc8100; text-decoration: none; }
            a:hover { color: #333; text-decoration: none; }
        `
    ],
    template: `<router-outlet *ngIf="!maintenance"></router-outlet>
    <div style="margin: 20px" *ngIf="maintenance">
        <img src="assets/images/maintenanceLogo.png" width="100" height="100" alt="User" />
        <h1 style="color: #374957">We&rsquo;ll be back soon!</h1>
        <div>
            <p>{{message}}</p>
            <p>&mdash; The Team</p>
        </div>
    </div>
    `
})
export class RootComponent {
    maintenance = false;
    message = '';
    constructor(
        private firestore: AngularFireDatabase
    ) {
        this.firestore.object('/asad').valueChanges().subscribe(data => {
            this.maintenance = data['maintenance'];
            this.message = data['message'];
        });
    }

}
