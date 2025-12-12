import { Component, Input, OnInit, OnDestroy, AfterViewInit, DoCheck, Optional, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, HostBinding, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, ValidatorFn, Validators, AbstractControl, ValidationErrors, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { ValidatorsService } from '../../services/custom-validators.service';
import { ValidatorSpec, ValidationErrorMessages } from '../../interfaces/validation.interfaces';

@Component({
  selector: 'app-input-enhanced',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UniversalIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputEnhancedComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="wrapperClass + ' input-wrapper'" [ngClass]="getWrapperClasses()">
      
      <!-- Helper text superior -->
      <div *ngIf="helperText && helperPosition === 'top'" 
           class="helper-text mb-1 flex items-center">
        <svg *ngIf="helperIcon" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- Floating layout -->
      <div *ngIf="isFloatingTrue(); else nonFloatingTemplate" class="relative">
        <!-- Icono izquierdo -->
        <span *ngIf="iconLeft"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              [ngClass]="getIconClasses('left')">
          <app-universal-icon *ngIf="iconLeftType === 'material' || iconLeftType === 'bootstrap'"
            [name]="iconLeft"
            [size]="20"
            customClass="text-current">
          </app-universal-icon>
          <span *ngIf="iconLeftType !== 'material' && iconLeftType !== 'bootstrap'">{{ iconLeft }}</span>
        </span>

        <!-- Input principal optimizado -->
        <ng-container>
          <!-- Input de texto -->
          <input *ngIf="type === 'text' || type === 'email' || type === 'password' || type === 'number'"
              [id]="controlId"
              [type]="type"
              [attr.maxlength]="getMaxLength() || null"
              class="peer floating-input"
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
              [value]="value || ''"
              (focus)="onFocus()" 
              (blur)="onBlur()"
              (input)="onInput($event)"
              (paste)="onPaste($event)"
              (keydown)="onKeyDown($event)"
              (keyup)="onKeyUp($event)">

          <!-- Textarea -->
          <textarea *ngIf="type === 'textarea'"
              [id]="controlId"
              class="peer floating-input resize-none"
              [attr.maxlength]="getMaxLength() || null"
              [class]="inputClass"
              [ngClass]="getInputStateClasses()"
              [style.width]="getComputedWidth()"
              [style.height]="getComputedHeight()"
              [style.paddingLeft.px]="getLeftPadding()"
              [style.paddingRight.px]="getRightPadding()"
              [style.paddingTop.px]="14"
              [style.paddingBottom.px]="14"
              [placeholder]="' '"
              [attr.rows]="rows"
              [readonly]="readonly"
              [disabled]="disabled || isDisabled"
              [attr.aria-invalid]="invalidTouched"
              [attr.aria-describedby]="getAriaDescribedBy()"
              [value]="value || ''"
              (focus)="onFocus()" 
              (blur)="onBlur()"
              (input)="onInput($event)"
              (paste)="onPaste($event)"
              (keydown)="onKeyDown($event)"
              (keyup)="onKeyUp($event)">
          </textarea>
        </ng-container>

        <!-- Botón clear -->
        <button *ngIf="clear && value && !readonly" 
                type="button" 
                (click)="clearValue(); $event.stopPropagation()"
                class="clear-button absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                [ngClass]="getClearButtonClasses()"
                title="Limpiar">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Icono derecho -->
        <span *ngIf="iconRight"
              class="absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              [ngClass]="getIconClasses('right')"
              [style.right.px]="getRightIconPosition()">
          <app-universal-icon *ngIf="iconRightType === 'material' || iconRightType === 'bootstrap'"
              [name]="iconRight"
              [size]="20"
              customClass="text-current">
          </app-universal-icon>
          <span *ngIf="iconRightType !== 'material' && iconRightType !== 'bootstrap'">{{ iconRight }}</span>
        </span>

        <!-- Label flotante -->
        <label
          [for]="controlId"
          [style.left.px]="getLeftPadding()"
          class="floating-label absolute text-gray-500 pointer-events-none transition-all duration-200 ease-out bg-white px-1"
          [class.label--shifted]="labelShifted"
          [class.label--focused]="isFocused"
          [ngClass]="getLabelClasses()">
          {{ label }} 
          <span *ngIf="isRequired" class="text-red-500 ml-1">*</span>
          <span *ngIf="optional && !isRequired" class="text-gray-400 text-xs ml-1">(opcional)</span>
        </label>
      </div>

      <!-- Non-floating template -->
      <ng-template #nonFloatingTemplate>
        <label *ngIf="label" [for]="controlId" class="form-label block text-sm font-medium text-gray-700 mb-1" [ngClass]="getLabelClasses()">
          {{ label }}
          <span *ngIf="isRequired" class="text-red-500 ml-1">*</span>
          <span *ngIf="optional && !isRequired" class="text-gray-400 text-xs ml-1">(opcional)</span>
        </label>

        <div class="relative flex items-center input-container" [ngClass]="getContainerClasses()">
          <!-- Icono izquierdo -->
          <span *ngIf="iconLeft" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                [ngClass]="getIconClasses('left')">
            {{ iconLeft }}
          </span>

          <ng-container *ngIf="control">
            <!-- Input simplificado para non-floating -->
            <input *ngIf="type !== 'file' && type !== 'range' && type !== 'textarea'"
                 [id]="controlId"
                 [type]="type"
                 [class]="inputClass"
                 [class.has-icon-left]="iconLeft && type === 'color'"
                 [class.has-icon-right]="iconRight && type === 'color'"
                 [ngClass]="getInputStateClasses()"
                 [style.width]="getComputedWidth()"
                 [style.height]="getComputedHeight()"
                 [style.paddingLeft.px]="getLeftPadding()"
                 [style.paddingRight.px]="getRightPadding()"
                 [placeholder]="placeholder"
                 [attr.min]="min"
                 [attr.max]="max"
                 [attr.step]="step"
                 [attr.accept]="accept"
                 [attr.autocomplete]="autocomplete"
                 [readonly]="readonly"
                 [attr.aria-invalid]="invalidTouched"
                 [attr.aria-describedby]="getAriaDescribedBy()"
                 [value]="value || ''"
                 (focus)="onFocus()" 
                 (blur)="onBlur()"
                 (input)="onInput($event)"
                 (paste)="onPaste($event)"
                 (keydown)="onKeyDown($event)"
                 (keyup)="onKeyUp($event)">

            <!-- Textarea para non-floating -->
            <textarea *ngIf="type === 'textarea'"
                 [id]="controlId"
                 [class]="inputClass"
                 [ngClass]="getInputStateClasses()"
                 [style.width]="getComputedWidth()"
                 [style.height]="getComputedHeight()"
                 [style.paddingLeft.px]="getLeftPadding()"
                 [style.paddingRight.px]="getRightPadding()"
                 [placeholder]="placeholder"
                 [attr.rows]="rows"
                 [readonly]="readonly"
                 [attr.aria-invalid]="invalidTouched"
                 [attr.aria-describedby]="getAriaDescribedBy()"
                 [value]="value || ''"
                 (focus)="onFocus()" 
                 (blur)="onBlur()"
                 (input)="onInput($event)"
                 (paste)="onPaste($event)"
                 (keydown)="onKeyDown($event)"
                 (keyup)="onKeyUp($event)">
            </textarea>
          </ng-container>

          <!-- Botón clear -->
          <button *ngIf="clear && value && !readonly" 
                  type="button" 
                  (click)="clearValue(); $event.stopPropagation()"
                  class="clear-button absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  [ngClass]="getClearButtonClasses()"
                  title="Limpiar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Icono derecho -->
          <span *ngIf="iconRight"
                class="absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                [ngClass]="getIconClasses('right')"
                [style.right.px]="getRightIconPosition()">
            <app-universal-icon *ngIf="iconRightType === 'material' || iconRightType === 'bootstrap'"
                [name]="iconRight"
                [size]="20"
                customClass="text-current">
            </app-universal-icon>
            <span *ngIf="iconRightType !== 'material' && iconRightType !== 'bootstrap'">{{ iconRight }}</span>
          </span>

          <!-- Indicador de loading -->
          <div *ngIf="loading" 
               class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        </div>
      </ng-template>

      <!-- Mensajes de validación simplificados -->
      <div *ngIf="invalidTouched" class="validation-errors mt-1" [id]="getErrorId()">
        <div *ngFor="let error of getActiveErrors()" class="error-message flex items-center">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ error }}
        </div>
      </div>

      <!-- Helper text inferior -->
      <div *ngIf="helperText && helperPosition === 'bottom'" 
           class="helper-text mt-1 flex items-center">
        <svg *ngIf="helperIcon" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- Contador de caracteres -->
      <div *ngIf="showCharCount && getMaxLength()" class="char-counter text-xs mt-1 text-right">
        <span [ngClass]="getCharCountClasses()">
          {{ getCharCount() }}/{{ getMaxLength() }}
        </span>
      </div>
    </div>
  `,
  styles: [`
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

    /* Input base styles usando las clases del sistema */
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

    /* Color input specific size (requested) */
    input[type="color"].form-input,
    .floating-input[type="color"] {
      width: 100px !important;
      height: 60px !important;
      padding: 5px !important;
      border-radius: 6px !important;
      border: 1px solid var(--gray-300) !important;
      overflow: hidden;
    }

    /* Padding when color input has icons */
    input[type="color"].form-input.has-icon-left,
    .floating-input[type="color"].has-icon-left {
      padding-left: 48px !important;
    }

    input[type="color"].form-input.has-icon-right,
    .floating-input[type="color"].has-icon-right {
      padding-right: 48px !important;
    }

    /* Autofill detection */
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus {
      transition: background-color 5000s ease-in-out 0s;
    }

    /* Force floating label when autofilled */
    .form-input:-webkit-autofill + .floating-label,
    .floating-input:-webkit-autofill + .floating-label {
      top: 0 !important;
      transform: translateY(-50%) !important;
      font-size: 0.75rem !important;
      color: var(--institucional-primario) !important;
      font-weight: 600 !important;
    }

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

    /* Range input styles */
    /* Range input styles simplificados */
    .range-input {
      -webkit-appearance: none;
      appearance: none;
      height: 10px;
      border-radius: 999px;
      outline: none;
      transition: filter 0.15s ease;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
    }

    .range-input:active {
      filter: brightness(0.98);
    }

    .range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--institucional-primario);
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(139,21,56,0.25);
      margin-top: -6px;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .range-input::-webkit-slider-thumb:active {
      transform: scale(1.05);
      box-shadow: 0 6px 14px rgba(139,21,56,0.32);
    }

    .range-input::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--institucional-primario);
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(139,21,56,0.25);
    }

    /* Error states usando variables institucionales */
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

    /* File picker styles */
    .file-picker {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      padding: 0.5rem;
      background-color: #fff;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .file-picker:hover {
      border-color: var(--institucional-primario);
      box-shadow: var(--shadow-institucional);
    }

    .file-btn {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      background-color: var(--gray-100);
      color: var(--gray-700);
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .file-btn:hover {
      background-color: var(--institucional-primario);
      color: white;
    }

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--gray-600);
      font-family: 'Montserrat', sans-serif;
    }

    /* Clear button styles */
    .clear-button {
      z-index: 10;
      color: var(--gray-400);
      transition: all var(--transition-fast);
    }

    .clear-button:hover {
      color: var(--institucional-primario);
      transform: translate(-50%, -50%) scale(1.1);
    }

    /* Character counter styles */
    .char-counter .warning {
      color: var(--warning);
      font-weight: 600;
    }

    .char-counter .error {
      color: var(--error);
      font-weight: 600;
    }

    /* Variant styles básicos */
    .variant-filled {
      background-color: var(--gray-100);
      border: 1px solid transparent;
    }

    .variant-filled:focus {
      background-color: #fff;
      border-color: var(--institucional-primario);
    }

    /* Loading y helper text */
    .loading-spinner {
      color: var(--institucional-primario);
    }

    .helper-text {
      color: var(--gray-600);
      font-family: 'Montserrat', sans-serif;
      font-size: 0.75rem;
    }

    /* Success states */
    .form-input.success {
      border-color: var(--success);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }
  `]
})
export class InputEnhancedComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy, ControlValueAccessor {
  @ViewChild('rangeEl') rangeEl?: ElementRef<HTMLInputElement>;

  // Propiedades básicas
  @Input() controlName = '';
  // Aceptar AbstractControl | FormControl | null para mayor compatibilidad con bindings desde templates
  @Input() control?: AbstractControl | FormControl | null;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};
  @Input() required = false;
  @Input() optional = false;
  // Flags para validaciones específicas que pueden venir desde el template
  @Input() rfc?: boolean;
  @Input() curp?: boolean;
  @Input() nss?: boolean;
  
  // Dimensiones
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth = false;
  
  // Variantes visuales básicas
  @Input() variant: 'filled' | 'outlined' = 'outlined';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() floating = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() iconLeftType?: 'bootstrap' | 'material' | 'universal';
  @Input() iconRightType?: 'bootstrap' | 'material' | 'universal';
  @Input() clear = false;
  @Input() extraClasses = '';
  
  // Estados
  @Input() loading = false;
  @Input() readonly = false;
  @Input() disabled = false;
  
  // Atributos HTML específicos
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number | string;
  @Input() accept?: string;
  @Input() multiple = false;
  @Input() autocomplete?: string;
  @Input() rows = 3;
  
  // Helper text y contador de caracteres
  @Input() helperText?: string;
  @Input() helperPosition: 'top' | 'bottom' = 'bottom';
  @Input() helperIcon = false;
  @Input() showCharCount = false;

  // Eventos
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() keyup = new EventEmitter<KeyboardEvent>();

  controlId = '';
  isFocused = false;
  lastFileName: string | null = null;
  private _valueSub?: Subscription;
  private _shifted = false;
  private _mutationObserver?: MutationObserver;
  private _lastControlValue: any = undefined;
  private _userHasInteracted = false; // Nueva bandera para rastrear interacción real del usuario
  private _initializedComplete = false; // Variable para evitar detectar falsas interacciones durante inicialización
  
  // ControlValueAccessor properties
  private _value: any = null;
  private _onChange: (value: any) => void = () => {};
  private _onTouched: () => void = () => {};
  private _disabled = false;

  @HostBinding('class.has-value')
  get hasValue(): boolean {
    return this._shifted;
  }

  get isDisabled(): boolean {
    return this._disabled;
  }

  /**
   * Devuelve true solo si floating es booleano true (no string, no undefined)
   */
  isFloatingTrue(): boolean {
    // No permitir label flotante en tipos que no soportan floating (range, file, color)
    const unsupported = ['range', 'file', 'color'];
    if (unsupported.includes(this.type)) {
      return false;
    }
    return this.floating === true;
  }

  private _validatorsApplied = false;

  constructor(@Optional() private controlContainer: ControlContainer, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `input-enhanced-${Math.random().toString(36).slice(2, 9)}`;

    // Intentar obtener el FormControl desde el contenedor padre
    this.attemptControlConnection();

    // Inicializar estado de label flotante según valor actual
    const currentValue = this._value || (this.control && this.control.value);
    this._shifted = !!(currentValue !== null && currentValue !== undefined && currentValue !== '');
    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    // Re-evaluar después del primer render para capturar valores que el padre haya seteado tardíamente
    const currentValue = this._value || (this.control && this.control.value);
    const hasValue = !!(currentValue !== null && currentValue !== undefined && currentValue !== '');
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
      this.cdr.markForCheck();
    }

    // Intentar conectar con FormControl si no se encontró en ngOnInit con múltiples intentos
    if (!this.control && this.controlName) {
      let attempts = 0;
      const maxAttempts = 10;
      const tryConnection = () => {
        attempts++;
        this.attemptControlConnection();
        
        if (!this.control && attempts < maxAttempts) {
          setTimeout(tryConnection, 50 * attempts); // Incrementar el delay progresivamente
        } else {
          // Marcar inicialización como completa después de intentar conectar
          setTimeout(() => {
            this._initializedComplete = true;
            this.cdr.markForCheck();
          }, 100);
        }
      };
      tryConnection();
    } else {
      // Si ya tenemos el control, marcar como completo después de un pequeño delay
      setTimeout(() => {
        this._initializedComplete = true;
        this.cdr.markForCheck();
      }, 100);
    }

    // Configurar observador de mutaciones para detectar cambios de autocompletado del navegador
    this.setupAutofillDetection();
  }

  private attemptControlConnection(): void {
    if (this.control || !this.controlName) return;
    
    // Estrategia 1: ControlContainer directo
    if (this.controlContainer && this.controlContainer.control) {
      const parent = this.controlContainer.control as any;
      if (parent && parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
        if (this.control) {
          this.setupFormControlConnection();
          return;
        }
      }
    }

    // Estrategia 2: Buscar en el DOM hacia arriba
    try {
      let element = document.getElementById(this.controlId);
      while (element && !this.control) {
        element = element.parentElement;
        if (element) {
          // Buscar componente Angular que tenga FormGroup
          const ngComponent = (element as any).__ngContext__ || (window as any).ng?.getComponent?.(element);
          if (ngComponent && ngComponent.masterFormGroup) {
            this.control = ngComponent.masterFormGroup.get(this.controlName) as FormControl;
            if (this.control) {
              this.setupFormControlConnection();
              return;
            }
          }
        }
      }
    } catch (error) {
      // Error silencioso
    }

    // Estrategia 3: Buscar en el componente stepper-form globalmente
    try {
      const stepperElement = document.querySelector('app-stepper-form');
      if (stepperElement) {
        const stepperComponent = (window as any).ng?.getComponent?.(stepperElement);
        if (stepperComponent && stepperComponent.masterFormGroup) {
          this.control = stepperComponent.masterFormGroup.get(this.controlName) as FormControl;
          if (this.control) {
            this.setupFormControlConnection();
            return;
          }
        }
      }
    } catch (error) {
      // Error silencioso
    }
  }

  private setupFormControlConnection(): void {
    if (!this.control) return;

    // Aplicar validadores solo una vez
    if (!this._validatorsApplied) {
      this.applyValidations();
      this._validatorsApplied = true;
    }

    // Sincronizar valores
    if (this._value !== undefined && this._value !== this.control.value) {
      // Si el componente ya tiene un valor, aplicarlo al FormControl
      this.control.setValue(this._value, { emitEvent: false });
      this.control.markAsDirty();
      this.control.markAsTouched();
    } else {
      // Si no, tomar el valor del FormControl
      this._value = this.control.value;
    }
    
    // Suscribirse a cambios
    this._valueSub = this.control.valueChanges?.subscribe((val: any) => {
      this._value = val;
      const hasValue = !(val === null || val === undefined || val === '');
      if (hasValue !== this._shifted) {
        this._shifted = hasValue;
        this.cdr.markForCheck();
      }
    });
  }

  private setupAutofillDetection(): void {
    // Solo configurar para inputs de texto que realmente lo necesiten
    if (!['text', 'email', 'password'].includes(this.type)) return;
    
    const inputElement = document.getElementById(this.controlId) as HTMLInputElement | HTMLTextAreaElement;
    if (!inputElement) return;

    // Usar un solo listener optimizado
    const handleValueChange = () => {
      this.checkAndUpdateShifted(inputElement.value);
    };

    // Eventos esenciales para autofill
    inputElement.addEventListener('change', handleValueChange, { passive: true });
    inputElement.addEventListener('input', handleValueChange, { passive: true });

    // Observador más específico - solo para cambios de value
    this._mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          handleValueChange();
          break;
        }
      }
    });

    this._mutationObserver.observe(inputElement, {
      attributes: true,
      attributeFilter: ['value'],
      subtree: false
    });

    // Polling reducido - solo uno después de la inicialización
    setTimeout(() => {
      if (inputElement.value && !this._shifted) {
        this.checkAndUpdateShifted(inputElement.value);
      }
    }, 300);
  }

  private checkAndUpdateShifted(value: string): void {
    const hasValue = !!(value && value.trim() !== '');
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
      // Actualizar también el control si es necesario
      if (this.control && this.control.value !== value) {
        this.control.setValue(value, { emitEvent: false });
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  ngDoCheck(): void {
    // Solo verificar cambios si el valor realmente cambió para evitar ciclos innecesarios
    if (this.control && this.control.value !== this._lastControlValue) {
      this._lastControlValue = this.control.value;
      const hasValue = !!(this.control.value !== null && this.control.value !== '');
      if (hasValue !== this._shifted) {
        this._shifted = hasValue;
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this._valueSub?.unsubscribe();
    this._mutationObserver?.disconnect();
  }

  private applyValidations(): void {
    const spec = this.validationMap?.[this.controlName];
    if (!spec || !this.control) return;

    if (!spec.messages) spec.messages = {};

    const fns: ValidatorFn[] = [];
    
    // Solo aplicar validadores que realmente se necesitan
    if (spec.required || this.required) fns.push(Validators.required);
    if (spec.minLength) fns.push(Validators.minLength(spec.minLength));
    if (spec.maxLength) fns.push(Validators.maxLength(spec.maxLength));
    if (spec.min !== undefined) fns.push(Validators.min(spec.min));
    if (spec.max !== undefined) fns.push(Validators.max(spec.max));
    if (spec.pattern) fns.push(Validators.pattern(spec.pattern));
    if (spec.email) fns.push(Validators.email);

    // Aplicar validaciones personalizadas comunes usando el servicio
    if (spec.rfc || this.rfc) fns.push(ValidatorsService.rfcValidator());
    if (spec.curp || this.curp) fns.push(ValidatorsService.curpValidator());
    if (spec.nss || this.nss) fns.push(ValidatorsService.nssValidator());
    if (spec.mexicanPhone) fns.push(ValidatorsService.mexicanPhoneValidator());
    if (spec.postalCode) fns.push(ValidatorsService.postalCodeValidator());
    if (spec.creditCard) fns.push(ValidatorsService.creditCardValidator());
    if (spec.strongPassword) fns.push(ValidatorsService.strongPasswordValidator());
    if (spec.positiveNumber) fns.push(ValidatorsService.positiveNumberValidator());
    if (spec.negativeNumber) fns.push(ValidatorsService.negativeNumberValidator());
    if (spec.integer) fns.push(ValidatorsService.integerValidator());
    if (spec.alphanumeric) fns.push(ValidatorsService.alphanumericValidator());
    if (spec.onlyLetters) fns.push(ValidatorsService.onlyLettersValidator());
    if (spec.onlyNumbers) fns.push(ValidatorsService.onlyNumbersValidator());
    if (spec.noSpaces) fns.push(ValidatorsService.noSpacesValidator());
    if (spec.url) fns.push(ValidatorsService.urlValidator());
    if (spec.futureDate) fns.push(ValidatorsService.futureDateValidator());
    if (spec.pastDate) fns.push(ValidatorsService.pastDateValidator());
    if (spec.ageRange) fns.push(ValidatorsService.ageRangeValidator(spec.ageRange.min, spec.ageRange.max));
    if (spec.passwordMatch) fns.push(ValidatorsService.passwordMatchValidator(spec.passwordMatch));
    if (spec.custom) fns.push(spec.custom);

    if (fns.length) {
      this.control.setValidators(fns);
      this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

  // Getters y métodos de estado
  get invalidTouched(): boolean {
    // Solo mostrar errores si:
    // 1. El control es inválido
    // 2. El usuario ha interactuado realmente con el campo (no solo programáticamente)
    // 3. El componente ha terminado de inicializarse
    return !!(this.control && 
              this.control.invalid && 
              this._userHasInteracted && 
              this._initializedComplete);
  }

  get labelShifted(): boolean {
  return this._shifted || this.isFocused;
  }

  get isRequired(): boolean {
    return this.required || !!(this.validationMap?.[this.controlName]?.required);
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  get inputClass(): string {
    const base = 'form-input transition-all duration-200';
    const variantClass = `variant-${this.variant}`;
    const sizeClass = `size-${this.size}`;
    return [base, variantClass, sizeClass, this.extraClasses].filter(Boolean).join(' ');
  }

  // Métodos de clase CSS
  getWrapperClasses(): any {
    return {
      'w-full': this.fullWidth,
      'input-wrapper--floating': this.floating,
      'input-wrapper--error': this.invalidTouched,
      'input-wrapper--focused': this.isFocused,
      'input-wrapper--readonly': this.readonly
    };
  }

  // Métodos de clase CSS simplificados
  getInputStateClasses(): any {
    return {
      'border-red-500 ring-red-500': this.invalidTouched,
      'success': this.control?.valid && this.control?.touched,
      'bg-gray-50': this.readonly
    };
  }

  getLabelClasses(): any {
    return {
      'text-red-500': this.invalidTouched,
      'text-gray-400': this.readonly
    };
  }

  getContainerClasses(): any {
    return {
      'opacity-50': this.readonly
    };
  }

  getIconClasses(position: 'left' | 'right'): any {
    return {
      'text-gray-300': this.readonly,
      'text-red-400': this.invalidTouched
    };
  }

  getClearButtonClasses(): any {
    return {
      'right-8': this.iconRight || this.loading,
      'right-2': !this.iconRight && !this.loading
    };
  }

  getCharCountClasses(): any {
    const count = this.getCharCount();
    const max = this.getMaxLength();
    if (!max) return {};

    const percentage = count / max;
    return {
      'warning': percentage > 0.8 && percentage <= 1,
      'error': percentage > 1
    };
  }

  // Métodos de cálculo simplificados
  getLeftPadding(): number {
    return this.iconLeft ? 48 : 12;
  }

  getRightPadding(): number {
    let padding = 12;
    if (this.clear && this.control?.value) padding += 36;
    if (this.iconRight) padding += 36;
    if (this.loading) padding += 36;
    return padding;
  }

  getRightIconPosition(): number {
    let position = 12;
    if (this.clear && this.control?.value) position += 36;
    if (this.loading) position += 36;
    return position;
  }

  getComputedWidth(): string | null {
    return this.width ?? null;
  }

  getComputedHeight(): string | null {
    if (this.type === 'textarea' && !this.height) {
      return `${this.rows * 1.5 + 1}rem`;
    }
    return this.height ?? null;
  }

  getMaxLength(): number | null {
    // Si la bandera rfc está activada, forzamos maxlength a 13
    if (this.rfc) {
      return 13;
    }
    const spec = this.validationMap?.[this.controlName];
    return spec?.maxLength ?? null;
  }

  getCharCount(): number {
    const value = this.control?.value;
    return value ? String(value).length : 0;
  }

  getAriaDescribedBy(): string {
    const ids = [];
    if (this.invalidTouched) ids.push(this.getErrorId());
    if (this.helperText) ids.push(`${this.controlId}-helper`);
    return ids.join(' ');
  }

  getErrorId(): string {
    return `${this.controlId}-error`;
  }

  // Mensajes de validación simplificados (español)
  private readonly defaultValidationMessages: { [key: string]: string } = {
    required: 'Este campo es requerido',
    minlength: 'Mínimo {requiredLength} caracteres',
    maxlength: 'Máximo {requiredLength} caracteres',
    min: 'Valor mínimo: {min}',
    max: 'Valor máximo: {max}',
    email: 'Correo electrónico inválido',
    pattern: 'Formato inválido',
    rfc: 'RFC inválido',
    curp: 'CURP inválida',
    nss: 'NSS inválido',
    phone: 'Teléfono inválido',
    url: 'URL inválida',
    alphanumeric: 'Solo caracteres alfanuméricos',
    onlyLetters: 'Solo se permiten letras'
  };

  // Método optimizado para obtener errores activos
  getActiveErrors(): string[] {
    if (!this.control?.errors) return [];
    
    const errors: string[] = [];
    const errorKeys = Object.keys(this.control.errors);
    
    for (const key of errorKeys) {
      const message = this.getMessage(key);
      if (!message) continue;

      // Si el error proviene del validador strongPassword y el objeto de error tiene 'missing',
      // preferimos dividir en elementos por línea para mostrar lista de requisitos.
      const errorObj = this.control?.errors?.[key];
      if (key === 'strongPassword' && errorObj && typeof errorObj === 'object' && Array.isArray(errorObj.missing)) {
        // agregar cada requisito como entrada separada
        for (const m of errorObj.missing) {
          errors.push(m);
        }
        continue;
      }

      // Si el mensaje contiene saltos de línea, dividirlo para renderizar múltiples líneas
      if (message.includes('\n')) {
        const parts = message.split('\n').map(p => p.trim()).filter(Boolean);
        for (const part of parts) {
          errors.push(part);
        }
        continue;
      }

      errors.push(message);
    }
    
    return errors;
  }

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    
    // Primero intentar mensajes personalizados en validationMap
    if (spec?.messages) {
      if (spec.messages[key]) return spec.messages[key];
      const normalized = key === 'minLength' ? 'minlength' : key === 'maxLength' ? 'maxlength' : key;
      if (spec.messages[normalized]) return spec.messages[normalized];
    }

    // Usar el servicio de validadores para obtener mensajes
    const errorValue = this.control?.errors?.[key];
    const customMessages = spec?.messages;
    
    // Intentar obtener el mensaje del servicio
    const serviceMessage = ValidatorsService.getErrorMessage(key, errorValue, customMessages);
    if (serviceMessage !== `Error de validación: ${key}`) {
      return serviceMessage;
    }

    // Fallback a mensajes por defecto del componente
    const normalizedKey = key === 'minLength' ? 'minlength' : key === 'maxLength' ? 'maxlength' : key;
    const defaultMsg = this.defaultValidationMessages[normalizedKey];
    if (!defaultMsg) return undefined;

    // Reemplazar placeholders con datos del error
    const errorObj = this.control?.errors?.[normalizedKey] ?? this.control?.errors?.[key];
    if (errorObj && typeof errorObj === 'object') {
      let msg = defaultMsg;
      Object.keys(errorObj).forEach(k => {
        msg = msg.replace(`{${k}}`, String((errorObj as any)[k]));
      });
      return msg;
    }

    return defaultMsg;
  }

  // Métodos para range input
  getRangeValue(): number | string {
    const v: any = this.control?.value;
    if (v === null || v === undefined || v === '') return this.getRangeMin();
    const n = typeof v === 'number' ? v : Number(v);
    return isNaN(n) ? this.getRangeMin() : n;
  }

  getRangeMin(): number {
    const spec = this.validationMap?.[this.controlName];
    return spec?.min ?? this.min ?? 0;
  }

  getRangeMax(): number {
    const spec = this.validationMap?.[this.controlName];
    return spec?.max ?? this.max ?? 100;
  }

  getRangePercent(): number {
    const min = this.getRangeMin();
    const max = this.getRangeMax();
    const val = Number(this.getRangeValue());
    const denom = Math.max(1, (max - min));
    const rawPct = ((val - min) / denom) * 100;
    return Math.max(0, Math.min(100, rawPct));
  }

  getRangeBackground(): string {
    const percent = this.getRangePercent();
    return `linear-gradient(90deg, var(--institucional-primario) 0%, var(--institucional-primario) ${percent}%, var(--gray-200) ${percent}%, var(--gray-200) 100%)`;
  }

  // Métodos para file input simplificados
  getFileName(): string | null {
    if (this.lastFileName) return this.lastFileName;
    const val: any = this.control?.value;
    if (val instanceof File) return val.name;
    if (typeof val === 'string' && val.length) return val.split('\\').pop() || val;
    return null;
  }

  // Manejadores de eventos
  onFocus(): void {
    this.isFocused = true;
    this._userHasInteracted = true; // Marcar que el usuario ha interactuado
    this.focus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this._userHasInteracted = true; // Marcar que el usuario ha interactuado
    this._onTouched(); // Llamar al callback de touched de ControlValueAccessor
    this.blur.emit();
  }

  onInput(event: Event): void {
    this._userHasInteracted = true; // Marcar que el usuario ha interactuado
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const v = target?.value;
    const hasValue = !(v === null || v === undefined || v === '');
    
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
    }
    
    // Actualizar el valor a través de ControlValueAccessor
    this.value = v;
  }
  
  onPaste(event: ClipboardEvent): void {
    // Lógica de paste aquí...
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keydown.emit(event);
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keyup.emit(event);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.lastFileName = file.name;
      
      if (this.control) {
        this.control.setValue(this.multiple ? Array.from(files) : file);
        this.control.markAsDirty();
        this.control.markAsTouched();
      }
    }
  }

  clearValue(): void {
    this.value = '';
    this.lastFileName = null;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value = value;
    
    // Si tenemos un FormControl y el valor es diferente, actualizarlo
    if (this.control && this.control.value !== value) {
      this.control.setValue(value, { emitEvent: false });
    }
    
    // Actualizar el estado del label flotante
    this._shifted = !!(value !== null && value !== undefined && value !== '');
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  get value(): any {
    return this._value;
  }

  set value(val: any) {
    this._value = val;
    this._onChange(val);
    this._onTouched();
    
    // Estrategia simple: intentar conectar si no tenemos control
    if (!this.control && this.controlName) {
      this.attemptControlConnection();
    }
    
    // Si tenemos FormControl, actualizarlo
    if (this.control) {
      // Emit the change so any valueChanges subscribers react (e.g., table-filters globalSearch)
      this.control.setValue(val, { emitEvent: true });
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    
    // Actualizar el estado del label flotante
    this._shifted = !!(val !== null && val !== undefined && val !== '');
    this.cdr.markForCheck();
  }
}
