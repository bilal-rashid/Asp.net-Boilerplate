import { Component } from '@angular/core';
import {PagedListingComponentBase, PagedRequestDto} from '@shared/paged-listing-component-base';
import {
    RouteDto,
    RouteDtoPagedResultDto,
    RouteServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {Router} from '@node_modules/@angular/router';
import {MatDialog} from '@node_modules/@angular/material';
import {finalize} from '@node_modules/rxjs/operators';
import {appModuleAnimation} from '@shared/animations/routerTransition';
class GetRoutesRequestDto extends PagedRequestDto {
    keyword: string;
    sorting: string;
}
@Component({
    animations: [appModuleAnimation()],
  selector: 'app-dairy-route',
  templateUrl: './dairy-route.component.html',
  styleUrls: ['./dairy-route.component.css']
})
export class DairyRouteComponent extends PagedListingComponentBase<RouteDto> {
    routes: RouteDto[] = [];

    keyword = '';

    constructor(
        injector: Injector,
        private _routeService: RouteServiceProxy,
        private _router: Router,
        private _dialog: MatDialog
    ) {
        super(injector);
    }
    list(
        request: GetRoutesRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;

        this._routeService
            .getAll(request.keyword, request.sorting, request.skipCount, request.maxResultCount)
            .pipe(
                finalize(() => {
                    finishedCallback();
                })
            )
            .subscribe((result: RouteDtoPagedResultDto) => {
                this.routes = result.items;
                this.showPaging(result, pageNumber);
            });
    }
    delete(route: RouteDto): void {
        abp.message.confirm(
            this.l('DeleteWarningMessage', route.name),
            undefined,
            (result: boolean) => {
                if (result) {
                    this._routeService
                        .delete(route.id)
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
    // createCustomer(): void {
    //     this.showCreateOrEditRoleDialog();
    // }
    //
    // editCustomer(role: CustomerDto): void {
    //     this.showCreateOrEditRoleDialog(role.id);
    // }
    // goToOrders(id) {
    //     this._router.navigate(['app/orders'], { queryParams: { customer: id } });
    // }
    createRoute() {
        this._router.navigate(['app/routes/create']);
    }
    updareRoute(id) {
        this._router.navigate(['app/routes/update'], { queryParams: { routeId: id } });
    }
}
