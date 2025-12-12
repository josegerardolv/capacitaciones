import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { SelectComponent } from '@/app/shared/components/inputs/select.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface PaginationConfig {
  pageSize: number;
  totalItems: number;
  currentPage: number;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  maxVisiblePages?: number;
}

export interface PageChangeEvent {
  page: number;
  pageSize: number;
  totalPages: number;
}

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule, SelectComponent, InstitutionalButtonComponent],
  template: `
    <!-- Selector de tamaño de página arriba de la tabla -->
    <div *ngIf="config.showPageSizeSelector !== false && showPageSizeSelector" class="institucional-table-page-size-selector">
      <div class="page-size-selector-container">
        <span class="page-size-label">Mostrar</span>
        <div class="w-20">
          <!-- Usar el componente select institucionalizado -->
          <app-select
            [control]="pageSizeControl"
            [options]="pageSizeOptionItems"
            [extraClasses]="'institucional-form-select'"
            [placeholder]="' '"
            [fullWidth]="false"
            (change)="onPageSizeSelectChange($event)">
          </app-select>
        </div>
        
        <span class="page-size-label">registros por página</span>
      </div>
    </div>

    <!-- Controles de paginación debajo de la tabla -->
    <div *ngIf="showPaginationControls" class="institucional-table-pagination">
      <!-- Info de registros - Responsive -->
      <div class="institucional-table-pagination-info" *ngIf="config.showInfo !== false">
        <div class="pagination-info-primary">
          <span class="hidden sm:inline">Mostrando</span>
          <span class="font-semibold">{{ startRecord }} - {{ endRecord }}</span>
          <span class="hidden sm:inline">de</span>
          <span class="hidden sm:inline font-semibold">{{ config.totalItems }}</span>
          <span class="hidden sm:inline">registros</span>
          <span class="sm:hidden text-xs">/{{ config.totalItems }}</span>
        </div>
      </div>

      <!-- Controles de paginación - Responsive -->
      <div class="institucional-table-pagination-controls">
        <!-- Navegación básica para móviles -->
        <div class="pagination-mobile-nav sm:hidden">
          <!-- Botón primera página -->
          <app-institutional-button
            [config]="{
              variant: 'secondary',
              icon: 'first_page',
              disabled: config.currentPage === 1
            }"
            class="institucional-table-pagination-btn pagination-btn-mobile"
            title="Primera página"
            (buttonClick)="goToPage(1)">
          </app-institutional-button>
          
          <app-institutional-button
            [config]="{
              variant: 'secondary',
              icon: 'chevron_left',
              disabled: config.currentPage === 1
            }"
            class="institucional-table-pagination-btn pagination-btn-mobile"
            title="Página anterior"
            (buttonClick)="goToPage(config.currentPage - 1)">
          </app-institutional-button>
          
          <div class="pagination-mobile-info">
            <span class="text-sm font-medium">{{ config.currentPage }} / {{ totalPages }}</span>
          </div>
          
          <app-institutional-button
            [config]="{
              variant: 'secondary',
              icon: 'chevron_right',
              disabled: config.currentPage === totalPages
            }"
            class="institucional-table-pagination-btn pagination-btn-mobile"
            title="Página siguiente"
            (buttonClick)="goToPage(config.currentPage + 1)">
          </app-institutional-button>
          
          <!-- Botón última página -->
          <app-institutional-button
            [config]="{
              variant: 'secondary',
              icon: 'last_page',
              disabled: config.currentPage === totalPages
            }"
            class="institucional-table-pagination-btn pagination-btn-mobile"
            title="Última página"
            (buttonClick)="goToPage(totalPages)">
          </app-institutional-button>
        </div>

        <!-- Navegación completa para tablets y desktop -->
        <div class="pagination-desktop-nav hidden sm:flex">
          <!-- Botón primera página -->
          <button 
            class="institucional-table-pagination-btn pagination-btn-nav"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(1)"
            title="Primera página">
            <span class="material-symbols-outlined">first_page</span>
          </button>

          <!-- Botón página anterior -->
          <button 
            class="institucional-table-pagination-btn pagination-btn-nav"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(config.currentPage - 1)"
            title="Página anterior">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <!-- Números de página - Responsive -->
          <div class="pagination-pages-container">
            <ng-container *ngFor="let page of visiblePages">
              <button 
                *ngIf="page !== '...'; else ellipsis"
                class="institucional-table-pagination-btn pagination-btn-page"
                [class.institucional-table-pagination-btn-active]="page === config.currentPage"
                (click)="goToPage(+page)">
                {{ page }}
              </button>
              
              <ng-template #ellipsis>
                <span class="institucional-table-pagination-ellipsis">...</span>
              </ng-template>
            </ng-container>
          </div>

          <!-- Botón página siguiente -->
          <button 
            class="institucional-table-pagination-btn pagination-btn-nav"
            [disabled]="config.currentPage === totalPages"
            (click)="goToPage(config.currentPage + 1)"
            title="Página siguiente">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <!-- Botón última página -->
          <button 
            class="institucional-table-pagination-btn pagination-btn-nav"
            [disabled]="config.currentPage === totalPages"
            (click)="goToPage(totalPages)"
            title="Última página">
            <span class="material-symbols-outlined">last_page</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* === PAGE SIZE SELECTOR ABOVE TABLE === */
    .institucional-table-page-size-selector {
      padding: 1rem 2rem 0.5rem;
      background: #ffffff;
      border-top-left-radius: var(--border-radius-lg);
      border-top-right-radius: var(--border-radius-lg);
      border-bottom: 1px solid rgba(139, 21, 56, 0.08);
    }

    .page-size-selector-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .page-size-label {
      font-size: 0.875rem;
      color: var(--gray-600);
      font-weight: 500;
      white-space: nowrap;
    }


    .pagination-page-size-select:focus {
      outline: none;
      border-color: var(--institucional-secundario);
      box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.1);
    }

    /* === RESPONSIVE PAGE SIZE SELECTOR === */
    @media (max-width: 640px) {
      .institucional-table-page-size-selector {
        padding: 0.75rem 1rem 0.5rem;
      }

      .page-size-selector-container {
        justify-content: center;
        flex-wrap: wrap;
      }

      .page-size-label {
        font-size: 0.8rem;
      }

      .pagination-page-size-select {
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
        min-width: 4.25rem;
      }
    }

    @media (max-width: 480px) {
      .institucional-table-page-size-selector {
        padding: 0.5rem 0.75rem 0.375rem;
      }

      .page-size-label {
        font-size: 0.75rem;
      }

      .pagination-page-size-select {
        padding: 0.25rem;
        font-size: 0.8rem;
        min-width: 3.5rem;
      }
    }

    /* === RESPONSIVE PAGINATION STYLES === */
    .institucional-table-pagination-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--gray-600);
      font-weight: 500;
    }

    .pagination-info-primary {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* === MOBILE NAVIGATION === */
    .pagination-mobile-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
    }

    .pagination-mobile-info {
      display: flex;
      align-items: center;
      min-width: 4rem;
      justify-content: center;
      margin: 0 0.5rem;
    }

    .pagination-btn-mobile {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      min-width: 2.5rem;
      height: 2.5rem;
    }

    /* === DESKTOP NAVIGATION === */
    .pagination-desktop-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pagination-btn-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      min-width: 2.5rem;
      height: 2.5rem;
    }

    .pagination-pages-container {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .pagination-btn-page {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      min-width: 2.5rem;
      height: 2.5rem;
    }

    .institucional-table-pagination-ellipsis {
      padding: 0.5rem 0.25rem;
      color: var(--gray-500);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* === RESPONSIVE BREAKPOINTS === */
    @media (min-width: 640px) {
      .institucional-table-pagination-info {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
      }
    }

    @media (min-width: 768px) {
      .pagination-desktop-nav {
        gap: 0.75rem;
      }

      .pagination-pages-container {
        gap: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .institucional-table-pagination {
        padding: 1rem !important;
        gap: 1rem;
      }

      .pagination-btn-mobile .material-symbols-outlined {
        font-size: 1.25rem;
      }

      .pagination-mobile-nav {
        gap: 0.25rem;
      }

      .pagination-mobile-info {
        margin: 0 0.25rem;
        min-width: 3.5rem;
      }
    }

    @media (max-width: 639px) {
      .pagination-pages-container {
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .pagination-pages-container::-webkit-scrollbar {
        display: none;
      }
    }

    /* === UTILITY CLASSES === */
    .hidden {
      display: none;
    }

    .flex {
      display: flex;
    }

    .items-center {
      align-items: center;
    }

    .justify-center {
      justify-content: center;
    }

    .gap-1 {
      gap: 0.25rem;
    }

    .text-sm {
      font-size: 0.875rem;
    }

    .text-xs {
      font-size: 0.75rem;
    }

    .font-medium {
      font-weight: 500;
    }

    .font-semibold {
      font-weight: 600;
    }

    /* === RESPONSIVE UTILITIES === */
    @media (min-width: 640px) {
      .sm\\:inline {
        display: inline;
      }

      .sm\\:flex {
        display: flex;
      }

      .sm\\:hidden {
        display: none;
      }
    }

    @media (min-width: 768px) {
      .md\\:flex {
        display: flex;
      }
    }

    @media (min-width: 1024px) {
      .lg\\:inline {
        display: inline;
      }

      .lg\\:hidden {
        display: none;
      }
    }
  `]
})
export class TablePaginationComponent implements OnInit, OnChanges {
  @Input() config!: PaginationConfig;
  @Input() showPageSizeSelector: boolean = true; // Controla si mostrar el selector arriba
  @Input() showPaginationControls: boolean = true; // Controla si mostrar los controles debajo
  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  totalPages = 0;
  startRecord = 0;
  endRecord = 0;
  visiblePages: (number | string)[] = [];
  pageSizeOptions: number[] = [];
  // items compatible con app-select: { value, label }
  pageSizeOptionItems: { value: number; label: string }[] = [];
  // Control para que `app-select` renderice el elemento interno <select>
  pageSizeControl: FormControl = new FormControl();

  ngOnInit() {
    this.initializePagination();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.initializePagination();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Recalcular páginas visibles cuando cambia el tamaño de ventana
    this.calculateVisiblePages();
  }

  private initializePagination() {
    this.totalPages = Math.ceil(this.config.totalItems / this.config.pageSize);
    this.calculateRecordRange();
    this.calculateVisiblePages();
    this.pageSizeOptions = this.config.pageSizeOptions || [10, 25, 50, 100];
    // Mapear a items del componente select
    this.pageSizeOptionItems = this.pageSizeOptions.map(s => ({ value: s, label: String(s) }));
    // Inicializar valor del control para que app-select muestre la opción correcta
    try {
      this.pageSizeControl.setValue(this.config.pageSize, { emitEvent: false });
    } catch (e) {
      // defensivo: si ocurre antes de que control exista, no romper
    }
  }

  private calculateRecordRange() {
    if (this.config.totalItems === 0) {
      this.startRecord = 0;
      this.endRecord = 0;
      return;
    }

    this.startRecord = (this.config.currentPage - 1) * this.config.pageSize + 1;
    this.endRecord = Math.min(
      this.config.currentPage * this.config.pageSize,
      this.config.totalItems
    );
  }

  private calculateVisiblePages() {
    const maxVisible = this.getMaxVisiblePages();
    const pages: (number | string)[] = [];
    
    if (this.totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas con ellipsis
      const current = this.config.currentPage;
      const half = Math.floor(maxVisible / 2);
      
      // Siempre mostrar la primera página
      pages.push(1);
      
      let start = Math.max(2, current - half);
      let end = Math.min(this.totalPages - 1, current + half);
      
      // Ajustar si estamos cerca del inicio
      if (current <= half + 1) {
        end = Math.min(this.totalPages - 1, maxVisible - 1);
      }
      
      // Ajustar si estamos cerca del final
      if (current >= this.totalPages - half) {
        start = Math.max(2, this.totalPages - maxVisible + 2);
      }
      
      // Agregar ellipsis si es necesario
      if (start > 2) {
        pages.push('...');
      }
      
      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Agregar ellipsis si es necesario
      if (end < this.totalPages - 1) {
        pages.push('...');
      }
      
      // Siempre mostrar la última página (si no es la primera)
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }
    
    this.visiblePages = pages;
  }

  private getMaxVisiblePages(): number {
    // Responsive max visible pages - más generoso en móvil ya que tenemos first/last
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) {
        return 5; // Mobile: incrementado porque tenemos botones first/last
      } else if (width < 768) {
        return 7; // Tablet: páginas moderadas
      }
    }
    
    return this.config.maxVisiblePages || 9; // Desktop: más páginas
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.config.currentPage) {
      return;
    }

    this.pageChange.emit({
      page,
      pageSize: this.config.pageSize,
      totalPages: this.totalPages
    });
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    
    // Calcular la nueva página actual para mantener aproximadamente los mismos registros visibles
    const currentFirstRecord = (this.config.currentPage - 1) * this.config.pageSize + 1;
    const newPage = Math.ceil(currentFirstRecord / newPageSize);

    this.pageChange.emit({
      page: newPage,
      pageSize: newPageSize,
      totalPages: Math.ceil(this.config.totalItems / newPageSize)
    });
  }

  // Handler para el evento (change) emitido por app-select
  onPageSizeSelectChange(value: any) {
    const newPageSize = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(newPageSize)) {
      return;
    }

    const currentFirstRecord = (this.config.currentPage - 1) * this.config.pageSize + 1;
    const newPage = Math.ceil(currentFirstRecord / newPageSize);

    this.pageChange.emit({
      page: newPage,
      pageSize: newPageSize,
      totalPages: Math.ceil(this.config.totalItems / newPageSize)
    });
  }
}
