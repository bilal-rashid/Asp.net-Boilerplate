import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AbpModule } from '@abp/abp.module';

import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { SharedModule } from '@shared/shared.module';

import { HomeComponent } from '@app/home/home.component';
import { AboutComponent } from '@app/about/about.component';
import { TopBarComponent } from '@app/layout/topbar.component';
import { TopBarLanguageSwitchComponent } from '@app/layout/topbar-languageswitch.component';
import { SideBarUserAreaComponent } from '@app/layout/sidebar-user-area.component';
import { SideBarNavComponent } from '@app/layout/sidebar-nav.component';
import { SideBarFooterComponent } from '@app/layout/sidebar-footer.component';
import { RightSideBarComponent } from '@app/layout/right-sidebar.component';
// tenants
import { TenantsComponent } from '@app/tenants/tenants.component';
import { CreateTenantDialogComponent } from './tenants/create-tenant/create-tenant-dialog.component';
import { EditTenantDialogComponent } from './tenants/edit-tenant/edit-tenant-dialog.component';
// roles
import { RolesComponent } from '@app/roles/roles.component';
import { CreateRoleDialogComponent } from './roles/create-role/create-role-dialog.component';
import { EditRoleDialogComponent } from './roles/edit-role/edit-role-dialog.component';
// users
import { UsersComponent } from '@app/users/users.component';
import { CreateUserDialogComponent } from '@app/users/create-user/create-user-dialog.component';
import { EditUserDialogComponent } from '@app/users/edit-user/edit-user-dialog.component';
import { ChangePasswordComponent } from './users/change-password/change-password.component';
import { ResetPasswordDialogComponent } from './users/reset-password/reset-password.component';
import { ProductComponent } from './product/product.component';
import { CreateProductDialogComponent } from './product/create-product-dialog/create-product-dialog.component';
import { EditProductDialogComponent } from './product/edit-product-dialog/edit-product-dialog.component';
import { CustomerComponent } from './customer/customer.component';
import { CreateCustomerDialogComponent } from './customer/create-customer-dialog/create-customer-dialog.component';
import { EditCustomerDialogComponent } from './customer/edit-customer-dialog/edit-customer-dialog.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { AllOrdersComponent } from './all-orders/all-orders.component';
import {CustomerBillDialogComponent} from '@app/all-orders/customer-bill/customer-bill-dialog.component';
import { DairyRouteComponent } from './dairy-route/dairy-route.component';
import { CreateRouteComponent } from './dairy-route/create-route/create-route.component';
import { UpdateRouteComponent } from './dairy-route/update-route/update-route.component';
import { SelectRouteComponent } from './select-route/select-route.component';
import {BillCustomerComponent, BillDialog} from './bill-customer/bill-customer.component';
import { CustomerBillDataComponent } from './customer-bill-data/customer-bill-data.component';
import { SampleLogComponent } from './sample-log/sample-log.component';
import { AllSamplesComponent } from './all-samples/all-samples.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    TopBarComponent,
    TopBarLanguageSwitchComponent,
    SideBarUserAreaComponent,
    SideBarNavComponent,
    SideBarFooterComponent,
    RightSideBarComponent,
    // tenants
    TenantsComponent,
    CreateTenantDialogComponent,
    EditTenantDialogComponent,
    // roles
    RolesComponent,
    CreateRoleDialogComponent,
    EditRoleDialogComponent,
    // users
    UsersComponent,
    CreateUserDialogComponent,
    EditUserDialogComponent,
    ChangePasswordComponent,
    ResetPasswordDialogComponent,
    ProductComponent,
    CreateProductDialogComponent,
    EditProductDialogComponent,
    CustomerComponent,
    CreateCustomerDialogComponent,
    EditCustomerDialogComponent,
    CustomerBillDialogComponent,
    CreateOrderComponent,
    AllOrdersComponent,
    DairyRouteComponent,
    CreateRouteComponent,
    UpdateRouteComponent,
    SelectRouteComponent,
    BillCustomerComponent,
      BillDialog,
      CustomerBillDataComponent,
      SampleLogComponent,
      AllSamplesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ModalModule.forRoot(),
    AbpModule,
    AppRoutingModule,
    ServiceProxyModule,
    SharedModule,
    NgxPaginationModule
  ],
  providers: [],
  entryComponents: [
    // tenants
    CreateTenantDialogComponent,
    EditTenantDialogComponent,
    // roles
    CreateRoleDialogComponent,
    EditRoleDialogComponent,
    // products
    CreateProductDialogComponent,
    EditProductDialogComponent,
    // customers
    CreateCustomerDialogComponent,
    EditCustomerDialogComponent,
    // bill
    CustomerBillDialogComponent,
    // users
    CreateUserDialogComponent,
    EditUserDialogComponent,
    ResetPasswordDialogComponent,
      BillDialog
  ]
})
export class AppModule {}
