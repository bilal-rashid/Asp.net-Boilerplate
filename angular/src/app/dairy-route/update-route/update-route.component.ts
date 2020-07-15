import { Component, OnInit } from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {AppComponentBase} from '@shared/app-component-base';
import {ThemePalette} from '@node_modules/@angular/material';
import {
    CustomerDto,
    CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    RouteDto,
    RouteServiceProxy
} from '@shared/service-proxies/service-proxies';
import {Injector} from '@node_modules/@angular/core';
import {ActivatedRoute, Router} from '@node_modules/@angular/router';
import {finalize} from '@node_modules/rxjs/operators';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@node_modules/@angular/cdk/drag-drop';

@Component({
    animations: [appModuleAnimation()],
  selector: 'app-update-route',
  templateUrl: './update-route.component.html',
  styleUrls: ['./update-route.component.css']
})
export class UpdateRouteComponent extends AppComponentBase implements OnInit {

    color: ThemePalette = 'primary';
    customers: CustomerDto[] = [];
    routeObj: RouteDto = new RouteDto();
    routeId: any;
    saving = false;
    loading = false;
    done = [];
    idArray = [];
    constructor(
        injector: Injector,
        private _router: Router,
        private route: ActivatedRoute,
        private _customerService: CustomerServiceProxy,
        private _routeService: RouteServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.route
            .queryParams
            .subscribe(params => {
                // Defaults to 0 if no query param provided.
                if (params.routeId) {
                    this.routeId = parseInt(params.routeId, 10);
                    this.loading = true;
                    this._customerService
                        .getAll('', undefined, 0, 5000)
                        .pipe(
                            finalize(() => {
                                this.getRoute();
                            })
                        )
                        .subscribe((result: CustomerDtoPagedResultDto) => {
                            this.customers = result.items;
                        });
                }
            });
    }
    getRoute() {
        this._routeService
            .get(this.routeId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe((result: RouteDto) => {
                this.routeObj.init(result);
                this.idArray = [... JSON.parse(result.customers)];
                this.idArray.forEach(id=>{
                    this.done.push(this.customers.find(p=>p.id===id));
                });
                this.idArray.forEach(id => {
                    this.customers.splice(this.customers.indexOf(this.customers.find(p=>p.id===id)),
                        1);
                });
            });
    }
    drop(event: CdkDragDrop<CustomerDto[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }
    save() {
        this.routeObj.customers = JSON.stringify(this.done.map(value => value.id));
        this.saving = true;
        this._routeService
            .update(this.routeObj)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this._router.navigate(['app/routes']);
            });
    }

}
