/**
 * @fileoverview Motor de formateo para el componente FormattedInput
 * @description Clase que maneja toda la lógica de formateo, validación y extracción de valores
 */

import { InputFormat, FormattedInputState, FormatterConfig } from './formatted-input.types';

export class FormatterEngine {
  private format: InputFormat;
  private config: FormatterConfig;

  constructor(format: InputFormat, config: Partial<FormatterConfig> = {}) {
    this.format = format;
    this.config = {
      format,
      emitFormatted: false,
      realTimeFormatting: true,
      allowSeparatorInput: true,
      autoValidate: true,
      ...config
    };
  }

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Formatea un valor según el patrón definido
   * @param rawValue Valor sin formato
   * @returns Valor formateado
   */
  formatValue(rawValue: string): string {
    if (!rawValue) return '';

    // Si hay formateador personalizado, usarlo
    if (this.format.customFormatter) {
      return this.format.customFormatter(rawValue);
    }

    return this.applyPatternFormatting(rawValue);
  }

  /**
   * Extrae el valor crudo de un valor formateado
   * @param formattedValue Valor formateado
   * @returns Valor sin formato
   */
  extractRawValue(formattedValue: string): string {
    if (!formattedValue) return '';

    // Si hay extractor personalizado, usarlo
    if (this.format.customExtractor) {
      return this.format.customExtractor(formattedValue);
    }

    return this.removeSeparators(formattedValue);
  }

  /**
   * Valida si un carácter es permitido según el formato
   * @param char Carácter a validar
   * @param position Posición en el valor crudo
   * @returns true si el carácter es válido
   */
  isCharAllowed(char: string, position: number): boolean {
    // Validador personalizado tiene prioridad
    if (this.format.customCharValidator) {
      return this.format.customCharValidator.test(char);
    }

    switch (this.format.allowedChars) {
      case 'numeric':
        return /^[0-9]$/.test(char);
      case 'alphabetic':
        return /^[A-Za-z]$/.test(char);
      case 'alphanumeric':
        return /^[A-Za-z0-9]$/.test(char);
      default:
        return true;
    }
  }

  /**
   * Valida si el valor completo es válido según el formato
   * @param rawValue Valor sin formato a validar
   * @returns true si es válido
   */
  isValueValid(rawValue: string): boolean {
    if (this.format.validator) {
      return this.format.validator(rawValue);
    }

    // Validación básica por longitud
    return rawValue.length === this.format.maxLength;
  }

  /**
   * Procesa la entrada del usuario y retorna el nuevo estado
   * @param inputValue Valor del input
   * @param currentState Estado actual
   * @returns Nuevo estado del componente
   */
  processInput(inputValue: string, currentState: FormattedInputState): FormattedInputState {
    // Extraer valor crudo
    const rawValue = this.extractRawValue(inputValue);
    
    // Aplicar límite de longitud
    const limitedRawValue = rawValue.slice(0, this.format.maxLength);
    
    // Formatear para display
    const displayValue = this.config.realTimeFormatting 
      ? this.formatValue(limitedRawValue)
      : limitedRawValue;

    // Validar
    const isValid = this.isValueValid(limitedRawValue);
    const isComplete = limitedRawValue.length === this.format.maxLength;

    return {
      rawValue: limitedRawValue,
      displayValue,
      isValid,
      isComplete,
      errorMessage: isValid ? undefined : this.format.errorMessage
    };
  }

  /**
   * Calcula la nueva posición del cursor después del formateo
   * @param oldPosition Posición anterior del cursor
   * @param oldValue Valor anterior
   * @param newValue Nuevo valor
   * @returns Nueva posición del cursor
   */
  calculateCursorPosition(oldPosition: number, oldValue: string, newValue: string): number {
    // Si el nuevo valor es más corto (eliminación)
    if (newValue.length < oldValue.length) {
      return Math.min(oldPosition, newValue.length);
    }

    // Si el nuevo valor es más largo (inserción)
    if (newValue.length > oldValue.length) {
      // Contar separadores añadidos antes de la posición del cursor
      const oldSeparators = this.countSeparatorsBefore(oldValue, oldPosition);
      const newSeparators = this.countSeparatorsBefore(newValue, oldPosition + (newValue.length - oldValue.length));
      
      return oldPosition + (newValue.length - oldValue.length) + (newSeparators - oldSeparators);
    }

    return oldPosition;
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Aplica el formateo basado en el patrón
   * @param rawValue Valor sin formato
   * @returns Valor formateado
   */
  private applyPatternFormatting(rawValue: string): string {
    const pattern = this.format.pattern;
    let formatted = '';
    let rawIndex = 0;

    for (let i = 0; i < pattern.length && rawIndex < rawValue.length; i++) {
      const patternChar = pattern[i];
      
      if (this.isPatternPlaceholder(patternChar)) {
        // Es un placeholder, insertar el carácter del valor
        formatted += rawValue[rawIndex];
        rawIndex++;
      } else {
        // Es un separador, insertarlo tal como está
        formatted += patternChar;
      }
    }

    return formatted;
  }

  /**
   * Remueve los separadores de un valor formateado
   * @param formattedValue Valor formateado
   * @returns Valor sin separadores
   */
  private removeSeparators(formattedValue: string): string {
    let cleanValue = formattedValue;
    
    // Remover todos los separadores definidos
    this.format.separators.forEach(separator => {
      cleanValue = cleanValue.split(separator).join('');
    });

    // Filtrar solo caracteres permitidos
    return cleanValue.split('').filter(char => 
      this.isCharAllowed(char, 0)
    ).join('');
  }

  /**
   * Verifica si un carácter del patrón es un placeholder
   * @param char Carácter del patrón
   * @returns true si es placeholder
   */
  private isPatternPlaceholder(char: string): boolean {
    return char === '#' || char === 'A' || char === '*';
  }

  /**
   * Cuenta los separadores antes de una posición específica
   * @param value Valor a analizar
   * @param position Posición límite
   * @returns Número de separadores antes de la posición
   */
  private countSeparatorsBefore(value: string, position: number): number {
    let count = 0;
    for (let i = 0; i < Math.min(position, value.length); i++) {
      if (this.format.separators.includes(value[i])) {
        count++;
      }
    }
    return count;
  }

  // ===== GETTERS Y SETTERS =====

  /**
   * Obtiene el formato actual
   */
  getFormat(): InputFormat {
    return this.format;
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): FormatterConfig {
    return this.config;
  }

  /**
   * Actualiza el formato
   * @param newFormat Nuevo formato a aplicar
   */
  updateFormat(newFormat: InputFormat): void {
    this.format = newFormat;
    this.config.format = newFormat;
  }

  /**
   * Actualiza la configuración
   * @param newConfig Nueva configuración
   */
  updateConfig(newConfig: Partial<FormatterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene el valor a emitir según la configuración
   * @param state Estado actual del componente
   * @returns Valor a emitir (formateado o crudo)
   */
  getEmitValue(state: FormattedInputState): string {
    return this.config.emitFormatted ? state.displayValue : state.rawValue;
  }

  /**
   * Obtiene el placeholder efectivo
   * @returns Placeholder a mostrar
   */
  getPlaceholder(): string {
    return this.format.placeholder;
  }

  /**
   * Obtiene la longitud máxima del input formateado
   * @returns Longitud máxima del valor formateado
   */
  getMaxDisplayLength(): number {
    // Calcular longitud del patrón completo
    return this.format.pattern.length;
  }
}