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
                  sent: op.mails ? true : false,
                  id: op.id,
                  model: op.model,
                  make: op.make,
                  description: op.description,
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

    sendOp(op: any): void {
      this.operationService.sendOperation(op, 'list')
    }
    
    deleteOperation(row: any): void {
      this.operationService.deleteOperationModal(row)
      .then(() => {
        this.operationService.deleteOperationById(row.id);
        this.fetchData();
      })
      .catch((err: any) => {
        console.log(err);
      });
    }
    
    viewDetails(row: any): void {
      this.router.navigate(['../details', row.id], { relativeTo: this.route });
    }

}
