import { AbstractControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

export function ibanValidator(control: AbstractControl): ValidationErrors | null {
    let iban = control.value;
    if (!iban) {
        return { 'iban': true };
    }
    // Remove spaces and convert to uppercase
    iban = iban.replace(/\s+/g, '').toUpperCase();
    
    // Check if the total length is correct as per the country code
    const ibanLengths: { [key: string]: number } = {
        'AL': 28, 'AD': 24, 'AT': 20, 'AZ': 28, 'BH': 22, 'BE': 16, 'BA': 20,
        'BR': 29, 'BG': 22, 'CR': 22, 'HR': 21, 'CY': 28, 'CZ': 24, 'DK': 18,
        'DO': 28, 'EE': 20, 'FO': 18, 'FI': 18, 'FR': 27, 'GE': 22, 'DE': 22,
        'GI': 23, 'GR': 27, 'GL': 18, 'GT': 28, 'HU': 28, 'IS': 26, 'IE': 22,
        'IL': 23, 'IT': 27, 'JO': 30, 'KZ': 20, 'XK': 20, 'KW': 30, 'LV': 21,
        'LB': 28, 'LI': 21, 'LT': 20, 'LU': 20, 'MT': 31, 'MR': 27, 'MU': 30,
        'MC': 27, 'MD': 24, 'ME': 22, 'NL': 18, 'MK': 19, 'NO': 15, 'PK': 24,
        'PS': 29, 'PL': 28, 'PT': 25, 'QA': 29, 'RO': 24, 'SM': 27, 'SA': 24,
        'RS': 22, 'SK': 24, 'SI': 19, 'ES': 24, 'SE': 24, 'CH': 21, 'TN': 24,
        'TR': 26, 'AE': 23, 'GB': 22, 'VG': 24
    };

    const countryCode = iban.slice(0, 2);
    if (!ibanLengths[countryCode] || iban.length !== ibanLengths[countryCode]) {
        return { 'iban': true };
    }

    // Move the four initial characters to the end of the string
    iban = iban.slice(4) + iban.slice(0, 4);
    
    // Replace each letter in the string with two digits
    iban = iban.replace(/[A-Z]/g, (match: any) => {
        return (match.charCodeAt(0) - 55).toString();
    });

    // Convert the string to an integer and perform the MOD-97-10 operation
    const matches = iban.match(/\d{1,7}/g);
    if (!matches) {
        return { 'iban': true };
    }

    const remainder = matches.reduce((acc: number, value: number) => {
        return (Number(acc + value) % 97).toString();
    }, '');

    return remainder === '1' ? null : { 'iban': true };
}

export function ibanValidationMessage(error: any, field: FormlyFieldConfig) {
    return `Pareciera que el IBAN introducido no es válido. Por favor, verifícalo y vuelve a intentarlo.`;
}
