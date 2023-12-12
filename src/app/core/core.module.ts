import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModalModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsContainer } from './components/toast/toast-container.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';
import { ConfirmationModalContent } from './components/confirmation-modal/confirmation-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerInterceptor } from './interceptors/spinner';
import { SpinnerComponent } from './components/spinner/spinner.component';


@NgModule({
  declarations: [
    ToastsContainer,
    SpinnerComponent,
    ToastGlobalComponent,
    ConfirmationModalContent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModalModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
  ],
  exports: [
    ToastsContainer,
    SpinnerComponent,
    ConfirmationModalContent,
    NgbToastModule,
  ]
})
export class CoreModule { }
