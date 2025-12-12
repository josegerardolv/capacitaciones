import { Component, Input, OnInit, OnDestroy, Optional, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { Subject, takeUntil, debounceTime } from 'rxjs';

export interface SelectMultiOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
  avatar?: string;
  badges?: string[];
  color?: string;
}

type ValidatorSpec = {
  required?: boolean;
  minItems?: number;
  maxItems?: number;
  custom?: (value: any) => string | null;
  messages?: { [key: string]: string };
};

@Component({
  selector: 'app-select-multi',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="wrapperClass + ' mb-3'" [ngClass]="{'relative': true}">
      
      <!-- Label -->
      <label *ngIf="label && !floating" [for]="controlId" class="form-label">
        {{ label }}<span *ngIf="isRequired" class="text-red-500"> *</span>
      </label>

      <!-- Container principal -->
      <div class="relative" [ngClass]="{'mt-1': label && !floating}">
        
        <!-- Selected items display -->
        <div class="relative min-h-[44px]">
          
          <!-- Tags container -->
          <div 
            class="flex flex-wrap gap-1 p-2 border rounded-lg cursor-text transition-all duration-200"
            [class]="containerClass"
            [ngClass]="{ 
              'border-red-500 ring-red-500': invalidTouched,
              'border-green-500 ring-green-500': validTouched,
              'ring-2 ring-opacity-50 border-institucional-primario': isOpen
            }"
            [style.border-color]="getBorderColor()"
            [style.box-shadow]="getBoxShadow()"
            (click)="focusInput()">

            <!-- Selected items as tags -->
            <div 
              *ngFor="let item of selectedOptions; trackBy: trackByOption" 
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200"
              [style.background-color]="item.color || 'var(--institucional-primario)'"
              [style.color]="getTagTextColor(item)"
              [ngClass]="{
                'bg-institucional-primario text-white': !item.color,
                'opacity-50': item.disabled
              }">
              
              <!-- Avatar in tag -->
              <img 
                *ngIf="item.avatar" 
                [src]="item.avatar" 
                [alt]="item.label" 
                class="w-4 h-4 rounded-full object-cover">
              
              <span class="truncate max-w-[120px]">{{ item.label }}</span>
              
              <!-- Remove button -->
              <button 
                *ngIf="!disabled && !item.disabled"
                type="button"
                class="ml-1 text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
                (click)="removeOption(item, $event)"
                [attr.aria-label]="'Remover ' + item.label">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Search input -->
            <input
              #searchInput
              [id]="controlId"
              type="text"
              class="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder-gray-400"
              [placeholder]="getInputPlaceholder()"
              [value]="searchTerm"
              [disabled]="disabled || (maxItems && selectedOptions.length >= maxItems)"
              (input)="onSearchInput($event)"
              (focus)="onFocus()"
              (blur)="onBlur()"
              (keydown)="onKeyDown($event)"
              [attr.aria-expanded]="isOpen"
              [attr.aria-haspopup]="true"
              [attr.role]="'combobox'">

            <!-- Floating label -->
            <label
              *ngIf="floating && selectedOptions.length === 0"
              [for]="controlId"
              class="absolute left-3 text-gray-500 pointer-events-none floating-label transition-all duration-200"
              [class.label--shifted]="labelShifted"
              [class.text-red-500]="invalidTouched"
              [class.text-green-500]="validTouched && !invalidTouched">
              {{ label }} <span *ngIf="isRequired" class="text-red-500">*</span>
            </label>

            <!-- Action buttons -->
            <div class="flex items-center gap-1 ml-2">
              <!-- Loading spinner -->
              <svg *ngIf="loading" class="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              
              <!-- Clear all button -->
              <button 
                *ngIf="clearable && selectedOptions.length > 0 && !disabled && !loading"
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                (click)="clearAll($event)"
                [attr.aria-label]="'Limpiar todas las selecciones'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              
              <!-- Dropdown arrow -->
              <svg 
                *ngIf="!loading"
                class="w-4 h-4 text-gray-400 transition-transform duration-200"
                [class.rotate-180]="isOpen"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Counter and limit info -->
        <div *ngIf="showCounter || maxItems" class="flex justify-between items-center mt-1 text-xs text-gray-500">
          <span *ngIf="showCounter">{{ selectedOptions.length }} seleccionado{{ selectedOptions.length !== 1 ? 's' : '' }}</span>
          <span *ngIf="maxItems" class="ml-auto">{{ selectedOptions.length }}/{{ maxItems }}</span>
        </div>

        <!-- Dropdown panel -->
        <div 
          *ngIf="isOpen"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          [attr.aria-multiselectable]="true">
          
          <!-- Header with select all -->
          <div *ngIf="selectAllEnabled && filteredOptions.length > 0" 
               class="border-b border-gray-100 p-2">
            <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded p-2">
              <input 
                type="checkbox" 
                [checked]="allSelected"
                [indeterminate]="someSelected && !allSelected"
                (change)="toggleSelectAll()"
                class="rounded border-gray-300 text-institucional-primario focus:ring-institucional-primario">
              <span class="text-sm font-medium text-gray-700">
                {{ allSelected ? 'Deseleccionar todo' : 'Seleccionar todo' }}
              </span>
            </label>
          </div>
          
          <!-- No options message -->
          <div *ngIf="filteredOptions.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
            <div *ngIf="searchTerm && searchTerm.length > 0; else noOptionsTemplate">
              No se encontraron resultados para "{{ searchTerm }}"
            </div>
            <ng-template #noOptionsTemplate>
              <div *ngIf="options.length === 0; else noSearchResults">
                No hay opciones disponibles
              </div>
              <ng-template #noSearchResults>
                {{ allOptionsSelected ? 'Todas las opciones están seleccionadas' : 'Escribe para buscar opciones' }}
              </ng-template>
            </ng-template>
          </div>

          <!-- Options list -->
          <div *ngIf="filteredOptions.length > 0">
            
            <!-- Grouped options -->
            <ng-container *ngIf="hasGroups()">
              <div *ngFor="let group of getFilteredGroups(); trackBy: trackByGroup" class="border-b border-gray-100 last:border-b-0">
                <div class="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50 sticky top-0">
                  {{ group }}
                </div>
                <div 
                  *ngFor="let option of getFilteredOptionsByGroup(group); trackBy: trackByOption; let i = index"
                  class="option-item"
                  [class.highlighted]="highlightedIndex === getOptionGlobalIndex(option)"
                  [class.selected]="isSelected(option)"
                  [class.disabled]="option.disabled || isMaxReached()"
                  role="option"
                  [attr.aria-selected]="isSelected(option)"
                  (click)="toggleOption(option)"
                  (mouseenter)="highlightedIndex = getOptionGlobalIndex(option)">
                  
                  <label class="flex items-center px-4 py-3 cursor-pointer">
                    <!-- Checkbox -->
                    <input 
                      type="checkbox" 
                      [checked]="isSelected(option)"
                      [disabled]="option.disabled || (!isSelected(option) && isMaxReached())"
                      class="rounded border-gray-300 text-institucional-primario focus:ring-institucional-primario mr-3"
                      (change)="toggleOption(option)"
                      tabindex="-1">
                    
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
                  </label>
                </div>
              </div>
            </ng-container>

            <!-- Simple options -->
            <ng-container *ngIf="!hasGroups()">
              <div 
                *ngFor="let option of filteredOptions; trackBy: trackByOption; let i = index"
                class="option-item"
                [class.highlighted]="highlightedIndex === i"
                [class.selected]="isSelected(option)"
                [class.disabled]="option.disabled || isMaxReached()"
                role="option"
                [attr.aria-selected]="isSelected(option)"
                (click)="toggleOption(option)"
                (mouseenter)="highlightedIndex = i">
                
                <label class="flex items-center px-4 py-3 cursor-pointer">
                  <!-- Checkbox -->
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(option)"
                    [disabled]="option.disabled || (!isSelected(option) && isMaxReached())"
                    class="rounded border-gray-300 text-institucional-primario focus:ring-institucional-primario mr-3"
                    (change)="toggleOption(option)"
                    tabindex="-1">
                  
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
                </label>
              </div>
            </ng-container>
          </div>

          <!-- Create new option -->
          <div 
            *ngIf="allowCreate && searchTerm && !hasExactMatch() && !loading"
            class="option-item border-t border-gray-200"
            [class.highlighted]="highlightedIndex === filteredOptions.length"
            (click)="createNewOption()"
            (mouseenter)="highlightedIndex = filteredOptions.length">
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
          {{ getMessage('required') || 'Debes seleccionar al menos una opción' }}
        </div>
        <div *ngIf="control?.errors?.['minItems']" class="error-message">
          {{ getMessage('minItems') || 'Debes seleccionar al menos ' + minItems + ' opciones' }}
        </div>
        <div *ngIf="control?.errors?.['maxItems']" class="error-message">
          {{ getMessage('maxItems') || 'No puedes seleccionar más de ' + maxItems + ' opciones' }}
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

    /* Container styles */
    .tags-container {
      min-height: 44px;
      font-family: 'Montserrat', sans-serif;
      border: 1px solid var(--gray-300);
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .tags-container:focus-within {
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12), var(--shadow-institucional);
    }

    .tags-container.disabled {
      background-color: var(--gray-50);
      cursor: not-allowed;
    }

    /* Option styles */
    .option-item {
      transition: all var(--transition-fast);
    }

    .option-item:hover,
    .option-item.highlighted {
      background-color: var(--gray-50);
    }

    .option-item.selected {
      background-color: rgba(139, 21, 56, 0.05);
    }

    .option-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-item.disabled:hover {
      background-color: transparent;
    }

    /* Checkbox styles */
    input[type="checkbox"] {
      accent-color: var(--institucional-primario);
    }

    input[type="checkbox"]:focus {
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12);
    }

    /* Tag styles */
    .tag {
      background-color: var(--institucional-primario);
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .tag:hover {
      opacity: 0.9;
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
export class SelectMultiComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Basic inputs
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() label = '';
  @Input() placeholder = 'Seleccionar opciones...';
  @Input() options: SelectMultiOption[] = [];
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};
  @Input() required = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() helperText = '';

  // Multi-select specific
  @Input() maxItems?: number;
  @Input() minItems?: number;
  @Input() selectAllEnabled = true;
  @Input() showCounter = true;
  @Input() clearable = true;
  @Input() allowCreate = false;

  // Search functionality
  @Input() searchable = true;
  @Input() minSearchLength = 0;
  @Input() debounceTime = 300;

  // Visual customization
  @Input() floating = false;
  @Input() width?: string;
  @Input() height?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth = false;

  // Events
  @Output() change = new EventEmitter<any[]>();
  @Output() search = new EventEmitter<string>();
  @Output() create = new EventEmitter<string>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() maxReached = new EventEmitter<void>();

  // Internal state
  controlId = '';
  isOpen = false;
  isFocused = false;
  searchTerm = '';
  filteredOptions: SelectMultiOption[] = [];
  selectedOptions: SelectMultiOption[] = [];
  highlightedIndex = -1;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    @Optional() private controlContainer: ControlContainer,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `select-multi-${Math.random().toString(36).slice(2, 9)}`;

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
      this.updateSelectedOptions();
      
      // Watch for value changes
      this.control.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.updateSelectedOptions());
    }

    // Setup search with debounce
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.search.emit(term);
        this.filterOptions();
      });

    // Initial filter
    this.filterOptions();
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
    
    if (this.searchTerm.length >= this.minSearchLength) {
      this.searchSubject.next(this.searchTerm);
    } else {
      this.filterOptions();
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
      case 'Backspace':
        if (!this.searchTerm && this.selectedOptions.length > 0) {
          this.removeOption(this.selectedOptions[this.selectedOptions.length - 1]);
        }
        break;
    }
  }

  // Dropdown management
  openDropdown(): void {
    if (!this.disabled && !this.isOpen) {
      this.isOpen = true;
      this.filterOptions();
      this.open.emit();
    }
  }

  closeDropdown(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.highlightedIndex = -1;
      this.searchTerm = '';
      this.close.emit();
    }
  }

  focusInput(): void {
    this.searchInput?.nativeElement.focus();
  }

  // Option management
  toggleOption(option: SelectMultiOption): void {
    if (option.disabled) return;

    if (this.isSelected(option)) {
      this.removeOption(option);
    } else {
      this.addOption(option);
    }
  }

  addOption(option: SelectMultiOption): void {
    if (this.isMaxReached() && !this.isSelected(option)) {
      this.maxReached.emit();
      return;
    }

    if (!this.isSelected(option)) {
      this.selectedOptions.push(option);
      this.updateFormControl();
    }
  }

  removeOption(option: SelectMultiOption, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const index = this.selectedOptions.findIndex(item => item.value === option.value);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
      this.updateFormControl();
    }
  }

  selectHighlightedOption(): void {
    if (this.highlightedIndex >= 0) {
      if (this.allowCreate && this.highlightedIndex === this.filteredOptions.length) {
        this.createNewOption();
      } else if (this.filteredOptions[this.highlightedIndex]) {
        this.toggleOption(this.filteredOptions[this.highlightedIndex]);
      }
    }
  }

  createNewOption(): void {
    if (this.searchTerm.trim()) {
      this.create.emit(this.searchTerm.trim());
      this.searchTerm = '';
    }
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    this.selectedOptions = [];
    this.updateFormControl();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      // Deselect all
      this.selectedOptions = [];
    } else {
      // Select all available options
      const availableOptions = this.filteredOptions.filter(opt => !opt.disabled);
      if (this.maxItems) {
        this.selectedOptions = availableOptions.slice(0, this.maxItems);
      } else {
        this.selectedOptions = [...availableOptions];
      }
    }
    this.updateFormControl();
  }

  // Navigation
  navigateOptions(direction: number): void {
    if (!this.isOpen) {
      this.openDropdown();
      return;
    }

    const maxIndex = this.allowCreate && this.searchTerm && !this.hasExactMatch() 
      ? this.filteredOptions.length 
      : this.filteredOptions.length - 1;

    this.highlightedIndex = Math.max(-1, Math.min(maxIndex, this.highlightedIndex + direction));
  }

  // Filtering
  filterOptions(): void {
    if (!this.searchTerm || this.searchTerm.length < this.minSearchLength) {
      this.filteredOptions = this.options.slice();
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredOptions = this.options.filter(option => 
      option.label.toLowerCase().includes(term) ||
      (option.description && option.description.toLowerCase().includes(term)) ||
      (option.badges && option.badges.some(badge => badge.toLowerCase().includes(term)))
    );
  }

  // Form control management
  updateFormControl(): void {
    if (this.control) {
      const values = this.selectedOptions.map(opt => opt.value);
      this.control.setValue(values);
      this.control.markAsDirty();
      this.control.markAsTouched();
      this.change.emit(values);
    }
  }

  updateSelectedOptions(): void {
    if (this.control?.value && Array.isArray(this.control.value)) {
      this.selectedOptions = this.options.filter(opt => 
        this.control?.value.includes(opt.value)
      );
    } else {
      this.selectedOptions = [];
    }
  }

  setupValidators(): void {
    if (!this.control) return;

    const spec = this.validationMap?.[this.controlName];
    const validators: ValidatorFn[] = [];
    
    if (spec?.required || this.required) {
      validators.push(Validators.required);
    }

    if (this.minItems || spec?.minItems) {
      const min = this.minItems || spec?.minItems || 0;
      validators.push((control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value && Array.isArray(value) && value.length < min) {
          return { minItems: { requiredLength: min, actualLength: value.length } };
        }
        return null;
      });
    }

    if (this.maxItems || spec?.maxItems) {
      const max = this.maxItems || spec?.maxItems || 0;
      validators.push((control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value && Array.isArray(value) && value.length > max) {
          return { maxItems: { requiredLength: max, actualLength: value.length } };
        }
        return null;
      });
    }

    if (spec?.custom) {
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

  // Computed properties and helpers
  get labelShifted(): boolean {
    return this.isFocused || this.selectedOptions.length > 0;
  }

  get invalidTouched(): boolean {
    return !!(this.control && this.control.invalid && this.control.touched);
  }

  get validTouched(): boolean {
    return !!(this.control && this.control.valid && this.control.touched && this.control.value);
  }

  get containerClass(): string {
    const baseClass = 'min-h-[44px] bg-white transition-all duration-200';
    const disabledClass = this.disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-text';
    return `${baseClass} ${disabledClass}`;
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  get isRequired(): boolean {
    return this.required || !!(this.validationMap?.[this.controlName]?.required);
  }

  get allSelected(): boolean {
    const availableOptions = this.filteredOptions.filter(opt => !opt.disabled);
    return availableOptions.length > 0 && availableOptions.every(opt => this.isSelected(opt));
  }

  get someSelected(): boolean {
    const availableOptions = this.filteredOptions.filter(opt => !opt.disabled);
    return availableOptions.some(opt => this.isSelected(opt));
  }

  get allOptionsSelected(): boolean {
    return this.options.filter(opt => !opt.disabled).every(opt => this.isSelected(opt));
  }

  // Utility methods
  isSelected(option: SelectMultiOption): boolean {
    return this.selectedOptions.some(item => item.value === option.value);
  }

  isMaxReached(): boolean {
    return !!(this.maxItems && this.selectedOptions.length >= this.maxItems);
  }

  hasExactMatch(): boolean {
    return this.options.some(option => 
      option.label.toLowerCase() === this.searchTerm.toLowerCase()
    );
  }

  getInputPlaceholder(): string {
    if (this.selectedOptions.length === 0) {
      return this.placeholder;
    }
    return this.isMaxReached() ? 'Límite alcanzado' : 'Buscar más opciones...';
  }

  getTagTextColor(option: SelectMultiOption): string {
    if (option.color) {
      // Simple logic to determine if we should use dark or light text
      const hex = option.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    }
    return '#ffffff';
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

  // Group helpers
  hasGroups(): boolean {
    return this.filteredOptions.some(option => option.group);
  }

  getFilteredGroups(): string[] {
    const groups = this.filteredOptions
      .filter(option => option.group)
      .map(option => option.group!)
      .filter((group, index, array) => array.indexOf(group) === index);
    return groups;
  }

  getFilteredOptionsByGroup(group: string): SelectMultiOption[] {
    return this.filteredOptions.filter(option => option.group === group);
  }

  getOptionGlobalIndex(option: SelectMultiOption): number {
    return this.filteredOptions.indexOf(option);
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    return spec?.messages ? spec.messages[key] : undefined;
  }

  // Track by functions
  trackByOption(index: number, option: SelectMultiOption): any {
    return option.value;
  }

  trackByGroup(index: number, group: string): string {
    return group;
  }
}
