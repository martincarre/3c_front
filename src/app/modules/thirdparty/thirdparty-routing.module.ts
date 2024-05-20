import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThirdpartydetailComponent } from './components/thirdpartydetail/thirdpartydetail.component';
import { ThirdpartyhomeComponent } from './components/thirdpartyhome/thirdpartyhome.component';
import { ThirdpartylistComponent } from './components/thirdpartylist/thirdpartylist.component';
import { authGuard } from 'src/app/core/guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: ThirdpartyhomeComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'create', component: ThirdpartydetailComponent,
        canActivate: [authGuard], data: { expectedRole: ['admin', 'moderator'] }
       },
      { path: 'create/:id', component: ThirdpartydetailComponent },
      { path: 'details/:id', component: ThirdpartydetailComponent },
      { path: 'list', component: ThirdpartylistComponent,
        canActivate: [authGuard], data: { expectedRole: ['admin', 'moderator'] }
       },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThirdpartyRoutingModule { }
