export const signupFormFields: any = [
    {
        className: 'section-label',
        template: '<h5 class="card-title">Datos personales:</h5>',
    },
    // Sign Up Form
    {
      fieldGroupClassName: 'row',
      fieldGroup: 
      [
          {
            className: 'col-lg-6 col-12',
            key: 'idNumber',
            type: 'input',
            defaultValue: null,
            props: {
                label: 'DNI / NIE',
                placeholder: '12345678Z / X1234567Z',
                required: true, 
            },
            validators: {
                validation: ['id']
            },
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
                    placeholder: 'Nombre(s) (como en tu DNI/NIE)',
                    required: true, 
                },
        },
        {
            className: 'col-lg-6 col-12',
            key: 'surname',
            type: 'input',
            defaultValue: null,
            props: {
                label: 'Apellidos',
                placeholder: 'Apellidos (como en tu DNI/NIE)',
                required: true,
            },
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
    }
   ]   
  },
  {
    className: 'section-label',
    template: '<hr /><h5 class="card-title">Contraseña:</h5>',
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
                defaultValue: null,
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
                defaultValue: null,
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
        template: '<hr />',
    },
    // {
    //     key: 'gdpr',
    //     type: 'checkbox',
    //     defaultValue: false,
    //     props: {
    //         label: 'Acepto que 3c realice el envío de mis datos a terceras entidades con las que 3c mantenga acuerdos comerciales (afiliados) y consulta por 3c o sus afiliados a sistemas externos de información crediticia.',
    //         required: true,
    //     },
    // },
    // {
    //     key: 'financialSecurity',
    //     type: 'checkbox',
    //     defaultValue: false,
    //     props: {
    //         formCheck: 'custom-switch',
    //         label: 'Consiento que 3c y sus afiliados consulten en la Tesorería General de la Seguridad Social la información sobre mi actividad económica con la finalidad descrita en el apartado.',
    //         required: true,
    //     },
    // },
    // {
    //     key: 'commercialCommunications',
    //     type: 'checkbox',
    //     defaultValue: false,
    //     props: {
    //         label: 'Acepto el envío de comunicaciones comerciales sobre productos de 3c, su grupo y/o sus afiliados, previo realización de un perfilado de mis datos y consulta a sistemas externos de información crediticia',
    //     },
    // },
];