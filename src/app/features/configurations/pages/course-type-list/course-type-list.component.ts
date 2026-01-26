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
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';

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
    TableFiltersComponent
  ],
  templateUrl: './course-type-list.component.html'
})
export class CourseTypeListComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  allCourseTypes: CourseTypeConfig[] = []; // Almacena todos los datos
  filteredCourseTypes: CourseTypeConfig[] = []; // Datos filtrados
  courseTypes: CourseTypeConfig[] = [];





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
      { key: 'paymentType', label: 'Tipo', template: this.statusTemplate, align: 'center', minWidth: '150px' },
      { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center', minWidth: '150px' }
    ];
  }

  loadData() {
    this.tableConfig.loading = true;
    this.courseTypeService.getCourseTypes().subscribe({
      next: (data) => {
        this.allCourseTypes = data;
        this.filterData('');
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

  filterData(query: string) {
    const term = query.toLowerCase().trim();

    if (!term) {
      this.filteredCourseTypes = [...this.allCourseTypes];
    } else {
      this.filteredCourseTypes = this.allCourseTypes.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    this.paginationConfig.totalItems = this.filteredCourseTypes.length;
    this.updatePaginatedData();
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
    this.router.navigate(['/config/config-cursos/editar', item.id]);
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
