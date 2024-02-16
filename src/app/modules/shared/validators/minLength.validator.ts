import { FormlyFieldConfig } from "@ngx-formly/core";

export function minLengthValidationMessages(error: any, field: FormlyFieldConfig) {
    return `Tiene que tener al menos ${field.props!['minLength']} caracteres`;
}