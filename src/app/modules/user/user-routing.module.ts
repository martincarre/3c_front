import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserComponent } from './components/user/user.component';
import { BackUserDetailsComponent } from './components/back-user-details/back-user-details.component';
import { UserSignupComponent } from './components/user-signup/user-signup.component';
import { BackUserConfirmComponent } from './components/back-user-confirm/back-user-confirm.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'list', component: UserListComponent, canActivate: [authGuard], data: { expectedRole: ['admin', 'moderator'] }},
      { path: 'create', component: BackUserDetailsComponent, canActivate: [authGuard], data: { expectedRole: ['admin', 'moderator'] }},
      { path: 'signup/:id', component: UserSignupComponent },
      { path: 'password-setup', component: BackUserConfirmComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule { }