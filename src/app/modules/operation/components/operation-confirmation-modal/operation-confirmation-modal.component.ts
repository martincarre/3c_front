import { Component, Input, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';


@Component({
  selector: 'app-operation-confirmation-modal',
  templateUrl: './operation-confirmation-modal.component.html',
  styleUrl: './operation-confirmation-modal.component.scss'
})
export class OperationConfirmationModalComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() data: any;
  model: any = {};
  sendFormOptions: FormlyFormOptions = {};
  sendForm: FormGroup = new FormGroup({});
  sendFormFields: FormlyFieldConfig[] = [
    {
      key: 'roleSelection',
      type: 'select',
      defaultValue: 'partner',
      props: {
        label: 'Destinatario',
        placeholder: 'Seleccione el destinatario',
        required: true,
        options: [
          { label: 'Partner', value: 'partner' },
          { label: 'Cliente', value: 'client' },
        ]
      }
    },
    {
      key: 'fName',
      type: 'input',
      props: {
        label: 'Nombre',
        placeholder: 'Introduzca el nombre',
        required: false,
      },
      expressions: {
        hide: (field: any) => {
          const roleSelection = field.form.controls.roleSelection.value;
          if (roleSelection === 'partner') {
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
        required: false,
      },
      expressions: {
        hide: (field: any) => {
          const roleSelection = field.form.controls.roleSelection.value;
          if (roleSelection === 'partner') {
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
  ];

  ngOnInit(): void {
    if (!this.data) {
      console.log('No data')
    } else {
      console.log(this.data);
    }
  }

  onSend(): void { 
    this.activeModal.close({
      ...this.sendForm.value,
      partnerId: this.data.partnerId,
      partnerFiscalName: this.data.partnerFiscalName,
    });
  }
}
