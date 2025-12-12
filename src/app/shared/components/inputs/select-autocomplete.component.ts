import { Component, Input, OnInit, OnDestroy, Optional, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { Subject, takeUntil, debounceTime, switchMap, catchError, of, Observable, BehaviorSubject } from 'rxjs';

export interface AutocompleteOption {
  value: any;
  label: string;
  disabled?: boolean;
  description?: string;
  avatar?: string;
  badges?: string[];
  metadata?: any;
}

export interface AutocompleteConfig {
  endpoint?: string;
  searchParam?: string;
  valueField?: string;
  labelField?: string;
  descriptionField?: string;
  avatarField?: string;
  transform?: (data: any) => AutocompleteOption[];
}

type ValidatorSpec = {
  required?: boolean;
  custom?: (value: any) => string | null;
  messages?: { [key: string]: string };
};

@Component({
  selector: 'app-select-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UniversalIconComponent],
  template: `
    <div [class]="wrapperClass + ' mb-3'" [ngClass]="{'relative': true}">
      
      <!-- Label -->
      <label *ngIf="label && !floating" [for]="controlId" class="form-label">
        {{ label }}<span *ngIf="isRequired" class="text-red-500"> *</span>
      </label>

      <!-- Container principal -->
      <div class="relative" [ngClass]="{'mt-1': label && !floating}">
        
        <!-- Input container -->
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
            [style.paddingRight.px]="60"
            [style.paddingTop.px]="floating ? 20 : null"
            [style.paddingBottom.px]="floating ? 8 : null"
            [placeholder]="floating ? '' : placeholder"
            [value]="displayValue"
            [disabled]="disabled"
            [readonly]="readonly"
            (input)="onSearchInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeyDown($event)"
            [attr.aria-expanded]="isOpen"
            [attr.aria-haspopup]="true"
            [attr.aria-activedescendant]="getActiveDescendant()"
            [attr.autocomplete]="'off'">

          <!-- Floating label -->
          <label
            *ngIf="floating"
            [for]="controlId"
            [style.left.px]="iconLeft ? 48 : 16"
            class="absolute text-gray-500 pointer-events-none floating-label transition-all duration-200"
            [class.label--shifted]="labelShifted"
            [class.text-red-500]="invalidTouched"
            [class.text-green-500]="validTouched && !invalidTouched">
            {{ label }} <span *ngIf="isRequired" class="text-red-500">*</span>
          </label>

          <!-- Action buttons -->
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            
            <!-- Loading spinner -->
            <svg *ngIf="loading || isSearching" class="animate-spin w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <!-- Clear button -->
            <button 
              *ngIf="clearable && selectedOption && !disabled && !loading && !readonly"
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-2"
              (click)="clearSelection($event)"
              [attr.aria-label]="'Limpiar selección'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            
            <!-- Refresh button for manual search -->
            <button 
              *ngIf="showRefreshButton && !isSearching"
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200 mr-2"
              (click)="refreshOptions()"
              [attr.aria-label]="'Actualizar opciones'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            
            <!-- Dropdown arrow -->
            <svg 
              *ngIf="!loading && !isSearching"
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
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          [style.width]="getComputedWidth() || '100%'"
          role="listbox"
          [attr.aria-label]="'Opciones disponibles'">
          
          <!-- Search info -->
          <div *ngIf="searchTerm && minSearchLength > 0 && searchTerm.length < minSearchLength" 
               class="px-4 py-3 text-sm text-gray-500 text-center border-b border-gray-100">
            Escribe al menos {{ minSearchLength }} caracteres para buscar
          </div>

          <!-- Loading state -->
          <div *ngIf="isSearching" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div class="flex items-center justify-center space-x-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loadingText }}</span>
            </div>
          </div>

          <!-- Error state -->
          <div *ngIf="hasError && !isSearching" class="px-4 py-3 text-sm text-red-500 text-center border-b border-gray-100">
            <div class="flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
            <button 
              *ngIf="allowRetry"
              class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              (click)="retrySearch()">
              Reintentar
            </button>
          </div>
          
          <!-- No options message -->
          <div *ngIf="!isSearching && !hasError && options.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div *ngIf="searchTerm && searchTerm.length >= minSearchLength; else noOptionsTemplate">
              No se encontraron resultados para "{{ searchTerm }}"
            </div>
            <ng-template #noOptionsTemplate>
              <div *ngIf="searchTerm && searchTerm.length > 0; else initialState">
                {{ noResultsText }}
              </div>
              <ng-template #initialState>
                {{ emptyStateText }}
              </ng-template>
            </ng-template>
          </div>

          <!-- Options list -->
          <div *ngIf="!isSearching && !hasError && options.length > 0">
            
            <!-- Recent selections -->
            <div *ngIf="showRecentSelections && recentOptions.length > 0 && !searchTerm" class="border-b border-gray-100">
              <div class="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50">
                Selecciones recientes
              </div>
              <div 
                *ngFor="let option of recentOptions; trackBy: trackByOption; let i = index"
                class="option-item recent"
                [class.highlighted]="highlightedIndex === i"
                [class.selected]="isSelected(option)"
                [class.disabled]="option.disabled"
                [attr.id]="'recent-option-' + getOptionId(option)"
                role="option"
                [attr.aria-selected]="isSelected(option)"
                (click)="selectOption(option)"
                (mouseenter)="highlightedIndex = i">
                
                <div class="flex items-center px-4 py-3">
                  <!-- Recent icon -->
                  <svg class="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  
                  <!-- Avatar -->
                  <div *ngIf="option.avatar" class="flex-shrink-0 mr-3">
                    <img [src]="option.avatar" [alt]="option.label" class="w-8 h-8 rounded-full object-cover">
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900">{{ option.label }}</div>
                    <div *ngIf="option.description" class="text-xs text-gray-500 truncate">{{ option.description }}</div>
                  </div>
                  
                  <!-- Check icon for selected -->
                  <div *ngIf="isSelected(option)" class="flex-shrink-0 ml-2">
                    <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Search results -->
            <div 
              *ngFor="let option of options; trackBy: trackByOption; let i = index"
              class="option-item"
              [class.highlighted]="highlightedIndex === (showRecentSelections && recentOptions.length > 0 && !searchTerm ? recentOptions.length + i : i)"
              [class.selected]="isSelected(option)"
              [class.disabled]="option.disabled"
              [attr.id]="'option-' + getOptionId(option)"
              role="option"
              [attr.aria-selected]="isSelected(option)"
              (click)="selectOption(option)"
              (mouseenter)="highlightedIndex = (showRecentSelections && recentOptions.length > 0 && !searchTerm ? recentOptions.length + i : i)">
              
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
                  <span *ngFor="let badge of option.badges" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {{ badge }}
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
          </div>

          <!-- Create new option -->
          <div 
            *ngIf="allowCreate && searchTerm && !hasExactMatch() && !isSearching && !hasError"
            class="option-item border-t border-gray-200"
            [class.highlighted]="highlightedIndex === getTotalOptionsCount() - 1"
            (click)="createNewOption()"
            (mouseenter)="highlightedIndex = getTotalOptionsCount() - 1">
            <div class="flex items-center px-4 py-3">
              <svg class="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span class="text-sm text-gray-700">Crear "{{ searchTerm }}"</span>
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
    /* Base styles usando variables institucionales */
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

    input:read-only {
      background-color: var(--gray-50);
      cursor: default;
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

    .option-item.recent {
      background-color: rgba(139, 21, 56, 0.02);
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

    /* Button hover styles */
    button:hover {
      background-color: var(--gray-100);
      border-radius: 4px;
    }
  `]
})
export class SelectAutocompleteComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Basic inputs
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() options: AutocompleteOption[] = [];
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() loading = false;
  @Input() helperText = '';

  // Autocomplete specific
  @Input() config?: AutocompleteConfig;
  @Input() searchFunction?: (term: string) => Observable<AutocompleteOption[]>;
  @Input() minSearchLength = 1;
  @Input() debounceTime = 300;
  @Input() maxResults = 50;
  @Input() cacheResults = true;
  @Input() allowCreate = false;
  @Input() allowRetry = true;

  // Visual features
  @Input() showRecentSelections = false;
  @Input() maxRecentSelections = 5;
  @Input() showRefreshButton = false;
  @Input() clearable = true;

  // Text customization
  @Input() loadingText = 'Buscando...';
  @Input() noResultsText = 'No se encontraron resultados';
  @Input() emptyStateText = 'Escribe para buscar';
  @Input() errorMessage = 'Error al buscar. Intenta de nuevo.';

  // Visual customization
  @Input() floating = false;
  @Input() width?: string;
  @Input() height?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth = false;
  @Input() iconLeft?: string;
  @Input() iconLeftType?: 'bootstrap' | 'material' | 'universal';

  // Events
  @Output() change = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() create = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() error = new EventEmitter<any>();

  // Internal state
  controlId = '';
  isOpen = false;
  isFocused = false;
  isSearching = false;
  hasError = false;
  searchTerm = '';
  selectedOption: AutocompleteOption | null = null;
  recentOptions: AutocompleteOption[] = [];
  highlightedIndex = -1;
  private cache = new Map<string, AutocompleteOption[]>();
  private lastSearchTerm = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    @Optional() private controlContainer: ControlContainer,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `select-autocomplete-${Math.random().toString(36).slice(2, 9)}`;

    // Setup form control
    if (!this.control && this.controlName) {
      const parent = this.controlContainer && (this.controlContainer.control as any);
      if (parent && parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
      }
    }

    // Setup validators
    if (this.control) {
      this.setupValidators();
      this.updateSelectedOption();
      
      // Watch for value changes
      this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.updateSelectedOption());
    }

    // Setup search with debounce
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        switchMap(term => this.performSearch(term)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (options) => {
          this.isSearching = false;
          this.hasError = false;
          this.options = options;
          this.cacheResult(this.lastSearchTerm, options);
        },
        error: (err) => {
          this.isSearching = false;
          this.hasError = true;
          this.options = [];
          this.error.emit(err);
        }
      });

    // Load recent selections
    this.loadRecentSelections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Host listener for clicks outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  // Event handlers
  onFocus(): void {
    this.isFocused = true;
    this.openDropdown();
  }

  onBlur(): void {
    this.isFocused = false;
    setTimeout(() => {
      if (!this.isFocused) {
        this.closeDropdown();
      }
    }, 150);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.lastSearchTerm = this.searchTerm;
    
    // Clear selection if search term doesn't match selected option
    if (this.selectedOption && this.searchTerm !== this.selectedOption.label) {
      this.selectedOption = null;
      if (this.control) {
        this.control.setValue(null);
      }
    }

    this.highlightedIndex = -1;
    this.hasError = false;
    
    if (this.searchTerm.length >= this.minSearchLength) {
      this.triggerSearch();
    } else {
      this.options = [];
      this.isSearching = false;
    }
    
    if (!this.isOpen) {
      this.openDropdown();
    }

    this.search.emit(this.searchTerm);
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

  // Dropdown management
  openDropdown(): void {
    if (!this.disabled && !this.isOpen) {
      this.isOpen = true;
      
      // If no search term and we have recent selections, show them
      if (!this.searchTerm && this.showRecentSelections && this.recentOptions.length > 0) {
        this.options = [];
      } else if (this.searchTerm.length >= this.minSearchLength) {
        this.triggerSearch();
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

  // Search functionality
  private triggerSearch(): void {
    if (this.isSearching) return;

    // Check cache first
    if (this.cacheResults && this.cache.has(this.searchTerm)) {
      this.options = this.cache.get(this.searchTerm) || [];
      return;
    }

    this.isSearching = true;
    this.searchSubject.next(this.searchTerm);
  }

  private performSearch(term: string): Observable<AutocompleteOption[]> {
    if (!term || term.length < this.minSearchLength) {
      return of([]);
    }

    // Use custom search function if provided
    if (this.searchFunction) {
      return this.searchFunction(term).pipe(
        catchError(err => {
          this.hasError = true;
          return of([]);
        })
      );
    }

    // Use configuration-based search
    if (this.config?.endpoint) {
      return this.searchWithConfig(term);
    }

    // Fallback to local filtering
    return of(this.filterLocalOptions(term));
  }

  private searchWithConfig(term: string): Observable<AutocompleteOption[]> {
    if (!this.config?.endpoint) {
      return of([]);
    }

    // This would typically use HttpClient
    // For now, return empty observable
    return of([]).pipe(
      catchError(err => {
        this.hasError = true;
        return of([]);
      })
    );
  }

  private filterLocalOptions(term: string): AutocompleteOption[] {
    const lowerTerm = term.toLowerCase();
    return this.options.filter(option => 
      option.label.toLowerCase().includes(lowerTerm) ||
      (option.description && option.description.toLowerCase().includes(lowerTerm))
    ).slice(0, this.maxResults);
  }

  retrySearch(): void {
    this.hasError = false;
    if (this.searchTerm.length >= this.minSearchLength) {
      this.triggerSearch();
    }
  }

  refreshOptions(): void {
    this.cache.clear();
    if (this.searchTerm.length >= this.minSearchLength) {
      this.triggerSearch();
    }
  }

  // Option management
  selectOption(option: AutocompleteOption): void {
    if (option.disabled) return;

    this.selectedOption = option;
    this.searchTerm = option.label;
    
    if (this.control) {
      this.control.setValue(option.value);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    
    this.change.emit(option.value);
    this.addToRecentSelections(option);
    this.closeDropdown();
  }

  selectHighlightedOption(): void {
    if (this.highlightedIndex >= 0) {
      const totalOptions = this.getTotalOptionsCount();
      
      if (this.allowCreate && this.highlightedIndex === totalOptions - 1) {
        this.createNewOption();
      } else {
        const allOptions = this.getAllOptions();
        if (allOptions[this.highlightedIndex]) {
          this.selectOption(allOptions[this.highlightedIndex]);
        }
      }
    }
  }

  createNewOption(): void {
    if (this.searchTerm.trim()) {
      this.create.emit(this.searchTerm.trim());
      this.searchTerm = '';
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
    
    this.change.emit(null);
    this.searchInput?.nativeElement.focus();
  }

  // Navigation
  navigateOptions(direction: number): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    const totalOptions = this.getTotalOptionsCount();
    const maxIndex = this.allowCreate && this.searchTerm && !this.hasExactMatch() 
      ? totalOptions 
      : totalOptions - 1;

    this.highlightedIndex = Math.max(-1, Math.min(maxIndex, this.highlightedIndex + direction));
  }

  // Helpers
  private updateSelectedOption(): void {
    if (this.control?.value) {
      // Try to find in current options first
      this.selectedOption = this.options.find(opt => opt.value === this.control?.value) || null;
      
      // If not found, try recent options
      if (!this.selectedOption) {
        this.selectedOption = this.recentOptions.find(opt => opt.value === this.control?.value) || null;
      }
      
      if (this.selectedOption) {
        this.searchTerm = this.selectedOption.label;
      }
    } else {
      this.selectedOption = null;
      this.searchTerm = '';
    }
  }

  private resetSearchTerm(): void {
    this.searchTerm = this.selectedOption?.label || '';
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
          const result = spec.custom!(control.value);
          return result ? { custom: result } : null;
        };
        validators.push(customFn);
      }

      if (validators.length) {
        this.control.setValidators(validators);
        this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
    }
  }

  // Cache management
  private cacheResult(term: string, options: AutocompleteOption[]): void {
    if (this.cacheResults && term) {
      this.cache.set(term, options);
    }
  }

  // Recent selections management
  private loadRecentSelections(): void {
    if (this.showRecentSelections) {
      const stored = localStorage.getItem(`autocomplete-recent-${this.controlName}`);
      if (stored) {
        try {
          this.recentOptions = JSON.parse(stored);
        } catch (e) {
          this.recentOptions = [];
        }
      }
    }
  }

  private addToRecentSelections(option: AutocompleteOption): void {
    if (!this.showRecentSelections) return;

    // Remove if already exists
    this.recentOptions = this.recentOptions.filter(item => item.value !== option.value);
    
    // Add to beginning
    this.recentOptions.unshift(option);
    
    // Keep only max recent selections
    if (this.recentOptions.length > this.maxRecentSelections) {
      this.recentOptions = this.recentOptions.slice(0, this.maxRecentSelections);
    }

    // Save to localStorage
    localStorage.setItem(`autocomplete-recent-${this.controlName}`, JSON.stringify(this.recentOptions));
  }

  // Computed properties
  get displayValue(): string {
    return this.searchTerm;
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

    return `w-full rounded-lg transition-all duration-200 ${sizeClasses[this.size]}`;
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
  isSelected(option: AutocompleteOption): boolean {
    return this.selectedOption?.value === option.value;
  }

  hasExactMatch(): boolean {
    return this.getAllOptions().some(option => 
      option.label.toLowerCase() === this.searchTerm.toLowerCase()
    );
  }

  getAllOptions(): AutocompleteOption[] {
    const allOptions = [];
    
    if (this.showRecentSelections && this.recentOptions.length > 0 && !this.searchTerm) {
      allOptions.push(...this.recentOptions);
    }
    
    allOptions.push(...this.options);
    
    return allOptions;
  }

  getTotalOptionsCount(): number {
    return this.getAllOptions().length;
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getOptionId(option: AutocompleteOption): string {
    return `${this.controlId}-option-${option.value}`;
  }

  getActiveDescendant(): string | null {
    if (this.highlightedIndex >= 0) {
      const allOptions = this.getAllOptions();
      if (allOptions[this.highlightedIndex]) {
        return this.getOptionId(allOptions[this.highlightedIndex]);
      }
    }
    return null;
  }

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    return spec?.messages ? spec.messages[key] : undefined;
  }

  // Track by functions
  trackByOption(index: number, option: AutocompleteOption): any {
    return option.value;
  }
}
