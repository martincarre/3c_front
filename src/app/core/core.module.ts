import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModalModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsContainer } from './components/toast/toast-container.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';
import { ConfirmationModalContent } from './components/confirmation-modal/confirmation-modal.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ToastsContainer,
    ToastGlobalComponent,
    ConfirmationModalContent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModalModule,
  ],
  exports: [
    ToastsContainer,
    ConfirmationModalContent,
    NgbToastModule,
  ]
})
export class CoreModule { }
