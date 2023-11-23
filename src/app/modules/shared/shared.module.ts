// Module imports:
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// Shared Components:
import { NavbarComponent } from './components/navbar/navbar.component';

// Bootstrap imports:
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';



@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    ToastGlobalComponent
  ],
  imports: [
    // Module imports:
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,

    // Bootstrap imports:
    NgbDropdownModule
  ],
  exports: [
    // Modules: 
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    // Shared Components:
    NavbarComponent,
    SidenavComponent,
    // Bootstrap exports:
    NgbDropdownModule,
  ]
})
export class SharedModule { }
