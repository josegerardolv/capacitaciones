import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, AfterContentInit, AfterViewInit, ViewChildren, ElementRef, QueryList, ChangeDetectorRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingModalComponent } from '@/app/shared/components/modals/loading-modal.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  maxWidth?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom' | 'duration';
  // Para columnas de tipo duration, indicar la unidad base del valor
  // Valores permitidos: 'seconds'|'minutes'|'hours'|'days'|'weeks'|'months'|'years'
  durationUnit?: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  // Cómo mostrar la duración: 'long' (ej. "1 año 2 meses") o 'short' (ej. "1a 2mes")
  durationDisplay?: 'long' | 'short';
  template?: TemplateRef<any>;
  /** Pin column during horizontal scroll. Use 'left' or 'right' to pin to that side. */
  pin?: 'left' | 'right';
}

export interface TableConfig {
  variant?: 'default' | 'compact' | 'dense' | 'spacious';
  striped?: boolean;
  hoverable?: boolean;
  responsive?: boolean;
  fixedHeader?: boolean;
  stickyHeader?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  localSort?: boolean; // Si es true, ordena localmente; si es false, emite evento para ordenamiento del servidor
}

export interface SortEvent {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface SelectionEvent {
  selectedItems: any[];
  allSelected: boolean;
}

@Component({
  selector: 'app-institutional-table',
  standalone: true,
  imports: [CommonModule, LoadingModalComponent],
  template: `
      <!-- Modal de carga usando el componente dedicado -->
      <app-loading-modal
        [isOpen]="config.loading || false"
        [config]="{
          title: 'Cargando datos',
          message: 'Obteniendo información de la tabla...',
          size: 'md',
          preventClose: true
        }">
      </app-loading-modal>

      <div 
        class="institucional-table-responsive"
        [class.institucional-table-fixed-header]="config.fixedHeader">
        
          <table 
          class="institucional-table"
          [class.institucional-table-sticky]="config.stickyHeader"
          [class.institucional-table-compact]="config.variant === 'compact'"
          [class.institucional-table-dense]="config.variant === 'dense'"
          [class.institucional-table-spacious]="config.variant === 'spacious'"
          [class.has-sticky-columns]="hasStickyColumns">
          
          <thead>
            <tr>
              <th *ngIf="config.selectable" class="institucional-table-header">
                <input 
                  type="checkbox" 
                  class="institucional-table-checkbox"
                  [checked]="allSelected"
                  [indeterminate]="someSelected && !allSelected"
                  (change)="toggleSelectAll($event)">
              </th>
              
              <th 
                *ngFor="let column of columns; let i = index" 
                #colHeader
                [attr.data-col-index]="i"
                class="institucional-table-header"
                [class.institucional-table-sortable]="column.sortable"
                [class.institucional-table-sort-asc]="sortColumn === column.key && sortDirection === 'asc'"
                [class.institucional-table-sort-desc]="sortColumn === column.key && sortDirection === 'desc'"
                [class.institucional-table-column-sticky-left]="column.pin === 'left'"
                [class.institucional-table-column-sticky-right]="column.pin === 'right'"
                [style.left.px]="column.pin !== 'left' ? null : leftOffsets[i]"
                [style.right.px]="column.pin !== 'right' ? null : 0"
                [style.width]="column.width ? column.width : null"
                [style.max-width]="column.maxWidth ? column.maxWidth : null"
                [style.min-width]="column.minWidth ? column.minWidth : null"
                [style.text-align]="column.align || 'left'"
                (click)="onSort(column)">
                
                <div class="header-content">
                  <span class="column-title">{{ column.label }}</span>
                  <span 
                    *ngIf="column.sortable" 
                    class="institucional-table-sort-icon material-symbols-outlined">
                    {{ getSortIcon(column.key) }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr 
              *ngFor="let item of displayData; let i = index; trackBy: trackByFn"
              class="institucional-table-row"
              [class.institucional-table-row-selected]="isSelected(item)"
              [class.institucional-table-row-striped]="config.striped"
              [class.institucional-table-expandable-row]="config.expandable"
              (click)="onRowClick(item, i)">
              
              <td *ngIf="config.selectable" class="institucional-table-cell">
                <input 
                  type="checkbox" 
                  class="institucional-table-checkbox"
                  [checked]="isSelected(item)"
                  (change)="toggleSelect(item, $event)"
                  (click)="$event.stopPropagation()">
              </td>
              
              <td 
                *ngFor="let column of columns; let ci = index" 
                class="institucional-table-cell"
                [class.institucional-table-column-sticky-left]="column.pin === 'left'"
                [class.institucional-table-column-sticky-right]="column.pin === 'right'"
                [style.left.px]="column.pin !== 'left' ? null : leftOffsets[ci]"
                [style.right.px]="column.pin !== 'right' ? null : 0"
                [style.width]="column.width ? column.width : null"
                [style.max-width]="column.maxWidth ? column.maxWidth : null"
                [style.text-align]="column.align || 'left'">
                
                <div *ngIf="column.template; else defaultCell" class="cell-content">
                  <ng-container 
                    *ngTemplateOutlet="column.template; context: { $implicit: item, column: column, index: i }">
                  </ng-container>
                </div>
                
                <ng-template #defaultCell>
                  <div class="cell-content">{{ getCellValue(item, column) }}</div>
                </ng-template>
              </td>
            </tr>
            
            <tr *ngFor="let expandedItem of displayData; trackBy: trackByFn">
              <td *ngIf="config.expandable && isExpanded(expandedItem)" 
                  [attr.colspan]="getTotalColumns()" 
                  class="institucional-table-expanded-content">
                <ng-content select="[slot=expanded]"></ng-content>
              </td>
            </tr>
            
            <tr *ngIf="displayData.length === 0 && !config.loading" class="institucional-table-row">
              <td [attr.colspan]="getTotalColumns()" class="institucional-table-empty">
                <div class="institucional-table-empty-icon material-symbols-outlined">
                  {{ config.emptyIcon || 'table_view' }}
                </div>
                <div class="institucional-table-empty-title">
                  Sin datos disponibles
                </div>
                <div class="institucional-table-empty-description">
                  {{ config.emptyMessage || 'No hay información para mostrar en este momento.' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  `
})
export class InstitutionalTableComponent implements AfterContentInit, AfterViewInit, OnChanges {
  constructor(private cd: ChangeDetectorRef) {
    // Inicializar arrays para evitar problemas de referencia
    this.originalData = [];
    this.sortedData = [];
  }
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config: TableConfig = {};
  @Input() selectedItems: any[] = [];
  @Input() expandedItems: any[] = [];
  @Input() sortColumn: string | null = '';
  @Input() sortDirection: 'asc' | 'desc' | null = null;

  @Output() sort = new EventEmitter<SortEvent>();
  @Output() selectionChange = new EventEmitter<SelectionEvent>();
  @Output() rowClick = new EventEmitter<{ item: any; index: number }>();
  @Output() expandToggle = new EventEmitter<{ item: any; expanded: boolean }>();

  @ContentChild('actions') actionsTemplate?: TemplateRef<any>;
  @ContentChild('expanded') expandedTemplate?: TemplateRef<any>;

  @ViewChildren('colHeader', { read: ElementRef }) headerCells!: QueryList<ElementRef>;

  leftOffsets: { [key: number]: number } = {};
  rightOffsets: { [key: number]: number } = {};

  // Para ordenamiento local
  private originalData: any[] = [];
  sortedData: any[] = [];

  get hasStickyColumns(): boolean {
    return this.columns.some(col => col.pin === 'left' || col.pin === 'right');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambiaron los datos, actualizar datos originales y aplicar ordenamiento
    if (changes['data'] && changes['data'].currentValue) {
      this.originalData = [...changes['data'].currentValue];
      this.applySortIfLocal();

      // Re-aplicar sticky positioning cuando cambien los datos de la tabla
      if (!changes['data'].firstChange) {
        setTimeout(() => {
          this.computeStickyOffsets();
          this.enforceStickyPositioning();
        }, 50);
      }
    }

    // Si cambió el ordenamiento externo y está en modo local, aplicar ordenamiento
    if ((changes['sortColumn'] || changes['sortDirection']) && this.config.localSort) {
      this.applySortIfLocal();
    }

    // Si cambió la configuración, re-aplicar ordenamiento
    if (changes['config'] && this.config.localSort) {
      this.applySortIfLocal();
    }
  }

  ngAfterContentInit() {
    // Actions are now handled via column configuration
  }

  ngAfterViewInit() {
    // Wait a tick for DOM to settle
    setTimeout(() => {
      this.computeStickyOffsets();
      this.enforceStickyPositioning();
    }, 0);
  }

  @HostListener('window:resize')
  onWindowResize() {
    // recompute offsets on resize
    this.computeStickyOffsets();
    this.enforceStickyPositioning();
  }

  /**
   * Force sticky positioning for browsers that might ignore CSS sticky
   */
  private enforceStickyPositioning() {
    if (!this.hasStickyColumns) return;

    const tableContainer = document.querySelector('.institucional-table-responsive') as HTMLElement;
    const stickyHeaders = document.querySelectorAll('.institucional-table-column-sticky-right');

    if (!tableContainer || !stickyHeaders.length) return;

    // Force the sticky positioning with JavaScript
    stickyHeaders.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.position = 'sticky';
      htmlElement.style.right = '0';
      htmlElement.style.zIndex = '1000';
      htmlElement.style.backgroundColor = htmlElement.tagName.toLowerCase() === 'th'
        ? 'transparent'
        : 'white';
    });

    // Optional: Add scroll listener for extra enforcement
    tableContainer.addEventListener('scroll', () => {
      stickyHeaders.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.right = '0';
      });
    });
  }

  private computeStickyOffsets() {
    if (!this.headerCells || !this.columns) return;

    // reset
    this.leftOffsets = {};
    this.rightOffsets = {};

    // Map header elements by data-col-index
    const map: { [key: number]: HTMLElement } = {};
    this.headerCells.forEach(el => {
      const idx = el.nativeElement.getAttribute('data-col-index');
      if (idx !== null) map[Number(idx)] = el.nativeElement as HTMLElement;
    });

    // Compute left offsets for pinned-left columns in order
    const leftPinned = this.columns
      .map((c, i) => ({ c, i }))
      .filter(x => x.c.pin === 'left')
      .map(x => x.i)
      .sort((a, b) => a - b);

    let acc = 0;
    for (const idx of leftPinned) {
      const el = map[idx];
      const w = el ? el.offsetWidth : 0;
      this.leftOffsets[idx] = acc;
      acc += w;
    }

    // Compute right offsets for pinned-right columns (from right to left)
    const rightPinned = this.columns
      .map((c, i) => ({ c, i }))
      .filter(x => x.c.pin === 'right')
      .map(x => x.i)
      .sort((a, b) => b - a);

    acc = 0;
    for (const idx of rightPinned) {
      const el = map[idx];
      const w = el ? el.offsetWidth : 0;
      this.rightOffsets[idx] = acc;
      acc += w;
    }

    // trigger change detection in case bindings need to update
    try { this.cd.detectChanges(); } catch (e) { /* ignore */ }
  }

  get allSelected(): boolean {
    return this.displayData.length > 0 && this.selectedItems.length === this.displayData.length;
  }

  get someSelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.displayData.length;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item);
  }

  isExpanded(item: any): boolean {
    return this.expandedItems.includes(item);
  }

  toggleSelect(item: any, event: Event): void {
    event.stopPropagation();
    const isSelected = this.isSelected(item);
    let newSelection: any[];

    if (isSelected) {
      newSelection = this.selectedItems.filter(selected => selected !== item);
    } else {
      newSelection = [...this.selectedItems, item];
    }

    this.selectionChange.emit({
      selectedItems: newSelection,
      allSelected: newSelection.length === this.data.length
    });
  }

  toggleSelectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    let newSelection: any[];

    if (isChecked) {
      // Union: Add visible items to existing selection (avoid duplicates)
      const currentSelectionIds = new Set(this.selectedItems.map(item => this.trackByFn(0, item)));
      const itemsToAdd = this.displayData.filter(item => !currentSelectionIds.has(this.trackByFn(0, item)));
      newSelection = [...this.selectedItems, ...itemsToAdd];
    } else {
      // Difference: Remove visible items from existing selection
      const visibleIds = new Set(this.displayData.map(item => this.trackByFn(0, item)));
      newSelection = this.selectedItems.filter(item => !visibleIds.has(this.trackByFn(0, item)));
    }

    this.selectionChange.emit({
      selectedItems: newSelection,
      allSelected: isChecked
    });
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let newDirection: 'asc' | 'desc' | null = 'asc';
    let newColumn: string | null = column.key;

    if (this.sortColumn === column.key) {
      if (this.sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        newDirection = null;
        newColumn = null; // Limpiar la columna cuando no hay ordenamiento
      }
    }

    // Actualizar estado de ordenamiento
    this.sortColumn = newColumn;
    this.sortDirection = newDirection;

    // Si está habilitado el ordenamiento local, ordenar los datos internamente
    if (this.config.localSort) {
      this.applySortIfLocal();
      // Forzar detección de cambios para actualizar la vista
      this.cd.detectChanges();
    }

    // Siempre emitir el evento para mantener sincronización con el componente padre
    this.sort.emit({
      column: newColumn,
      direction: newDirection
    });
  }

  /**
   * Aplica ordenamiento local a los datos si está habilitado
   */
  private applySortIfLocal(): void {
    if (!this.config.localSort) {
      this.sortedData = [...this.originalData];
      return;
    }

    if (!this.originalData || this.originalData.length === 0) {
      this.sortedData = [];
      return;
    }

    if (!this.sortColumn || !this.sortDirection) {
      // Sin ordenamiento, usar datos originales
      this.sortedData = [...this.originalData];
      return;
    }

    this.sortedData = [...this.originalData].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      // Manejar casos especiales para propiedades calculadas
      if (this.sortColumn === 'person.full_name') {
        // Crear nombre completo para ordenamiento
        valueA = a.person ? `${a.person.first_name || ''} ${a.person.last_name || ''} ${a.person.second_last_name || ''}`.trim() : '';
        valueB = b.person ? `${b.person.first_name || ''} ${b.person.last_name || ''} ${b.person.second_last_name || ''}`.trim() : '';
      } else {
        valueA = this.getNestedProperty(a, this.sortColumn!);
        valueB = this.getNestedProperty(b, this.sortColumn!);
      }

      // Manejar valores nulos/undefined
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (valueB == null) return this.sortDirection === 'asc' ? -1 : 1;

      let comparison = 0;

      // Determinar tipo de comparación
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase(), 'es-ES');
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        comparison = valueA.getTime() - valueB.getTime();
      } else {
        // Convertir a string para comparación genérica
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        comparison = strA.localeCompare(strB, 'es-ES');
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Obtener los datos que se deben mostrar (ordenados si está habilitado el modo local)
   */
  get displayData(): any[] {
    if (this.config.localSort) {
      // En modo local, usar datos ordenados si están disponibles, sino usar originales
      return this.sortedData && this.sortedData.length > 0 ? this.sortedData : this.originalData;
    }
    // En modo servidor, usar datos directos del input
    return this.data || [];
  }

  onRowClick(item: any, index: number): void {
    if (this.config.expandable) {
      this.toggleExpanded(item);
    }

    this.rowClick.emit({ item, index });
  }

  toggleExpanded(item: any): void {
    const isExpanded = this.isExpanded(item);
    this.expandToggle.emit({ item, expanded: !isExpanded });
  }

  getSortIcon(columnKey: string): string {
    if (this.sortColumn !== columnKey || this.sortDirection === null) {
      return 'unfold_more';
    }
    return this.sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  getCellValue(item: any, column: TableColumn): any {
    const value = this.getNestedProperty(item, column.key);

    switch (column.type) {
      case 'duration':
        // Determinar unidad base (por defecto: minutes para compatibilidad)
        const base = (column as any).durationUnit || 'minutes';
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return '';

        // Convertir todo a segundos
        const multipliers: { [k: string]: number } = {
          seconds: 1,
          minutes: 60,
          hours: 3600,
          days: 86400,
          weeks: 604800,
          months: 2592000, // 30 días
          years: 31536000 // 365 días
        };

        const totalSeconds = Math.round(num * (multipliers[base] || 60));

        if (totalSeconds === 0) {
          const baseLabels: any = { seconds: 'segundos', minutes: 'minutos', hours: 'horas', days: 'días', weeks: 'semanas', months: 'meses', years: 'años' };
          return `0 ${baseLabels[base] || 'segundos'}`;
        }

        let rest = totalSeconds;
        const years = Math.floor(rest / multipliers['years']); rest %= multipliers['years'];
        const months = Math.floor(rest / multipliers['months']); rest %= multipliers['months'];
        const weeks = Math.floor(rest / multipliers['weeks']); rest %= multipliers['weeks'];
        const days = Math.floor(rest / multipliers['days']); rest %= multipliers['days'];
        const hours = Math.floor(rest / multipliers['hours']); rest %= multipliers['hours'];
        const minutes = Math.floor(rest / multipliers['minutes']); rest %= multipliers['minutes'];
        const seconds = rest;

        const display = (column as any).durationDisplay || 'long';
        const parts: string[] = [];
        if (display === 'short') {
          const mapShort: any = { years: 'a', months: 'mes', weeks: 'sem', days: 'd', hours: 'h', minutes: 'min', seconds: 's' };
          if (years) parts.push(`${years}${mapShort['years']}`);
          if (months) parts.push(`${months}${mapShort['months']}`);
          if (weeks) parts.push(`${weeks}${mapShort['weeks']}`);
          if (days) parts.push(`${days}${mapShort['days']}`);
          if (hours) parts.push(`${hours}${mapShort['hours']}`);
          if (minutes) parts.push(`${minutes}${mapShort['minutes']}`);
          if (seconds) parts.push(`${seconds}${mapShort['seconds']}`);
          return parts.join(' ');
        }

        if (years) parts.push(`${years} año${years > 1 ? 's' : ''}`);
        if (months) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
        if (weeks) parts.push(`${weeks} semana${weeks > 1 ? 's' : ''}`);
        if (days) parts.push(`${days} día${days > 1 ? 's' : ''}`);
        if (hours) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
        if (minutes) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
        if (seconds) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

        return parts.join(' ');
      case 'date':
        return value ? new Date(value).toLocaleDateString('es-ES') : '';
      case 'boolean':
        return value ? 'Sí' : 'No';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('es-ES') : value;
      default:
        return value || '';
    }
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getTotalColumns(): number {
    let count = this.columns.length;
    if (this.config.selectable) count++;
    // Actions are now included in the columns array, not separately
    return count;
  }
}
