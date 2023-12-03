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

// Bootstrap imports:
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormlyFieldFile } from './formly-helpers/types/file-type.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    FormlyFieldFile,
  ],
  imports: [
    // Module imports:
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    FormlyModule.forRoot({
      types: [{ name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] }],
    }),
    FormlyBootstrapModule,

    // Bootstrap imports:
    NgbDropdownModule,
  ],
  exports: [
    // Modules: 
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    // Shared Components:
    NavbarComponent,
    SidenavComponent,
    FormlyFieldFile,
    // Bootstrap exports:
    NgbDropdownModule,
  ]
})
export class SharedModule { }
