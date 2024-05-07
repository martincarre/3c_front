import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserComponent } from './components/user/user.component';
import { SharedModule } from '../shared/shared.module';
import { BackUserDetailsComponent } from './components/back-user-details/back-user-details.component';
import { UserSignupComponent } from './components/user-signup/user-signup.component';
import { BackUserConfirmComponent } from './components/back-user-confirm/back-user-confirm.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserComponent,
    BackUserDetailsComponent,
    UserSignupComponent,
    BackUserConfirmComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
  ]
})
export class UserModule { }
