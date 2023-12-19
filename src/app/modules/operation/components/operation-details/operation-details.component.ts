import { Component, OnDestroy } from '@angular/core';
import { Operation } from '../../models/operation.model';
import { Subject, Subscription, map, takeUntil, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { OperationService } from '../../services/operation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { operationEconomicDetailsForm, operationForm, operationsDetailsForm } from '../../models/operation.formly-form';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../operation-confirmation-modal/operation-confirmation-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent implements OnDestroy {
  createMode: boolean = true;
  private opSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();
  private destroy$: Subject<any> = new Subject<any>();

  fiscalId: FormControl = new FormControl('');
  tpInfo: any = null;

  opForm: FormGroup = new FormGroup({});
  opModel: any;
  opFields: FormlyFieldConfig[];
  opOptions: FormlyFormOptions = {};

  opDetailForm: FormGroup = new FormGroup({});
  opDetailModel: any;
  opDetailFields: FormlyFieldConfig[];
  opDetailOptions: FormlyFormOptions = {};

  opEcoDetailForm: FormGroup = new FormGroup({});
  opEcoDetailModel: any;
  opEcoDetailFields: FormlyFieldConfig[];
  opEcoDetailOptions: FormlyFormOptions = {};

  calculationResult: number | null = null;

  formEditMode: FormlyFormOptions = {
    formState: {
      disabled: false,
    },
  };

  constructor(
    private operationService: OperationService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private modalService: NgbModal,
    private spinnerService: SpinnerService, 
    private userService: UserService
  ) {
    this.opFields = operationForm;
    this.opDetailFields = operationsDetailsForm;
    this.opEcoDetailFields = operationEconomicDetailsForm;
  }

  ngOnInit(): void {
    
  }

  calculateQuote(): void { 
    const ecoDetails = { 
      rate: this.opEcoDetailForm.value.rate?  this.opEcoDetailForm.value.rate/ 100 : null,
      commission: this.opEcoDetailForm.value.commission? this.opEcoDetailForm.value.commission/ 100 : null,
      margin: this.opEcoDetailForm.value.margin / 100,  
      selector: this.opForm.value.quoteSelection === 'rent' ? true : false,
      amount: this.opForm.value.target,
      duration: this.opEcoDetailForm.value.andOneRv? this.opForm.value.tenor + 1 : this.opForm.value.tenor,
      rv: this.opEcoDetailForm.value.andOneRv? 0 : this.opEcoDetailForm.value.rv,
    }
    const res = this.operationService.getQuote(ecoDetails);
    if (!(res instanceof Error)) {
      this.calculationResult = res;
    } else {
      console.error(res);
    }
  }

  save(op: any): void { 
    this.spinnerService.show();
    this.operationService.createOperation(op)
    .then((res: any) => {
      console.log(res)
      this.toastService.show('bg-success text-light', 'Operación guardada con éxito', 'Éxito!', 7000);
      this.router.navigate(['../list'], { relativeTo: this.route });
      this.spinnerService.hide();
    })
    .catch((err: any) => {
      console.error(err);
      this.spinnerService.hide();
    });
  }
  
  send(op: any): void { 
    const sendModalRef: NgbModalRef = this.modalService.open(OperationConfirmationModalComponent);
    sendModalRef.componentInstance.data = op;
    sendModalRef.result
    .then((modalRes: {email: string, message: string, relatedPartner: string, roleSelection: string}) => {
      console.log(modalRes);
      this.spinnerService.show();
      this.userService.addUserByEmail(modalRes.email, modalRes.roleSelection, modalRes.relatedPartner)
      .then((res: any) => console.log(res))
      .catch((err: any) => console.error(err));
      this.operationService.createOperation(op, modalRes)
      .then(
        (res: any) => {
          console.log(res)
          this.toastService.show('bg-success text-light', `Opéración guardada y enviada a ${modalRes.email} con éxito!`, 'Éxito!', 7000);
          this.router.navigate(['../list'], { relativeTo: this.route });
          this.spinnerService.hide();
        }
        )
      })
      .catch((err: any) => {
        console.error(err);
        this.spinnerService.hide();
      });
  }

  onSubmit(submitType: string): void {

    console.log(this.opDetailForm.value.partner);
    const op = {
      ...this.opEcoDetailForm.value,
      partnerId: this.opDetailForm.value.partner.id,
      partnerFiscalName: this.opDetailForm.value.partner.fiscalName,
      make: this.opDetailForm.value.equipmentMake,
      model: this.opDetailForm.value.equipmentModel,
      [this.opForm.value.quoteSelection === 'rent' ? 'rent' : 'investment' ]: this.calculationResult,
      [this.opForm.value.quoteSelection === 'rent' ? 'investment' : 'rent' ]: this.opForm.value.target,
      tenor: this.opForm.value.tenor,
      description: this.opDetailForm.value.description,
    }
    if (submitType === 'send') { 
      this.send(op);
    } else if (submitType === 'save') { 
      this.save(op);
    }
  }

  ngOnDestroy(): void {
    this.opSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}
