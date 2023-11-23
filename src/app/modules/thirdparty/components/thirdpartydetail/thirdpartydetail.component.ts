import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thirdpartydetail',
  templateUrl: './thirdpartydetail.component.html',
  styleUrls: ['./thirdpartydetail.component.scss']
})
export class ThirdpartydetailComponent {
  createMode: boolean = true;
  form = new FormGroup({});
  model = {};
  title: string = this.createMode ? 'Nuevo tercero: ' : '';
  fields: FormlyFieldConfig[] = [
    
    {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
        {
          className: 'col-8',
          key: 'fiscalName',
          type: 'input',
          props: {
            label: 'Denominación social',
            placeholder: 'Empresa',
            required: true,
            change: (field: any) => {
              this.title = this.title + field.form.controls.fiscalName.value;
            }
          },
          hooks: {
            onInit: (field: any) => {
              if (!this.createMode) {
                this.title = field.form.controls.fiscalName.value;
              }
            }
          }
        },
        {
          className: 'col-4',
          key: 'fiscalId',
          type: 'input',
          props: {
            label: 'NIF/CIF',
            placeholder: 'A12345678',
            required: true,
          },
        },
      ]
    },
    {
      className: 'section-label',
      template: '<hr /><h5 class="card-title">Dirección:</h5>',
    },
    {
      fieldGroup: [
        {
          key: 'address',
          type: 'input',
          props: {
            label: 'Calle',
            placeholder: 'Calle & número ',
            required: true,
          },
        },
        {
          key: 'addressComp',
          type: 'input',
          props: {
            label: 'Complemento',
            placeholder: 'Piso, puerta, etc.',
          },
        },
      ]
    },
    {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
        {
          className: 'col-3',
          key: 'postalCode',
          type: 'input',
          props: {
            label: 'Código postal',
            placeholder: '28000',
            required: true,
          },
        },
        {
          className: 'col-4',
          key: 'city',
          type: 'select',
          props: {
            label: 'Ciudad',
            placeholder: 'Madrid',
            required: true,
          },
        },
        {
          className: 'col-4',
          key: 'state',
          type: 'select',
          props: {
            label: 'Provincia',
            placeholder: 'Madrid',
            required: true,
          },
        },
      ]
    },
    {
      className: 'section-label',
      template: '<hr /><h5 class="card-title">Contacto general:</h5>',
    },
    {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
        {
          className: 'col-4',
          key: 'phone',
          type: 'input',
          props: {
            label: 'Teléfono',
            placeholder: '912-345-678',
          },
        },
        {
          className: 'col-4',
          key: 'email',
          type: 'input',
          props: {
            label: 'Email',
            placeholder: 'info@empresa.com',
          },
        },
      ]
    }
  ];

  constructor(
    private thirdpartyService: ThirdpartyService,
    private router: Router
  ) { }

  onSubmit(model: any) {
    this.thirdpartyService.addThirdparty(model).subscribe(res => {
      console.log(res);
      this.router.navigate(['/thirdparty/list']);
    });
  }
}
