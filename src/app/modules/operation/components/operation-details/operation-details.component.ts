import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationDetailsEditModalComponent } from './operation-details-edit-modal/operation-details-edit-modal.component';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent implements OnInit {
  currentId: string | null = null;
  currOp: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentUser: any = {
    name: 'Juan',
    lastName: 'Lopez',
    role: 'partner'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private modal: NgbModal,
    private operationService: OperationService,
    private spinnerService: SpinnerService,
  ) {
  }


  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) { 
      this.fetchOperation(this.currentId);
    }
  }

  fetchOperation(id: string): void { 
    this.spinnerService.show();
      this.operationService.fetchOperationById(id)
        .then((data: any) => {
          this.currOp.next(data);
          this.spinnerService.hide();
        })
        .catch((err: any) => { 
          console.log(err);
          this.spinnerService.hide();
        });
  }

  partnerLookup(id: string): void {
    this.router.navigate(['../../../thirdparty/details', id], { relativeTo: this.route });
  }

  onSend(): void { 
    // Adapting object to what's expected in the send function
    const opToSend = { 
      description: this.currOp.value.description,
      investment: this.currOp.value.investment,
      make: this.currOp.value.make,
      model: this.currOp.value.model,
      id: this.currentId,
      partnerFiscalName: this.currOp.value.partnerFiscalName,
      partnerId: this.currOp.value.partnerId,
      quote: this.currOp.value.rent,
      reference: this.currOp.value.reference,
      tenor: this.currOp.value.tenor,
    };
    this.operationService.sendOperation(opToSend, 'details')
      .then(
        (data: any) => {
          console.log(data);
          this.fetchOperation(this.currentId!);
          // this.router.navigate(['../../'], { relativeTo: this.route });
        },
        (reason) => {
          console.log(reason);
        }
      )
      .catch((err: any) => {
        console.log(err);
      });
  }

  onDuplicate(): void {
    this.operationService
    this.router.navigate(['../../'], { relativeTo: this.route });
  };

  onDelete(): void { 
    this.operationService.deleteOperation({ id: this.currentId, ...this.currOp})
      .then(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onEditDetails(): void {
    const editMdodal = this.modal.open(OperationDetailsEditModalComponent, { size: 'lg', centered: true});
    editMdodal.componentInstance.data = { id: this.currentId, ...this.currOp.value};
  }

  onMessagesView(): void {
    if (this.currentId) {
      this.operationService.viewMails(this.currentId)
      // Putting a then but useless. Just to avoid a console.error for not handling the promise
        .then(() => {})
        .catch(() => {});
    } else {
      console.error('No operation id found');
    }
  }

  close(): void {
    this.location.back();
  }

  // Todo: delete once deved: 
  userRoleSelect(eventTarget: any): void {
    this.currentUser.role = eventTarget.value;
  }
}
