import { FormlyFieldConfig } from "@ngx-formly/core";

export const thirdpartyFormlyForm: FormlyFieldConfig[] = [    
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
        {
            className: 'col-6',
            key: 'fiscalName',
            type: 'input',
            props: {
            label: 'Denominación social',
            placeholder: 'Empresa',
            required: true,
            },
            expressions: {
            'props.disabled': 'formState.disabled'
            }
        },
        {
            className: 'col-3',
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
        {
            className: 'col-3',
            key: 'type',
            type: 'select',
            props: {
            label: 'Tipo de persona jurídica',
            options: [
                { label: 'Sociedad Anonima', value: 'sa' },
                { label: 'Sociedad Limitada', value: 'sl' },
                { label: 'Autónomo', value: 'au' },
                { label: 'Otro', value: 'ot' },
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