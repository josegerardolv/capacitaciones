import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InputEnhancedComponent } from '@/app/shared/components/inputs/input-enhanced.component';
import { SelectComponent, SelectOption } from '@/app/shared/components/inputs/select.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'daterange' | 'select' | 'boolean';
  placeholder?: string;
  options?: SelectOption[];
  multiple?: boolean;
  width?: string;
}

export interface FilterValue {
  [key: string]: any;
}

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputEnhancedComponent, SelectComponent, InstitutionalButtonComponent],
  template: `
    <div class="institucional-table-filters">
      <!-- Búsqueda global -->
      <div class="institucional-form-group global-search-container" *ngIf="showGlobalSearch">
        <app-input-enhanced
          [control]="globalSearchControl"
          [placeholder]="globalSearchPlaceholder || 'Buscar...'"
          [iconLeft]="''"
          [iconLeftType]="'material'"
          [variant]="'outlined'"
          [floating]="false"
          [size]="'sm'"
          [fullWidth]="false"
          [width]="'300px'"
          [height]="'38px'"
          extraClasses="compact-search-input">
        </app-input-enhanced>
      </div>

      <!-- Filtros específicos -->
      <form [formGroup]="filterForm" class="flex flex-wrap items-end gap-4">
        <div 
          *ngFor="let filter of filters" 
          class="institucional-form-group"
          [style.width]="filter.width || 'auto'">
          
          <!-- Filtro de texto -->
          <app-input-enhanced 
            *ngIf="filter.type === 'text'"
            [control]="getFilterControl(filter.key)"
            [label]="filter.label"
            [placeholder]="filter.placeholder || ''"
            [variant]="'outlined'"
            [floating]="true"
            [size]="'md'"
            [width]="filter.width || 'auto'">
          </app-input-enhanced>

          <!-- Filtro numérico -->
          <app-input-enhanced 
            *ngIf="filter.type === 'number'"
            [control]="getFilterControl(filter.key)"
            [label]="filter.label"
            [type]="'number'"
            [placeholder]="filter.placeholder || ''"
            [variant]="'outlined'"
            [floating]="true"
            [size]="'md'"
            [width]="filter.width || 'auto'">
          </app-input-enhanced>

          <!-- Filtro de fecha -->
          <app-input-enhanced 
            *ngIf="filter.type === 'date'"
            [control]="getFilterControl(filter.key)"
            [label]="filter.label"
            [type]="'date'"
            [variant]="'outlined'"
            [floating]="true"
            [size]="'md'"
            [width]="filter.width || 'auto'">
          </app-input-enhanced>

          <!-- Filtro de selección -->
          <app-select 
            *ngIf="filter.type === 'select'"
            [control]="getFilterControl(filter.key)"
            [label]="filter.label"
            [placeholder]="filter.placeholder || 'Todos'"
            [options]="filter.options || []"
            [allowEmpty]="true"
            [variant]="'outlined'"
            [floating]="true"
            [size]="'md'"
            [width]="filter.width || 'auto'">
          </app-select>

          <!-- Filtro booleano -->
          <app-select 
            *ngIf="filter.type === 'boolean'"
            [control]="getFilterControl(filter.key)"
            [label]="filter.label"
            [placeholder]="'Todos'"
            [options]="getBooleanOptions()"
            [allowEmpty]="true"
            [variant]="'outlined'"
            [size]="'md'"
            [floating]="true"
            [width]="filter.width || 'auto'">
          </app-select>

          <!-- Filtro de rango de fechas -->
          <div *ngIf="filter.type === 'daterange'" class="flex gap-2">
            <app-input-enhanced 
              [control]="getFilterControl(filter.key + '_from')"
              [label]="filter.label + ' (Desde)'"
              [type]="'date'"
              [placeholder]="'Desde'"
              [variant]="'outlined'"
              [size]="'md'"
              [width]="'auto'"
              [floating]="true"
              extraClasses="flex-1">
            </app-input-enhanced>
            <app-input-enhanced 
              [control]="getFilterControl(filter.key + '_to')"
              [label]="filter.label + ' (Hasta)'"
              [type]="'date'"
              [placeholder]="'Hasta'"
              [variant]="'outlined'"
              [size]="'md'"
              [width]="'auto'"
              [floating]="true"
              extraClasses="flex-1">
            </app-input-enhanced>
          </div>
        </div>
      </form>

      <!-- Acciones de filtros -->
      <div class="institucional-table-filter-actions">
        <app-institutional-button *ngIf="activeFiltersCount > 0 || globalSearchControl.value"
          [config]="{
            variant: 'secondary',
            icon: 'clear_all'
          }"
          title="Limpiar filtros"
          (buttonClick)="clearFilters()">
        </app-institutional-button>

        <app-institutional-button *ngIf="filters.length > 0"
          [config]="{
            variant: 'secondary',
            icon: 'tune'
          }"
          title="Filtros avanzados"
          (buttonClick)="toggleAdvancedFilters()">
          Filtros avanzados
        </app-institutional-button>
      </div>
    </div>

    <!-- Indicador de filtros activos -->
    <div *ngIf="activeFiltersCount > 0" class="institucional-table-active-filters">
      <span class="institucional-table-active-filters-count">
        {{ activeFiltersCount }} filtro(s) activo(s)
      </span>
      
      <div class="institucional-table-active-filters-list">
        <span 
          *ngFor="let filter of getActiveFilters()" 
          class="institucional-table-filter-chip">
          {{ filter.label }}: {{ filter.displayValue }}
          <button
            type="button"
            class="institucional-table-filter-chip-remove"
            title="Quitar filtro"
            (pointerdown)="removeFilter(filter.key, $event)">
            ✕
          </button>
        </span>
      </div>
    </div>
  `,
  styles: [`
    .flex {
      display: flex;
    }
    
    .flex-wrap {
      flex-wrap: wrap;
    }
    
    .items-end {
      align-items: flex-end;
    }
    
    .gap-4 {
      gap: 1rem;
    }
    
    .gap-2 {
      gap: 0.5rem;
    }
    
    .flex-1 {
      flex: 1;
    }
    
    .institucional-table-filter-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
    }
    
    .institucional-table-active-filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background-color: rgba(139, 21, 56, 0.05);
      border-bottom: 1px solid var(--gray-200);
    }
    
    .institucional-table-active-filters-count {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--institucional-primario);
    }
    
    .institucional-table-active-filters-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .institucional-table-filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      background-color: var(--institucional-secundario);
      color: white;
      border-radius: 1rem;
    }
    
    .institucional-table-filter-chip-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 0.875rem;
      height: 0.875rem;
      min-width: 0.875rem;
      padding: 0;
      
      border: none;
      color: white;
      font-size: 0.625rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s ease;
      line-height: 1;
    }
    
    .institucional-table-filter-chip-remove:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .institucional-table-filter-chip-remove:active {
      transform: scale(0.95);
    }
    
    /* Asegurar que el botón pueda recibir clicks aun si hay superposiciones */
    .institucional-table-filter-chip-remove {
      pointer-events: auto;
      z-index: 10;
    }
/* Remove margin from global search input wrapper to reduce spacing with table */
    .global-search-container ::ng-deep .input-wrapper {
      margin-bottom: 0 !important;
    }

    /* Aggressive compaction for the search bar */
    .global-search-container {
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }

    ::ng-deep .compact-search-input {
      font-size: 0.875rem !important;
    }
  `]
})
export class TableFiltersComponent implements OnInit {
  @Input() filters: FilterConfig[] = [];
  @Input() showGlobalSearch = true;
  @Input() globalSearchPlaceholder = 'Buscar...';
  @Input() globalSearchValue = '';
  @Input() initialValues: FilterValue = {};

  @Output() filtersChange = new EventEmitter<FilterValue>();
  @Output() globalSearchChange = new EventEmitter<string>();

  filterForm!: FormGroup;
  globalSearchControl = new FormControl('');
  activeFiltersCount = 0;
  showAdvanced = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForm();
    this.setupFormSubscription();
    this.setupGlobalSearchSubscription();
  }

  private setupGlobalSearchSubscription() {
    this.globalSearchControl.setValue(this.globalSearchValue);
    this.globalSearchControl.valueChanges
      .pipe(
        debounceTime(300), // Reducido de 400ms a 300ms para mayor responsividad
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.globalSearchChange.emit(value || '');
      });
  }

  private initializeForm() {
    const formControls: { [key: string]: any } = {};

    this.filters.forEach(filter => {
      const initialValue = this.initialValues[filter.key] ||
        (filter.multiple ? [] : (filter.type === 'boolean' ? '' : ''));
      formControls[filter.key] = [initialValue];

      // Para rangos de fechas, agregar controles adicionales
      if (filter.type === 'daterange') {
        formControls[filter.key + '_from'] = [this.initialValues[filter.key + '_from'] || ''];
        formControls[filter.key + '_to'] = [this.initialValues[filter.key + '_to'] || ''];
      }
    });

    this.filterForm = this.fb.group(formControls);
  }

  private setupFormSubscription() {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500), // Consistente con búsqueda global para evitar muchas peticiones
        distinctUntilChanged()
      )
      .subscribe(values => {
        this.updateActiveFiltersCount();
        this.filtersChange.emit(values);
      });
  }

  getFilterControl(filterKey: string): FormControl {
    return this.filterForm.get(filterKey) as FormControl;
  }

  getBooleanOptions(): SelectOption[] {
    return [
      { value: 'true', label: 'Sí' },
      { value: 'false', label: 'No' }
    ];
  }

  onGlobalSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalSearchChange.emit(target.value);
  }

  clearFilters() {
    this.filterForm.reset();
    this.globalSearchControl.setValue('');
    const clearedValues: FilterValue = {};

    this.filters.forEach(filter => {
      clearedValues[filter.key] = filter.multiple ? [] : '';
      if (filter.type === 'daterange') {
        clearedValues[filter.key + '_from'] = '';
        clearedValues[filter.key + '_to'] = '';
      }
    });

    this.filtersChange.emit(clearedValues);
    this.globalSearchChange.emit('');
  }

  removeFilter(filterKey: string, event?: Event) {
    // console debug removed; method will stop propagation if event is provided

    // Evitar que el evento burbujee a otros contenedores/overlays
    if (event && typeof (event as Event).stopPropagation === 'function') {
      (event as Event).stopPropagation();
    }

    const filter = this.filters.find(f => f.key === filterKey);
    if (!filter) return;

    const resetValue = filter.multiple ? [] : '';
    this.filterForm.patchValue({ [filterKey]: resetValue });

    if (filter.type === 'daterange') {
      this.filterForm.patchValue({
        [filterKey + '_from']: '',
        [filterKey + '_to']: ''
      });
    }

    // Forzar actualización y emitir inmediatamente para que el padre reciba el cambio
    this.filterForm.updateValueAndValidity();
    this.updateActiveFiltersCount();
    this.filtersChange.emit(this.filterForm.value);
  }

  // removed onChipPointerDown: pointerdown now invokes removeFilter directly

  toggleAdvancedFilters() {
    this.showAdvanced = !this.showAdvanced;
  }

  private updateActiveFiltersCount() {
    const values = this.filterForm.value;
    let count = 0;

    this.filters.forEach(filter => {
      const value = values[filter.key];

      if (filter.type === 'daterange') {
        const fromValue = values[filter.key + '_from'];
        const toValue = values[filter.key + '_to'];
        if (fromValue || toValue) count++;
      } else if (filter.multiple) {
        if (Array.isArray(value) && value.length > 0) count++;
      } else {
        if (value !== '' && value !== null && value !== undefined) count++;
      }
    });

    this.activeFiltersCount = count;
  }

  getActiveFilters(): Array<{ key: string; label: string; displayValue: string }> {
    const values = this.filterForm.value;
    const activeFilters: Array<{ key: string; label: string; displayValue: string }> = [];

    this.filters.forEach(filter => {
      const value = values[filter.key];
      let displayValue = '';

      if (filter.type === 'daterange') {
        const fromValue = values[filter.key + '_from'];
        const toValue = values[filter.key + '_to'];
        if (fromValue || toValue) {
          displayValue = `${fromValue || '...'} - ${toValue || '...'}`;
        }
      } else if (filter.type === 'select' && filter.options) {
        if (filter.multiple && Array.isArray(value) && value.length > 0) {
          const selectedOptions = filter.options.filter(opt => value.includes(opt.value));
          displayValue = selectedOptions.map(opt => opt.label).join(', ');
        } else if (!filter.multiple && value !== '') {
          const selectedOption = filter.options.find(opt => opt.value === value);
          displayValue = selectedOption ? selectedOption.label : value;
        }
      } else if (filter.type === 'boolean' && value !== '') {
        displayValue = value === 'true' ? 'Sí' : 'No';
      } else if (value !== '' && value !== null && value !== undefined) {
        displayValue = String(value);
      }

      if (displayValue) {
        activeFilters.push({
          key: filter.key,
          label: filter.label,
          displayValue
        });
      }
    });

    return activeFilters;
  }
}
