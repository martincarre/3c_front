import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractComponent } from './components/contract/contract.component';
import { ContractSignComponent } from './components/contract-sign/contract-sign.component';
import { ContractListComponent } from './components/contract-list/contract-list.component';

const routes: Routes = [
  {
    path: '',
    component: ContractComponent,
    children: [
      { path: '', redirectTo: 'list',  pathMatch: 'full' },
      { path: 'list', component: ContractListComponent },
      { path: 'contract-sign/:id', component: ContractSignComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractRoutingModule { }
