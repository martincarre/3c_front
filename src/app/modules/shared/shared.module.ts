// Module imports:
import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// Shared Components:
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

// Bootstrap imports:
import { NgbAccordionModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

// Formly imports:
import { FormlyFieldFile } from './formly-helpers/types/file-type.component';
import { FormlyFieldButton } from './formly-helpers/types/button-type.component';
import { ObjectTypeComponent } from './formly-helpers/types/object-type.component';
import { spanishIdValidationMessage, spanishIdValidator } from './validators/spanishId.validator';
import { FormlyFieldTypeahead } from './formly-helpers/types/typeahead-type.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CustomerGdprModalComponent } from './components/customer-gdpr-modal/customer-gdpr-modal.component';
import { fieldMatchValidator } from './validators/fieldMatch.validator';
import { minLengthValidationMessages } from './validators/minLength.validator';
import { SignInModalComponent } from './components/sign-in-modal/sign-in-modal.component';
import { RoleDirective } from 'src/app/core/directives/role.directive';
import { FooterComponent } from './components/footer/footer.component';
import { ibanValidationMessage, ibanValidator } from './validators/iban.validator';


@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent,
    CustomerGdprModalComponent,
    SignInModalComponent,
    FooterComponent,
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

    // Directives:
    RoleDirective,

    // Formly imports:
    
    FormlyModule.forRoot({
      validators: [
        { name: 'id', validation: spanishIdValidator },
        { name: 'fieldMatch', validation: fieldMatchValidator},
        { name: 'iban', validation:  ibanValidator},
      ],
      validationMessages: [
        { name: 'required', message: 'Este campo es obligatorio' },
        { name: 'id', message:  spanishIdValidationMessage },
        { name: 'iban', message:  ibanValidationMessage},
        { name: 'minLength', message: minLengthValidationMessages },
      ],
      types: [
        { name: 'typeahead', component: FormlyFieldTypeahead, wrappers: ['form-field'] },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] },
        { name: 'button', component: FormlyFieldButton, wrappers: ['form-field'], defaultOptions: { props: { btnType: 'default', type: 'button',},},}
      ],
    }),
    FormlyBootstrapModule,

    // Ngx imports:
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
    NgbAccordionModule,

  ],
  exports: [
    // Modules: 
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    NgxDatatableModule,

    // Directives:
    RoleDirective,

    // Shared Components:
    NavbarComponent,
    FooterComponent,
    SidenavComponent,
    CustomerGdprModalComponent,
    SignInModalComponent,
    // Bootstrap exports:
    NgbDropdownModule,
    NgbTypeaheadModule,
    NgSelectModule,
    NgbAccordionModule,
  ],
})
export class SharedModule { }
