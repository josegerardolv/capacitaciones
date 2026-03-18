import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { CourseTypeConfig } from '../../../../core/models/course-type-config.model';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';

import { CourseTypeFormModalComponent } from '../../components/modals/course-type-form-modal/course-type-form-modal.component';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';



@Component({
  selector: 'app-course-type-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    InstitutionalTableComponent,
    InstitutionalCardComponent,
    InstitutionalButtonComponent,
    UniversalIconComponent,
    BreadcrumbComponent,
    TablePaginationComponent,
    ReactiveFormsModule,
    TableFiltersComponent,
    TooltipDirective,
    ConfirmationModalComponent,
  ],
  templateUrl: './course-type-list.component.html'
})
export class CourseTypeListComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('isActiveTemplate', { static: true }) isActiveTemplate!: TemplateRef<any>;

  allCourseTypes: CourseTypeConfig[] = []; // Almacena todos los datos
  filteredCourseTypes: CourseTypeConfig[] = []; // Datos filtrados
  courseTypes: CourseTypeConfig[] = [];





  // Configuración de la tabla
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    selectable: false,
    loading: true,
    localSort: true
  };

  paginationConfig: PaginationConfig = {
    pageSize: 10,
    totalItems: 0,
    currentPage: 1,
    pageSizeOptions: [5, 10, 20, 50],
    showInfo: true
  };

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', url: '/dashboard' },
    { label: 'Configuración' },
    { label: 'Tipos de Curso' }
  ];

  // Configuración del Modal de Confirmación
  isConfirmOpen = false;
  confirmConfig: ConfirmationConfig = {
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  };
  private pendingAction: (() => void) | null = null;

  constructor(
    private courseTypeService: CourseTypeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initColumns();
    this.loadData();
  }

  initColumns() {
    this.tableColumns = [
      { key: 'name', label: 'Nombre', sortable: true, minWidth: '200px' },
      { key: 'description', label: 'Descripción', sortable: true, minWidth: '300px' },
      { key: 'type', label: 'Tipo', template: this.statusTemplate, align: 'center', minWidth: '150px' },
      { key: 'isActive', label: 'Estado', template: this.isActiveTemplate, align: 'center', minWidth: '120px' },
      { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center', minWidth: '150px' }
    ];
  }

  loadData(search: string = '') {
    this.tableConfig.loading = true;
    this.courseTypeService.getCourseTypes(
      this.paginationConfig.currentPage,
      this.paginationConfig.pageSize,
      search
    ).subscribe({
      next: (response) => {
        // Soporte para el objeto meta que envía el backend
        this.courseTypes = response.data || response.items || response.results || [];

        // Actualizar referencia para disparar OnChanges en el componente de paginación
        this.paginationConfig = {
          ...this.paginationConfig,
          totalItems: response.meta?.total || response.total || response.count || this.courseTypes.length
        };

        this.tableConfig.loading = false;
      },
      error: (err) => {
        console.error('Error loading course types', err);
        this.tableConfig.loading = false;
      }
    });
  }

  onPageChange(event: PageChangeEvent) {
    this.paginationConfig = {
      ...this.paginationConfig,
      currentPage: event.page,
      pageSize: event.pageSize
    };
    this.loadData(); // Volvemos a cargar desde el servidor
  }

  filterData(query: string) {
    this.paginationConfig = {
      ...this.paginationConfig,
      currentPage: 1
    };
    this.loadData(query); // Buscamos en el servidor
  }

  updatePaginatedData() {
    const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
    const end = start + this.paginationConfig.pageSize;
    this.courseTypes = this.filteredCourseTypes.slice(start, end);
  }

  getDisplayCost(item: CourseTypeConfig): number {
    if (!item.availableDocuments || item.availableDocuments.length === 0) return 0;
    // Retornamos el costo más alto como referencia
    return Math.max(...item.availableDocuments.map(d => d.cost || 0));
  }

  openCreateModal() {
    this.router.navigate(['/config/config-cursos/nuevo']);
  }

  openEditModal(item: CourseTypeConfig) {
    if (item.isActive === false) return; // Por seguridad, aunque el botón esté deshabilitado
    this.router.navigate(['/config/config-cursos/editar', item.id]);
  }

  onDelete(item: CourseTypeConfig) {
    this.confirmConfig = {
      title: 'Desactivar Tipo de Curso',
      message: `¿Estás seguro de desactivar "${item.name}"? Los cursos ya creados seguirán operando, pero no se podrán crear nuevos de este tipo.`,
      type: 'danger',
      confirmText: 'Desactivar',
      cancelText: 'Cancelar'
    };
    this.pendingAction = () => {
      this.tableConfig.loading = true;
      this.courseTypeService.removeCourseType(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error deactivating course type:', err);
          this.tableConfig.loading = false;
        }
      });
    };
    this.isConfirmOpen = true;
  }

  onRestore(item: CourseTypeConfig) {
    this.confirmConfig = {
      title: 'Activar Tipo de Curso',
      message: `¿Deseas activar nuevamente el tipo de curso "${item.name}"?`,
      type: 'success',
      confirmText: 'Activar',
      cancelText: 'Cancelar'
    };
    this.pendingAction = () => {
      this.tableConfig.loading = true;
      this.courseTypeService.restoreCourseType(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error restoring course type:', err);
          this.tableConfig.loading = false;
        }
      });
    };
    this.isConfirmOpen = true;
  }

  onPermanentDelete(item: CourseTypeConfig) {
    this.confirmConfig = {
      title: 'Eliminar Permanentemente',
      message: `¿Estás seguro de eliminar definitivamente "${item.name}"? Esta acción marcará el registro como eliminado en base de datos y no se podrá recuperar fácilmente. Use esta opción solo para catálogos obsoletos.`,
      type: 'danger',
      confirmText: 'Eliminar Permanentemente',
      cancelText: 'Cancelar'
    };
    this.pendingAction = () => {
      this.tableConfig.loading = true;
      this.courseTypeService.deleteCourseType(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error deleting course type:', err);
          this.tableConfig.loading = false;
        }
      });
    };
    this.isConfirmOpen = true;
  }

  onConfirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.isConfirmOpen = false;
    this.pendingAction = null;
  }
}
