/**
 * @fileoverview Formatos predefinidos para el componente FormattedInput
 * @description Catálogo de formatos comunes listos para usar
 */

import { InputFormat } from './formatted-input.types';

// ===== FORMATOS PREDEFINIDOS =====

/** Formato para teléfonos mexicanos: 555 123 4567 */
export const PHONE_FORMAT: InputFormat = {
  type: 'phone',
  pattern: '### ### ####',
  mask: '### ### ####',
  maxLength: 10,
  allowedChars: 'numeric',
  placeholder: '555 123 4567',
  separators: [' '],
  validator: (value: string) => value.length === 10 && /^[0-9]{10}$/.test(value),
  errorMessage: 'Ingrese un teléfono válido de 10 dígitos'
};

/** Formato para tarjetas de crédito: 1234 5678 9012 3456 */
export const CREDIT_CARD_FORMAT: InputFormat = {
  type: 'creditCard',
  pattern: '#### #### #### ####',
  mask: '#### #### #### ####',
  maxLength: 16,
  allowedChars: 'numeric',
  placeholder: '1234 5678 9012 3456',
  separators: [' '],
  validator: (value: string) => value.length >= 13 && value.length <= 19 && /^[0-9]+$/.test(value),
  errorMessage: 'Ingrese un número de tarjeta válido'
};

/** Formato para código postal mexicano: 12345 */
export const POSTAL_CODE_FORMAT: InputFormat = {
  type: 'postalCode',
  pattern: '#####',
  mask: '#####',
  maxLength: 5,
  allowedChars: 'numeric',
  placeholder: '12345',
  separators: [],
  validator: (value: string) => value.length === 5 && /^[0-9]{5}$/.test(value),
  errorMessage: 'Ingrese un código postal válido de 5 dígitos'
};

/** Formato para código postal extendido: 12345-6789 */
export const POSTAL_CODE_EXTENDED_FORMAT: InputFormat = {
  type: 'postalCode',
  pattern: '#####-####',
  mask: '#####-####',
  maxLength: 9,
  allowedChars: 'numeric',
  placeholder: '12345-6789',
  separators: ['-'],
  validator: (value: string) => /^[0-9]{5}$/.test(value) || /^[0-9]{9}$/.test(value),
  errorMessage: 'Ingrese un código postal válido'
};

/** Formato para fechas: DD/MM/YYYY */
export const DATE_FORMAT: InputFormat = {
  type: 'date',
  pattern: '##/##/####',
  mask: 'DD/MM/YYYY',
  maxLength: 8,
  allowedChars: 'numeric',
  placeholder: 'DD/MM/YYYY',
  separators: ['/'],
  validator: (value: string) => {
    if (value.length !== 8) return false;
    const day = parseInt(value.slice(0, 2));
    const month = parseInt(value.slice(2, 4));
    const year = parseInt(value.slice(4, 8));
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Validación básica de fecha
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  },
  errorMessage: 'Ingrese una fecha válida (DD/MM/YYYY)'
};

/** Formato para RFC mexicano: ABCD123456ABC */
export const RFC_FORMAT: InputFormat = {
  type: 'rfc',
  pattern: 'AAAA######AAA',
  mask: 'AAAA######AAA',
  maxLength: 13,
  allowedChars: 'alphanumeric',
  customCharValidator: /^[A-Z0-9]$/,
  placeholder: 'ABCD123456ABC',
  separators: [],
  validator: (value: string) => {
    // RFC: 4 letras + 6 números + 3 alfanuméricos
    return value.length === 13 && 
           /^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/.test(value);
  },
  errorMessage: 'Ingrese un RFC válido (13 caracteres)'
};

/** Formato para CURP mexicano: ABCD123456HIJKLM12 */
export const CURP_FORMAT: InputFormat = {
  type: 'curp',
  pattern: 'AAAA######AAAAAA##',
  mask: 'AAAA######AAAAAA##',
  maxLength: 18,
  allowedChars: 'alphanumeric',
  customCharValidator: /^[A-Z0-9]$/,
  placeholder: 'ABCD123456HIJKLM12',
  separators: [],
  validator: (value: string) => {
    // CURP: 4 letras + 6 números + 6 letras + 2 números
    return value.length === 18 && 
           /^[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}$/.test(value);
  },
  errorMessage: 'Ingrese una CURP válida (18 caracteres)'
};

// ===== MAPA DE FORMATOS PREDEFINIDOS =====
export const PREDEFINED_FORMATS: Record<string, InputFormat> = {
  phone: PHONE_FORMAT,
  creditCard: CREDIT_CARD_FORMAT,
  postalCode: POSTAL_CODE_FORMAT,
  postalCodeExtended: POSTAL_CODE_EXTENDED_FORMAT,
  date: DATE_FORMAT,
  rfc: RFC_FORMAT,
  curp: CURP_FORMAT
};

// ===== FUNCIONES HELPER =====

/**
 * Obtiene un formato predefinido por su clave
 * @param formatKey Clave del formato predefinido
 * @returns InputFormat correspondiente o undefined si no existe
 */
export function getPredefinedFormat(formatKey: string): InputFormat | undefined {
  return PREDEFINED_FORMATS[formatKey];
}

/**
 * Lista todas las claves de formatos predefinidos disponibles
 * @returns Array con las claves de todos los formatos predefinidos
 */
export function getAvailableFormats(): string[] {
  return Object.keys(PREDEFINED_FORMATS);
}

/**
 * Crea un formato personalizado básico
 * @param config Configuración básica del formato
 * @returns InputFormat personalizado
 */
export function createCustomFormat(config: {
  pattern: string;
  maxLength: number;
  allowedChars: 'numeric' | 'alphabetic' | 'alphanumeric';
  placeholder: string;
  separators?: string[];
  validator?: (value: string) => boolean;
  errorMessage?: string;
}): InputFormat {
  return {
    type: 'custom',
    pattern: config.pattern,
    mask: config.pattern,
    maxLength: config.maxLength,
    allowedChars: config.allowedChars,
    placeholder: config.placeholder,
    separators: config.separators || [],
    validator: config.validator,
    errorMessage: config.errorMessage || 'Formato inválido'
  };
}