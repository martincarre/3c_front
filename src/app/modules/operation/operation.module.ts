import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationRoutingModule } from './operation-routing.module';
import { SharedModule } from '../shared/shared.module';
import { OperationDashboardComponent } from './components/operation-dashboard/operation-dashboard.component';
import { OperationDetailsComponent } from './components/operation-details/operation-details.component';
import { OperationConfirmationModalComponent } from './components/operation-confirmation-modal/operation-confirmation-modal.component';
import { OperationListComponent } from './components/operation-list/operation-list.component';

@NgModule({
  declarations: [
    OperationDashboardComponent,
    OperationDetailsComponent,
    OperationConfirmationModalComponent,
    OperationListComponent
  ],
  imports: [
    CommonModule,
    OperationRoutingModule,
    SharedModule
  ]
})
export class OperationModule { }
