import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, AfterViewInit, HostListener, OnChanges, SimpleChanges, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ControlContainer } from '@angular/forms';
import { DayPickerComponent } from '../day-picker/day-picker.component';
import { UniversalIconComponent } from '@/app/shared/components/universal-icon/universal-icon.component';

@Component({
  selector: 'app-compact-date-input',
  standalone: true,
  imports: [CommonModule, DayPickerComponent, UniversalIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompactDateInputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="wrapperClass + ' mb-3'" [ngClass]="{'relative': true}">
      
      <!-- Label non-floating -->
      <label *ngIf="label && !floating" [for]="controlId" class="form-label block text-sm font-medium text-gray-700 mb-1">
        {{ label }}<span *ngIf="required" class="text-red-500"> *</span>
      </label>

      <!-- Container principal -->
      <div class="compact-date-input relative" #inputContainer>
        
        <!-- Input display con floating label -->
        <div class="relative">
          <!-- Input principal -->
          <div 
            [id]="controlId"
            class="peer w-full flex items-center transition-all duration-200 border rounded-lg bg-white"
            [ngClass]="{ 
              'cursor-pointer': !disabled,
              'cursor-not-allowed bg-opacity-50 bg-gray-50 opacity-70': disabled,
              'border-red-500 ring-red-500': hasError || invalidTouched,
              'border-green-500 ring-green-500': validTouched,
              'border-gray-300 ring-institucional-primario ring-opacity-10': !showCalendar && !hasError && !invalidTouched && !validTouched,
              'border-institucional-primario ring-2 ring-institucional-primario ring-opacity-10': showCalendar
            }"
            [class]="inputClass"
            [style.width]="getComputedWidth()"
            [style.height]="getComputedHeight()"
            (click)="!disabled && toggleCalendar()"
            (keydown.enter)="!disabled && toggleCalendar()"
            (keydown.space)="!disabled && toggleCalendar(); $event.preventDefault()"
            (focus)="!disabled && onFocus()"
            (blur)="!disabled && onBlur()"
            [attr.tabindex]="disabled ? '-1' : '0'"
            role="button"
            [attr.aria-label]="ariaLabel || 'Seleccionar fecha'"
            [attr.aria-expanded]="showCalendar">
            
            <div class="flex items-center justify-between w-full h-full px-4">
              <span class="text-sm truncate" [class.text-gray-400]="!selectedDate" [class.text-gray-900]="selectedDate" [style.marginTop]="floating && selectedDate ? '0.5rem' : '0'">
                {{ getDisplayText() }}
              </span>
              <app-universal-icon name="calendar_today" type="material" [size]="20" class="text-gray-400 flex-shrink-0"></app-universal-icon>
            </div>
          </div>

          <!-- Floating label -->
          <label
            *ngIf="floating"
            [for]="controlId"
            class="absolute left-4 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1"
            [ngStyle]="{
              'top': (labelShifted || showCalendar) ? '0' : '50%',
              'transform': 'translateY(-50%)',
              'font-size': (labelShifted || showCalendar) ? '0.75rem' : '1rem',
              'color': (showCalendar || isFocused) ? 'var(--institucional-primario)' : '#6b7280',
              'font-weight': (labelShifted || showCalendar) ? '600' : 'normal',
              'z-index': 10
            }">
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
            [minDate]="$any(parseInputDate(minDate))"
            [maxDate]="$any(parseInputDate(maxDate))"
            [disabledDates]="disabledDates"
            [locale]="locale"
            [onlyCurrentMonth]="true"
            [showFooter]="false"
            [className]="'compact-calendar px-4 py-2'"
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
      <div *ngIf="invalidTouched" class="mt-1 text-xs text-red-500">
        {{ hasValidationError('required') ? 'Este campo es requerido' : (validationErrors?.['custom'] || '') }}
      </div>

      <!-- Helper text -->
      <div *ngIf="helperText && !invalidTouched" class="mt-1 text-xs text-gray-500">
        {{ helperText }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      --institucional-primario: #8B1538;
      display: block;
    }

    .compact-calendar {
      max-width: 320px;
    }

    /* Estilos del calendario interno */
    :host ::ng-deep .compact-calendar .app-daypicker { 
      border: none !important;
      box-shadow: none !important;
    }

    :host ::ng-deep .compact-calendar .app-daypicker__day {
      width: 36px;
      height: 36px;
      font-size: 0.875rem;
    }

    :host ::ng-deep .compact-calendar .app-daypicker__header-content app-select .peer {
      min-height: 36px !important;
    }
  `]
})
export class CompactDateInputComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() minDate: any;
  @Input() maxDate: any;
  @Input() disabledDates?: Date[] | ((date: Date) => boolean);
  @Input() locale: string = 'es-MX';
  @Input() placeholder: string = 'Seleccionar fecha';
  @Input() ariaLabel?: string;
  @Input() hasError: boolean = false;

  // Propiedades para floating label y layout
  @Input() label: string = '';
  @Input() floating: boolean = false;
  @Input() required: boolean = false;
  @Input() helperText: string = '';
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() controlName = '';
  @Input() disabled: boolean = false;
  @Input() preferredPosition: 'auto' | 'top' | 'bottom' = 'auto';

  @Output() dateChange = new EventEmitter<Date | null>();

  @ViewChild('inputContainer', { static: false }) inputContainer!: ElementRef;
  @ViewChild('calendarDropdown', { static: false }) calendarDropdown!: ElementRef;

  selectedDate: Date | null = null;
  showCalendar = false;
  dropdownPosition: 'bottom' | 'top' = 'bottom';
  calendarKey: number = 0;
  controlId: string = '';
  isFocused: boolean = false;
  validationErrors: any = null;
  control?: FormControl;

  private onChange = (value: Date | null) => { };
  private onTouched = () => { };

  constructor(@Optional() private controlContainer?: ControlContainer) {
    this.controlId = `compact-date-input-${Math.random().toString(36).slice(2, 9)}`;
  }

  ngAfterViewInit(): void {
    if (this.controlName && this.controlContainer) {
      try {
        this.control = this.controlContainer.control?.get(this.controlName) as FormControl;
        if (this.control && this.control.value) {
          this.writeValue(this.control.value);
        }
      } catch (e) { }
    }
  }

  ngOnChanges(changes: SimpleChanges): void { }

  public parseInputDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(val);
      if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return new Date(val);
    }
    return undefined;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.showCalendar) this.calculateDropdownPosition();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.showCalendar) this.calculateDropdownPosition();
  }

  writeValue(value: any): void {
    if (!value) {
      this.selectedDate = null;
    } else {
      this.selectedDate = this.parseInputDate(value) || null;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  getDisplayText(): string {
    if (!this.selectedDate) return this.placeholder;
    return new Intl.DateTimeFormat(this.locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(this.selectedDate);
  }

  getCalendarClasses(): string {
    const base = 'absolute left-0 z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl';
    return this.dropdownPosition === 'top' ? `${base} bottom-full mb-2` : `${base} top-full mt-2`;
  }

  calculateDropdownPosition(): void {
    if (!this.inputContainer) return;

    if (this.preferredPosition !== 'auto') {
      this.dropdownPosition = this.preferredPosition;
      return;
    }

    const rect = this.inputContainer.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 350 && spaceAbove > spaceBelow) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
  }

  public open(): void {
    if (!this.showCalendar) {
      this.calculateDropdownPosition();
      this.showCalendar = true;
      this.calendarKey++;
      this.onFocus();
    }
  }

  public close(): void {
    if (this.showCalendar) {
      this.showCalendar = false;
      this.onBlur();
    }
  }

  toggleCalendar(): void {
    if (this.showCalendar) {
      this.closeCalendar();
    } else {
      this.calculateDropdownPosition();
      this.showCalendar = true;
      this.calendarKey++;
      this.onTouched();
    }
  }

  closeCalendar(): void { this.showCalendar = false; }
  onFocus(): void { this.isFocused = true; }
  onBlur(): void { this.isFocused = false; this.onTouched(); }

  get labelShifted(): boolean { return !!(this.selectedDate || this.isFocused); }
  get invalidTouched(): boolean { return this.hasError || (this.control?.invalid && this.control?.touched) || false; }
  get validTouched(): boolean { return !!(this.selectedDate && !this.invalidTouched); }

  get inputClass(): string {
    const minHeight = this.floating ? 'min-h-[3.5rem]' : 'min-h-[2.5rem]';
    return `${minHeight} ${this.fullWidth ? 'w-full' : ''}`;
  }

  get wrapperClass(): string { return this.fullWidth ? 'w-full' : ''; }
  getComputedWidth(): string | null { return this.width || null; }
  getComputedHeight(): string | null { return this.height || (this.floating ? '3.5rem' : null); }

  hasValidationError(type: string): boolean { return this.control?.hasError(type) || false; }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.onChange(date);
    this.dateChange.emit(date);
    this.closeCalendar();
  }
}