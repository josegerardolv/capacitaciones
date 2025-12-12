import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface SelectionConfig {
  title: string;
  subtitle?: string;
  searchable?: boolean;
  multiple?: boolean;
  showSelectAll?: boolean;
  showSelectedCount?: boolean;
  maxSelections?: number;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: string;
  confirmIconPosition?: 'left' | 'right' | 'only';
  cancelIcon?: string;
  cancelIconPosition?: 'left' | 'right' | 'only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

@Component({
  selector: 'app-selection-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InstitutionalButtonComponent],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="institutional-modal-overlay entering"
         role="dialog"
         aria-modal="true"
         [attr.aria-labelledby]="'modal-title-' + modalId"
         [attr.aria-describedby]="'modal-desc-' + modalId"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del modal -->
      <div class="institutional-modal-container entering"
           [class.size-sm]="config.size === 'sm'"
           [class.size-md]="!config.size || config.size === 'md'"
           [class.size-lg]="config.size === 'lg'"
           [class.size-xl]="config.size === 'xl'"
           (click)="$event.stopPropagation()">
        
        <!-- Header del modal -->
        <div class="institutional-modal-header">
          <h3 class="institutional-modal-title" [id]="'modal-title-' + modalId">
            {{ config.title }}
          </h3>
          <p *ngIf="config.subtitle" class="text-sm mt-1 opacity-90">{{ config.subtitle }}</p>
          
          <!-- Botón cerrar -->
          <app-institutional-button
            [config]="{
              variant: 'modal-close',
              icon: 'close',
              iconPosition: 'only',
              size: 'medium',
              disabled: isLoading,
              ariaLabel: 'Cerrar modal'
            }"
            class="institutional-modal-close"
            (buttonClick)="close()">
          </app-institutional-button>
          
          <!-- Contador de selecciones -->
          <div *ngIf="config.showSelectedCount && config.multiple" 
               class="mt-3 text-sm opacity-90">
            {{ getSelectedCount() }} 
            {{ config.maxSelections ? 'de ' + config.maxSelections : '' }} 
            seleccionado{{ getSelectedCount() !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Body del modal -->
        <div class="institutional-modal-body">
          <!-- Barra de búsqueda -->
          <div *ngIf="config.searchable" class="mb-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
              <input [formControl]="searchControl"
                     type="text"
                     placeholder="Buscar opciones..."
                     class="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
              <app-institutional-button
                *ngIf="searchControl.value"
                [config]="{
                  variant: 'ghost',
                  icon: config.cancelIcon || 'close',
                  iconPosition: config.cancelIconPosition || 'left',
                  ariaLabel: 'Limpiar búsqueda'
                }"
                class="absolute right-2 top-1/2 transform -translate-y-1/2"
                (buttonClick)="clearSearch()">
                </app-institutional-button>
            </div>
          </div>

          <!-- Controles de selección -->
          <div *ngIf="config.multiple && config.showSelectAll && filteredOptions.length > 0" 
               class="mb-4 flex gap-2">
            <app-institutional-button
              [config]="{
                variant: 'secondary',
                disabled: isMaxSelectionsReached() && !areAllSelected(),
                ariaLabel: 'Seleccionar todas las opciones',
                icon: config.confirmIcon || 'done_all',
                iconPosition: config.confirmIconPosition || 'left'
              }"
              (buttonClick)="selectAll()">
              Seleccionar todo
            </app-institutional-button>
            <app-institutional-button
              [config]="{
                variant: 'ghost',
                ariaLabel: 'Limpiar todas las selecciones',
                icon: config.cancelIcon || 'clear',
                iconPosition: config.cancelIconPosition || 'left'
              }"
              (buttonClick)="clearAll()">
              Limpiar
            </app-institutional-button>
          </div>

          <!-- Lista de opciones -->
          <div class="max-h-64 overflow-y-auto" [id]="'modal-desc-' + modalId">
            <div *ngIf="filteredOptions.length === 0" class="text-center py-8 text-gray-500">
              <span class="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              <p>No se encontraron opciones</p>
            </div>
            
            <div *ngFor="let option of filteredOptions; trackBy: trackByOptionId" 
                 class="transition-all duration-200 hover:bg-gray-50 rounded-lg">
              <label class="flex items-center p-3 cursor-pointer"
                     [class.opacity-50]="option.disabled"
                     [class.cursor-not-allowed]="option.disabled"
                     [class.bg-blue-50]="isSelected(option)">
                
                <!-- Checkbox o Radio -->
                <input [type]="config.multiple ? 'checkbox' : 'radio'"
                       [name]="config.multiple ? '' : 'selection'"
                       [checked]="isSelected(option)"
                       [disabled]="option.disabled || (config.multiple && !isSelected(option) && isMaxSelectionsReached())"
                       (change)="toggleSelection(option)"
                       class="mr-3">
                
                <!-- Icono de la opción -->
                <div *ngIf="option.icon" 
                     class="w-8 h-8 mr-3 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span class="material-symbols-outlined text-gray-600 text-sm">{{ option.icon }}</span>
                </div>
                
                <!-- Contenido de la opción -->
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ option.label }}</div>
                  <div *ngIf="option.description" class="text-sm text-gray-600 mt-1">{{ option.description }}</div>
                </div>
                
                <!-- Indicador de selección -->
                <div *ngIf="isSelected(option)" 
                     class="w-6 h-6 ml-3 rounded-full bg-blue-500 flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-sm">check</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Dropdown auxiliar -->
          <div *ngIf="auxDropdownOptions?.length" class="mt-4 pt-4 border-t border-gray-200">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ auxDropdownLabel || 'Seleccionar' }}</label>
            <select class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    [(ngModel)]="auxModel">
              <option [ngValue]="null">-- Ninguno --</option>
              <option *ngFor="let o of auxDropdownOptions" [value]="o.id">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="institutional-modal-footer">
          <!-- Botón cancelar -->
          <app-institutional-button
            [config]="{
              variant: 'ghost',
              disabled: isLoading,
              ariaLabel: 'Cancelar selección',
              icon: config.cancelIcon || 'close',
              iconPosition: config.cancelIconPosition || 'left'
            }"
            (buttonClick)="onCancel()">
            {{ config.cancelText || 'Cancelar' }}
          </app-institutional-button>

          <!-- Botón confirmar -->
          <app-institutional-button
            [config]="{
              variant: 'primary',
              loading: isLoading,
              disabled: isConfirmDisabled(),
              ariaLabel: 'Confirmar selección',
              icon: config.confirmIcon || 'check',
              iconPosition: config.confirmIconPosition || 'left'
            }"
            (buttonClick)="onConfirm()">
            {{ config.confirmText || 'Confirmar' }}
          </app-institutional-button>
        </div>
      </div>
    </div>
  `
})
export class SelectionModalComponent {
  @Input() isOpen = false;
  @Input() config: SelectionConfig = {
    title: 'Seleccionar opciones',
    multiple: true
  };
  @Input() options: SelectionOption[] = [];
  @Input() selectedIds: string[] = [];
  @Input() isLoading = false;
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;
  @Input() autoClose = true; // Nuevo: controla si el modal se cierra automáticamente al confirmar
  @Input() closeOnCancel = true; // Nuevo: controla si el modal se cierra automáticamente al cancelar

  // Opcional: dropdown auxiliar (por ejemplo para seleccionar rol relacionado a la selección principal)
  @Input() auxDropdownOptions: SelectionOption[] = [];
  @Input() auxDropdownLabel: string | null = null;
  @Input() auxSelectedId: string | null = null;

  // Iniciales y control para requerir que la selección cambie antes de confirmar
  @Input() initialSelectedIds: string[] = [];
  @Input() requireChange = false;

  @Output() auxSelectionChange = new EventEmitter<string | null>();

  @Output() selectionChange = new EventEmitter<SelectionOption[]>();
  @Output() cancel = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();
  @Output() selectionUpdate = new EventEmitter<string[]>(); // Nuevo: emite cuando cambian las selecciones sin confirmar

  // ID único para accesibilidad
  modalId = Math.random().toString(36).substr(2, 9);

  searchControl = new FormControl('');
  filteredOptions: SelectionOption[] = [];

  // manejar ngModel interno para aux dropdown
  auxModel: string | null = null;

  ngOnInit(): void {
    this.updateFilteredOptions();
    this.searchControl.valueChanges.subscribe(() => {
      this.updateFilteredOptions();
    });
  }

  /** Devuelve true si la selección actual es distinta de la selección inicial */
  isSelectionChanged(): boolean {
    const current = [...this.selectedIds].sort();
    const initial = [...(this.initialSelectedIds || [])].sort();
    if (current.length !== initial.length) return true;
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== initial[i]) return true;
    }
    return false;
  }

  ngOnChanges(): void {
    this.updateFilteredOptions();
    // sincronizar auxModel con auxSelectedId
    this.auxModel = this.auxSelectedId ?? null;
    // sincronizar selectedIds con input (si se actualiza desde fuera)
    if (!this.selectedIds || this.selectedIds.length === 0) {
      // si hay initialSelectedIds, copiarlas como estado inicial
      this.selectedIds = [...(this.initialSelectedIds || [])];
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen && !this.isLoading) {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay && !this.isLoading) {
      this.close();
    }
  }
  // Devuelve true si el botón confirmar debe estar deshabilitado
  isConfirmDisabled(): boolean {
    return this.isLoading || (!this.config.multiple && this.getSelectedCount() === 0) || (this.requireChange && !this.isSelectionChanged());
  }

  toggleSelection(option: SelectionOption): void {
    if (option.disabled) return;

    const isCurrentlySelected = this.isSelected(option);
    
    if (this.config.multiple) {
      if (isCurrentlySelected) {
        this.selectedIds = this.selectedIds.filter(id => id !== option.id);
      } else {
        if (!this.isMaxSelectionsReached()) {
          this.selectedIds = [...this.selectedIds, option.id];
        }
      }
    } else {
      this.selectedIds = isCurrentlySelected ? [] : [option.id];
    }
    
    // Emitir cambio de selección en tiempo real
    this.selectionUpdate.emit([...this.selectedIds]);
  }

  isSelected(option: SelectionOption): boolean {
    return this.selectedIds.includes(option.id);
  }

  getSelectedCount(): number {
    return this.selectedIds.length;
  }

  isMaxSelectionsReached(): boolean {
    return this.config.maxSelections ? this.getSelectedCount() >= this.config.maxSelections : false;
  }

  areAllSelected(): boolean {
    const selectableOptions = this.filteredOptions.filter(opt => !opt.disabled);
    return selectableOptions.every(opt => this.isSelected(opt));
  }

  selectAll(): void {
    if (!this.config.multiple) return;
    
    const selectableOptions = this.filteredOptions.filter(opt => !opt.disabled);
    const maxToSelect = this.config.maxSelections || selectableOptions.length;
    const optionsToSelect = selectableOptions.slice(0, maxToSelect);
    
    this.selectedIds = [...new Set([...this.selectedIds, ...optionsToSelect.map(opt => opt.id)])];
  }

  clearAll(): void {
    this.selectedIds = [];
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onConfirm(): void {
    const selectedOptions = this.options.filter(opt => this.selectedIds.includes(opt.id));
    this.selectionChange.emit(selectedOptions);
    // emitir selección auxiliar al confirmar también
    this.auxSelectionChange.emit(this.auxModel ?? null);
    
    // Solo cerrar automáticamente si autoClose está habilitado
    if (this.autoClose) {
      this.close();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    
    // Solo cerrar automáticamente si closeOnCancel está habilitado
    if (this.closeOnCancel) {
      this.close();
    }
  }

  close(): void {
    if (this.isLoading) return;
    
    this.isOpen = false;
    this.modalClose.emit();
  }

  trackByOptionId(index: number, option: SelectionOption): string {
    return option.id;
  }

  private updateFilteredOptions(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(option =>
        option.label.toLowerCase().includes(searchTerm) ||
        (option.description && option.description.toLowerCase().includes(searchTerm))
      );
    }
  }
}
