import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/core/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalContent } from 'src/app/core/components/confirmation-modal/confirmation-modal.component';

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
    private toastService: ToastService,
    private modalService: NgbModal
  ) {}

    ngOnInit(): void {
      this.fetchUsers();
    }

    private fetchUsers(): void {
      this.spinnerService.show();
     this.userSub = this.userService.fetchUsers()
        .subscribe(
          (users: any[]) => { 
            console.log(users);
            this.userList = users.map((user: any) => {
              return {
                id: user.id,
                partnerId: user.relatedTpFiscalId ? user.relatedTpFiscalId : user.relatedTpId,
                partnerFiscalName: user.relatedTpName, 
                name: user.name,
                surname: user.surname,
                email: user.email,
                type: user.role,
                validationSetup: user.validationSetup,
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
      // Confirmation Modal to delete the user
      const confirmationData = {
        title: 'Eliminar usuario',
        message: `¿Está seguro que desea eliminar el usuario ${row.email}?`
      }
      const modalRef = this.modalService.open(ConfirmationModalContent);
      modalRef.componentInstance.data = confirmationData;
      modalRef.result
        .then(() => {
          // Delete the user
          this.spinnerService.show();
          this.userService.deleteBackUser(row.id)
            .then((res) => {
                if (res) {
                  const data = res.data;
                  // Not a fan of the line below but will do for now.
                  data.success? this.toastService.show('bg-success text-light', data.message , 'Éxito!', 7000) : this.toastService.show('bg-danger text-light', data.message, 'Error!', 7000);
                  // TODO bug the res.message doesn't show up
                  console.log(data);
                }
                this.spinnerService.hide();
            })
            .catch((err) => {
              console.log(err);
              this.toastService.show(err.message);
              this.spinnerService.hide();
            });
        });
    }

    ngOnDestroy(): void {
      this.userSub.unsubscribe();
    }
}
