import { 
  Component, 
  OnInit, 
  OnDestroy, 
  OnChanges,
  SimpleChanges,
  ViewChild, 
  Input, 
  Output, 
  EventEmitter, 
  ElementRef, 
  HostListener, 
  Optional,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  FormControl, 
  ControlContainer, 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { 
  Subject, 
  takeUntil, 
  Observable, 
  BehaviorSubject, 
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  catchError,
  of,
  tap,
  map
} from 'rxjs';
import { SelectDataService, SelectDataItem, SelectSearchParams } from '@/app/core/services/select-data.service';
import { UniversalIconComponent } from '@/app/shared/components/universal-icon/universal-icon.component';

export interface SelectSearchOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  avatar?: string;
  badges?: Badge[];
}

export interface Badge {
  text: string;
  color?: string;
  bgColor?: string;
  textColor?: string;
}

export interface BadgeConfig {
  // Función personalizada para generar badges
  generator?: (item: SelectDataItem) => Badge[];
  // Configuración de colores por valor
  colorMap?: { [key: string]: { bgColor: string; textColor: string } };
  // Colores por defecto
  defaultColors?: { bgColor: string; textColor: string };
  // Si usar badges automáticos basados en endpoint (compatibilidad)
  useEndpointBadges?: boolean;
}

type ValidatorSpec = {
  required?: boolean;
  custom?: (value: any) => string | null;
  messages?: { [key: string]: string };
};

@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UniversalIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchComponent),
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
      <div class="relative" [ngClass]="{'mt-1': label && !floating}">
        
        <!-- Input de búsqueda con floating label -->
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

          <!-- Input principal -->
          <input
            #searchInput
            [id]="controlId"
            type="text"
            class="peer"
            [class]="inputClass"
            [ngClass]="{ 
              'border-red-500 ring-red-500': invalidTouched,
              'border-green-500 ring-green-500': validTouched,
              'ring-2 ring-opacity-50': isOpen
            }"
            [style.border-color]="getBorderColor()"
            [style.box-shadow]="getBoxShadow()"
            [style.width]="getComputedWidth()"
            [style.height]="getComputedHeight()"
            [style.paddingLeft.px]="iconLeft ? 48 : (floating ? 16 : 12)"
            [style.paddingRight.px]="48"
            [style.paddingTop.px]="floating ? 14 : null"
            [style.paddingBottom.px]="floating ? 14 : null"
            [placeholder]="floating ? '' : placeholder"
            [value]="displayValue"
            [disabled]="disabled"
            (input)="onSearchInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (click)="onInputClick()"
            (keydown)="onKeyDown($event)"
            [attr.aria-expanded]="isOpen"
            [attr.aria-haspopup]="true"
            [attr.role]="'combobox'"
            [attr.aria-activedescendant]="getActiveDescendant()">

          <!-- Floating label -->
          <label
            *ngIf="floating"
            [for]="controlId"
            [style.left.px]="iconLeft ? 48 : 16"
            class="absolute text-gray-500 pointer-events-none floating-label transition-all duration-200"
            [class.label--shifted]="labelShifted"
            [class.text-red-500]="invalidTouched"
            [class.text-green-500]="validTouched && !invalidTouched">
            {{ label }} <span *ngIf="required" class="text-red-500">*</span>
          </label>

          <!-- Icono de flecha/estado -->
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div class="flex items-center space-x-1">
              <!-- Loading spinner -->
              <svg *ngIf="isLoading" class="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              <!-- Clear button -->
              <button 
                *ngIf="clearable && selectedOption && !disabled && !isLoading"
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200 pointer-events-auto"
                (click)="clearSelection($event)"
                [attr.aria-label]="'Limpiar selección'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              
              <!-- Dropdown arrow -->
              <svg 
                *ngIf="!isLoading"
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                [class.rotate-180]="isOpen"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Dropdown panel -->
        <div 
          *ngIf="isOpen"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          [style.width]="getComputedWidth() || '100%'"
          role="listbox"
          [attr.aria-label]="'Opciones disponibles'">
          
          <!-- Loading state -->
          <div *ngIf="isLoading" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div class="flex items-center justify-center space-x-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loadingText }}</span>
            </div>
          </div>

          <!-- Error state -->
          <div *ngIf="error && !isLoading" class="px-4 py-3 text-sm text-red-500 text-center">
            <div class="flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- No options message -->
          <div *ngIf="!isLoading && !error && filteredOptions.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div *ngIf="searchTerm && searchTerm.length > 0; else noOptionsTemplate">
              No se encontraron resultados para "{{ searchTerm }}"
            </div>
            <ng-template #noOptionsTemplate>
              <div *ngIf="availableOptions.length === 0; else noSearchResults">
                {{ getNoOptionsMessage() }}
              </div>
              <ng-template #noSearchResults>
                Escribe para buscar opciones
              </ng-template>
            </ng-template>
          </div>

          <!-- Options list -->
          <ng-container *ngIf="!isLoading && !error && filteredOptions.length > 0">
            <div 
              *ngFor="let option of filteredOptions; trackBy: trackByOption; let i = index"
              class="option-item"
              [class.highlighted]="highlightedIndex === i"
              [class.selected]="isSelected(option)"
              [class.disabled]="option.disabled"
              [attr.id]="'option-' + getOptionId(option)"
              role="option"
              [attr.aria-selected]="isSelected(option)"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex = i">
              
              <div class="flex items-center px-4 py-3">
                <!-- Avatar -->
                <div *ngIf="option.avatar" class="flex-shrink-0 mr-3">
                  <img [src]="option.avatar" [alt]="option.label" class="w-8 h-8 rounded-full object-cover">
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900" [innerHTML]="highlightSearchTerm(option.label)"></div>
                  <div *ngIf="option.description" class="text-xs text-gray-500 truncate" [innerHTML]="highlightSearchTerm(option.description)"></div>
                </div>
                
                <!-- Badges -->
                <div *ngIf="option.badges && option.badges.length > 0" class="flex items-center space-x-1 ml-2">
                  <span *ngFor="let badge of option.badges" 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        [class]="badge.bgColor || 'bg-gray-100'"
                        [ngClass]="badge.textColor || 'text-gray-800'">
                    {{ badge.text }}
                  </span>
                </div>
                
                <!-- Check icon for selected -->
                <div *ngIf="isSelected(option)" class="flex-shrink-0 ml-2">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Create new option -->
          <div 
            *ngIf="allowCreate && searchTerm && !hasExactMatch() && !isLoading && !error"
            class="option-item border-t border-gray-200"
            [class.highlighted]="highlightedIndex === filteredOptions.length"
            (click)="createNewOption()"
            (mouseenter)="highlightedIndex = filteredOptions.length">
            <div class="flex items-center px-4 py-3">
              <svg class="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span class="text-sm text-gray-700">{{ createText }} "{{ searchTerm }}"</span>
            </div>
          </div>
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

    /* Input styles */
    input {
      font-family: 'Montserrat', sans-serif;
      color: var(--gray-800);
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    input:focus {
      outline: none;
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12), var(--shadow-institucional);
    }

    input:disabled {
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

    /* Highlight text styles */
    .highlight {
      background-color: rgba(139, 21, 56, 0.2);
      font-weight: 600;
      border-radius: 2px;
      padding: 0 1px;
    }
  `]
})
export class SelectSearchComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // =============================================
  // API PÚBLICA - INPUTS REQUERIDOS
  // =============================================
  
  /**
   * REQUERIDO: Endpoint de la API de donde obtener los datos
   * Ejemplo: 'areas', 'positions', 'facilities/active'
   */
  @Input({ required: true }) endpoint!: string;

  // =============================================
  // API PÚBLICA - INPUTS OPCIONALES
  // =============================================
  
  // Configuración básica
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() required = false;
  @Input() disabled = false;
  @Input() helperText = '';

  // Configuración de validación (compatible con sistema existente)
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};

  // Configuración de búsqueda
  @Input() searchable = true;
  @Input() clearable = true;
  @Input() allowCreate = false;
  @Input() minSearchLength = 1;
  @Input() debounceTime = 300;
  @Input() maxHeight = '240px';
  @Input() noOptionsText = 'No hay opciones disponibles';
  @Input() loadingText = 'Cargando...';
  @Input() createText = 'Crear';
  
  /**
   * Si está habilitado, solo realiza búsquedas locales en los elementos ya cargados
   * No hace consultas adicionales a la API durante la búsqueda
   * Útil para listas pequeñas o cuando se quiere evitar múltiples requests a la API
   */
  @Input() localSearchOnly = false;

  // Configuración visual
  @Input() floating = true;
  @Input() width?: string;
  @Input() height?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'outlined' | 'filled' | 'borderless' = 'outlined';
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconLeftType?: 'bootstrap' | 'material' | 'universal';

  // Configuración de datos adicionales
  @Input() additionalParams: SelectSearchParams = {};
  
  /**
   * Si está habilitado, requiere que additionalParams tengan valores antes de cargar datos
   * Útil para casos como "positions" que requieren "area_id" para filtrar
   */
  @Input() requireAdditionalParams = false;

  /**
   * Configuración para personalizar badges
   * Puede ser una función que recibe el item y retorna array de badges con colores
   * O un objeto con configuración estática
   */
  @Input() badgeConfig?: BadgeConfig;

  // =============================================
  // API PÚBLICA - OUTPUTS
  // =============================================
  
  /**
   * Evento principal que emite cuando cambia la selección
   * Emite el objeto completo seleccionado
   */
  @Output() selectionChange = new EventEmitter<SelectDataItem | null>();
  
  // Eventos adicionales para casos específicos
  @Output() create = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // =============================================
  // ESTADO INTERNO - ENCAPSULADO
  // =============================================
  
  // Estado de datos
  availableOptions: SelectDataItem[] = [];
  filteredOptions: SelectSearchOption[] = [];
  selectedOption: SelectDataItem | null = null;
  isLoading = false;
  error: string | null = null;

  // Estado de UI
  controlId = '';
  isOpen = false;
  isFocused = false;
  searchTerm = '';
  highlightedIndex = -1;

  // Subjects para manejo reactivo interno
  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<string>('');

  // Control de peticiones para evitar spam
  private lastParamsHash = '';
  private isInitialLoadComplete = false;

  // ControlValueAccessor
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(
    @Optional() private controlContainer: ControlContainer,
    private elementRef: ElementRef,
    private selectDataService: SelectDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `select-search-${Math.random().toString(36).slice(2, 9)}`;

    // Setup form control
    this.setupFormControl();

    // Setup validators
    this.setupValidators();

    // Setup data stream
    this.setupDataStream();

    // Load initial data
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambian los additionalParams y ya hemos inicializado, recargar datos
    if (changes['additionalParams'] && !changes['additionalParams'].firstChange && this.isInitialLoadComplete) {
      const newParamsHash = JSON.stringify(this.additionalParams);
      
      // Solo recargar si los parámetros realmente cambiaron
      if (newParamsHash !== this.lastParamsHash) {
        this.lastParamsHash = newParamsHash;
        this.loadInitialData();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =============================================
  // SETUP METHODS
  // =============================================

  private setupFormControl(): void {
    if (!this.control && this.controlName) {
      const parent = this.controlContainer && (this.controlContainer.control as any);
      if (parent && parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
      }
    }

    if (this.control) {
      // Watch for external value changes
      this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => this.handleExternalValueChange(value));
    }
  }

  private setupValidators(): void {
    if (!this.control) return;

    const spec = this.validationMap?.[this.controlName];
    if (spec) {
      const validators: ValidatorFn[] = [];
      
      if (spec.required || this.required) {
        validators.push(Validators.required);
      }

      if (spec.custom) {
        const customFn: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
          const error = spec.custom!(control.value);
          return error ? { custom: error } : null;
        };
        validators.push(customFn);
      }

      if (validators.length) {
        this.control.setValidators(validators);
        this.control.updateValueAndValidity();
      }
    }
  }

  private setupDataStream(): void {
    // Setup reactive search stream
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        switchMap(searchTerm => this.performSearch(searchTerm)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (result) => this.handleSearchResult(result),
        error: (error) => this.handleSearchError(error)
      });
  }

  // =============================================
  // DATA MANAGEMENT - ENCAPSULADO
  // =============================================

  private loadInitialData(): void {
    // Evitar cargas múltiples si ya está cargando
    if (this.isLoading) {
      return;
    }

    // Si se requieren additionalParams pero están vacíos, no cargar datos aún
    if (this.requireAdditionalParams && Object.keys(this.additionalParams).length === 0) {
      this.availableOptions = [];
      this.updateFilteredOptions();
      this.isLoading = false;
      this.isInitialLoadComplete = true;
      this.lastParamsHash = JSON.stringify(this.additionalParams);
      this.cdr.markForCheck();
      return;
    }

    // Verificar si ya tenemos estos parámetros cargados
    const currentParamsHash = JSON.stringify(this.additionalParams);
    if (this.isInitialLoadComplete && currentParamsHash === this.lastParamsHash) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.lastParamsHash = currentParamsHash;

    // Si localSearchOnly está habilitado, cargar más elementos inicialmente
    const limit = this.localSearchOnly ? 200 : 50;

    const params: SelectSearchParams = {
      ...this.additionalParams,
      limit: limit
    };

    this.selectDataService.search(this.endpoint, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableOptions = response.items;
          this.updateFilteredOptions();
          this.isLoading = false;
          this.isInitialLoadComplete = true;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.isInitialLoadComplete = true;
          this.handleSearchError(error);
        }
      });
  }

  private performSearch(searchTerm: string): Observable<any> {
    // Si localSearchOnly está habilitado, solo buscar localmente
    if (this.localSearchOnly) {
      return of({ items: this.availableOptions, fromCache: true });
    }

    if (!searchTerm || searchTerm.length < this.minSearchLength) {
      // Si no hay término de búsqueda, mostrar datos iniciales
      return of({ items: this.availableOptions, fromCache: true });
    }

    this.isLoading = true;
    this.error = null;

    const params: SelectSearchParams = {
      ...this.additionalParams,
      search: searchTerm,
      limit: 50
    };

    return this.selectDataService.search(this.endpoint, params)
      .pipe(
        map(response => ({ ...response, fromCache: false })),
        catchError(error => {
          return of({ items: [], error: 'Error al buscar datos', fromCache: false });
        })
      );
  }

  private handleSearchResult(result: any): void {
    this.isLoading = false;
    
    if (result.error) {
      this.error = result.error;
      this.availableOptions = [];
    } else {
      this.error = null;
      this.availableOptions = result.items || [];
    }
    
    this.updateFilteredOptions();
    this.cdr.markForCheck();
  }

  private handleSearchError(error: any): void {
    this.isLoading = false;
    this.error = 'Error al cargar los datos';
    this.availableOptions = [];
    this.updateFilteredOptions();
    this.cdr.markForCheck();
  }

  private updateFilteredOptions(): void {
    // Convertir SelectDataItem[] a SelectSearchOption[]
    let optionsToFilter = this.availableOptions.map(item => ({
      value: item.id,
      label: item.name,
      description: item.description,
      disabled: false,
      badges: this.generateBadges(item)
    }));

    // Si hay un término de búsqueda, filtrar localmente
    if (this.searchTerm && this.searchTerm.length > 0) {
      const term = this.searchTerm.toLowerCase();
      optionsToFilter = optionsToFilter.filter(option =>
        option.label.toLowerCase().includes(term) ||
        (option.description && option.description.toLowerCase().includes(term)) ||
        (option.badges && option.badges.some(badge => badge.text.toLowerCase().includes(term)))
      );
    }

    this.filteredOptions = optionsToFilter;
  }

  private generateBadges(item: SelectDataItem): Badge[] {
    // Si hay configuración personalizada, usarla
    if (this.badgeConfig?.generator) {
      return this.badgeConfig.generator(item);
    }

    const badges: Badge[] = [];
    
    // 1. Primero intentar obtener badges desde los datos de la API
    if (item['badge']) {
      // Puede ser string o array
      const badgeData = Array.isArray(item['badge']) ? item['badge'] : [item['badge']];
      
      badgeData.forEach(badgeText => {
        if (badgeText && typeof badgeText === 'string') {
          const badge: Badge = { text: badgeText };
          
          // Aplicar colores desde configuración
          if (this.badgeConfig?.colorMap?.[badgeText]) {
            const colors = this.badgeConfig.colorMap[badgeText];
            badge.bgColor = colors.bgColor;
            badge.textColor = colors.textColor;
          } else if (this.badgeConfig?.defaultColors) {
            badge.bgColor = this.badgeConfig.defaultColors.bgColor;
            badge.textColor = this.badgeConfig.defaultColors.textColor;
          } else {
            // Colores por defecto
            badge.bgColor = 'bg-blue-100';
            badge.textColor = 'text-blue-800';
          }
          
          badges.push(badge);
        }
      });
    }

    // 2. Si no hay badges en los datos y está habilitado, usar badges automáticos por endpoint
    if (badges.length === 0 && (this.badgeConfig?.useEndpointBadges !== false)) {
      const defaultColors = this.badgeConfig?.defaultColors || { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
      
      if (this.endpoint.includes('area')) {
        badges.push({ text: 'Área', ...defaultColors });
      }
      if (this.endpoint.includes('position')) {
        badges.push({ text: 'Puesto', ...defaultColors });
      }
      if (this.endpoint.includes('facilit')) {
        badges.push({ text: 'Instalación', ...defaultColors });
      }
    }
    
    return badges;
  }

  private handleExternalValueChange(value: any): void {
    if (value && value !== this.selectedOption?.id) {
      // Cargar el elemento por ID si no está en la lista actual
      this.loadItemById(value);
    } else if (!value) {
      this.selectedOption = null;
      this.searchTerm = '';
    }
  }

  private loadItemById(id: any): void {
    this.selectDataService.getById(this.endpoint, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (item) => {
          if (item) {
            this.selectedOption = item;
            this.searchTerm = '';
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          // Error silencioso
        }
      });
  }

  // =============================================
  // EVENT HANDLERS
  // =============================================

  onFocus(): void {
    this.isFocused = true;
    if (this.selectedOption) {
      this.searchTerm = '';
      this.updateFilteredOptions();
    }
    this.openDropdown();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    setTimeout(() => {
      if (!this.isFocused) {
        this.closeDropdown();
      }
    }, 150);
  }

  onInputClick(): void {
    if (!this.isOpen) {
      this.openDropdown();
    } else if (this.selectedOption) {
      this.searchTerm = '';
      this.updateFilteredOptions();
      this.highlightedIndex = -1;
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    
    // Si localSearchOnly está habilitado, solo filtrar localmente
    if (this.localSearchOnly) {
      this.updateFilteredOptions();
    } else {
      // Comportamiento normal: usar el stream reactivo para búsquedas en API
      if (this.searchTerm.length >= this.minSearchLength) {
        this.searchSubject.next(this.searchTerm);
      } else {
        this.updateFilteredOptions();
      }
    }
    
    this.highlightedIndex = -1;
    
    if (!this.isOpen) {
      this.openDropdown();
    }
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
        event.preventDefault();
        this.selectHighlightedOption();
        break;
      case 'Escape':
        this.closeDropdown();
        break;
      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  // =============================================
  // DROPDOWN MANAGEMENT
  // =============================================

  openDropdown(): void {
    if (!this.disabled && !this.isOpen) {
      this.isOpen = true;
      if (!this.selectedOption || this.searchTerm) {
        this.updateFilteredOptions();
      }
      this.open.emit();
    }
  }

  closeDropdown(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.highlightedIndex = -1;
      this.resetSearchTerm();
      this.close.emit();
    }
  }

  private resetSearchTerm(): void {
    this.searchTerm = (!this.isFocused && this.selectedOption) ? this.selectedOption.name : '';
  }

  // =============================================
  // OPTION MANAGEMENT
  // =============================================

  selectOption(option: SelectSearchOption): void {
    if (option.disabled) return;

    // Encontrar el elemento completo en availableOptions
    const fullItem = this.availableOptions.find(item => item.id === option.value);
    if (!fullItem) return;

    this.selectedOption = fullItem;
    this.searchTerm = '';
    
    // Actualizar FormControl
    if (this.control) {
      this.control.setValue(fullItem.id);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    
    // ControlValueAccessor
    this.onChange(fullItem.id);
    
    // Emitir evento principal
    this.selectionChange.emit(fullItem);
    
    this.closeDropdown();
  }

  selectHighlightedOption(): void {
    if (this.highlightedIndex >= 0) {
      if (this.allowCreate && this.highlightedIndex === this.filteredOptions.length) {
        this.createNewOption();
      } else if (this.filteredOptions[this.highlightedIndex]) {
        this.selectOption(this.filteredOptions[this.highlightedIndex]);
      }
    }
  }

  createNewOption(): void {
    if (this.searchTerm.trim()) {
      this.create.emit(this.searchTerm.trim());
      this.closeDropdown();
    }
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedOption = null;
    this.searchTerm = '';
    
    if (this.control) {
      this.control.setValue(null);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    
    this.onChange(null);
    this.selectionChange.emit(null);
    this.searchInput?.nativeElement.focus();
  }

  private navigateOptions(direction: number): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    const maxIndex = this.allowCreate && this.searchTerm && !this.hasExactMatch() 
      ? this.filteredOptions.length 
      : this.filteredOptions.length - 1;

    this.highlightedIndex = Math.max(-1, Math.min(maxIndex, this.highlightedIndex + direction));
  }

  // =============================================
  // COMPUTED PROPERTIES & HELPERS
  // =============================================

  get displayValue(): string {
    if (this.searchTerm) {
      return this.searchTerm;
    }
    if (this.selectedOption && !this.isFocused) {
      return this.selectedOption.name;
    }
    return '';
  }

  get labelShifted(): boolean {
    return this.isFocused || !!this.searchTerm || !!this.selectedOption;
  }

  get invalidTouched(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  get validTouched(): boolean {
    return !!(this.control && this.control.valid && this.control.touched && this.control.value);
  }

  get inputClass(): string {
    const sizeClasses = {
      sm: 'text-sm py-2 px-3',
      md: 'text-base py-3 px-4',
      lg: 'text-lg py-4 px-5'
    };

    const variantClasses = {
      outlined: 'bg-white border',
      filled: 'bg-gray-50 border-transparent',
      borderless: 'bg-transparent border-transparent'
    };

    return `w-full rounded-lg transition-all duration-200 ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
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
  isSelected(option: SelectSearchOption): boolean {
    return this.selectedOption?.id === option.value;
  }

  hasExactMatch(): boolean {
    return this.availableOptions.some(option => 
      option.name.toLowerCase() === this.searchTerm.toLowerCase()
    );
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getOptionId(option: SelectSearchOption): string {
    return `${this.controlId}-option-${option.value}`;
  }

  getActiveDescendant(): string | null {
    if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
      return this.getOptionId(this.filteredOptions[this.highlightedIndex]);
    }
    return null;
  }

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    return spec?.messages ? spec.messages[key] : undefined;
  }

  // Track by functions for performance
  trackByOption(index: number, option: SelectSearchOption): any {
    return option.value;
  }

  // =============================================
  // CONTROLVALUEACCESSOR IMPLEMENTATION
  // =============================================

  writeValue(value: any): void {
    if (value !== this.selectedOption?.id) {
      if (value) {
        this.loadItemById(value);
      } else {
        this.selectedOption = null;
        this.searchTerm = '';
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  /**
   * Obtiene el mensaje apropiado cuando no hay opciones disponibles
   */
  getNoOptionsMessage(): string {
    if (this.requireAdditionalParams && Object.keys(this.additionalParams).length === 0) {
      return 'Selecciona un filtro primero para ver las opciones';
    }
    return this.noOptionsText;
  }
}
