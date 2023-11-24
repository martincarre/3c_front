import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastsContainer } from './components/toast/toast-container.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    ToastsContainer,
    ToastGlobalComponent,
  ],
  imports: [
    CommonModule,
    NgbToastModule,
  ],
  exports: [
    ToastsContainer,
    NgbToastModule,
  ]
})
export class CoreModule { }
