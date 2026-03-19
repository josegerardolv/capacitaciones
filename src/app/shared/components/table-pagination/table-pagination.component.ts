import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { SelectComponent } from '@/app/shared/components/inputs/select.component';

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
  imports: [CommonModule, SelectComponent],
  template: `
    <!-- Selector de tamaño de página arriba de la tabla -->
    <div *ngIf="config.showPageSizeSelector !== false && showPageSizeSelector" 
         class="institucional-table-page-size-selector bg-white px-4 py-3 sm:px-6">
      <div class="flex items-center justify-between sm:justify-end w-full gap-2 sm:gap-3">
        <span class="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Mostrar</span>
        <div class="flex-1 sm:flex-none sm:w-24 min-w-[4rem] max-w-[8rem] sm:max-w-none">
          <app-select
            [control]="pageSizeControl"
            [options]="pageSizeOptionItems"
            [extraClasses]="'institucional-form-select !min-h-[2.5rem] !py-1'"
            [placeholder]="' '"
            [fullWidth]="true"
            (change)="onPageSizeSelectChange($event)">
          </app-select>
        </div>
        <span class="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
          <span class="hidden sm:inline">registros por página</span>
          <span class="sm:hidden">registros</span>
        </span>
      </div>
    </div>

    <!-- Controles de paginación debajo de la tabla -->
    <div *ngIf="showPaginationControls" class="institucional-table-pagination">
      <!-- Info de registros - Responsive -->
      <div class="institucional-table-pagination-info w-full sm:w-auto" *ngIf="config.showInfo !== false">
        <div class="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
          <span class="hidden sm:inline">Mostrando</span>
          <span class="font-bold text-gray-900 mx-1">{{ startRecord }} - {{ endRecord }}</span>
          <span class="hidden sm:inline">de</span>
          <span class="font-bold text-gray-900 mx-1 hidden sm:inline">{{ config.totalItems }}</span>
          <span class="hidden sm:inline">registros</span>
          <span class="sm:hidden text-gray-500 ml-1">/ {{ config.totalItems }} totales</span>
        </div>
      </div>

      <!-- Controles de paginación - Responsive -->
      <div class="institucional-table-pagination-controls w-full sm:w-auto">
        
        <!-- Navegación móvil (< 640px) -->
        <div class="flex sm:hidden items-center justify-center gap-1 w-full max-w-[320px]">
          <button 
            class="institucional-table-pagination-btn !px-1.5 !min-w-[2.25rem] h-9"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(1)"
            title="Primera página">
            <span class="material-symbols-outlined text-[1.25rem]">first_page</span>
          </button>
          
          <button 
            class="institucional-table-pagination-btn !px-1.5 !min-w-[2.25rem] h-9"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(config.currentPage - 1)"
            title="Página anterior">
            <span class="material-symbols-outlined text-[1.25rem]">chevron_left</span>
          </button>
          
          <div class="flex-1 flex items-center justify-center px-2">
            <span class="text-xs font-bold text-gray-700 whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
              {{ config.currentPage }} / {{ totalPages }}
            </span>
          </div>
          
          <button 
            class="institucional-table-pagination-btn !px-1.5 !min-w-[2.25rem] h-9"
            [disabled]="config.currentPage === totalPages"
            (click)="goToPage(config.currentPage + 1)"
            title="Página siguiente">
            <span class="material-symbols-outlined text-[1.25rem]">chevron_right</span>
          </button>
          
          <button 
            class="institucional-table-pagination-btn !px-1.5 !min-w-[2.25rem] h-9"
            [disabled]="config.currentPage === totalPages"
            (click)="goToPage(totalPages)"
            title="Última página">
            <span class="material-symbols-outlined text-[1.25rem]">last_page</span>
          </button>
        </div>

        <!-- Navegación completa para tablets y desktop (>= 640px) -->
        <div class="hidden sm:flex items-center gap-1.5">
          <button 
            class="institucional-table-pagination-btn !px-2.5 h-10"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(1)"
            title="Primera página">
            <span class="material-symbols-outlined">first_page</span>
          </button>

          <button 
            class="institucional-table-pagination-btn !px-2.5 h-10"
            [disabled]="config.currentPage === 1"
            (click)="goToPage(config.currentPage - 1)"
            title="Página anterior">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>

          <div class="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            <ng-container *ngFor="let page of visiblePages">
              <button 
                *ngIf="page !== '...'; else ellipsis"
                class="institucional-table-pagination-btn !px-3.5 h-10"
                [class.institucional-table-pagination-btn-active]="page === config.currentPage"
                (click)="goToPage(+page)">
                {{ page }}
              </button>
              
              <ng-template #ellipsis>
                <span class="text-gray-500 font-medium px-2 flex items-center justify-center h-10">...</span>
              </ng-template>
            </ng-container>
          </div>

          <button 
            class="institucional-table-pagination-btn !px-2.5 h-10"
            [disabled]="config.currentPage === totalPages"
            (click)="goToPage(config.currentPage + 1)"
            title="Página siguiente">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <button 
            class="institucional-table-pagination-btn !px-2.5 h-10"
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
    /* Ocultar barra de scroll horizontal en contenedores de números pequeños si ocurre */
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
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
