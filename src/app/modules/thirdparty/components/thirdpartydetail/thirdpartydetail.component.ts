import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { Thirdparty } from '../../models/thirdparty.model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-thirdpartydetail',
  templateUrl: './thirdpartydetail.component.html',
  styleUrls: ['./thirdpartydetail.component.scss']
})
export class ThirdpartydetailComponent implements OnInit, OnDestroy {
  createMode: boolean = true;
  currentId: string | undefined | null;
  editMode: boolean = false;
  private currentTP: Thirdparty | undefined;
  private tpSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();

  tpForm = new FormGroup({});
  model = {};
  title: string = 'Nuevo tercero';
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
          },
          expressions: {
            'props.disabled': 'formState.disabled'
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
          expressions: {
            'props.disabled': 'formState.disabled'
          }
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
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
        {
          key: 'addressComp',
          type: 'input',
          props: {
            label: 'Complemento',
            placeholder: 'Piso, puerta, etc.',
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
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
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
        {
          className: 'col-4',
          key: 'city',
          type: 'select',
          props: {
            label: 'Ciudad',
            options: [
              { label: 'Madrid', value: 'MAD'},
              { label: 'Barcelona', value: 'BCN'},
            ],
            required: true,
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
        {
          className: 'col-4',
          key: 'state',
          type: 'select',
          props: {
            label: 'Provincia',
            options: [
              { label: 'Madrid', value: 'MAD'},
              { label: 'Barcelona', value: 'BCN'},
            ],
            required: true,
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
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
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
        {
          className: 'col-4',
          key: 'email',
          type: 'input',
          props: {
            label: 'Email',
            placeholder: 'info@empresa.com',
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
      ]
    }
  ];

  formEditMode: FormlyFormOptions = {
    formState: {
      disabled: false,
    },
  };

  constructor(
    private thirdpartyService: ThirdpartyService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) {
      this.createMode = false;
      this.formEditMode.formState.disabled = true;
      this.fetchThirdParty(this.currentId);
    }
  }

  private fetchThirdParty(id: string): void {
    this.tpSub = this.thirdpartyService.fetchThirdPartyById(id)
      .subscribe((thirdparty: Thirdparty) => {
        this.currentTP = thirdparty;
        this.model = thirdparty;
        this.title = thirdparty.fiscalName;
      });
  }

  onEdit(): void {
    this.formEditMode.formState.disabled = !this.formEditMode.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    const tp = this.tpForm.value as Thirdparty;
    if (this.createMode) {
      this.submitSub = this.thirdpartyService.addThirdparty(tp)
      .subscribe(res => {
        this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
        console.log(res);
        this.router.navigate(['/thirdparty/list']);
      });
    }
    else { 
      this.submitSub = this.thirdpartyService.updateThirdparty(tp)
      .subscribe(res => {
        this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
        console.log(res);
        this.router.navigate(['/thirdparty/list']);
      });
    }
  }

  onClose(): void {
    this.router.navigate(['/thirdparty']);
  }

  ngOnDestroy(): void {
    this.tpSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}
