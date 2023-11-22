import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThirdpartydetailComponent } from './components/thirdpartydetail/thirdpartydetail.component';
import { ThirdpartyhomeComponent } from './components/thirdpartyhome/thirdpartyhome.component';
import { ThirdpartylistComponent } from './components/thirdpartylist/thirdpartylist.component';


const routes: Routes = [
  {
    path: '',
    component: ThirdpartyhomeComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'create', component: ThirdpartydetailComponent },
      { path: 'list', component: ThirdpartylistComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThirdpartyRoutingModule { }
