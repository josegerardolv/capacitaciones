import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

// RFC: 12-13 chars depending on person/entity, validate structure
export const rfcValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control || control.value == null || control.value === '') return null;
  const value = control.value.toString().toUpperCase();
  const pattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/;
  return pattern.test(value) ? null : { rfc: true };
};

// CURP validator (Mexico)
export const curpValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control || control.value == null || control.value === '') return null;
  const value = control.value.toString().toUpperCase();
  const pattern = /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
  return pattern.test(value) ? null : { curp: true };
};

// NSS validator: numeric 11 digits
export const nssValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control || control.value == null || control.value === '') return null;
  const digitsOnly = control.value.toString().replace(/\D/g, '');
  return digitsOnly.length === 11 ? null : { nss: true };
};
