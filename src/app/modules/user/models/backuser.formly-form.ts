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
                    hide: 'model.role !== "partner"'
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
];