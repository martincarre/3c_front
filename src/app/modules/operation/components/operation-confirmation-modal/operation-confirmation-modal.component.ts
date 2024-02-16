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
      defaultValue: 'client',
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
    }
  }

  onSend(): void { 
    this.activeModal.close({
      ...this.sendForm.value,
      ...this.data
    });
  }
}
