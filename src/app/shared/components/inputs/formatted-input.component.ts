/**
 * @fileoverview Componente FormattedInput - Input genérico con formateo dinámico
 * @description Componente reutilizable que aplica formatos automáticos a inputs
 * 
 * @example
 * // Teléfono básico
 * <app-formatted-input
 *   format="phone"
 *   label="Teléfono"
 *   controlName="telefono"
 *   required="true">
 * </app-formatted-input>
 * 
 * @example
 * // Tarjeta de crédito con valor formateado
 * <app-formatted-input
 *   format="creditCard"
 *   [emitFormatted]="true"
 *   label="Número de tarjeta"
 *   controlName="tarjeta">
 * </app-formatted-input>
 * 
 * @example
 * // Formato personalizado
 * <app-formatted-input
 *   [customFormat]="myCustomFormat"
 *   label="Código especial"
 *   controlName="codigo">
 * </app-formatted-input>
 */

import { 
  Component, Input, OnInit, OnDestroy, AfterViewInit, 
  ViewChild, ElementRef, Output, EventEmitter, 
  ChangeDetectorRef, ChangeDetectionStrategy, 
  forwardRef, Optional 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, ControlContainer, FormControl, 
  ControlValueAccessor, NG_VALUE_ACCESSOR 
} from '@angular/forms';

import { 
  InputFormat, FormattedInputState, FormattedInputEvent, 
  FormatterConfig 
} from './formatted-input.types';
import { 
  PREDEFINED_FORMATS, getPredefinedFormat 
} from './formatted-input.formats';
import { FormatterEngine } from './formatter-engine';
import { StepperFormComponent } from '../forms/stepper-form.component';

@Component({
  selector: 'app-formatted-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormattedInputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="wrapperClass + ' input-wrapper'" [ngClass]="getWrapperClasses()">
      
      <!-- Helper text superior -->
      <div *ngIf="helperText && helperPosition === 'top'" 
           class="helper-text mb-1 flex items-center text-xs text-gray-500">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- Layout flotante -->
      <div class="relative">
        
        <!-- Input principal -->
        <input
            #formattedInput
            [id]="controlId"
            [type]="inputType"
            class="peer floating-input form-input w-full"
            [class]="inputClass"
            [ngClass]="getInputStateClasses()"
            [style.width]="getComputedWidth()"
            [style.height]="getComputedHeight()"
            [style.paddingLeft.px]="getLeftPadding()"
            [style.paddingRight.px]="getRightPadding()"
            [style.paddingTop.px]="14"
            [style.paddingBottom.px]="14"
            [placeholder]="' '"
            [readonly]="readonly"
            [disabled]="disabled || isDisabled"
            [attr.aria-invalid]="invalidTouched"
            [attr.aria-describedby]="getAriaDescribedBy()"
            [attr.maxlength]="getMaxInputLength()"
            [value]="state.displayValue"
            (focus)="onFocus()" 
            (blur)="onBlur()"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            (paste)="onPaste($event)">

        <!-- Label flotante -->
        <label *ngIf="floating && label" 
               [for]="controlId" 
               class="floating-label absolute text-gray-500 pointer-events-none transition-all duration-200 ease-out bg-white px-1"
               [ngClass]="getLabelClasses()"
               [style.left.px]="getLabelLeftPosition()"
               [style.zIndex]="10">
          {{ label }}
          <span *ngIf="required || isRequired" class="text-red-500 ml-1">*</span>
        </label>

        <!-- Label estático -->
        <label *ngIf="!floating && label" 
               [for]="controlId" 
               class="form-label block text-sm font-medium text-gray-700 mb-1"
               [ngClass]="getLabelClasses()">
          {{ label }}
          <span *ngIf="required || isRequired" class="text-red-500 ml-1">*</span>
        </label>

        <!-- Icono derecho -->
        <span *ngIf="iconRight"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              [ngClass]="getIconClasses('right')">
          <span>{{ iconRight }}</span>
        </span>
      </div>

      <!-- Mensajes de validación -->
      <div *ngIf="invalidTouched && state.errorMessage" class="validation-errors mt-1" [id]="getErrorId()">
        <div class="error-message flex items-center text-sm text-red-600">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ state.errorMessage }}
        </div>
      </div>

      <!-- Helper text inferior -->
      <div *ngIf="helperText && (helperPosition === 'bottom' || !helperPosition)" 
           class="helper-text mt-1 flex items-center text-xs text-gray-500">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- Indicator de progreso (opcional) -->
      <div *ngIf="showProgress && formatter" class="progress-indicator mt-1">
        <div class="w-full bg-gray-200 rounded-full h-1">
          <div class="bg-blue-600 h-1 rounded-full transition-all duration-300" 
               [style.width.%]="getProgressPercentage()">
          </div>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          {{ state.rawValue.length }} / {{ formatter.getFormat().maxLength }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos exactos del input-enhanced para mantener consistencia */
    .input-wrapper {
      position: relative;
      margin-bottom: 1rem;
      font-family: 'Montserrat', sans-serif;
    }

    /* Floating label styles */
    .floating-label {
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      z-index: 1;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
    }

    .floating-input:focus + .floating-label,
    .floating-input:not(:placeholder-shown) + .floating-label,
    .label--shifted,
    .has-value .floating-label {
      top: 0;
      transform: translateY(-50%);
      font-size: 0.75rem;
      color: var(--institucional-primario);
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .label--focused {
      color: var(--institucional-primario);
    }

    /* Input base styles */
    .form-input {
      display: block;
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--gray-800);
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      font-family: 'Montserrat', sans-serif;
      box-shadow: var(--shadow-sm);
    }

    /* Estados de focus */
    .form-input:focus {
      outline: none;
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12), var(--shadow-institucional);
    }

    .form-input:disabled {
      background-color: var(--gray-50);
      color: var(--gray-400);
      cursor: not-allowed;
    }

    /* Error states */
    .form-input:invalid,
    .form-input.error {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .error-message {
      animation: fadeIn 0.2s ease-in-out;
      color: var(--error);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Estados específicos del wrapper */
    .input-wrapper--focused .floating-label {
      color: var(--institucional-primario);
    }

    .input-wrapper--error .floating-label {
      color: var(--error);
    }

    .input-wrapper--error .form-input {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    /* Progress indicator */
    .progress-indicator {
      font-family: 'Montserrat', sans-serif;
    }

    /* Success state */
    .success {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }

    .success + .floating-label {
      color: #10b981;
    }
  `]
})
export class FormattedInputComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  
  // ===== INPUTS PRINCIPALES =====
  
  /** Formato predefinido a usar (ej: 'phone', 'creditCard', 'date') */
  @Input() format?: string;
  
  /** Formato personalizado (tiene prioridad sobre format) */
  @Input() customFormat?: InputFormat;
  
  /** Si debe emitir el valor formateado (true) o crudo (false) */
  @Input() emitFormatted = false;
  
  /** Si debe aplicar formateo en tiempo real */
  @Input() realTimeFormatting = true;
  
  /** Si debe mostrar indicador de progreso */
  @Input() showProgress = false;
  
  // ===== INPUTS COMUNES DE INPUT =====
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() helperText?: string;
  @Input() helperPosition: 'top' | 'bottom' = 'bottom';
  @Input() floating = true;
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() wrapperClass = '';
  @Input() inputClass = '';
  @Input() iconRight?: string;
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth = true;
  @Input() inputType = 'text';
  
  // ===== OUTPUTS =====
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<FormattedInputEvent>();
  @Output() formatComplete = new EventEmitter<FormattedInputEvent>();
  @Output() validationChange = new EventEmitter<boolean>();

  @ViewChild('formattedInput') inputRef!: ElementRef<HTMLInputElement>;

  // ===== ESTADO INTERNO =====
  controlId = '';
  isFocused = false;
  formatter?: FormatterEngine;
  state: FormattedInputState = {
    rawValue: '',
    displayValue: '',
    isValid: false,
    isComplete: false
  };
  
  private _userHasInteracted = false;
  private _initializedComplete = false;
  
  // ControlValueAccessor properties
  private _onChange: (value: any) => void = () => {};
  private _onTouched: () => void = () => {};
  private _disabled = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Optional() private controlContainer: ControlContainer,
    @Optional() private stepperForm: StepperFormComponent
  ) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `formatted-input-${Math.random().toString(36).slice(2, 9)}`;
    this.initializeFormatter();
    this.attemptControlConnection();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initializedComplete = true;
      this.cdr.markForCheck();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar recursos si es necesario
  }

  // ===== INICIALIZACIÓN =====
  
  private initializeFormatter(): void {
    let inputFormat: InputFormat | undefined;

    // Prioridad: customFormat > format predefinido
    if (this.customFormat) {
      inputFormat = this.customFormat;
    } else if (this.format) {
      inputFormat = getPredefinedFormat(this.format);
    }

    if (!inputFormat) {
      console.error(`FormattedInput: No se pudo resolver el formato '${this.format}'`);
      return;
    }

    // Crear el motor de formateo
    this.formatter = new FormatterEngine(inputFormat, {
      emitFormatted: this.emitFormatted,
      realTimeFormatting: this.realTimeFormatting,
      allowSeparatorInput: true,
      autoValidate: true
    });

    // Usar placeholder del formato si no se especificó uno
    if (!this.placeholder) {
      this.placeholder = inputFormat.placeholder;
    }
  }

  // ===== CONTROL VALUE ACCESSOR =====
  
  writeValue(value: any): void {
    if (!this.formatter) return;
    
    const rawValue = value || '';
    this.state = this.formatter.processInput(rawValue, this.state);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this._disabled = disabled;
    this.cdr.markForCheck();
  }

  // ===== MANEJADORES DE EVENTOS =====
  
  onFocus(): void {
    this.isFocused = true;
    this._userHasInteracted = true;
    this.focus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this._userHasInteracted = true;
    this._onTouched();
    this.blur.emit();
  }

  onInput(event: Event): void {
    if (!this.formatter) return;
    
    this._userHasInteracted = true;
    const target = event.target as HTMLInputElement;
    const inputValue = target.value;
    
    // Guardar posición del cursor
    const cursorPosition = target.selectionStart || 0;
    
    // Procesar el input
    const oldState = { ...this.state };
    this.state = this.formatter.processInput(inputValue, this.state);
    
    // Actualizar el input si el valor cambió
    if (this.state.displayValue !== inputValue) {
      target.value = this.state.displayValue;
      
      // Restaurar posición del cursor
      const newCursorPosition = this.formatter.calculateCursorPosition(
        cursorPosition, 
        oldState.displayValue, 
        this.state.displayValue
      );
      
      setTimeout(() => {
        target.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
    
    // Emitir cambios
    this.emitChanges();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.formatter) return;
    
    // Permitir teclas de control
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'Clear', 'Copy', 'Paste'
    ];
    
    if (allowedKeys.includes(event.key)) {
      return;
    }
    
    // Validar si el carácter es permitido
    const target = event.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const rawPosition = this.formatter.extractRawValue(
      this.state.displayValue.slice(0, cursorPosition)
    ).length;
    
    if (!this.formatter.isCharAllowed(event.key, rawPosition)) {
      event.preventDefault();
      return;
    }
    
    // Verificar límite de longitud
    if (this.state.rawValue.length >= this.formatter.getFormat().maxLength) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    if (!this.formatter) return;
    
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const target = event.target as HTMLInputElement;
    
    // Procesar el paste
    this.state = this.formatter.processInput(paste, this.state);
    target.value = this.state.displayValue;
    
    // Posicionar cursor al final
    setTimeout(() => {
      target.setSelectionRange(this.state.displayValue.length, this.state.displayValue.length);
    }, 0);
    
    this.emitChanges();
  }

  // ===== EMISIÓN DE EVENTOS =====
  
  private emitChanges(): void {
    if (!this.formatter) return;
    
    // Emitir valor al FormControl
    const emitValue = this.formatter.getEmitValue(this.state);
    this._onChange(emitValue);
    
    // Actualizar FormControl si existe
    if (this.control) {
      this.control.setValue(emitValue);
      this.control.markAsDirty();
    }
    
    // Crear evento
    const event: FormattedInputEvent = {
      raw: this.state.rawValue,
      formatted: this.state.displayValue,
      isValid: this.state.isValid,
      isComplete: this.state.isComplete,
      format: this.formatter.getFormat()
    };
    
    // Emitir eventos
    this.valueChange.emit(event);
    this.validationChange.emit(this.state.isValid);
    
    if (this.state.isComplete) {
      this.formatComplete.emit(event);
    }
  }

  // ===== CONEXIÓN CON FORM CONTROL =====
  
  private attemptControlConnection(): void {
    if (this.control || !this.controlName) return;
    
    // Intentar conectar con el FormControl padre
    if (this.controlContainer && this.controlContainer.control) {
      const parent = this.controlContainer.control as any;
      if (parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
      }
    }

    if (!this.control && this.stepperForm && this.stepperForm.masterFormGroup) {
      const foundControl = this.stepperForm.getFormControl(this.controlName);
      if (foundControl) {
        this.control = foundControl;
      }
    }
  }

  // ===== GETTERS PARA TEMPLATE =====
  
  get isRequired(): boolean {
    return this.required || !!(this.control?.hasError('required'));
  }

  get isDisabled(): boolean {
    return this.disabled || this._disabled || this.control?.disabled || false;
  }

  get invalidTouched(): boolean {
    return !!(this.control && 
              this.control.invalid && 
              this._userHasInteracted && 
              this._initializedComplete);
  }

  get labelShifted(): boolean {
    return !!(this.state.displayValue || this.isFocused);
  }

  // ===== MÉTODOS DE ESTILO =====
  
  getWrapperClasses(): { [key: string]: boolean } {
    return {
      'w-full': true,
      'input-wrapper--floating': this.floating,
      'input-wrapper--error': this.invalidTouched,
      'input-wrapper--focused': this.isFocused,
      'input-wrapper--readonly': this.readonly,
      'input-wrapper--complete': this.state.isComplete
    };
  }

  getInputStateClasses(): { [key: string]: boolean } {
    return {
      'border-red-500 ring-red-500': this.invalidTouched,
      'success': this.state.isValid && this.state.isComplete,
      'bg-gray-50': this.readonly,
      'error': this.invalidTouched
    };
  }

  getLabelClasses(): { [key: string]: boolean } {
    return {
      'text-red-500': this.invalidTouched,
      'text-gray-400': this.readonly,
      'label--shifted': this.labelShifted,
      'label--focused': this.isFocused && !this.invalidTouched
    };
  }

  getIconClasses(position: 'left' | 'right'): { [key: string]: boolean } {
    return {
      'text-red-400': this.invalidTouched,
      'text-gray-400': !this.invalidTouched
    };
  }

  // ===== MÉTODOS AUXILIARES =====
  
  getComputedWidth(): string {
    return this.width || '100%';
  }

  getComputedHeight(): string {
    return this.height || 'auto';
  }

  getLeftPadding(): number {
    return 12;
  }

  getRightPadding(): number {
    return this.iconRight ? 40 : 12;
  }

  getLabelLeftPosition(): number {
    return this.getLeftPadding() - 4;
  }

  getAriaDescribedBy(): string {
    const ids: string[] = [];
    if (this.invalidTouched) ids.push(this.getErrorId());
    if (this.helperText) ids.push(`${this.controlId}-helper`);
    return ids.join(' ');
  }

  getErrorId(): string {
    return `${this.controlId}-error`;
  }

  getMaxInputLength(): number | undefined {
    return this.formatter ? this.formatter.getMaxDisplayLength() : undefined;
  }

  getProgressPercentage(): number {
    if (!this.formatter) return 0;
    const max = this.formatter.getFormat().maxLength;
    return max > 0 ? (this.state.rawValue.length / max) * 100 : 0;
  }

  // ===== MÉTODOS PÚBLICOS =====
  
  /**
   * Obtiene el valor crudo actual
   */
  getRawValue(): string {
    return this.state.rawValue;
  }

  /**
   * Obtiene el valor formateado actual
   */
  getFormattedValue(): string {
    return this.state.displayValue;
  }

  /**
   * Obtiene el estado actual completo
   */
  getState(): FormattedInputState {
    return { ...this.state };
  }

  /**
   * Actualiza el formato dinámicamente
   */
  updateFormat(newFormat: string | InputFormat): void {
    if (!this.formatter) return;
    
    let inputFormat: InputFormat | undefined;
    
    if (typeof newFormat === 'string') {
      inputFormat = getPredefinedFormat(newFormat);
    } else {
      inputFormat = newFormat;
    }
    
    if (inputFormat) {
      this.formatter.updateFormat(inputFormat);
      // Reprocessar el valor actual con el nuevo formato
      this.state = this.formatter.processInput(this.state.rawValue, this.state);
      this.cdr.markForCheck();
    }
  }

  /**
   * Limpia el input
   */
  clear(): void {
    this.state = {
      rawValue: '',
      displayValue: '',
      isValid: false,
      isComplete: false
    };
    
    if (this.inputRef) {
      this.inputRef.nativeElement.value = '';
    }
    
    this.emitChanges();
  }
}