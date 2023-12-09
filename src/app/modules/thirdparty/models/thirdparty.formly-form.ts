import { FormlyFieldConfig } from "@ngx-formly/core";

export const thirdpartyFormlyForm: FormlyFieldConfig[] = [   
    // Fiscal ID and tp type (client or supplier) 
    {
        fieldGroupClassName: 'row align-items-end justify-content-left',
        fieldGroup: [
            {
                className: 'col-lg-3 col-12',
                key: 'tpType',
                type: 'select',
                defaultValue: 'client',
                props: {
                    label: 'Tipo de tercero',
                    options: [
                        { label: 'Cliente', value: 'client' },
                        { label: 'Proveedor', value: 'supplier' },
                    ],
                    required: true,
                },
                expressions: {
                'props.disabled': 'formState.disabled'
                }
            },
            {
                className: 'col-lg-3 col-12',
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
    // Fiscal name and type
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
        {
            className: 'col-lg-6 col-12',
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
            className: 'col-lg-4 col-12',
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
    // Address street number, floor, door
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
    // Postal info - Postcode, city, state
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
        {
            className: 'col-lg-4 col-12',
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
            className: 'col-lg-4 col-12',
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
            className: 'col-lg-4 col-12',
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
    // Additionnal info - Contact
    {
        className: 'section-label',
        template: '<hr /><h5 class="card-title">Contacto general:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
        {
            className: 'col-lg-4 col-12',
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
            className: 'col-lg-4 col-12',
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