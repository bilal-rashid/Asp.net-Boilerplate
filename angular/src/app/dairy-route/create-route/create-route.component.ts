import { Component, OnInit } from '@angular/core';
import {appModuleAnimation} from '@shared/animations/routerTransition';
import {
    CustomerDto,
    CustomerDtoPagedResultDto,
    CustomerServiceProxy,
    RouteDto,
    RouteServiceProxy
} from '@shared/service-proxies/service-proxies';
import {finalize} from '@node_modules/rxjs/operators';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ThemePalette} from '@node_modules/@angular/material';
import {AppComponentBase} from '@shared/app-component-base';
import {Injector} from '@node_modules/@angular/core';
import {Router} from '@node_modules/@angular/router';

@Component({
    animations: [appModuleAnimation()],
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrls: ['./create-route.component.css']
})
export class CreateRouteComponent extends AppComponentBase implements OnInit {

    color: ThemePalette = 'primary';
    customers: CustomerDto[] = [];
    routeName = '';
    routeDescription = '';
    saving = false;
    done = [];
  constructor(
      injector: Injector,
      private _router: Router,
      private _customerService: CustomerServiceProxy,
      private _routeService: RouteServiceProxy,
  ) {
      super(injector);
  }
  ngOnInit() {
      this._customerService
          .getAll('', undefined, 0, 5000)
          .pipe(
              finalize(() => {
              })
          )
          .subscribe((result: CustomerDtoPagedResultDto) => {
              this.customers = result.items;
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
        console.log(this.done.map(value => value.id));
    }

    addRoute() {
      this.saving = true;
      const route = new RouteDto();
      route.name = this.routeName;
      route.description = this.routeDescription;
      route.customers = JSON.stringify(this.done.map(value => value.id));
        this._routeService
            .create(route)
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
