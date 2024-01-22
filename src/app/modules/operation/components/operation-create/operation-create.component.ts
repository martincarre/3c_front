import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { OperationService } from '../../services/operation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { operationEconomicDetailsForm, operationForm, operationsDetailsForm } from '../../models/operation.formly-form';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { TypeaheadService } from 'src/app/modules/shared/services/typeahead.service';


@Component({
  selector: 'app-operation-create',
  templateUrl: './operation-create.component.html',
  styleUrl: './operation-create.component.scss'
})
export class OperationCreateComponent implements OnDestroy {
  private opSub: Subscription = new Subscription();
  private ecoDetailsSub: Subscription = new Subscription();
  private destroy$: Subject<any> = new Subject<any>();

  fiscalId: FormControl = new FormControl('');
  tpInfo: any = null;
  currId: string | null = null;
  private currOp: any = null;

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
    private location: Location,
    private typeaheadService: TypeaheadService,
    private toastService: ToastService,
    private spinnerService: SpinnerService, 
  ) {
    this.opFields = operationForm;
    this.opDetailFields = operationsDetailsForm;
    this.opEcoDetailFields = operationEconomicDetailsForm;
  }

  ngOnInit(): void {
    this.opSub = this.opForm.valueChanges.subscribe((change: any) => {
      this.calculationResult = null;
    });
    this.ecoDetailsSub = this.opEcoDetailForm.valueChanges.subscribe((change: any) => {
      this.calculationResult = null;
    });

    this.currId = this.route.snapshot.params['id'];
    if (this.currId) { 
      this.operationService.fetchOperationById(this.currId)
        .then((res: any) => {
          this.typeaheadService.getThirdparties()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              const partner = data.find((tp: any) => tp.id === res.partnerId);
              if (partner) {
                this.destroy$.next(true);
                this.currOp = {partner: partner, ...res};
                this.copyQuote(this.currOp);
              }
            });
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  }

  close(): void {
    this.location.back();
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

  private copyQuote(op: any): void {
    this.opDetailModel = {
      reference: this.currOp.reference,
      partner: this.currOp.partner,
      make: this.currOp.make,
      model: this.currOp.model,
      description: this.currOp.description,
    };
    this.opEcoDetailModel = {
      rateSwitch: this.currOp.rateSwitch,
      comSwitch: this.currOp.comSwitch,
      rate: this.currOp.rate,
      commission: this.currOp.commission,
      margin: this.currOp.margin,
      andOneRv: this.currOp.andOneRv,
      rv: this.currOp.rv,
    };
    this.opModel = {
      target: Math.round(this.currOp.rent * 100) / 100,
      tenor: this.currOp.tenor,
    };
  }

  save(op: any): void { 
    this.spinnerService.show();
    this.operationService.createOperation(op)
    .then((res: any) => {
      console.log(res)
      this.toastService.show('bg-success text-light', 'Operación guardada con éxito', 'Éxito!', 7000);
      this.router.navigate(['operation/list']);
      this.spinnerService.hide();
    })
    .catch((err: any) => {
      console.error(err);
      this.spinnerService.hide();
    });
  }
  
  send(op: any): void { 
    // TODO: need to check what we're sending here in terms of data;
    console.log(op);
    this.operationService.createOperation(op)
    .then(
      (res: any) => {
        const opToSend = { 
          description: op.description,
          investment: op.investment,
          make: op.make,
          model: op.model,
          id: res.id,
          partnerFiscalName: op.partnerFiscalName,
          partnerId: op.partnerId,
          quote: op.rent,
          reference: op.reference,
          tenor: op.tenor,
        };
        this.operationService.sendOperation(opToSend, 'create')
          .then(() => {
            this.router.navigate(['operation/list']);
            this.spinnerService.hide();
          })
          .catch((err: any) => {
            console.log(err);
            this.spinnerService.hide();
          });
      })
      .catch((err: any) => {
        console.error(err);
        this.spinnerService.hide();
      });
  }

  onSubmit(submitType: string): void {
    const op = {
      ...this.opEcoDetailForm.value,
      reference: this.opDetailForm.value.reference,
      partnerId: this.opDetailForm.value.partner.id,
      partnerFiscalName: this.opDetailForm.value.partner.fiscalName,
      make: this.opDetailForm.value.make,
      model: this.opDetailForm.value.model,
      [this.opForm.value.quoteSelection === 'rent' ? 'rent' : 'investment' ]: this.calculationResult,
      [this.opForm.value.quoteSelection === 'rent' ? 'investment' : 'rent' ]: this.opForm.value.target,
      tenor: this.opForm.value.tenor,
      description: this.opDetailForm.value.description,
      fromCopy: this.currId ? this.currId : null,
    }
    if (submitType === 'send') { 
      this.send(op);
    } else if (submitType === 'save') { 
      this.save(op);
    }
  }

  ngOnDestroy(): void {
    this.opSub.unsubscribe();
    this.ecoDetailsSub.unsubscribe();
  }
}
