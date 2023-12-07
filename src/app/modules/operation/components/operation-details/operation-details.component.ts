import { Component, OnDestroy } from '@angular/core';
import { Operation } from '../../models/operation.model';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { OperationService } from '../../services/operation.service';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { operationEconomicDetailsForm, operationForm, operationsDetailsForm } from '../../models/operation.formly-form';
import { ExtInfoService } from 'src/app/core/services/extInfo.service';

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
    private extInfoService: ExtInfoService,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.opFields = operationForm;
    this.opDetailFields = operationsDetailsForm;
    this.opEcoDetailFields = operationEconomicDetailsForm;
  }

  ngOnInit(): void {
  }

  onSearch(): void {
    this.extInfoService.getTpInfo(this.fiscalId.value).subscribe((res: any) => {
      console.log(res);
      this.tpInfo = res;
    });
  }

  calculateQuote(): void { 
    const ecoDetails = { 
      rate: this.opEcoDetailForm.value.rate?  this.opEcoDetailForm.value.rate/ 100 : null,
      commission: this.opEcoDetailForm.value.commission? this.opEcoDetailForm.value.commission/ 100 : null,
      margin: this.opEcoDetailForm.value.margin / 100,  
      selector: this.opForm.value.quoteSelection === 'rent' ? true : false,
      amount: this.opForm.value.rent,
      duration: this.opEcoDetailForm.value.andOneRv? this.opForm.value.tenor + 1 : this.opForm.value.tenor,
      rv: this.opEcoDetailForm.value.andOneRv? 0 : this.opEcoDetailForm.value.rv / 100,
    }
    const res = this.operationService.getQuote(ecoDetails);
    if (!(res instanceof Error)) {
      this.calculationResult = res;
    } else {
      console.error(res);
    }
  }

  onSubmit(): void {
    const op = this.opForm.value as Operation;
    if (this.createMode) {
      console.log('create', op);
    }
    else { 
      console.log('update', op);
    }
  }

  ngOnDestroy(): void {
    this.opSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}
