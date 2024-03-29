import { FormlyFieldConfig } from "@ngx-formly/core";

export const operationForm: any = [
  // Title Econ
  {
    className: 'section-label',
    template: '<h5 class="card-title">Datos económicos:</h5>',
  },
  // Calculator switch
  {
    fieldGroupClassName: 'row',
    fieldGroup: 
      [
        {
          className: 'col-lg-6 col-12',
          key: 'quoteSelection',
          type: 'select',
          defaultValue: 'investment',
          props: { 
            label: 'Que deseas calcular?',
            options: [
              { label: 'Cuota', value: 'rent' },
              { label: 'Precio de venta', value: 'investment' },
            ],
          }
        }
      ]
  },
  // Basic Inputs (amount + duration)
  {
    fieldGroupClassName: 'row',
    fieldGroup: 
    [
      {
        className: 'col-lg-6 col-12',
        key: 'target',
        type: 'input',
        props: {
            type: 'number',
            addonRight: {
              text: '€',
            },
            min: 50,
            label: 'Target',
            required: true,
        },
        expressions: {
          'props.label': (field: any) => {
            const quoteSelection = field.form.controls.quoteSelection.value;
            if (quoteSelection === 'investment') {
              return 'Cuota deseada';
            } else {
              return 'Precio de venta deseado';
            }
          }
        }
      },
      {
        className: 'col-lg-3 col-12',
        key: 'tenor',
        type: 'select',
        defaultValue: 60,
        props: {
            type: 'number',
            options: [ 
              { label: '24', value: 24 },
              { label: '36', value: 36 },
              { label: '48', value: 48 },
              { label: '60', value: 60 },
              { label: '72', value: 72 },
            ],
            label: 'Plazo',
            required: true,
        },
      },
      
    ]
  },
  {
    className: 'section-label',
    template: '<hr />',
  }
];

export const operationsDetailsForm: FormlyFieldConfig[] = [
  // Title Ref
  {
    className: 'section-label',
    template: '<h5 class="card-title">Referencias de la operación:</h5>',
  },
  // Reference
  {   
    fieldGroupClassName: 'row',
    fieldGroup: 
      [
        {
          className: 'col-12',
          key: 'reference',
          type: 'input',
          defaultValue: null,
          props: {
            label: 'Referencia',
            placeholder: 'Operación para Juan Lopez',
            required: true,
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
      ]
  },
  // Partner
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-12',
        key: 'partner',
        type: 'typeahead',
        props: {
          label: 'Partner',
          placeholder: 'Buscar un proveedor',
          typeSearched: 'partner',
          required: true,
        }
      },
    ]
  },
  // Title Equipment
  {
    className: 'section-label',
    template: '<hr /><h5 class="card-title">Equipo:</h5>',
  },
  // Make and Model
  {   
  fieldGroupClassName: 'row',
  fieldGroup: 
    [
      {
        className: 'col-lg-6 col-12',
        key: 'make',
        type: 'input',
        defaultValue: null,
        props: {
          label: 'Marca',
          placeholder: 'Marca del equipo',
        },
        expressions: {
          'props.disabled': 'formState.disabled'
        }
      },
      {
        className: 'col-lg-6 col-12',
        key: 'model',
        type: 'input',
        defaultValue: null,
        props: {
          label: 'Modelo',
          placeholder: 'Model del equipo',
          required: false,
        },
        expressions: {
          'props.disabled': 'formState.disabled'
        }
      },
    ]
  },
  // Description or Message
  {
    fieldGroupClassName: 'row',
    fieldGroup: [
      {
        key: 'description',
        type: 'textarea',
        defaultValue: null,
        props: {
          label: 'Descripción adicional',
          placeholder: '',
          rows: 4,
        },
      },
    ]
  }
];

export const operationEconomicDetailsForm: FormlyFieldConfig[] = [
  // Title
  {
    className: 'section-label',
    template: '<h5 class="card-title">Datos económicos adicionales:</h5><hr />',
  },
  // Margin
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'margin',
        type: 'input',
        defaultValue: 6.5,
        props: {
          type: 'number',
          addonRight: {
            text: '%',
          },
          label: 'Margen',
          required: true,
        },
      },
      
    ]
  },
  // RV
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'rv',
        type: 'input',
        defaultValue: 0,
        props: {
            type: 'number',
            min: 0,
            addonRight: {
              text: '€',
            },
            label: 'Valor Residual',
            required: true,
        },
        expressions: {
          hide: 'model.andOneRv',
        },
      }
    ]
  },
  // RV Switch
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup:
    [
      {
        className: 'col-lg-6 col-12',
        key: 'andOneRv',
        type: 'checkbox',
        defaultValue: false,
        props: {
          formCheck: 'inline-switch',
          label: 'VR última cuota',
          indeterminate: false,
        }
      },
    ]
  },
  // Rate
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'rate',
        type: 'input',
        props: {
          type: 'number',
          addonRight: {
            text: '%',
          },
          label: 'Tasa',
          required: true,
        },
        expressions: {
          hide: '!model.rateSwitch',
        },
      }
    ]
  },
  // Rate Switch
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'rateSwitch',
        type: 'checkbox',
        defaultValue: false,
        props: {
          formCheck: 'inline-switch',
          label: 'Tasa',
          indeterminate: false,
        }
      },
    ]
  },
  // Commission
  {
        fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'commission',
        type: 'input',
        defaultValue: 1,
        props: {
          type: 'number',
          addonRight: {
            text: '%',
          },
          label: 'Comisión',
          required: true,
        },
        expressions: {
          hide: '!model.comSwitch',
        },
      }
    ]
  },
  // Commission Switch
  {
    fieldGroupClassName: 'd-flex align-items-center justify-content-center',
    fieldGroup: [
      {
        className: 'col-lg-6 col-12',
        key: 'comSwitch',
        type: 'checkbox',
        defaultValue: false,
        props: {
          formCheck: 'inline-switch',
          label: 'Comisión',
          indeterminate: false,
        }
      },
    ]
  },  
];