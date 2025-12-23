import { Component, Input, OnInit, Optional, Output, EventEmitter, ElementRef, HostListener, ChangeDetectorRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

type ValidatorSpec = {
  required?: boolean;
  custom?: (value: any) => string | null; // return error message or null
  messages?: { [key: string]: string };
};

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UniversalIconComponent],
  template: `
    <!-- Loading state simplificado -->
    <div *ngIf="isInitializing" class="animate-pulse">
      <div class="h-12 bg-gray-200 rounded-md mb-3"></div>
    </div>

    <!-- Component content -->
    <div [class]="wrapperClass + ' mb-3'" [ngClass]="{'relative': true}" *ngIf="!isInitializing">
      
      <!-- Label -->
      <label *ngIf="label && !floating" [for]="controlId" class="form-label">
        {{ label }}<span *ngIf="isRequired" class="text-red-500"> *</span>
      </label>

      <!-- Container principal -->
      <div class="relative" [ngClass]="{'mt-1': label && !floating}">
        
        <!-- Input simulado con dropdown personalizado -->
        <div class="relative">
          
          <!-- Icono izquierdo -->
          <span *ngIf="iconLeft" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <app-universal-icon
              *ngIf="iconLeftType === 'universal'"
              [name]="iconLeft"
              [size]="20"
              customClass="text-current">
            </app-universal-icon>
            <span *ngIf="!iconLeftType || iconLeftType !== 'universal'">{{ iconLeft }}</span>
          </span>

          <!-- Input principal simulado -->
          <div
            [id]="controlId"
            class="peer cursor-pointer"
            [class]="inputClass"
            [ngClass]="cachedStateClasses"
            [attr.aria-expanded]="isOpen"
            [attr.aria-haspopup]="true"
            [attr.role]="'combobox'"
            (click)="toggleDropdown(); $event.stopPropagation()"
            (keydown)="onKeyDown($event)">
            
            <!-- Texto mostrado -->
            <span class="block truncate" [class.text-gray-400]="!selectedOption">
              {{ selectedOption ? selectedOption.label : placeholder }}
            </span>
          </div>

          <!-- Floating label simplificado -->
          <label
            *ngIf="floating"
            [for]="controlId"
            class="absolute text-gray-500 pointer-events-none floating-label transition-all duration-200"
            [class.label--shifted]="labelShifted"
            [class.text-red-500]="invalidTouched"
            [class.text-green-500]="validTouched && !invalidTouched"
            [class.pl-12]="iconLeft"
            [class.pl-4]="!iconLeft">
            {{ label }} <span *ngIf="isRequired" class="text-red-500">*</span>
          </label>

          <!-- Icono de flecha -->
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              class="w-5 h-5 text-gray-400 transition-transform duration-200"
              [class.rotate-180]="isOpen"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        <!-- Dropdown panel -->
        <div 
          *ngIf="isOpen"
          class="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          [style.width]="getComputedWidth() || '100%'"
          role="listbox"
          [attr.aria-label]="'Opciones disponibles'"
          (click)="$event.stopPropagation()"
          (mousedown)="$event.stopPropagation()">
          
          <!-- No options message -->
          <div *ngIf="options.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
            No hay opciones disponibles
          </div>

          <!-- Options list -->
          <ng-container *ngIf="options.length > 0">
            <!-- Opciones agrupadas -->
            <ng-container *ngIf="hasGroups(); else simpleOptionsList">
              <div *ngFor="let group of getGroups()">
                <!-- Group header -->
                <div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                  {{ group }}
                </div>
                <!-- Group options -->
                <div 
                  *ngFor="let option of getOptionsByGroup(group); let i = index"
                  class="option-item"
                  [class.highlighted]="highlightedIndex === getGlobalIndex(option)"
                  [class.selected]="isSelected(option)"
                  [class.disabled]="option.disabled"
                  [attr.id]="'option-' + getOptionId(option)"
                  role="option"
                  [attr.aria-selected]="isSelected(option)"
                  (click)="selectOption(option)"
                  (mouseenter)="highlightedIndex = getGlobalIndex(option)">
                  
                  <div class="flex items-center justify-between px-4 py-3">
                    <span class="text-sm text-gray-900">{{ option.label }}</span>
                    <!-- Check icon for selected -->
                    <div *ngIf="isSelected(option)" class="flex-shrink-0">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
            
            <!-- Opciones simples -->
            <ng-template #simpleOptionsList>
              <div 
                *ngFor="let option of options; trackBy: trackByOption; let i = index"
                class="option-item"
                [class.highlighted]="highlightedIndex === i"
                [class.selected]="isSelected(option)"
                [class.disabled]="option.disabled"
                [attr.id]="'option-' + getOptionId(option)"
                role="option"
                [attr.aria-selected]="isSelected(option)"
                (click)="selectOption(option)"
                (mouseenter)="highlightedIndex = i">
                
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-sm font-medium text-gray-900">{{ option.label }}</span>
                  <!-- Check icon for selected -->
                  <div *ngIf="isSelected(option)" class="flex-shrink-0">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </ng-template>
          </ng-container>
        </div>
      </div>

      <!-- Mensajes de validación -->
      <div *ngIf="invalidTouched" class="mt-1">
        <div *ngIf="control?.errors?.['required']" class="error-message">
          {{ getMessage('required') || 'Este campo es requerido' }}
        </div>
        <div *ngIf="control?.errors?.['custom']" class="error-message">
          {{ control?.errors?.['custom'] }}
        </div>
      </div>

      <!-- Helper text -->
      <div *ngIf="helperText && !invalidTouched" class="mt-1 text-xs text-gray-500">
        {{ helperText }}
      </div>
    </div>
  `,
  styles: [`
    /* Floating label styles */
    .floating-label {
      transition: all var(--transition-fast);
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      background: white;
      padding: 0 4px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
    }

    .label--shifted {
      top: 0;
      transform: translateY(-50%);
      font-size: 0.75rem;
      color: var(--institucional-primario) !important;
      font-weight: 600;
    }

    /* Input simulado styles */
    .peer {
      font-family: 'Montserrat', sans-serif;
      color: var(--gray-800);
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      min-height: var(--select-height, 2.5rem);
    }

    .peer:focus {
      outline: none;
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12), var(--shadow-institucional);
    }

    .peer:disabled {
      background-color: var(--gray-50);
      color: var(--gray-400);
      cursor: not-allowed;
    }

    /* Dropdown styles */
    .option-item {
      cursor: pointer;
      transition: all var(--transition-fast);
      border-bottom: 1px solid var(--gray-100);
    }

    .option-item:last-child {
      border-bottom: none;
    }

    .option-item:hover,
    .option-item.highlighted {
      background-color: var(--gray-50);
    }

    .option-item.selected {
      background-color: rgba(139, 21, 56, 0.05);
      border-left: 3px solid var(--institucional-primario);
    }

    .option-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--gray-50);
    }

    .option-item.disabled:hover {
      background-color: var(--gray-50);
    }

    /* Error styles */
    .error-message {
      color: var(--error);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      font-size: 0.875rem;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Scrollbar styles */
    .overflow-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-auto::-webkit-scrollbar-track {
      background: var(--gray-100);
    }

    .overflow-auto::-webkit-scrollbar-thumb {
      background: var(--gray-300);
      border-radius: 3px;
    }

    .overflow-auto::-webkit-scrollbar-thumb:hover {
      background: var(--gray-400);
    }
  `]
})
export class SelectComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() options: SelectOption[] = [];
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};
  @Input() required = false;
  @Input() allowEmpty = true;
  @Input() width?: string;
  @Input() height?: string;
  @Input() extraClasses = '';
  @Input() helperText = '';
  
  // Variantes visuales y presentaciones
  @Input() variant: 'filled' | 'outlined' | 'borderless' | 'underlined' | 'rounded' | 'square' = 'outlined';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() floating = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() iconLeftType?: 'bootstrap' | 'material' | 'universal';
  @Input() iconRightType?: 'bootstrap' | 'material' | 'universal';
  
  // NUEVAS PROPIEDADES DE PERSONALIZACIÓN
  @Input() customStyle?: any;
  @Input() theme?: string;
  @Input() customCss?: string;
  @Input() fullWidth = false;

  // Output events
  @Output() change = new EventEmitter<any>();

  // Estado interno
  controlId = '';
  isFocused = false;
  isOpen = false;
  selectedOption: SelectOption | null = null;
  highlightedIndex = -1;
  isInitializing = true;

  // Cache para optimización de rendimiento
  private _cachedStateClasses: any = {};
  private _isClassesDirty = true;

  get cachedStateClasses(): any {
    if (this._isClassesDirty) {
      this._cachedStateClasses = {
        'border-red-500 ring-red-500': this.invalidTouched,
        'border-green-500 ring-green-500': this.validTouched,
        'ring-2 ring-opacity-50': this.isOpen
      };
      this._isClassesDirty = false;
    }
    return this._cachedStateClasses;
  }

  constructor(
    @Optional() private controlContainer: ControlContainer,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `select-${Math.random().toString(36).slice(2, 9)}`;

    if (!this.control && this.controlName) {
      const parent = this.controlContainer && (this.controlContainer.control as any);
      if (parent && parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
      }
    }

    if (!this.control) return;

    // Setup inicial más eficiente
    this.setupInitialState();
  }

  ngAfterViewInit(): void {
    // Forzar detección después de que la vista esté completamente inicializada
    setTimeout(() => {
      this.cdr.detectChanges();
      // Marcar como inicializado y invalidar cache
      this.isInitializing = false;
      this._isClassesDirty = true;
      this.cdr.detectChanges();
    }, 10); // Reducido de 50ms a 10ms
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reaccionar a cambios en inputs críticos
    if (changes['options'] && this.control) {
      this.updateSelectedOption(this.control.value);
    }
    
    if (changes['validationMap'] && this.control) {
      this.setupValidators();
      this._isClassesDirty = true; // Invalidar cache cuando cambian validaciones
    }
    
    // Forzar detección de cambios
    this.cdr.markForCheck();
  }

  private setupInitialState(): void {
    // Setup validators
    this.setupValidators();

    // Watch for value changes - Siempre intentar actualizar la opción seleccionada
    const currentValue = this.control!.value;
    if (currentValue !== null && currentValue !== undefined) {
      this.updateSelectedOption(currentValue);
    }

    this.control!.valueChanges.subscribe(value => {
      this.updateSelectedOption(value);
      // Forzar detección cuando cambia el valor
      this.cdr.markForCheck();
    });
    
    // Forzar detección inicial
    this.cdr.detectChanges();
  }

  private setupValidators(): void {
    if (!this.control) return;

    const spec = this.validationMap?.[this.controlName];
    if (spec) {
      if (!spec.messages) spec.messages = {};
      
      const fns: ValidatorFn[] = [];
      
      if (spec.required || this.required) {
        fns.push(Validators.required);
      }

      if (spec.custom) {
        const customFn: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
          const res = spec.custom!(c.value);
          return res ? { custom: res } : null;
        };
        fns.push(customFn);
      }

      if (fns.length) {
        this.control.setValidators(fns);
        this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    }
  }

  private updateSelectedOption(value: any): void {
    this.selectedOption = this.options.find(option => option.value === value) || null;
    // Forzar detección cuando se actualiza la opción seleccionada
    this.cdr.markForCheck();
  }

  // Event handlers
  toggleDropdown(): void {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
    // Marcar cache como dirty cuando cambia el estado
    this._isClassesDirty = true;
    // Forzar detección después de toggle
    this.cdr.markForCheck();
  }

  openDropdown(): void {
    this.isOpen = true;
    this._isClassesDirty = true;
    this.highlightedIndex = this.selectedOption ? 
      this.options.findIndex(option => option.value === this.selectedOption!.value) : -1;
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this._isClassesDirty = true;
      this.highlightedIndex = -1;
      
      // Forzar la detección de cambios si es necesario
      if (this.cdr) {
        this.cdr.detectChanges();
      }
    }
  }

  /**
   * Método público para forzar el cierre del dropdown
   * Útil cuando se necesita cerrar desde componentes padre
   */
  forceClose(): void {
    this.closeDropdown();
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.selectedOption = option;
    
    if (this.control) {
      this.control.setValue(option.value);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    
    this.change.emit(option.value);
    
    // Cerrar el dropdown de forma más robusta
    setTimeout(() => {
      this.closeDropdown();
      // Forzar detección después de selección
      this.cdr.detectChanges();
    }, 0);
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(-1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen && this.highlightedIndex >= 0) {
          this.selectOption(this.options[this.highlightedIndex]);
        } else {
          this.toggleDropdown();
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  private navigateOptions(direction: number): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    const enabledOptions = this.options.filter(option => !option.disabled);
    if (enabledOptions.length === 0) return;

    let newIndex = this.highlightedIndex + direction;
    
    if (newIndex < 0) {
      newIndex = this.options.length - 1;
    } else if (newIndex >= this.options.length) {
      newIndex = 0;
    }

    // Skip disabled options
    while (this.options[newIndex]?.disabled) {
      newIndex += direction;
      if (newIndex < 0) newIndex = this.options.length - 1;
      if (newIndex >= this.options.length) newIndex = 0;
    }

    this.highlightedIndex = newIndex;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Usar un timeout para asegurar que se ejecute después de otros eventos
    setTimeout(() => {
      const target = event.target as HTMLElement;
      
      // Verificar si el clic fue dentro del componente o del dropdown
      if (target && 
          this.isOpen && 
          !this.elementRef.nativeElement.contains(target)) {
        this.closeDropdown();
      }
    }, 0);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Cerrar inmediatamente en mousedown si es fuera del componente
    if (target && 
        this.isOpen && 
        !this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeDropdown();
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
  }

  // Computed properties
  get invalidTouched(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  get validTouched(): boolean {
    return !!(this.control && this.control.valid && this.control.touched && this.control.value);
  }

  get labelShifted(): boolean {
    return !!(this.control && (this.control.value !== null && this.control.value !== '')) || this.isFocused;
  }

  get inputClass(): string {
    const sizeClasses = {
      xs: 'text-xs py-1 px-2',
      sm: 'text-sm py-2 px-3',
      md: 'text-base py-3 px-4',
      lg: 'text-lg py-4 px-5',
      xl: 'text-xl py-5 px-6'
    };

    const variantClasses = {
      outlined: 'bg-white border',
      filled: 'bg-gray-50 border-transparent',
      borderless: 'bg-transparent border-transparent',
      underlined: 'bg-transparent border-0 border-b',
      rounded: 'bg-white border rounded-full',
      square: 'bg-white border rounded-none'
    };

    return `w-full rounded-lg transition-all duration-200 ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${this.extraClasses}`;
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  get isRequired(): boolean {
    return this.required || !!(this.validationMap?.[this.controlName]?.required);
  }

  // Style methods
  getBorderColor(): string | null {
    if (this.invalidTouched) return 'rgb(239,68,68)';
    if (this.validTouched) return 'rgb(16,185,129)';
    if (this.isOpen) return 'var(--institucional-primario)';
    return null;
  }

  getBoxShadow(): string | null {
    if (this.invalidTouched) return '0 0 0 3px rgba(239,68,68,0.12)';
    if (this.validTouched) return '0 0 0 3px rgba(16,185,129,0.12)';
    if (this.isOpen) return '0 0 0 3px rgba(139, 21, 56, 0.12)';
    return null;
  }

  getComputedWidth(): string | null {
    return this.width ?? null;
  }

  getComputedHeight(): string | null {
    return this.height ?? null;
  }

  // Utility methods
  isSelected(option: SelectOption): boolean {
    return this.selectedOption?.value === option.value;
  }

  getOptionId(option: SelectOption): string {
    return `${this.controlId}-option-${option.value}`;
  }

  getGlobalIndex(option: SelectOption): number {
    return this.options.findIndex(opt => opt.value === option.value);
  }

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    return spec?.messages ? spec.messages[key] : undefined;
  }

  // Methods for grouped options
  hasGroups(): boolean {
    return this.options.some(option => option.group);
  }

  getGroups(): string[] {
    const groups = this.options
      .filter(option => option.group)
      .map(option => option.group!)
      .filter((group, index, array) => array.indexOf(group) === index);
    return groups;
  }

  getOptionsByGroup(group: string): SelectOption[] {
    return this.options.filter(option => option.group === group);
  }

  // Track by function for performance
  trackByOption(index: number, option: SelectOption): any {
    return option.value;
  }

  /**
   * Fuerza la sincronización de la selección desde el FormControl.
   * Útil cuando el control se actualiza programáticamente con emitEvent:false
   */
  refreshFromControl(): void {
    if (!this.control) return;
    this.updateSelectedOption(this.control.value);
    // Forzar detección de cambios para OnPush parents
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }
}
