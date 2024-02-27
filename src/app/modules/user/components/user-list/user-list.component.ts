import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  userList: any[] = [];
  columnMode = ColumnMode
  private userSub: Subscription = new Subscription();
  
  constructor(
    private userService: UserService,
    private spinnerService: SpinnerService,
  ) {}

    ngOnInit(): void {
      this.fetchUsers();
    }

    private fetchUsers(): void {
      this.spinnerService.show();
     this.userSub = this.userService.fetchUsers()
        .subscribe(
          (users: any[]) => { 
            this.userList = users.map((user: any) => {
              return {
                partnerId: user.partnerId,
                partnerFiscalName: user.partnerFiscalName, 
                name: user.name,
                email: user.email,
                type: user.role,
                actions: null
              }
            });
            this.spinnerService.hide();
        });
    }

    viewDetails(row: any): void {
      console.log(row);
    }

    deleteUser(row: any): void {
      console.log(row);
    }

    ngOnDestroy(): void {
      this.userSub.unsubscribe();
    }
}
