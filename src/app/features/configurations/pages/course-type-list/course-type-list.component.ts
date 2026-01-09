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
    CourseTypeFormModalComponent
  ],
  templateUrl: './course-type-list.component.html'
})
export class CourseTypeListComponent implements OnInit {
  @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  courseTypes: CourseTypeConfig[] = [];

  // Modal states
  showFormModal = false;
  selectedCourseType: CourseTypeConfig | null = null;

  // Configuración de la tabla
  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    selectable: false,
    loading: true
    // Pagination moved to external component or handled differently as it's not in TableConfig interface
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
      { key: 'paymentType', label: 'Tipo', template: this.statusTemplate, align: 'center', minWidth: '100px' },
      { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center', minWidth: '100px' }
    ];
  }

  loadData() {
    this.tableConfig.loading = true;
    this.courseTypeService.getCourseTypes().subscribe({
      next: (data) => {
        this.courseTypes = data;
        this.tableConfig.loading = false;
      },
      error: (err) => {
        console.error('Error loading course types', err);
        this.tableConfig.loading = false;
      }
    });
  }

  openCreateModal() {
    this.selectedCourseType = null;
    this.showFormModal = true;
  }

  openEditModal(item: CourseTypeConfig) {
    this.selectedCourseType = item;
    this.showFormModal = true;
  }

  onFormSave(config: Partial<CourseTypeConfig>) {
    this.showFormModal = false;
    this.tableConfig.loading = true;

    if (this.selectedCourseType) {
      // Update
      console.log('Updating', config);
      this.courseTypeService.updateCourseType(this.selectedCourseType.id, config).subscribe(() => this.loadData());
    } else {
      // Create
      console.log('Creating', config);
      // Cast to satisfy type (ignoring id/dates as service handles them)
      this.courseTypeService.createCourseType(config as any).subscribe(() => this.loadData());
    }
  }

  onDelete(item: CourseTypeConfig) {
    if (confirm(`¿Estás seguro de eliminar el tipo de curso "${item.name}"?`)) {
      this.courseTypeService.deleteCourseType(item.id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
