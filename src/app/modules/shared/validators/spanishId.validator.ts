import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function spanishIdValidator(control: AbstractControl): ValidationErrors | null {

    if (!control.value) {
        return null; // Don't validate empty value
    }

    const value = control.value.trim().toUpperCase();
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

    // Validate DNI
    if (dniRegex.test(value)) {
      return isValidDni(value) ? null : { 'id': true };
    }

    // Validate NIE
    if (nieRegex.test(value)) {
      return isValidNie(value) ? null : { 'id': true };
    }

    // Validate CIF
    if (cifRegex.test(value)) {
      return isValidCif(value) ? null : { 'id': true };
    }

    return { 'id': true }; // Not a valid DNI, NIE, or CIF
}

function isValidDni(dni: string): boolean {
  const letter = dni.charAt(8);
  const charIndex = parseInt(dni.substring(0, 8)) % 23;
  const validChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
  return validChars.charAt(charIndex) === letter;
}

function isValidNie(nie: string): boolean {
    const niePrefixes = { 'X': 0, 'Y': 1, 'Z': 2 };
    let nieLetter = nie.charAt(0) as keyof typeof niePrefixes;
    let nieNumber = niePrefixes[nieLetter] + nie.substring(1, 8);
    let charIndex = parseInt(nieNumber) % 23;
    let validChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
    let letter = nie.charAt(8);

    return validChars.charAt(charIndex) === letter;
}

function isValidCif(cif: string): boolean {
    const controlChar = cif.charAt(cif.length - 1);
    const body = cif.substring(1, cif.length - 1);
    let sumA = 0;
    let sumB = 0;

    for (let i = 0; i < body.length; i++) {
        if (i % 2 === 0) { // Even positions (considering 0 as first position)
            const aux = (parseInt(body.charAt(i), 10) * 2).toString();
            sumB += parseInt(aux.charAt(0), 10) + (aux.length > 1 ? parseInt(aux.charAt(1), 10) : 0);
        } else { // Odd positions
            sumA += parseInt(body.charAt(i), 10);
        }
    }

    const total = sumA + sumB;
    const lastDigitTotal = parseInt(total.toString().charAt(total.toString().length - 1), 10);
    const controlDigit = lastDigitTotal === 0 ? 0 : (10 - lastDigitTotal);

    const controlIsNumber = /^[ABEH]/.test(cif);
    const controlIsLetter = /^[KPQS]/.test(cif);
    const validControlLetter = 'JABCDEFGHI'.charAt(controlDigit);

    if (controlIsNumber) {
        return controlChar === controlDigit.toString();
    } else if (controlIsLetter) {
        return controlChar === validControlLetter;
    } else {
        return controlChar === controlDigit.toString() || controlChar === validControlLetter;
    }
}

export function spanishIdValidationMessage(error: any, field: FormlyFieldConfig) {
    return `"${field.formControl!.value}" no es un NIF, CIF, NIE o DNI válido`;
}
