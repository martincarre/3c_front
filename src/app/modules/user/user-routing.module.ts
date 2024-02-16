import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserComponent } from './components/user/user.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UserSignupComponent } from './components/user-signup/user-signup.component';


const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'list', component: UserListComponent },
      { path: 'create', component: UserDetailsComponent },
      { path: 'signup/:id', component: UserSignupComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule { }