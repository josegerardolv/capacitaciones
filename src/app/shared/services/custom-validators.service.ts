import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationErrorMessages {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  /**
   * Mensajes de error predeterminados en español
   */
  static readonly DEFAULT_ERROR_MESSAGES: ValidationErrorMessages = {
    required: 'Este campo es requerido',
    email: 'Ingrese un email válido',
    minlength: 'Debe tener al menos {requiredLength} caracteres',
    maxlength: 'No debe exceder {actualLength} caracteres',
    min: 'El valor mínimo es {min}',
    max: 'El valor máximo es {max}',
    pattern: 'El formato no es válido',
    rfc: 'RFC no válido. Formato: ABCD123456EFG',
    curp: 'CURP no válido. Formato: ABCD123456HEFGHI12',
    nss: 'NSS debe tener 11 dígitos',
    phone: 'Teléfono no válido',
    mexicanPhone: 'Teléfono mexicano no válido (10 dígitos)',
    postalCode: 'Código postal no válido (5 dígitos)',
    creditCard: 'Número de tarjeta de crédito no válido',
    strongPassword: 'La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
    url: 'URL no válida',
    positiveNumber: 'Debe ser un número positivo',
    negativeNumber: 'Debe ser un número negativo',
    integer: 'Debe ser un número entero',
    decimal: 'Debe ser un número decimal',
    alphanumeric: 'Solo se permiten letras y números',
    onlyLetters: 'Solo se permiten letras',
    onlyNumbers: 'Solo se permiten números',
    noSpaces: 'No se permiten espacios',
    dateFormat: 'Formato de fecha no válido',
    futureDate: 'La fecha debe ser futura',
    pastDate: 'La fecha debe ser pasada',
    age: 'La edad debe estar entre {min} y {max} años',
    passwordMatch: 'Las contraseñas no coinciden',
    passwordMismatch: 'Las contraseñas no coinciden',
    emailMismatch: 'Los correos no coinciden'
  };

  /**
   * Validador para RFC mexicano
   */
  static rfcValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const rfc = control.value.toString().toUpperCase();
      const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/;
      return rfcPattern.test(rfc) ? null : { rfc: true };
    };
    };

  /**
   * Validador para CURP mexicano
   */
  static curpValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const curp = control.value.toString().toUpperCase();
      const curpPattern = /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
      return curpPattern.test(curp) ? null : { curp: true };
    };
  }

  /**
   * Validador para NSS (Número de Seguridad Social)
   */
  static nssValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const digits = control.value.toString().replace(/\D/g, '');
      return digits.length === 11 ? null : { nss: true };
    };
  }

  /**
   * Validador para teléfono mexicano (10 dígitos)
   */
  static mexicanPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const phone = control.value.toString().replace(/\D/g, '');
      // Teléfono mexicano: 10 dígitos
      const phonePattern = /^[0-9]{10}$/;
      return phonePattern.test(phone) ? null : { mexicanPhone: true };
    };
  }

  /**
   * Validador para código postal mexicano (5 dígitos)
   */
  static postalCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const postalCode = control.value.toString().replace(/\D/g, '');
      const postalCodePattern = /^[0-9]{5}$/;
      return postalCodePattern.test(postalCode) ? null : { postalCode: true };
    };
  }

  /**
   * Validador para contraseña segura
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const password = control.value.toString();
      
      const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&#.]/.test(password)
      };

      const missing = [];
      if (!requirements.minLength) missing.push('Al menos 8 caracteres');
      if (!requirements.hasUppercase) missing.push('Una letra mayúscula');
      if (!requirements.hasLowercase) missing.push('Una letra minúscula');
      if (!requirements.hasNumber) missing.push('Un número');
      if (!requirements.hasSpecialChar) missing.push('Un carácter especial (@$!%*?&)');

      if (missing.length > 0) {
        return { 
          strongPassword: {
            missing: missing,
            message: `La contraseña debe contener:\n• ${missing.join('\n• ')}`
          }
        };
      }

      return null;
    };
  }

  /**
   * Validador para números de tarjeta de crédito (Algoritmo de Luhn)
   */
  static creditCardValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const cardNumber = control.value.toString().replace(/\D/g, '');
      
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        return { creditCard: true };
      }

      // Algoritmo de Luhn
      let sum = 0;
      let isEven = false;
      
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return (sum % 10 === 0) ? null : { creditCard: true };
    };
  }

  /**
   * Validador para números positivos
   */
  static positiveNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const num = parseFloat(control.value);
      return (!isNaN(num) && num > 0) ? null : { positiveNumber: true };
    };
  }

  /**
   * Validador para números negativos
   */
  static negativeNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const num = parseFloat(control.value);
      return (!isNaN(num) && num < 0) ? null : { negativeNumber: true };
    };
  }

  /**
   * Validador para números enteros
   */
  static integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const num = parseFloat(control.value);
      return (!isNaN(num) && Number.isInteger(num)) ? null : { integer: true };
    };
  }

  /**
   * Validador para caracteres alfanuméricos únicamente
   */
  static alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const alphanumericPattern = /^[a-zA-Z0-9]*$/;
      return alphanumericPattern.test(control.value) ? null : { alphanumeric: true };
    };
  }

  /**
   * Validador para solo letras
   */
  static onlyLettersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const lettersPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
      return lettersPattern.test(control.value) ? null : { onlyLetters: true };
    };
  }

  /**
   * Validador para solo números
   */
  static onlyNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const numbersPattern = /^[0-9]*$/;
      return numbersPattern.test(control.value) ? null : { onlyNumbers: true };
    };
  }

  /**
   * Validador para no permitir espacios
   */
  static noSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      return control.value.toString().indexOf(' ') === -1 ? null : { noSpaces: true };
    };
  }

  /**
   * Validador para URL
   */
  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      try {
        new URL(control.value);
        return null;
      } catch {
        return { url: true };
      }
    };
  }

  /**
   * Validador para fecha futura
   */
  static futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate > today ? null : { futureDate: true };
    };
  }

  /**
   * Validador para fecha pasada
   */
  static pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate < today ? null : { pastDate: true };
    };
  }

  /**
   * Validador para rango de edad
   */
  static ageRangeValidator(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || control.value == null || control.value === '') return null;
      
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // age--;
      }
      
      if (age < minAge || age > maxAge) {
        return { age: { min: minAge, max: maxAge, actual: age } };
      }
      
      return null;
    };
  }

  /**
   * Validador para confirmar contraseña (aplicado al campo de confirmación)
   * @param passwordField Nombre del campo de contraseña a comparar
   */
  static passwordMatchValidator(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.parent) return null;
      
      const password = control.parent.get(passwordField);
      const confirmPassword = control;
      
      if (!password || !confirmPassword) return null;
      if (!password.value || !confirmPassword.value) return null;
      
      return password.value === confirmPassword.value ? null : { passwordMatch: true };
    };
  }

  /**
   * Validador para confirmar contraseña a nivel de FormGroup
   * @param passwordField Nombre del campo de contraseña
   * @param confirmPasswordField Nombre del campo de confirmación de contraseña
   */
  static passwordsMatchValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (!formGroup || !formGroup.get) return null;
      
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmPasswordField);
      
      if (!password || !confirmPassword) return null;
      if (!password.value || !confirmPassword.value) return null;
      
      if (password.value !== confirmPassword.value) {
        // Establecer el error en el campo de confirmación
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        // Limpiar el error si las contraseñas coinciden
        if (confirmPassword.hasError('passwordMismatch')) {
          const errors = { ...confirmPassword.errors };
          delete errors['passwordMismatch'];
          const hasOtherErrors = Object.keys(errors).length > 0;
          confirmPassword.setErrors(hasOtherErrors ? errors : null);
        }
        return null;
      }
    };

  }

  /**
   * Validador para confirmar que dos campos de email coincidan.
   * @param emailField Nombre del campo de email a comparar
   */
  static emailMatchValidator(emailField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.parent) return null;

      const emailCtrl = control.parent.get(emailField);
      const confirmCtrl = control;
      if (!emailCtrl || !confirmCtrl) return null;

      const emailVal = (emailCtrl.value ?? '').toString().trim().toLowerCase();
      const confirmVal = (confirmCtrl.value ?? '').toString().trim().toLowerCase();

      // Si el campo de confirmación está vacío, no añadir error personalizado (required/email lo hará)
      if (!confirmVal) {
        // Si existe previamente el error emailMismatch, limpiarlo
        if (confirmCtrl.hasError('emailMismatch')) {
          const errs = { ...(confirmCtrl.errors || {}) };
          delete errs['emailMismatch'];
          confirmCtrl.setErrors(Object.keys(errs).length ? errs : null);
        }
        return null;
      }

      if (emailVal !== confirmVal) {
        return { emailMismatch: true };
      }

      // Si coinciden, devolver null (otros validadores seguirán aplicándose)
      return null;
    };

  }

  /**
   * Obtiene el mensaje de error para un tipo de validación específico
   */
  static getErrorMessage(errorType: string, errorValue?: any, customMessages?: ValidationErrorMessages): string {
    const messages = { ...this.DEFAULT_ERROR_MESSAGES, ...customMessages };
    
    // Manejo especial para strongPassword con información detallada
    if (errorType === 'strongPassword' && errorValue && errorValue.message) {
      return errorValue.message;
    }
    
    let message = messages[errorType] || `Error de validación: ${errorType}`;
    
    // Reemplazar placeholders en el mensaje
    if (errorValue && typeof errorValue === 'object') {
      Object.keys(errorValue).forEach(key => {
        if (key !== 'message' && key !== 'missing') {
          message = message.replace(`{${key}}`, errorValue[key]);
        }
      });
    }
    
    return message;
  }

  /**
   * Obtiene todos los mensajes de error para un control
   */
  static getAllErrorMessages(control: AbstractControl, customMessages?: ValidationErrorMessages): string[] {
    if (!control || !control.errors) return [];
    
    return Object.keys(control.errors).map(errorType => 
      this.getErrorMessage(errorType, control.errors![errorType], customMessages)
    );
  }

  /**
   * Obtiene el primer mensaje de error para un control
   */
  static getFirstErrorMessage(control: AbstractControl, customMessages?: ValidationErrorMessages): string | null {
    const messages = this.getAllErrorMessages(control, customMessages);
    return messages.length > 0 ? messages[0] : null;
  }
}