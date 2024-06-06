import { Injector } from "@angular/core";
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { InformaService } from "src/app/core/services/informa.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ThirdpartyService } from "../services/thirdparty.service";

export function createThirdpartyFormlyFormConfig(injector: Injector): FormlyFieldConfig[] {
    const informaService = injector.get(InformaService);
    const spinnerService = injector.get(SpinnerService);
    const tpService = injector.get(ThirdpartyService);
    let informaMessage: string = 'Error en la consulta con el servicio de gestion comercial';
    let fiscalIdCheckMessage: string = 'Error en la consulta con el servidor';
    return [   
        // Company Type and tp type (client or partner) 
        {
            fieldGroupClassName: 'row align-items-end justify-content-left',
            fieldGroup: [
                {
                    className: 'col-lg-2 col-12',
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
                        'props.disabled': 'formState.disabled || formState.currUserModerator',
                        defaultValue: 'formState.currUserModerator ? "partner" : "client"'
                    },
                },
                {
                    className: 'col-lg-3 col-12',
                    key: 'companyType',
                    type: 'select',
                    defaultValue: 'empresa',
                    props: {
                        label: 'Forma jurídica',
                        options: [
                            { label: 'Empresa', value: 'empresa' },
                            { label: 'Autónomo', value: 'autonomo' },
                        ],
                    },
                    expressions: {
                        'props.disabled': 'formState.disabled || formState.editMode',
                    },
                    hooks: {
                        onInit: (field: FormlyFieldConfig) => {
                            field.formControl?.valueChanges.subscribe((value) => {
                                if (value === 'autonomo' && !field.options?.formState.editMode) {
                                    const parentForm = field.formControl?.parent;
                                    if (parentForm) {
                                        // Clear all fields except tpType and companyType
                                        Object.keys(parentForm.controls).forEach(key => {
                                            if (key !== 'tpType' && key !== 'companyType' && parentForm.get(key)) {
                                                parentForm.get(key)!.reset();
                                            }
                                        });
                                    }
                                }
                            });
                        
                        }
                    }
                },
            ]
        },
        // Fiscal ID and Fiscal name 
        {
            fieldGroupClassName: 'row',
            fieldGroup: 
            [
                {
                    className: 'col-lg-2 col-12',
                    key: 'fiscalId',
                    type: 'input',
                    props: {
                        label: 'NIF/CIF',
                        placeholder: 'A12345678',
                        required: true,
                    },
                    modelOptions: {
                        updateOn: 'blur',
                    },
                    validators: {
                        validation: ['id']
                    },
                    asyncValidators: {
                        checkExistence: {
                            expression: (control: AbstractControl, field: FormlyFieldConfig) => {
                                if (!control.value) {
                                    return new Promise((resolve) => { resolve(false) });
                                }
                                
                                spinnerService.show();
                                return tpService.checkFiscalId(control.value)
                                    .then((res: any) => {
                                        spinnerService.hide();
                                        fiscalIdCheckMessage = res.data.message;
                                        return new Promise(resolve => {resolve(res.data.success)});
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        fiscalIdCheckMessage = 'Error en la consulta';
                                        return new Promise((resolve) => { resolve(false) });
                                    });
                            },
                            message: (error: any, field: FormlyFieldConfig) => { return fiscalIdCheckMessage; }
                        },
                        informTp: {
                            expression: (control: AbstractControl, field: FormlyFieldConfig) => {
                                
                                if (!control.value) {
                                    return new Promise((resolve) => { resolve(false) });
                                };
                                // if (field.model.options.formState.editMode) {
                                //     return new Promise((resolve) => { resolve(true) });
                                // }

                                if (field.model.companyType === 'autonomo') {
                                    return new Promise((resolve) => { resolve(true) });
                                };

                                if (field.model.companyType === 'empresa') {
                                    spinnerService.show();
                                    return informaService.getCompanyInfoByCif(control.value)
                                        .then((res: any) => {
                                            const resData = res.data;
                                            if (resData.success) {
                                                const parentForm = field.formControl?.parent;
                                                if (parentForm) {
                                                    Object.keys(parentForm.controls).forEach(key => {
                                                        if (key !== 'tpType' && key !== 'companyType' && key !== 'fiscalId' && parentForm.get(key) && resData.tpInfo[key]) {
                                                            parentForm.get(key)!.setValue(resData.tpInfo[key]);
                                                        }
                                                    });
                                                }
                                                informaMessage = resData.message;
                                                spinnerService.hide();
                                                return true;
                                            } else {
                                                informaMessage = resData.message;
                                                spinnerService.hide();
                                                return false;
                                            }
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            informaMessage = 'Error en la consulta';
                                            return new Promise((resolve) => { resolve(false) });
                                        });
                                };

                                return new Promise((resolve) => { resolve(true) });
                            },
                            message: (error: any, field: FormlyFieldConfig) => { return informaMessage;}
                        },
                    },
                    expressions: {
                        'props.disabled': 'formState.disabled || formState.editMode',
                    }
                },
                {
                    className: 'col-lg-3 col-12',
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
            ]
        },
        // Address street number, floor, door
        {
            className: 'section-label',
            template: '<hr /><h5 class="card-title">Dirección fiscal:</h5><p>Que usarémos tanto para la emisión del contrato como de las facturas. Es la dirección que aparece en el registro mercantil como domicilio de la persona jurídica.</p>',
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
                    type: 'input',
                    props: {
                        label: 'Municipio',
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
                        options: informaService.getStateList(),
                    },
                    expressions: {
                    'props.disabled': 'formState.disabled'
                    },
                    hooks: {
                        onInit: (field: FormlyFieldConfig) => {
                            informaService.fetchStateListAndPublishToSubscribers();
                        }
                    }
                },
            ],
        }, 
        // IBAN
        {
            className: 'section-label',
            template: '<hr /><h5 class="card-title">Datos bancarios:</h5><p>A partir de esta cuenta, domiciliaremos las cuotas de renting</p>',
            expressions: {
                hide: 'model.tpType === "partner"'
            }
        },
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
                        'props.disabled': 'formState.disabled',
                        hide: 'model.tpType === "partner"'
                    },
                    modelOptions: {
                        updateOn: 'blur',
                    },
                    validators: {
                        validation: ['iban']
                    }
                },
            ]
        },
    ];
}

