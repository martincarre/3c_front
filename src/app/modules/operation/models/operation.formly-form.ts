import { FormlyFieldConfig } from "@ngx-formly/core";

export const operationDetailFormlyForm: FormlyFieldConfig[] = [
    {
        className: 'section-label',
        template: '<hr /><h5 class="card-title">Proveedor:</h5>',
    },    
    {   
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
        {
          className: 'col-8',
          key: 'supplierFiscalName',
          type: 'input',
          props: {
            label: 'Nombre del proveedor',
            placeholder: 'Empresa',
            required: true,

          },

          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
        {
          className: 'col-4',
          key: 'supplierFiscalId',
          type: 'input',
          props: {
            label: 'NIF/CIF',
            placeholder: 'A12345678',
            required: false,
          },
          expressions: {
            'props.disabled': 'formState.disabled'
          }
        },
      ]
    },
    {
      className: 'section-label',
      template: '<hr /><h5 class="card-title">Equipo:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-4',
                key: 'marketType',
                type: 'select',
                props: {
                  label: 'Tipo de mercado',
                  required: true,
                  options: [
                    { label: 'Médico', value: 'healthcare' },
                    { label: 'Industrial', value: 'industry' },
                  ],
                },
            }
        ]
    },
    {   
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
          {
            className: 'col-4',
            key: 'equipmentType',
            type: 'input',
            props: {
              label: 'Tipo de equipo',
              placeholder: 'Ecografo, TAC, etc.',
              required: true,
  
            },
  
            expressions: {
              'props.disabled': 'formState.disabled'
            }
          },
          {
            className: 'col-4',
            key: 'equipmentMake',
            type: 'input',
            props: {
              label: 'Marca del equipo',
              placeholder: 'GE, Philips, etc.',
              required: true,
            },
            expressions: {
              'props.disabled': 'formState.disabled'
            }
          },
          {
            className: 'col-3',
            key: 'equipmentModel',
            type: 'input',
            props: {
              label: 'Modelo',
              placeholder: 'Voluson E8, etc.',
              required: false,
            },
            expressions: {
              'props.disabled': 'formState.disabled'
            }
          },
        ]
    },
    {
      className: 'section-label',
      template: '<hr /><h5 class="card-title">Datos económicos:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-4',
                key: 'investment',
                type: 'input',
                props: {
                    type: 'number',
                    min: 1000,
                    label: 'Importe de la operación',
                    placeholder: '25,000.00 €',
                    required: true,
                },
            },
            {
                className: 'col-2',
                key: 'tenor',
                type: 'input',
                props: {
                    type: 'number',
                    min: 1,
                    max: 72,
                    placeholder: '60',
                    label: 'Plazo max. (meses)',
                    required: true,
                },
            },
            {
                className: 'col-2',
                key: 'rv',
                type: 'input',
                props: {
                    type: 'number',
                    min: 1,
                    max: 70,
                    placeholder: '15%',
                    label: 'VR max. (%)',
                    required: true,
                },
            },
            
        ]
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-2',
                key: 'margin',
                type: 'input',
                props: {
                    type: 'number',
                    min: 1,
                    max: 50,
                    placeholder: '6%',
                    label: 'Margen (%)',
                    required: true,
                },
            },
            {
                className: 'col-2',
                key: 'rent',
                type: 'input',
                props: {
                    type: 'number',
                    min: 50,
                    placeholder: '150.00€',
                    label: 'Cuota',
                    required: false,
                },
            },
        ]
    }
];

export const operationCompFormlyForm: FormlyFieldConfig[] = [
  {
    className: 'section-label',
    template: '<hr /><h5 class="card-title">Datos económicos:</h5>',
  },
  {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
          {
              className: 'col-4',
              key: 'fs',
              type: 'file',
              props: {
                label: 'Últimas cuentas anuales',
                placeholder: 'Seleccionar archivo',
              },
          },
          
      ]
  },
  {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
          {
              className: 'col-4',
              key: 'fs',
              type: 'file',
              props: {
                label: 'Últimas cuentas anuales',
                placeholder: 'Seleccionar archivo',
              },
          },
          
      ]
  },
];