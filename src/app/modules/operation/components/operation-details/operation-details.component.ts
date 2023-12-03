import { Component } from '@angular/core';
import { Operation } from '../../models/operation.model';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { OperationService } from '../../services/operation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { thirdpartyFormlyForm } from 'src/app/modules/thirdparty/models/thirdparty.formly-form';
import { operationCompFormlyForm, operationDetailFormlyForm } from '../../models/operation.formly-form';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent {
  createMode: boolean = true;
  currentTab: string = 'tp';
  currentId: string | undefined | null;
  editMode: boolean = false;
  private currentOP: Operation | undefined;
  private opSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();

  opForm = new FormGroup({});

  detailOpForm = new FormGroup({});
  detailOpModel = {};
  detailOpFields: FormlyFieldConfig[];
  
  opCompForm = new FormGroup({});
  opCompModel = {};
  opCompFields: FormlyFieldConfig[];
  
  tpForm = new FormGroup({});
  tpModel = {};
  tpFields: FormlyFieldConfig[];

  formEditMode: FormlyFormOptions = {
    formState: {
      disabled: false,
    },
  };

  constructor(
    private operationService: OperationService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.detailOpFields = operationDetailFormlyForm;
    this.tpFields = thirdpartyFormlyForm;
    this.opCompFields = operationCompFormlyForm;
  }

  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) {
      this.createMode = false;
      this.formEditMode.formState.disabled = true;
      this.fetchThirdParty(this.currentId);
    }
  }

  private fetchThirdParty(id: string): void {

    // this.tpSub = this.thirdpartyService.fetchThirdPartyById(id)
    //   .subscribe((thirdparty: Thirdparty) => {
    //     this.currentTP = thirdparty;
    //     this.model = thirdparty;
    //     this.title = thirdparty.fiscalName;
    //   });
  }

  openTab(tab: string): void {
    console.log('Change tab to: ', tab);
    this.currentTab = tab;
  }

  onEdit(): void {
    this.formEditMode.formState.disabled = !this.formEditMode.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    const op = this.opForm.value as Operation;
    if (this.createMode) {
      console.log('create', op);
      // this.submitSub = this.thirdpartyService.addThirdparty(tp)
      // .subscribe(res => {
      //   this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
      //   console.log(res);
      //   this.router.navigate(['/thirdparty/list']);
      // });
    }
    else { 
      console.log('update', op);
      // this.submitSub = this.thirdpartyService.updateThirdparty(tp)
      // .subscribe(res => {
      //   this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
      //   console.log(res);
      //   this.router.navigate(['/thirdparty/list']);
      // });
    }
  }

  onClose(): void { // TODO: Centralize to refactor this. To put in the shared module.
    if (this.detailOpForm.touched || this.tpForm.touched) {
      const confirmation = confirm('¿Estás seguro de que quieres salir sin guardar?'); // TODO: Change to modal.
      console.log(confirmation);
      if (confirmation) {
        this.router.navigate(['/operation']);
      }
    }
  }

  ngOnDestroy(): void {
    this.opSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}
