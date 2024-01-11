import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationService } from '../../../services/operation.service';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { operationsDetailsForm } from '../../../models/operation.formly-form';
import { TypeaheadService } from 'src/app/modules/shared/services/typeahead.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-operation-details-edit-modal',
  templateUrl: './operation-details-edit-modal.component.html',
  styleUrl: './operation-details-edit-modal.component.scss'
})
export class OperationDetailsEditModalComponent implements OnInit, OnDestroy {
  activeModal = inject(NgbActiveModal);
  @Input() data: any;
  private destroy$: Subject<any> = new Subject<any>();
  private initialModel: any;
  
  opDetailForm: FormGroup = new FormGroup({});
  opDetailModel: any;
  opDetailFields: FormlyFieldConfig[];
  opDetailOptions: FormlyFormOptions = {};


  constructor(
    private operationService: OperationService,
    private typeaheadService: TypeaheadService,
  ) {
    this.opDetailFields = operationsDetailsForm;
  }

  ngOnInit(): void {
    console.log('init');
    this.typeaheadService.getThirdparties()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log('call');
        const partner = data.find((tp: any) => tp.id === this.data.partnerId);
        if (partner) {
          this.destroy$.next(true);
          this.opDetailModel = {
            reference: this.data.reference,
            partner: partner,
            model: this.data.model,
            make: this.data.make,
            description: this.data.description,
          };
        }
        this.initialModel = { ...this.opDetailModel};
      });
  }



  private getFormChanges(initialModel: any, currentModel: any): any {
    const changes: any = {};
    Object.keys(initialModel).forEach(key => {
      if (this.isObject(initialModel[key]) && this.isObject(currentModel[key])) {
        const deepChanges = this.getFormChanges(initialModel[key], currentModel[key]);
        if (Object.keys(deepChanges).length > 0) {
          changes[key] = deepChanges;
        }
      } else if (initialModel[key] !== currentModel[key]) {
        changes[key] = currentModel[key];
      }
    });
    return changes;
  }
  
  private isObject(item: any): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  private isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
  
  onSubmit(): void {
    // console.log(this.data);

    // Checking for changes
    const changes = this.getFormChanges(this.initialModel, this.opDetailModel);
    if (this.isEmptyObject(changes)) {
      // If no changes, stay on the modal but alert and return
      console.log('No changes detected');
      alert('No has hecho ningún cambio...');
      return;
    }
    // If changes, update the operation and close the modal: 
    // Modifying the operation for update (particularly for the Thirdparty object) -->  delete this.opDetailModel.partner and repalce it with the id and fiscalName;
    this.opDetailModel = { ...this.opDetailModel, partnerId: this.opDetailModel.partner.id, partnerFiscalName: this.opDetailModel.partner.fiscalName };
    delete this.opDetailModel.partner;
    Object.keys(this.opDetailModel).forEach(key => {
      this.data[key] = this.opDetailModel[key];
    });
    this.operationService.updateOperation(this.data)
      .then((data: any) => {
        
        this.activeModal.close();
      })
      .catch((err: any) => {
      });
    
  }

  public isFormUntouched(): boolean {
    return this.opDetailForm.pristine;
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
