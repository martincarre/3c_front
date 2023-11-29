import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationDetailsComponent } from './components/operation-details/operation-details.component';
import { OperationListComponent } from './components/operation-list/operation-list.component';
import { OperationDashboardComponent } from './components/operation-dashboard/operation-dashboard.component';


const routes: Routes = [
  {
    path: '',
    component: OperationDashboardComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'create', component: OperationDetailsComponent },
      { path: 'details/:id', component: OperationDetailsComponent },
      { path: 'list', component: OperationListComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationRoutingModule { }