import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OperationService } from '../../../services/operation.service';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { operationsDetailsForm } from '../../../models/operation.formly-form';
import { TypeaheadService } from 'src/app/modules/shared/services/typeahead.service';
import { Subject, takeUntil } from 'rxjs';
import { FormHelper } from 'src/app/modules/shared/utilities/formHelpers';

@Component({
  selector: 'app-operation-details-edit-modal',
  templateUrl: './operation-details-edit-modal.component.html',
  styleUrl: './operation-details-edit-modal.component.scss'
})
export class OperationDetailsEditModalComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() data: any;
  private destroy$: Subject<any> = new Subject<any>();
  private initialOpDetailModel: any;
  @Output() updateOperation: EventEmitter<any> = new EventEmitter<any>();
  
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
    this.typeaheadService.getThirdparties()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
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
        this.initialOpDetailModel = { ...this.opDetailModel};
      });
  }

  onSubmit(): void {
    // console.log(this.data);

    // Checking for changes
    const changes = FormHelper.getFormChanges(this.initialOpDetailModel, this.opDetailModel);
    if (FormHelper.isEmptyObject(changes)) {
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
        this.updateOperation.emit();
        this.activeModal.close();
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  public isFormUntouched(): boolean {
    return this.opDetailForm.pristine;
  }
}
