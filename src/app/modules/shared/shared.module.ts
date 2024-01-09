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
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// Formly imports:
import { FormlyFieldFile } from './formly-helpers/types/file-type.component';
import { FormlyFieldButton } from './formly-helpers/types/button-type.component';
import { ObjectTypeComponent } from './formly-helpers/types/object-type.component';
import { spanishIdValidationMessage, spanishIdValidator } from './validators/spanishId.validator';
import { FormlyFieldTypeahead } from './formly-helpers/types/typeahead-type.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    FormlyFieldFile,
    ObjectTypeComponent,
    FormlyFieldButton,
    FormlyFieldTypeahead,
  ],
  imports: [
    // Module imports:
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    FormlyModule.forRoot({
      validators: [
        { name: 'id', validation: spanishIdValidator },
      ],
      validationMessages: [
        { name: 'required', message: 'Este campo es obligatorio' },
        { name: 'id', message:  spanishIdValidationMessage },
      ],
      types: [
        { name: 'typeahead', component: FormlyFieldTypeahead, wrappers: ['form-field'] },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] },
        { name: 'button', component: FormlyFieldButton, wrappers: ['form-field'], defaultOptions: { props: { btnType: 'default', type: 'button',},},}
      ],
    }),
    FormlyBootstrapModule,

    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected' // Footer selected message
      }
    }),

    // Bootstrap imports:
    NgbDropdownModule,
    NgbTypeaheadModule,
    NgSelectModule,
  ],
  exports: [
    // Modules: 
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    NgxDatatableModule,
    // Shared Components:
    NavbarComponent,
    SidenavComponent,
    // Bootstrap exports:
    NgbDropdownModule,
    NgbTypeaheadModule,
    NgSelectModule,
  ]
})
export class SharedModule { }
