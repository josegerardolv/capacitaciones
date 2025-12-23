import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Course } from '../../../../core/models/course.model';
import { CoursesService } from '../../services/courses.service';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { CourseFormComponent } from '../../components/course-form/course-form.component';
import { CourseEditFormComponent } from '../../components/course-edit-form/course-edit-form.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'app-course-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        UniversalIconComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        CourseFormComponent,
        CourseEditFormComponent,
        TooltipDirective,
        ConfirmationModalComponent,

        InstitutionalButtonComponent
    ],
    templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    courses: Course[] = [];

    // Estado de los Modales
    showForm = false; // Nuevo Curso
    showEditForm = false; // Editar Curso
    selectedCourseToEdit: Course | null = null;

    tableConfig: TableConfig = {
        loading: true,
        striped: false,
        hoverable: true,
        localSort: true
    };

    tableColumns: TableColumn[] = [];
    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    // --- MODALES GENÉRICOS ---
    isConfirmOpen = false;
    confirmConfig: ConfirmationConfig = {
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar'
    };
    private pendingConfirmAction: (() => void) | null = null;



    constructor(
        private coursesService: CoursesService,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.initColumns();
        this.loadCourses();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'code', label: 'Nombre', sortable: true, minWidth: '120px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            { key: 'duration', label: 'Duración', sortable: true, minWidth: '100px' },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    loadCourses() {
        this.tableConfig.loading = true;
        this.coursesService.getCourses().subscribe({
            next: (data) => {
                this.courses = data;
                this.paginationConfig.totalItems = data.length;
                this.tableConfig.loading = false;
            },
            error: () => {
                this.tableConfig.loading = false;
                this.notificationService.error('Error', 'No se pudieron cargar los cursos.');
            }
        });
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
    }

    // --- HELPERS PARA MODALES ---
    openConfirm(config: ConfirmationConfig, action: () => void) {
        this.confirmConfig = config;
        this.pendingConfirmAction = action;
        this.isConfirmOpen = true;
    }

    onConfirmYes() {
        if (this.pendingConfirmAction) {
            this.pendingConfirmAction();
        }
        this.isConfirmOpen = false;
        this.pendingConfirmAction = null;
    }



    deleteCourse(id: number) {
        this.openConfirm({
            title: 'Eliminar Curso',
            message: '¿Estás seguro de eliminar este curso?',
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.coursesService.deleteCourse(id).subscribe({
                next: () => {
                    this.loadCourses();
                    this.notificationService.success('Eliminado', 'Curso eliminado correctamente.');
                },
                error: () => {
                    this.notificationService.error('Error', 'No se pudo eliminar el curso.');
                }
            });
        });
    }

    viewGroups(course: Course) {
        // En el futuro, podríamos pasar el ID course.id como query param para filtrar
        this.router.navigate(['/cursos/grupos']);
    }

    // Manejo del Modal de Nuevo Curso
    openForm() {
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
    }

    onFormSaved() {
        this.showForm = false;
        this.loadCourses();
        this.notificationService.success('Guardado', 'Curso guardado exitosamente.');
    }

    // Manejo del Modal de Edición
    openEditForm(course: Course) {
        this.selectedCourseToEdit = course;
        this.showEditForm = true;
    }

    closeEditForm() {
        this.showEditForm = false;
        this.selectedCourseToEdit = null;
    }

    onEditSaved() {
        this.showEditForm = false;
        this.selectedCourseToEdit = null;
        this.loadCourses();
        this.notificationService.success('Actualizado', 'Curso actualizado correctamente.');
    }
}
