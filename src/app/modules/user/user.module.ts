import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserComponent } from './components/user/user.component';
import { SharedModule } from '../shared/shared.module';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UserSignupComponent } from './components/user-signup/user-signup.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserComponent,
    UserDetailsComponent,
    UserSignupComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
  ]
})
export class UserModule { }
