import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OperationDetailsEditModalComponent } from './operation-details-edit-modal/operation-details-edit-modal.component';
import { OperationMailListComponent } from '../operation-mail-list/operation-mail-list.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { SignSelectorModalComponent } from 'src/app/modules/shared/components/sign-selector-modal/sign-selector-modal.component';
import { SignInModalComponent } from 'src/app/modules/shared/components/sign-in-modal/sign-in-modal.component';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent implements OnInit, OnDestroy {
  private isAuthed: boolean = false;  
  private isAuthedSub: Subscription = new Subscription();  
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
    private modalService: NgbModal,
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
  ) {
  }


  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];

    if (this.currentId) {
      this.fetchOperation(this.currentId);
      this.isAuthedSub = this.authService.getAuthState().subscribe((authState) => {
        this.isAuthed = authState ? true : false;
      });
      this.currOp = this.operationService.getCurrOperation();
    }
  }

  fetchOperation(id: string): void { 
    this.spinnerService.show();
    this.operationService.fetchOperationById(id)
      .then(() => {
        this.spinnerService.hide();
      })
      .catch((err: any) => {
        console.log(err);
        this.spinnerService.hide();
      });
  }

  partnerLookup(id: string): void {
    this.router.navigate(['thirdparty/details', id]);
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
    this.router.navigate(['operation/copy-quote', this.currentId]);
  };

  onDelete(): void { 
    this.operationService.deleteOperationModal({ id: this.currentId, ...this.currOp})
      .then((res) => {
        this.operationService.deleteOperationById(this.currentId!);
        this.router.navigate(['operation/list']);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onEditDetails(): void {
    const editMdodal = this.modalService.open(OperationDetailsEditModalComponent, { size: 'lg', centered: true});
    editMdodal.componentInstance.data = { id: this.currentId, ...this.currOp.value};
    editMdodal.result
      .then((data: any) => {
        this.fetchOperation(this.currentId!);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onMessagesView(): void {
    if (this.currentId) {
      const mailModalRef: NgbModalRef = this.modalService.open(OperationMailListComponent, { size: 'lg', centered: true, scrollable: true });
      mailModalRef.componentInstance.data = this.currentId;
    } else {
      console.error('No operation id found');
    }
  }

  customerValidation(): Promise<boolean | void> { 
    // Check if user is authenticated
    if (!this.isAuthed) {
     // If not, open the "signin / signup" modal
     const signSelectorModal = this.modalService.open(SignSelectorModalComponent, { centered: true });
     return signSelectorModal.result
       .then((res) => {
         if (res) {
           return this.router.navigate([`user/signup/${this.currentId}`]);
         } else {
           const signInModal = this.modalService.open(SignInModalComponent);
           signInModal.componentInstance.data = { opId: this.currentId };
           signInModal.result.then((res) => {
             if (res) {
                return this.contractFirstStep();
             } else {
                return new Promise((resolve, reject) => {
                  alert('No se ha podido autenticar');
                  reject('User not authenticated');
                });
             }
           });
           return;
           // create the events when signedId
           // Create a modal with the sign in form, inject the currentId and let the sign in form redirect to the thirdparty check/creation
         }
       
       })
       .catch((err) => {
         console.log(err);
       });
      }
    else {
      // Create an helper function for this so that it can be called once the user has authenticated above
      return this.contractFirstStep();

    };
  }
  
  contractFirstStep(): Promise<boolean> {
    // TODO: check if the user has created an thirdparty
    // If so, IBAN confirmation modal and navigate to PDF generation / electronic signature
    // If not, navigate to thirdparty creation with the current operation id:
    // TODO: Add the current operation id to the user if not already existing
    return this.router.navigate([`thirdparty/create/${this.currentId}`]);
  }

  close(): void {
    this.location.back();
  }

  // Todo: delete once deved: 
  userRoleSelect(eventTarget: any): void {
    this.currentUser.role = eventTarget.value;
  }

  ngOnDestroy(): void {
    this.isAuthedSub.unsubscribe();
    this.operationService.unsubscribeCurrOperation();
  }
}
