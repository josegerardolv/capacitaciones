import { ValidatorFn } from '@angular/forms';

/**
 * Interfaz para mensajes de error personalizados
 */
export interface ValidationErrorMessages {
  [key: string]: string;
}

/**
 * Interfaz para especificaciones de validadores
 */
export interface ValidatorSpec {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  rfc?: boolean;
  curp?: boolean;
  nss?: boolean;
  mexicanPhone?: boolean;
  postalCode?: boolean;
  creditCard?: boolean;
  strongPassword?: boolean;
  url?: boolean;
  positiveNumber?: boolean;
  negativeNumber?: boolean;
  integer?: boolean;
  alphanumeric?: boolean;
  onlyLetters?: boolean;
  onlyNumbers?: boolean;
  noSpaces?: boolean;
  futureDate?: boolean;
  pastDate?: boolean;
  ageRange?: { min: number; max: number };
  passwordMatch?: string; // nombre del campo de contraseña a comparar
  custom?: ValidatorFn;
  messages?: ValidationErrorMessages;
}

/**
 * Tipos de validación disponibles
 */
export type ValidationType = 
  | 'required'
  | 'email'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'rfc'
  | 'curp'
  | 'nss'
  | 'mexicanPhone'
  | 'postalCode'
  | 'creditCard'
  | 'strongPassword'
  | 'url'
  | 'positiveNumber'
  | 'negativeNumber'
  | 'integer'
  | 'alphanumeric'
  | 'onlyLetters'
  | 'onlyNumbers'
  | 'noSpaces'
  | 'futureDate'
  | 'pastDate'
  | 'ageRange'
  | 'passwordMatch';

/**
 * Configuración para validador de edad
 */
export interface AgeRangeConfig {
  min: number;
  max: number;
}

/**
 * Configuración para validador de longitud
 */
export interface LengthConfig {
  min?: number;
  max?: number;
}

/**
 * Configuración para validador numérico
 */
export interface NumericConfig {
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  firstError?: string;
}

/**
 * Configuración de validador personalizado
 */
export interface CustomValidatorConfig {
  name: string;
  validator: ValidatorFn;
  message: string;
}