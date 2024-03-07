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
    const newMail = { 
        partnerFiscalName: this.data.partnerFiscalName,
        reference: this.data.reference,
        partnerId: this.data.partnerId,
        investment: this.data.investment,
        tenor: this.data.tenor,
        quote: this.data.quote,
        opId: this.data.id,
        model: this.data.model,
        make: this.data.make,
        description: this.data.description,
        ...this.sendForm.value
    }
    this.activeModal.close(newMail);
  }
}
