import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  placeholder?: string;
  options?: { value: any; label: string }[];
  icon?: string;
}

export interface SearchFilters {
  [key: string]: any;
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg border-l-4 border-institucional-guinda animate-form-fade-in">
      <!-- Header colapsible con gradient -->
      <div class="bg-gradient-institucional text-white p-6 rounded-t-lg cursor-pointer form-element-transition hover:shadow-md" 
           (click)="toggleCollapsed()">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-icons text-xl">search</span>
            <div>
              <h3 class="text-lg font-bold">{{ title || 'Búsqueda y filtros' }}</h3>
              <p *ngIf="subtitle" class="text-sm opacity-90">{{ subtitle }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Indicador de filtros activos -->
            <div *ngIf="activeFiltersCount > 0" 
                 class="flex items-center gap-2 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span class="font-medium">{{ activeFiltersCount }} filtro(s) activo(s)</span>
            </div>
            
            <!-- Botón colapsar -->
            <button type="button" class="text-white hover:text-gray-200 transition-all duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20">
              <span class="material-icons transition-transform duration-300 text-xl"
                    [class.rotate-180]="isCollapsed">expand_more</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <div class="transition-all duration-500 overflow-hidden"
           [class.max-h-0]="isCollapsed"
           [class.max-h-screen]="!isCollapsed">
        
        <form [formGroup]="searchForm" class="p-8 space-y-6">
          
          <!-- Campo de búsqueda principal -->
          <div *ngIf="showMainSearch" class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="material-icons text-gray-400 text-lg">search</span>
            </div>
            <input type="text" 
                   formControlName="mainSearch"
                   class="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-institucional-primario focus:ring-opacity-20 focus:border-institucional-primario transition-all duration-200 form-input-transition text-lg placeholder-gray-400"
                   [placeholder]="mainSearchPlaceholder">
            
            <!-- Botón limpiar búsqueda principal -->
            <button *ngIf="searchForm.get('mainSearch')?.value" 
                    type="button"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                    (click)="clearMainSearch()">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>

          <!-- Campos de filtro dinámicos -->
          <div *ngIf="searchFields.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let field of searchFields" class="space-y-2 animate-form-step-in">
              <label class="block text-sm font-semibold text-gray-700">
                <span *ngIf="field.icon" class="material-icons text-sm mr-2 text-institucional-primario">{{ field.icon }}</span>
                {{ field.label }}
              </label>
              
              <!-- Input de texto -->
              <input *ngIf="field.type === 'text'" 
                     type="text"
                     [formControlName]="field.key"
                     [placeholder]="field.placeholder"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-institucional-primario focus:ring-opacity-50 focus:border-institucional-primario transition-all duration-200 form-input-transition">
              
              <!-- Input numérico -->
              <input *ngIf="field.type === 'number'" 
                     type="number"
                     [formControlName]="field.key"
                     [placeholder]="field.placeholder"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-institucional-primario focus:ring-opacity-50 focus:border-institucional-primario transition-all duration-200 form-input-transition">
              
              <!-- Input de fecha -->
              <input *ngIf="field.type === 'date'" 
                     type="date"
                     [formControlName]="field.key"
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-institucional-primario focus:ring-opacity-50 focus:border-institucional-primario transition-all duration-200 form-input-transition">
              
              <!-- Select -->
              <select *ngIf="field.type === 'select'" 
                      [formControlName]="field.key"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-institucional-primario focus:ring-opacity-50 focus:border-institucional-primario transition-all duration-200 form-input-transition bg-white">
                <option value="">{{ field.placeholder || 'Seleccionar...' }}</option>
                <option *ngFor="let option of field.options" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
              
              <!-- Checkbox -->
              <label *ngIf="field.type === 'boolean'" class="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" 
                       [formControlName]="field.key"
                       class="w-5 h-5 text-institucional-primario border-2 border-gray-300 rounded focus:ring-institucional-primario focus:ring-2 transition-all">
                <span class="text-sm font-medium text-gray-700">{{ field.placeholder || 'Activar filtro' }}</span>
              </label>
            </div>
          </div>

          <!-- Filtros rápidos predefinidos -->
          <div *ngIf="quickFilters.length > 0" class="border-t border-gray-200 pt-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="material-icons text-lg text-institucional-primario">tune</span>
              Filtros rápidos
            </h4>
            <div class="flex flex-wrap gap-3">
              <button *ngFor="let filter of quickFilters" 
                      type="button"
                      class="px-4 py-2 text-sm rounded-full border-2 transition-all duration-200 form-button-transition"
                      [class.border-institucional-primario]="isQuickFilterActive(filter.key)"
                      [class.bg-institucional-primario]="isQuickFilterActive(filter.key)"
                      [class.text-white]="isQuickFilterActive(filter.key)"
                      [class.shadow-md]="isQuickFilterActive(filter.key)"
                      [class.border-gray-300]="!isQuickFilterActive(filter.key)"
                      [class.text-gray-700]="!isQuickFilterActive(filter.key)"
                      [class.hover:border-institucional-primario]="!isQuickFilterActive(filter.key)"
                      [class.hover:bg-gray-50]="!isQuickFilterActive(filter.key)"
                      [class.hover:shadow-sm]="!isQuickFilterActive(filter.key)"
                      (click)="toggleQuickFilter(filter)">
                <span *ngIf="filter.icon" class="material-icons text-sm mr-2">{{ filter.icon }}</span>
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <div class="flex items-center gap-4">
              <!-- Botón limpiar todo -->
              <button type="button" 
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 form-button-transition"
                      [disabled]="activeFiltersCount === 0"
                      [class.opacity-50]="activeFiltersCount === 0"
                      [class.cursor-not-allowed]="activeFiltersCount === 0"
                      (click)="clearAllFilters()">
                <span class="material-icons text-lg">clear_all</span>
                Limpiar filtros
              </button>
              
              <!-- Contador de resultados -->
              <div *ngIf="resultCount !== undefined" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <span class="material-icons text-lg text-institucional-primario">analytics</span>
                <span class="text-sm font-medium text-gray-700">
                  {{ resultCount }} resultado(s) encontrado(s)
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Botón guardar búsqueda -->
              <button *ngIf="allowSaveSearch" 
                      type="button"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm border-2 border-institucional-secundario text-institucional-secundario hover:bg-institucional-secundario hover:text-white rounded-lg transition-all duration-200 form-button-transition"
                      [disabled]="activeFiltersCount === 0"
                      [class.opacity-50]="activeFiltersCount === 0"
                      [class.cursor-not-allowed]="activeFiltersCount === 0"
                      (click)="saveCurrentSearch()">
                <span class="material-icons text-lg">bookmark_add</span>
                Guardar búsqueda
              </button>
              
              <!-- Botón exportar -->
              <button *ngIf="allowExport" 
                      type="button"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm bg-stats-verde hover:bg-stats-verde/80 text-white rounded-lg transition-all duration-200 form-button-transition hover:shadow-md"
                      [disabled]="resultCount === 0"
                      [class.opacity-50]="resultCount === 0"
                      [class.cursor-not-allowed]="resultCount === 0"
                      (click)="exportResults()">
                <span class="material-icons text-lg">download</span>
                Exportar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SearchFormComponent implements OnInit, OnDestroy {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() searchFields: SearchField[] = [];
  @Input() quickFilters: { key: string; label: string; value: any; icon?: string }[] = [];
  @Input() showMainSearch = true;
  @Input() mainSearchPlaceholder = 'Buscar...';
  @Input() debounceTime = 500;
  @Input() autoSearch = true;
  @Input() allowSaveSearch = false;
  @Input() allowExport = false;
  @Input() resultCount?: number;
  @Input() isCollapsed = false;

  @Output() search = new EventEmitter<SearchFilters>();
  @Output() filterChange = new EventEmitter<SearchFilters>();
  @Output() quickFilterChange = new EventEmitter<{ key: string; active: boolean }>();
  @Output() saveSearch = new EventEmitter<SearchFilters>();
  @Output() exportData = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  searchForm!: FormGroup;
  activeQuickFilters = new Set<string>();
  private destroy$ = new Subject<void>();

  get activeFiltersCount(): number {
    const formValues = this.searchForm?.value || {};
    const activeFormFilters = Object.keys(formValues).filter(key => {
      const value = formValues[key];
      return value !== null && value !== undefined && value !== '';
    }).length;
    
    return activeFormFilters + this.activeQuickFilters.size;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const formControls: { [key: string]: FormControl } = {
      mainSearch: new FormControl('')
    };

    // Agregar controles para cada campo de búsqueda
    this.searchFields.forEach(field => {
      formControls[field.key] = new FormControl('');
    });

    this.searchForm = new FormGroup(formControls);
  }

  private setupFormSubscriptions(): void {
    if (this.autoSearch) {
      this.searchForm.valueChanges
        .pipe(
          debounceTime(this.debounceTime),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(values => {
          this.onSearchChange(values);
        });
    }
  }

  private onSearchChange(values: any): void {
    const filters = this.getActiveFilters(values);
    this.filterChange.emit(filters);
    if (this.autoSearch) {
      this.search.emit(filters);
    }
  }

  private getActiveFilters(formValues: any): SearchFilters {
    const filters: SearchFilters = {};
    
    // Filtros del formulario
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== undefined && value !== '') {
        filters[key] = value;
      }
    });

    // Filtros rápidos activos
    this.activeQuickFilters.forEach(filterKey => {
      const quickFilter = this.quickFilters.find(f => f.key === filterKey);
      if (quickFilter) {
        filters[quickFilter.key] = quickFilter.value;
      }
    });

    return filters;
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  clearMainSearch(): void {
    this.searchForm.get('mainSearch')?.setValue('');
  }

  isQuickFilterActive(filterKey: string): boolean {
    return this.activeQuickFilters.has(filterKey);
  }

  toggleQuickFilter(filter: { key: string; label: string; value: any; icon?: string }): void {
    if (this.activeQuickFilters.has(filter.key)) {
      this.activeQuickFilters.delete(filter.key);
    } else {
      this.activeQuickFilters.add(filter.key);
    }

    this.quickFilterChange.emit({
      key: filter.key,
      active: this.activeQuickFilters.has(filter.key)
    });

    // Emitir cambio de filtros
    const currentFilters = this.getActiveFilters(this.searchForm.value);
    this.filterChange.emit(currentFilters);
    
    if (this.autoSearch) {
      this.search.emit(currentFilters);
    }
  }

  clearAllFilters(): void {
    this.searchForm.reset();
    this.activeQuickFilters.clear();
    this.reset.emit();
    
    if (this.autoSearch) {
      this.search.emit({});
    }
  }

  saveCurrentSearch(): void {
    const filters = this.getActiveFilters(this.searchForm.value);
    this.saveSearch.emit(filters);
  }

  exportResults(): void {
    this.exportData.emit();
  }

  // Método público para realizar búsqueda manual
  performSearch(): void {
    const filters = this.getActiveFilters(this.searchForm.value);
    this.search.emit(filters);
  }

  // Método público para establecer filtros
  setFilters(filters: SearchFilters): void {
    Object.keys(filters).forEach(key => {
      if (this.searchForm.get(key)) {
        this.searchForm.get(key)?.setValue(filters[key]);
      } else {
        // Es un filtro rápido
        const quickFilter = this.quickFilters.find(f => f.key === key);
        if (quickFilter) {
          this.activeQuickFilters.add(key);
        }
      }
    });
  }

  // Método público para obtener filtros actuales
  getCurrentFilters(): SearchFilters {
    return this.getActiveFilters(this.searchForm.value);
  }
}
