import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationRoutingModule } from './operation-routing.module';
import { SharedModule } from '../shared/shared.module';
import { OperationDashboardComponent } from './components/operation-dashboard/operation-dashboard.component';

@NgModule({
  declarations: [
    OperationDashboardComponent,
    
  ],
  imports: [
    CommonModule,
    OperationRoutingModule,
    SharedModule
  ]
})
export class OperationModule { }
