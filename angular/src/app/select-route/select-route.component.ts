import { Component, OnInit } from '@angular/core';
import {AppComponentBase} from '@shared/app-component-base';
import {AfterViewInit, Injector} from '@node_modules/@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CreateOrEditRouteDataDto,
    ProductServiceProxy, RouteDataDto,
    RouteDataServiceProxy,
    RouteDto, RouteDtoPagedResultDto, RouteServiceProxy
} from '@shared/service-proxies/service-proxies';
import {MatDialog} from '@node_modules/@angular/material';
import {AbpSessionService} from '@abp/session/abp-session.service';
import {Router} from '@node_modules/@angular/router';
import {finalize} from '@node_modules/rxjs/operators';

@Component({
    animations: [appModuleAnimation()],
  selector: 'app-select-route',
  templateUrl: './select-route.component.html',
  styleUrls: ['./select-route.component.css']
})
export class SelectRouteComponent extends AppComponentBase implements AfterViewInit {

    routesList: RouteDto[] = [];
    routeId: any;
    constructor(
        injector: Injector,
        private _productsService: ProductServiceProxy,
        private _routeDataService: RouteDataServiceProxy,
        private _dialog: MatDialog,
        private _routeService: RouteServiceProxy,
        private _sessionService: AbpSessionService,
        private _router: Router,
    ) {
        super(injector);
    }
    ngAfterViewInit(): void {
        this._routeService
            .getAll('', undefined, 0, 2000)
            .pipe(
                finalize(() => {
                    // finishedCallback();
                })
            )
            .subscribe((result: RouteDtoPagedResultDto) => {
                this.routesList = result.items;
            });
    }

    selectRoute() {
        let routeData = new CreateOrEditRouteDataDto();
        routeData.id = null;
        routeData.name = this.routesList.filter(p=>p.id===this.routeId)[0].name;
        routeData.userId = this._sessionService.userId;
        routeData.pendingCustomers = this.routesList.filter(p=>p.id===this.routeId)[0].customers;
        this._routeDataService
            .createOrEdit(routeData)
            .subscribe(result => {
                this._router.navigate(['app/home']);
            });
    }
    billCustomers() {
        this._router.navigate(['app/bill-customers']);
    }
    logSample() {
        this._router.navigate(['app/sample']);
    }
}
