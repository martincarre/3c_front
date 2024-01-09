import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  userList: any[] = [];
  columnMode = ColumnMode

  
  constructor(
    private userService: UserService,
    private spinnerService: SpinnerService,
    private modalService: NgbModal,
  ) {}

    ngOnInit(): void {
      this.fetchUsers();
    }

    private fetchUsers(): void {
      this.spinnerService.show();
      this.userService.fetchUsers()
        .then(
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
          }
        )
        .catch((err: any) => {
          this.spinnerService.hide();
          console.log(err);
        });
    }

    viewDetails(row: any): void {
      console.log(row);
    }

    deleteUser(row: any): void {
      console.log(row);
    }

}
