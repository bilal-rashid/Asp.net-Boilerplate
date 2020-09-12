import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
    templateUrl: './topbar.component.html',
    selector: 'top-bar',
    encapsulation: ViewEncapsulation.None
})
export class TopBarComponent extends AppComponentBase {

    isAdmin: boolean;
    constructor(
        injector: Injector
    ) {
        super(injector);
        this.isAdmin = this.permission.isGranted('Pages.Customers.Bills');
    }
}
