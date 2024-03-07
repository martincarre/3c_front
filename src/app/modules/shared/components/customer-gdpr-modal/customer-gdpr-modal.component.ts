import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'app-customer-gdpr-modal',
  templateUrl: './customer-gdpr-modal.component.html',
  styleUrl: './customer-gdpr-modal.component.scss'
})
export class CustomerGdprModalComponent {
  activeModal = inject(NgbActiveModal);
  gdprFormFields: FormlyFieldConfig[] = [
    {
        key: 'gdpr',
        type: 'checkbox',
        defaultValue: false,
        props: {
          formCheck: 'inline-switch',
          label: 'Acepto que 3c realice el envío de mis datos a terceras entidades con las que 3c mantenga acuerdos comerciales (afiliados) y consulta por 3c o sus afiliados a sistemas externos de información crediticia.',
          required: true,
        },
    },
    {
        key: 'financialSecurity',
        type: 'checkbox',
        defaultValue: false,
        props: {
          formCheck: 'inline-switch',
          label: 'Consiento que 3c y sus afiliados consulten en la Tesorería General de la Seguridad Social la información sobre mi actividad económica con la finalidad descrita en el apartado.',
          required: true,
        },
    },
    {
        key: 'commercialCommunications',
        type: 'checkbox',
        defaultValue: true,
        props: {
          formCheck: 'inline-switch', 
          label: 'Acepto el envío de comunicaciones comerciales sobre productos de 3c, su grupo y/o sus afiliados, previo realización de un perfilado de mis datos y consulta a sistemas externos de información crediticia',
        },
    },
  ];
  gdprForm: FormGroup = new FormGroup({});
  gdprModel: any;
  gdprOptions: FormlyFormOptions = {};

  isGdprAndFinancialSecurityChecked(): boolean {
    const gdprChecked = this.gdprForm.get('gdpr')!.value;
    const financialSecurityChecked = this.gdprForm.get('financialSecurity')!.value;
    return gdprChecked && financialSecurityChecked;
  }

  gdprConfirmation() {
    if (!this.isGdprAndFinancialSecurityChecked()) {
      alert('Tienes que aceptar las condiciones basicas para poder estudiar tu solicitud (GDPR y Seguridad Financiera). De no desear continuar, puedes cerrar esta ventana.');
      return;
    }
    this.activeModal.close(this.gdprForm.value);
  }
  
}
