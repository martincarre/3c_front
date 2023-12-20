import { Component, OnInit } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../operation-confirmation-modal/operation-confirmation-modal.component';
import { UserService } from 'src/app/modules/user/services/user.service';
import { ConfirmationModalContent } from 'src/app/core/components/confirmation-modal/confirmation-modal.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.scss'
})
export class OperationListComponent implements OnInit {
  opList: any[] = [];
  columnMode = ColumnMode

  constructor(
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private modalService: NgbModal,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
    
    ngOnInit(): void {
      this.fetchData();
    }

    private fetchData(): void {
      this.spinnerService.show();
      this.operationService.fetchOperations()
        .then(
          (data: any[]) => {
            // console.log(data);
            this.opList = data.map((op: any) => {
                return {
                  partnerFiscalName: op.partnerFiscalName,
                  reference: op.reference,
                  partnerId: op.partnerId,
                  investment: op.investment,
                  tenor: op.tenor,
                  quote: op.rent,
                  actions: null,
                  id: op.id
                }
              });
            this.spinnerService.hide();
          }
        )
        .catch((err: any) => {
          console.log(err);
          this.spinnerService.hide();
        })
    }

    sendOp(row: any): void {
      const sendModal = this.modalService.open(OperationConfirmationModalComponent);
      sendModal.componentInstance.data = row;
      sendModal.result.then(
        (modalRes: {email: string, message: string, partnerId: string, partnerFiscalName: string, roleSelection: string}) => {
          this.spinnerService.show();
          this.userService.addUserByEmail(modalRes.email, modalRes.roleSelection, modalRes.partnerId, modalRes.partnerFiscalName)
            .then((data: any) => {
              console.log(data);
              this.spinnerService.hide();
            })
            .catch((err: any) => { 
              console.error(err);
              this.spinnerService.hide();
            });
        },
        (reason: any) => {
          console.log(reason);
        }
      );
    }
    
    deleteOperation(row: any): void {
      const confirmationData = {
        title: 'Eliminar operación',
        message: `¿Está seguro que desea eliminar el tercero ${row.reference}?`
      }
      const modalRef = this.modalService.open(ConfirmationModalContent);
      modalRef.componentInstance.data = confirmationData;
      modalRef.result
        .then((res: any) => {
          this.spinnerService.show();
          row.id ? this.operationService.deleteOperation(row.id)
            .then((delRes: any) => {
              this.spinnerService.hide();
              this.fetchData();
            })
            .catch((err: any) => {
              this.spinnerService.hide();
              console.error(err);
            })
            : console.log('No id');
      })
      .catch((err: any) => {
        console.error(err);
      });
    }
    
    viewDetails(row: any): void {
      this.router.navigate(['../details', row.id], { relativeTo: this.route });
    }

}
