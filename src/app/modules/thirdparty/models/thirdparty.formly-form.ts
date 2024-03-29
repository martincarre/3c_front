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
                        { label: 'Partner', value: 'partner' },
                    ],
                    required: true,
                },
                expressions: {
                    hide: 'formState.currUserCustomer',
                    'props.disabled': 'formState.disabled',
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
                validators: {
                    validation: ['id']
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
                key: 'companyType',
                type: 'select',
                defaultValue: 'sociedad_anonima',
                props: {
                    label: 'Forma jurídica',
                    options: [
                        { label: 'Sociedad Anonima', value: 'sociedad_anonima' },
                        { label: 'Sociedad Limitada', value: 'sociedad_limitada' },
                        { label: 'Autónomo', value: 'autonomo' },
                        { label: 'Otro', value: 'desc_otro' },
                    ],
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
        template: '<hr /><h5 class="card-title">Dirección fiscal:</h5><p>Que usarémos tanto para la emisión del contrato como de las facturas</p>',
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
            defaultValue: '',
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
                },
                expressions: {
                'props.disabled': 'formState.disabled'
                }
            },
        ],
    }, 
    // IBAN
    {
        className: 'section-label',
        template: '<hr /><h5 class="card-title">Datos bancarios:</h5><p>A partir de esta cuenta, domiciliaremos las cuotas de renting</p>',
    },
    // Tel and email
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-lg-4 col-12',
                key: 'Iban',
                type: 'input',
                props: {
                    label: 'IBAN',
                    placeholder: 'ESXX XXXX XXXX XXXX XXXX XXXX',
                    addonLeft: {
                        class:'bi-bank2'
                    },
                    required: true,
                },
                expressions: {
                'props.disabled': 'formState.disabled'
                }
            },
        ]
    }
    //     {
    //         className: 'col-lg-6 col-12',
    //         key: 'email',
    //         type: 'input',
    //         props: {
    //             label: 'Email',
    //             placeholder: 'info@empresa.com',
    //             addonRight: {
    //                 text: '@'
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     ]
    // },
    // Fax and website
    // {
    //     fieldGroupClassName: 'row',
    //     fieldGroup: 
    //     [
    //     {
    //         className: 'col-lg-6 col-12',
    //         key: 'website',
    //         type: 'input',
    //         props: {
    //             label: 'Web',
    //             placeholder: 'www.empresa.com',
    //             addonRight: {
    //                 class:'bi-globe'
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     {
    //         className: 'col-lg-6 col-12',
    //         key: 'fax',
    //         type: 'input',
    //         props: {
    //             label: 'Fax',
    //             placeholder: '912-345-678',
    //             addonRight: 
    //             {
    //                 class: 'bi-printer-fill'
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     ]
    // },
    // // Additionnal info - Economic / Financial
    // {
    //     className: 'section-label',
    //     template: '<hr /><h5 class="card-title">Información adicional:</h5>',
    // },
    // {
    //     fieldGroupClassName: 'row',
    //     fieldGroup: 
    //     [
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'sales',
    //         type: 'input',
    //         props: {
    //             type: 'number',
    //             label: 'Ventas anuales',
    //             addonRight: {
    //                 text: '€',
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'equity',
    //         type: 'input',
    //         props: {
    //             type: 'number',
    //             label: 'Capital social',
    //             addonRight: {
    //                 text: '€',
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'latestFSDate',
    //         type: 'input',
    //         props: {
    //             type: 'text',
    //             label: 'Fecha último balance',
    //             addonRight: {
    //                 class:'bi-calendar-event-fill'
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     ]
    // },
    // {
    //     fieldGroupClassName: 'row',
    //     fieldGroup: 
    //     [
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'employees',
    //         type: 'input',
    //         props: {
    //             type: 'number',
    //             label: 'Nûmero de empleados',
    //             addonRight: {
    //                 class: 'bi-people-fill',
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'activityCode',
    //         type: 'input',
    //         props: {
    //             type: 'text',
    //             label: 'CNAE',
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     {
    //         className: 'col-lg-4 col-12',
    //         key: 'constitutionDate',
    //         type: 'input',
    //         props: {
    //             type: 'text',
    //             label: 'Fecha de constitución',
    //             addonRight: {
    //                 class:'bi-calendar-check-fill'
    //             }
    //         },
    //         expressions: {
    //         'props.disabled': 'formState.disabled'
    //         }
    //     },
    //     ]
    // },
];