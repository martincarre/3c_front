// Module imports:
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// Shared Components:
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';
import { ToastsContainer } from './components/toast/toast-container.component';

// Bootstrap imports:
import { NgbDropdownModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    ToastGlobalComponent,
    ToastsContainer,
  ],
  imports: [
    // Module imports:
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,

    // Bootstrap imports:
    NgbDropdownModule,
    NgbToastModule,
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
