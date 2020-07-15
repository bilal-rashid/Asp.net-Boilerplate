import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRouteGuard } from '@shared/auth/auth-route-guard';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { UsersComponent } from './users/users.component';
import { TenantsComponent } from './tenants/tenants.component';
import { RolesComponent } from 'app/roles/roles.component';
import { ChangePasswordComponent } from './users/change-password/change-password.component';
import {ProductComponent} from '@app/product/product.component';
import {CustomerComponent} from '@app/customer/customer.component';
import {CreateOrderComponent} from '@app/create-order/create-order.component';
import {AllOrdersComponent} from '@app/all-orders/all-orders.component';
import {DairyRouteComponent} from '@app/dairy-route/dairy-route.component';
import {CreateRouteComponent} from '@app/dairy-route/create-route/create-route.component';
import {UpdateRouteComponent} from '@app/dairy-route/update-route/update-route.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AppComponent,
                children: [
                    { path: 'home', component: HomeComponent,  canActivate: [AppRouteGuard] },
                    { path: 'users', component: UsersComponent, data: { permission: 'Pages.Users' }, canActivate: [AppRouteGuard] },
                    { path: 'roles', component: RolesComponent, data: { permission: 'Pages.Roles' }, canActivate: [AppRouteGuard] },
                    { path: 'products', component: ProductComponent, data: { permission: 'Pages.Products' }, canActivate: [AppRouteGuard] },
                    { path: 'order', component: CreateOrderComponent, data: { permission: 'Pages.Orders' }, canActivate: [AppRouteGuard] },
                    { path: 'orders', component: AllOrdersComponent, data: { permission: 'Pages.Orders' }, canActivate: [AppRouteGuard] },
                    { path: 'customers', component: CustomerComponent, data: { permission: 'Pages.Customers' },
                        canActivate: [AppRouteGuard]},
                    { path: 'routes', component: DairyRouteComponent, data: { permission: 'Pages.Routes' },
                        canActivate: [AppRouteGuard]},
                    { path: 'routes/create', component: CreateRouteComponent, data: { permission: 'Pages.Routes' },
                        canActivate: [AppRouteGuard]},
                    { path: 'routes/update', component: UpdateRouteComponent, data: { permission: 'Pages.Routes' },
                        canActivate: [AppRouteGuard]},
                    { path: 'tenants', component: TenantsComponent, data: { permission: 'Pages.Tenants' }, canActivate: [AppRouteGuard] },
                    { path: 'about', component: AboutComponent },
                    { path: 'update-password', component: ChangePasswordComponent }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
