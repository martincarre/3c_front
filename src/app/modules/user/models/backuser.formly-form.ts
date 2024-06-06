import { Injector } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { UserService } from "../services/user.service";
import { SpinnerService } from "src/app/core/services/spinner.service";

// Todo change to function returning FormlyFieldConfig[]
export function createBackUserForm(injector: Injector): FormlyFieldConfig[] { 
    const userService = injector.get(UserService);
    const spinnerService = injector.get(SpinnerService);
    let checkEmailMessage = 'Parece que este email ya está en uso para otra cuenta de usuario';

    return [
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
            },
            modelOptions: {
                updateOn: 'blur',
            },
            asyncValidators: {
                checkExistence: {
                    expression: (control: AbstractControl, field: FormlyFieldConfig) => {
                        spinnerService.show();
                        return userService.checkUserEmailExists(control.value)
                            .then((result: any) => {
                                console.log(result);
                                spinnerService.hide();
                                return new Promise(resolve => resolve(result.data.success));
                                })
                            .catch((error: any) => {
                                spinnerService.hide();
                                return new Promise(resolve => resolve(false));
                            });
                    },
                    message: checkEmailMessage
                }
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
            modelOptions: {
                updateOn: 'blur',
            },
            expressions: {
                'props.disabled': 'formState.disabled',
            },
            asyncValidators: {
            }
        }
    ]   
    },
    ];
}

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