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
import { FormlyFieldButton } from './formly-helpers/types/button-type.component';
import { ObjectTypeComponent } from './formly-helpers/types/object-type.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    FormlyFieldFile,
    ObjectTypeComponent,
    FormlyFieldButton,
  ],
  imports: [
    // Module imports:
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    FormlyModule.forRoot({
      types: [
        { name: 'object', component: ObjectTypeComponent },
        { name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] },
        { name: 'button', component: FormlyFieldButton, wrappers: ['form-field'], defaultOptions: { props: { btnType: 'default', type: 'button',},},}
      ],
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
    // Bootstrap exports:
    NgbDropdownModule,
  ]
})
export class SharedModule { }
