import { Component, Input, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';


@Component({
  selector: 'app-operation-confirmation-modal',
  templateUrl: './operation-confirmation-modal.component.html',
  styleUrl: './operation-confirmation-modal.component.scss'
})
export class OperationConfirmationModalComponent {
  activeModal = inject(NgbActiveModal);
  @Input() data: any;
  model: any = {};
  sendFormOptions: FormlyFormOptions = {};
  sendForm: FormGroup = new FormGroup({});
  sendFormFields: FormlyFieldConfig[] = [
    {
      key: 'destSelection',
      type: 'select',
      defaultValue: 'partner',
      props: {
        label: 'Destinatario',
        placeholder: 'Seleccione el destinatario',
        required: true,
        options: [
          { label: 'Partner', value: 'partner' },
          { label: 'Cliente', value: 'cliente' },
        ]
      }
    },
    {
      key: 'fName',
      type: 'input',
      props: {
        label: 'Nombre',
        placeholder: 'Introduzca el nombre',
        required: true,
      },
      expressions: {
        hide: (field: any) => {
          const destSelection = field.form.controls.destSelection.value;
          if (destSelection === 'partner') {
            return true;
          } else {
            return false;
          }
        }
      }
    },
    {
      key: 'lName',
      type: 'input',
      props: {
        label: 'Apellidos',
        placeholder: 'Introduzca los apellidos',
        required: true,
      },
      expressions: {
        hide: (field: any) => {
          const destSelection = field.form.controls.destSelection.value;
          if (destSelection === 'partner') {
            return true;
          } else {
            return false;
          }
        }
      }
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email',
        placeholder: 'Introduzca el email',
        required: true,
      }
    },
    {
      key: 'message',
      type: 'textarea',
      props: {
        label: 'Mensaje',
        placeholder: 'Introduzca el mensaje',
        rows: 5,
      }
    }
  ]

  onSend(): void { 
    this.activeModal.close(this.sendForm.value);
  }
}
