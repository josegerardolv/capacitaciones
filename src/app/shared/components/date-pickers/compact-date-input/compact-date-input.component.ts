import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, AfterViewInit, HostListener, OnChanges, SimpleChanges, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ControlContainer } from '@angular/forms';
import { DayPickerComponent } from '../day-picker/day-picker.component';

@Component({
  selector: 'app-compact-date-input',
  standalone: true,
  imports: [CommonModule, DayPickerComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompactDateInputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="wrapperClass + ' mb-3'" [ngClass]="{'relative': true}">
      
      <!-- Label -->
      <label *ngIf="label && !floating" [for]="controlId" class="form-label">
        {{ label }}<span *ngIf="required" class="text-red-500"> *</span>
      </label>

      <!-- Container principal -->
      <div class="compact-date-input relative" #inputContainer [ngClass]="{'mt-1': label && !floating}">
        
        <!-- Input display con floating label -->
        <div class="relative">
          <!-- Input principal -->
          <div 
            [id]="controlId"
            class="peer w-full cursor-pointer"
            [class]="inputClass"
            [ngClass]="{ 
              'border-red-500 ring-red-500': hasError || invalidTouched,
              'border-green-500 ring-green-500': validTouched,
              'ring-2 ring-opacity-50': showCalendar
            }"
            [style.border-color]="getBorderColor()"
            [style.box-shadow]="getBoxShadow()"
            [style.width]="getComputedWidth()"
            [style.height]="getComputedHeight()"
            [style.paddingLeft.px]="floating ? 16 : 12"
            [style.paddingRight.px]="48"
            [style.paddingTop.px]="floating ? 14 : null"
            [style.paddingBottom.px]="floating ? 14 : null"
            (click)="toggleCalendar()"
            (keydown.enter)="toggleCalendar()"
            (keydown.space)="toggleCalendar(); $event.preventDefault()"
            (focus)="onFocus()"
            (blur)="onBlur()"
            tabindex="0"
            role="button"
            [attr.aria-label]="ariaLabel || 'Seleccionar fecha'"
            [attr.aria-expanded]="showCalendar">
            
            <div class="flex items-center justify-between h-full">
            @if(placeholder){
              <span class="text-sm truncate" [class.text-gray-400]="!selectedDate && floating" [class.text-gray-500]="!selectedDate && !floating" [class.text-gray-900]="selectedDate">
                {{ getDisplayText() }}
              </span>
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            }
            </div>
          </div>

          <!-- Floating label -->
          <label
            *ngIf="floating"
            [for]="controlId"
            class="absolute left-4 text-gray-500 pointer-events-none floating-label transition-all duration-200"
            [class.label--shifted]="labelShifted"
            [class.text-red-500]="hasError || invalidTouched"
            [class.text-green-500]="validTouched && !(hasError || invalidTouched)">
            {{ label }} <span *ngIf="required" class="text-red-500">*</span>
          </label>
        </div>

        <!-- Calendar dropdown -->
        <div 
          *ngIf="showCalendar"
          #calendarDropdown
          [class]="getCalendarClasses()"
          (click)="$event.stopPropagation()">
          
          <app-daypicker
            [attr.data-key]="calendarKey"
            [selected]="selectedDate"
            [initialDate]="initialDateValue"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [disabledDates]="disabledDates"
            [locale]="locale"
            [onlyCurrentMonth]="true"
            [showFooter]="false"
            [className]="'compact-calendar'"
            (dateChange)="onDateSelected($event)">
          </app-daypicker>
        </div>

        <!-- Backdrop para cerrar el calendario -->
        <div 
          *ngIf="showCalendar"
          class="fixed inset-0 z-40"
          (click)="closeCalendar()">
        </div>
      </div>

      <!-- Mensajes de validación -->
      <div *ngIf="invalidTouched" class="mt-1">
        <div *ngIf="hasValidationError('required')" class="error-message">
          Este campo es requerido
        </div>
        <div *ngIf="validationErrors && validationErrors['custom']" class="error-message">
          {{ validationErrors['custom'] }}
        </div>
      </div>

      <!-- Helper text -->
      <div *ngIf="helperText && !invalidTouched" class="mt-1 text-xs text-gray-500">
        {{ helperText }}
      </div>
    </div>
  `,
  styles: [`
    /* Variables simplificadas */
    :host {
      --primary: var(--institucional-primario, #8B1538);
      --transition: all 0.2s ease;
    }

    /* Floating label */
    .floating-label {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: white;
      padding: 0 4px;
      font-size: 1rem;
      color: #6b7280;
      transition: var(--transition);
      pointer-events: none;
    }

    .label--shifted {
      top: 0;
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
    }

    /* Input base */
    .peer {
      width: 100%;
      min-height: 2.5rem;
      padding: 0.5rem 3rem 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      background: white;
      color: #374151;
      transition: var(--transition);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .peer:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
    }

    .peer:disabled {
      background: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    /* Contenedores */
    .compact-date-input { min-width: 200px; }
    .compact-calendar { max-width: 280px; }
    .compact-calendar .app-daypicker { 
      border: none; 
      padding: 16px; 
    }

    /* Estilos del calendario interno */
    :host ::ng-deep .compact-calendar .app-daypicker__day {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }

    :host ::ng-deep .compact-calendar .app-daypicker__weekday {
      font-size: 0.75rem;
    }

    :host ::ng-deep .compact-calendar .app-daypicker__header-content app-select .peer {
      min-height: 30px !important;
      padding-right: 32px !important;
    }

    /* Mensajes de error */
    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CompactDateInputComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates?: Date[] | ((date: Date) => boolean);
  @Input() locale: string = 'es-MX';
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() ariaLabel?: string;
  @Input() hasError: boolean = false;
  
  // Nuevas propiedades para floating label y validaciones
  @Input() label: string = '';
  @Input() floating: boolean = false;
  @Input() required: boolean = false;
  @Input() helperText: string = '';
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() controlName = '';

  @Output() dateChange = new EventEmitter<Date | null>();

  @ViewChild('inputContainer', { static: false }) inputContainer!: ElementRef;
  @ViewChild('calendarDropdown', { static: false }) calendarDropdown!: ElementRef;

  selectedDate: Date | null = null;
  showCalendar = false;
  dropdownPosition: 'bottom' | 'top' = 'bottom';
  initialDateValue: Date = new Date();
  calendarKey: number = 0; // Para forzar re-render del calendario
  controlId: string = '';
  isFocused: boolean = false;
  validationErrors: any = null;
  control?: FormControl;

  // ControlValueAccessor implementation
  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  constructor(@Optional() private controlContainer?: ControlContainer) {
    this.controlId = `compact-date-input-${Math.random().toString(36).slice(2, 9)}`;
  }

  ngAfterViewInit(): void {
    // Intentar obtener el FormControl del parent si se proporciona controlName
    this.setupFormControl();
    
    // Inicializar la fecha inicial basada en las restricciones
    this.updateInitialDate();
  }

  private setupFormControl(): void {
    if (this.controlName && this.controlContainer) {
      try {
        this.control = this.controlContainer.control?.get(this.controlName) as FormControl;
        if (this.control) {
          // Sincronizar el valor inicial
          if (this.control.value && !this.selectedDate) {
            const val = this.control.value;
            if (typeof val === 'string') {
              // Soportar 'YYYY-MM-DD' y ISO: parsear a medianoche local
              const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(val);
              if (m) {
                const y = Number(m[1]);
                const mo = Number(m[2]);
                const d = Number(m[3]);
                this.selectedDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
              } else {
                const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(val);
                if (isoMatch) {
                  const y = Number(isoMatch[1]);
                  const mo = Number(isoMatch[2]);
                  const d = Number(isoMatch[3]);
                  this.selectedDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
                } else {
                  // Fallback a Date normal
                  this.selectedDate = new Date(val);
                }
              }
            } else if (val instanceof Date) {
              this.selectedDate = new Date(val);
            }
          }
        }
      } catch (error) {
        console.warn(`CompactDateInput: No se pudo obtener el FormControl '${this.controlName}' del parent FormGroup`);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minDate'] || changes['maxDate']) {
      this.updateInitialDate();
    }
  }

  private updateInitialDate(): void {
    const today = new Date();
    
    if (this.minDate && today < this.minDate) {
      this.initialDateValue = new Date(this.minDate);
    } else if (this.maxDate && today > this.maxDate) {
      this.initialDateValue = new Date(this.maxDate);
    } else {
      this.initialDateValue = new Date(today);
    }
    
    console.log('CompactDateInput: initialDateValue updated to:', this.initialDateValue);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (this.showCalendar) {
      this.calculateDropdownPosition();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    if (this.showCalendar) {
      this.calculateDropdownPosition();
    }
  }

  writeValue(value: Date | null): void {
    this.selectedDate = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  getDisplayText(): string {
    if (!this.selectedDate) {
      return this.placeholder;
    }

    return new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(this.selectedDate);
  }

  getCurrentDateForPicker(): Date {
    // Si ya hay una fecha seleccionada, la usamos
    if (this.selectedDate) {
      return this.selectedDate;
    }
    
    // Si no hay fecha seleccionada, usar la fecha actual
    const today = new Date();
    
    // Verificar si la fecha actual está dentro de los límites permitidos
    if (this.minDate && today < this.minDate) {
      return this.minDate;
    }
    
    if (this.maxDate && today > this.maxDate) {
      return this.maxDate;
    }
    
    return today;
  }

  getInitialDateForCalendar(): Date {
    // Solo retornar fecha inicial cuando el calendario está abierto y no hay fecha seleccionada
    if (!this.showCalendar || this.selectedDate) {
      return new Date(); // Valor por defecto
    }
    
    const today = new Date();
    
    if (this.minDate && today < this.minDate) {
      return this.minDate;
    }
    
    if (this.maxDate && today > this.maxDate) {
      return this.maxDate;
    }
    
    return today;
  }

  getInitialDate(): Date {
    // Fecha inicial para mostrar el calendario cuando no hay fecha seleccionada
    const today = new Date();
    
    // Verificar si la fecha actual está dentro de los límites permitidos
    if (this.minDate && today < this.minDate) {
      return this.minDate;
    }
    
    if (this.maxDate && today > this.maxDate) {
      return this.maxDate;
    }
    
    return today;
  }

  getCalendarClasses(): string {
    const baseClasses = 'absolute left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg';
    
    if (this.dropdownPosition === 'top') {
      return `${baseClasses} bottom-full mb-1`;
    } else {
      return `${baseClasses} top-full mt-1`;
    }
  }

  calculateDropdownPosition(): void {
    if (!this.inputContainer) return;

    const inputRect = this.inputContainer.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const calendarHeight = 350; // Altura estimada del calendario
    
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    // Si hay más espacio arriba que abajo y no hay suficiente espacio abajo
    if (spaceAbove > spaceBelow && spaceBelow < calendarHeight) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
  }

  toggleCalendar(): void {
    if (!this.showCalendar) {
      this.calculateDropdownPosition();
      // Actualizar la fecha inicial cada vez que se abre el calendario
      this.updateInitialDate();
      // Incrementar la clave para forzar re-render del calendario
      this.calendarKey++;
    }
    
    this.showCalendar = !this.showCalendar;
    
    if (this.showCalendar) {
      this.onTouched();
    }
  }

  closeCalendar(): void {
    this.showCalendar = false;
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  // Computed properties
  get labelShifted(): boolean {
    return !!(this.selectedDate || this.isFocused);
  }

  get invalidTouched(): boolean {
    return this.hasError || !!(this.validationErrors && Object.keys(this.validationErrors).length > 0);
  }

  get validTouched(): boolean {
    return !!(this.selectedDate && !this.invalidTouched);
  }

  get inputClass(): string {
    const sizeClasses = {
      sm: 'text-sm py-1 px-2 min-h-8',
      md: 'text-base py-2 px-3 min-h-10',
      lg: 'text-lg py-3 px-4 min-h-12'
    };

    return `w-full rounded-lg transition-all duration-200 ${sizeClasses[this.size]}`;
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  // Style methods
  getBorderColor(): string | null {
    if (this.invalidTouched) return 'rgb(239,68,68)';
    if (this.validTouched) return 'rgb(16,185,129)';
    if (this.showCalendar) return 'var(--institucional-primario)';
    return null;
  }

  getBoxShadow(): string | null {
    if (this.invalidTouched) return '0 0 0 3px rgba(239,68,68,0.12)';
    if (this.validTouched) return '0 0 0 3px rgba(16,185,129,0.12)';
    if (this.showCalendar) return '0 0 0 3px rgba(139, 21, 56, 0.12)';
    return null;
  }

  getComputedWidth(): string | null {
    return this.width ?? null;
  }

  getComputedHeight(): string | null {
    return this.height ?? null;
  }

  // Validation methods
  hasValidationError(errorType: string): boolean {
    return this.validationErrors && this.validationErrors[errorType];
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.onChange(date);
    this.dateChange.emit(date);
    this.closeCalendar();
  }
}