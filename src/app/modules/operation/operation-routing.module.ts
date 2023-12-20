import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationCreateComponent } from './components/operation-create/operation-create.component';
import { OperationListComponent } from './components/operation-list/operation-list.component';
import { OperationDashboardComponent } from './components/operation-dashboard/operation-dashboard.component';
import { OperationDetailsComponent } from './components/operation-details/operation-details.component';


const routes: Routes = [
  {
    path: '',
    component: OperationDashboardComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'create', component: OperationCreateComponent },
      { path: 'details/:id', component: OperationDetailsComponent  },
      { path: 'list', component: OperationListComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperationRoutingModule { }