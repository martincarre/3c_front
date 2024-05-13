export const backUserFormFields: any = [
    {
        className: 'section-label',
        template: '<h5 class="card-title">Datos personales:</h5>',
    },
    // BackUser Form
    {
        fieldGroupClassName: 'row',
        fieldGroup: [
            {
                className: 'col-lg-6 col-12',
                key: 'role',
                type: 'select',
                defaultValue: 'partner',
                props: {
                    label: 'Role',
                    options: [
                        { label: 'Socio', value: 'partner' },
                        { label: 'Moderador', value: 'moderator' },
                    ],
                    required: true, 
                },
                expressions: 
                {
                    'props.disabled': '!formState.admin || formState.disabled',
                }
            },
            {
                className: 'col-lg-6 col-12',
                key: 'partner',
                type: 'typeahead',
                props: {
                  label: 'Partner',
                  placeholder: 'Buscar un proveedor',
                  typeSearched: 'partner',
                  required: true,
                },
                expressions: 
                {   
                    hide: 'model.role !== "partner"',
                    'props.disabled': 'formState.disabled',
                }
            },
        ]
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-lg-6 col-12',
                key: 'name',
                type: 'input',
                defaultValue: null,
                props: {
                    label: 'Nombre(s)',
                    placeholder: 'Nombre(s)',
                    required: true, 
                },
                expressions: {
                    'props.disabled': 'formState.disabled',
                }
        },
        {
            className: 'col-lg-6 col-12',
            key: 'surname',
            type: 'input',
            defaultValue: null,
            props: {
                label: 'Apellidos',
                placeholder: 'Apellido(s)',
                required: true,
            },
            expressions: {
                'props.disabled': 'formState.disabled',
            }
        }
    ]
  },
  {
  fieldGroupClassName: 'row',
  fieldGroup: 
  [
    {
        className: 'col-lg-6 col-12',
        key: 'email',
        type: 'input',
        defaultValue: null,
        props: {
            label: 'Dirección de email',
            placeholder: 'juanperez@ejemplo.com',
            required: true,
        },
        expressions: {
            'props.disabled': 'formState.disabled',
        }
    },
    {
        className: 'col-lg-6 col-12',
        key: 'mobile',
        type: 'input',
        defaultValue: null,
        props: {
            label: 'Número de teléfono móvil',
            placeholder: '654 321 098',
            required: true,
        },
        expressions: {
            'props.disabled': 'formState.disabled',
        }
    }
   ]   
  },
];

export const backUserConfirmationFields: any = [
    {
        className: 'section-label',
        template: '<hr /><h5 class="card-title">Confirmación de email:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-lg-6 col-12',
                key: 'email',
                type: 'input',
                props: {
                    label: 'Dirección de email',
                    placeholder: 'juan@example.com',
                    required: true,
                }
            }
            
        ]
    },
    {
        className: 'section-label',
        template: '<h5 class="card-title">Contraseña:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        validators: {
            validation: [{ name: 'fieldMatch', options: { errorPath: 'passwordConfirm' } }],
        },    
        fieldGroup: 
        [
            {
                className: 'col-lg-6 col-12',
                key: 'password',
                type: 'input',
                props: {
                    label: 'Contraseña',
                    placeholder: 'La contraseña tiene que tener al menos 8 caracteres',
                    required: true,
                    minLength: 8,
                    type: 'password',
                },
            },
            {
                className: 'col-lg-6 col-12',
                key: 'passwordConfirm',
                type: 'input',
                props: {
                    label: 'Confirmar contraseña',
                    placeholder: 'Confirmar contraseña',
                    required: true,
                    type: 'password',
                },
            }
        ]
    },
    {
        className: 'section-label',
        template: '<hr/><h5 class="card-title">Condiciones de uso:</h5>',
    },
    {
        fieldGroupClassName: 'row',
        fieldGroup: 
        [
            {
                className: 'col-lg-6 col-12',
                key: 'terms',
                type: 'checkbox',
                defaultValue: true,
                templateOptions: {
                    label: 'Acepto los términos y condiciones',
                    required: true,
                }
            }
        ]
    }
];