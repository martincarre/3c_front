import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractComponent } from './components/contract/contract.component';
import { ContractSignComponent } from './components/contract-sign/contract-sign.component';
import { ContractListComponent } from './components/contract-list/contract-list.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    ContractListComponent,
    ContractComponent,
    ContractSignComponent,
  ],
  imports: [
    CommonModule,
    ContractRoutingModule,
    SharedModule,
  ]
})
export class ContractModule { }
