import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    CourseTypeFormModalComponent
  ],
  templateUrl: './course-type-list.component.html'
})
export class CourseTypeListComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  allCourseTypes: CourseTypeConfig[] = []; // Almacena todos los datos
  courseTypes: CourseTypeConfig[] = [];

  // Modal states
  showFormModal = false;
  selectedCourseType: CourseTypeConfig | null = null;

  // Configuración de la tabla
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    selectable: false,
    loading: true
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

  constructor(private courseTypeService: CourseTypeService) { }

  ngOnInit(): void {
    this.initColumns();
    this.loadData();
  }

  initColumns() {
    this.tableColumns = [
      { key: 'name', label: 'Nombre', sortable: true, minWidth: '200px' },
      { key: 'description', label: 'Descripción', sortable: true, minWidth: '300px' },
      { key: 'paymentType', label: 'Tipo', template: this.statusTemplate, align: 'center', minWidth: '150px' },
      { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center', minWidth: '150px' }
    ];
  }

  loadData() {
    this.tableConfig.loading = true;
    this.courseTypeService.getCourseTypes().subscribe({
      next: (data) => {
        this.allCourseTypes = data;
        this.paginationConfig.totalItems = data.length;
        this.updatePaginatedData();
        this.tableConfig.loading = false;
      },
      error: (err) => {
        console.error('Error loading course types', err);
        this.tableConfig.loading = false;
      }
    });
  }

  onPageChange(event: PageChangeEvent) {
    this.paginationConfig.currentPage = event.page;
    this.paginationConfig.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
    const end = start + this.paginationConfig.pageSize;
    this.courseTypes = this.allCourseTypes.slice(start, end);
  }

  getDisplayCost(item: CourseTypeConfig): number {
    if (!item.availableDocuments || item.availableDocuments.length === 0) return 0;
    // Retornamos el costo más alto como referencia
    return Math.max(...item.availableDocuments.map(d => d.cost || 0));
  }

  openCreateModal() {
    this.selectedCourseType = null;
    this.showFormModal = true;
  }

  openEditModal(item: CourseTypeConfig) {
    // Clone to avoid reference issues
    this.selectedCourseType = JSON.parse(JSON.stringify(item));
    this.showFormModal = true;
  }

  onFormSave(config: Partial<CourseTypeConfig>) {
    this.showFormModal = false;
    this.tableConfig.loading = true;

    if (this.selectedCourseType) {
      // Actualizar normal
      this.courseTypeService.updateCourseType(this.selectedCourseType.id, config).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error actualizando tipo de curso:', err);
          this.tableConfig.loading = false;
        }
      });
    } else {
      // Crear normal
      // Forzamos el tipo (ignorando id/dates ya que el servicio los maneja)
      this.courseTypeService.createCourseType(config as any).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error creando tipo de curso:', err);
          this.tableConfig.loading = false;
        }
      });
    }
  }

  onDelete(item: CourseTypeConfig) {
    if (confirm(`¿Estás seguro de eliminar el tipo de curso "${item.name}"?`)) {
      this.tableConfig.loading = true;
      this.courseTypeService.deleteCourseType(item.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
          console.error('Error deleting course type:', err);
          this.tableConfig.loading = false;
        }
      });
    }
  }
}
