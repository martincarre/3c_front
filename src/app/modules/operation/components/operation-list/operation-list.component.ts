import { Component, OnInit } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../operation-confirmation-modal/operation-confirmation-modal.component';

@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.scss'
})
export class OperationListComponent implements OnInit {
  columns: any[] = [
    { prop: 'partnerFiscalName', name: 'Partner' }, 

  ];
  opList: any[] = [];
  columnMode = ColumnMode

  constructor(
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private modalService: NgbModal,
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
                  investment: op.investment,
                  tenor: op.tenor,
                  quote: op.rent,
                  make: op.make,
                  model: op.model,
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
      console.log(row);
      const sendModal = this.modalService.open(OperationConfirmationModalComponent);
      sendModal.result.then(
        (result: any) => {
          console.log(result);
        },
        (reason: any) => {
          console.log(reason);
        }
      );
    }
    
    viewDetails(row: any): void {
      console.log(row);
    }
    
    deleteOperation(row: any): void {
      console.log(row);    
    }

}
