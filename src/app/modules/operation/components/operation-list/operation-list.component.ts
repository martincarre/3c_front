import { Component, OnDestroy, OnInit } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.scss'
})
export class OperationListComponent implements OnInit, OnDestroy {
  opList: any[] = [];
  columnMode = ColumnMode
  private operationListSub: Subscription = new Subscription();

  constructor(
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private router: Router,
    private authService: AuthService,
  ) {}
    
    ngOnInit(): void {
      this.fetchData();
    }

    private fetchData(): void {
      this.spinnerService.show();
      this.operationListSub = this.operationService.fetchOperations()
        .subscribe(
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
        );
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
      this.router.navigate(['operation/details', row.id]);
    }

    ngOnDestroy(): void {
      this.operationListSub.unsubscribe();
    };

}
