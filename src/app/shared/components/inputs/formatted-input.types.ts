/**
 * @fileoverview Tipos e interfaces para el componente FormattedInput
 * @description Define los formatos predefinidos, configuración personalizada y validadores
 */

// ===== TIPOS BÁSICOS =====
export type FormatType = 'phone' | 'creditCard' | 'postalCode' | 'date' | 'rfc' | 'curp' | 'custom';

export type ValidationCharacterType = 'numeric' | 'alphabetic' | 'alphanumeric' | 'custom';

// ===== INTERFAZ PRINCIPAL DE FORMATO =====
export interface InputFormat {
  /** Tipo de formato predefinido o 'custom' para formato personalizado */
  type: FormatType;
  
  /** Patrón de formato con # para dígitos, A para letras, * para alfanumérico */
  pattern: string;
  
  /** Máscara visual para mostrar al usuario (ej: "(###) ###-####") */
  mask: string;
  
  /** Longitud máxima del valor sin formato */
  maxLength: number;
  
  /** Tipo de caracteres permitidos */
  allowedChars: ValidationCharacterType;
  
  /** Regex personalizada para validar caracteres (opcional) */
  customCharValidator?: RegExp;
  
  /** Placeholder a mostrar cuando el input está vacío */
  placeholder: string;
  
  /** Separadores utilizados en el formato (se excluyen del valor crudo) */
  separators: string[];
  
  /** Función personalizada de formateo (opcional para formatos custom) */
  customFormatter?: (value: string) => string;
  
  /** Función personalizada de extracción de valor crudo (opcional) */
  customExtractor?: (formattedValue: string) => string;
  
  /** Validador personalizado para el valor completo */
  validator?: (value: string) => boolean;
  
  /** Mensaje de error personalizado */
  errorMessage?: string;
}

// ===== CONFIGURACIÓN DE FORMATEO =====
export interface FormatterConfig {
  /** Formato a aplicar */
  format: InputFormat;
  
  /** Si debe emitir el valor formateado (true) o crudo (false) */
  emitFormatted: boolean;
  
  /** Si debe aplicar formateo en tiempo real mientras se escribe */
  realTimeFormatting: boolean;
  
  /** Si debe permitir caracteres de separación al escribir */
  allowSeparatorInput: boolean;
  
  /** Si debe validar automáticamente el formato completo */
  autoValidate: boolean;
}

// ===== ESTADO DEL COMPONENTE =====
export interface FormattedInputState {
  /** Valor sin formato (solo caracteres válidos) */
  rawValue: string;
  
  /** Valor formateado para mostrar */
  displayValue: string;
  
  /** Si el formato está completo y válido */
  isValid: boolean;
  
  /** Si se ha alcanzado la longitud máxima */
  isComplete: boolean;
  
  /** Mensaje de error actual */
  errorMessage?: string;
}

// ===== EVENTOS =====
export interface FormattedInputEvent {
  /** Valor crudo */
  raw: string;
  
  /** Valor formateado */
  formatted: string;
  
  /** Estado de validez */
  isValid: boolean;
  
  /** Si está completo */
  isComplete: boolean;
  
  /** Formato aplicado */
  format: InputFormat;
}