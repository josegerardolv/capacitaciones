import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Course } from '../../../../core/models/course.model';
import { CoursesService } from '../../services/courses.service';
import { CourseTypeService } from '../../../../core/services/course-type.service'; // Importar servicio
import { CourseTypeConfig } from '../../../../core/models/course-type-config.model'; // Importar modelo
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { ModalFormComponent } from '../../../../shared/components/forms/modal-form.component';
import { InputEnhancedComponent } from '@/app/shared/components';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { HttpErrorResponse } from '@angular/common/http';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { SelectComponent } from '../../../../shared/components/inputs/select.component';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';


@Component({
    selector: 'app-course-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        InstitutionalTableComponent,
        TablePaginationComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        InstitutionalCardComponent,
        InstitutionalButtonComponent,
        ModalFormComponent,
        UniversalIconComponent,
        InputEnhancedComponent,
        InputEnhancedComponent,
        InputEnhancedComponent,
        BreadcrumbComponent,
        SelectComponent,
        TableFiltersComponent
    ],
    templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    allCourses: Course[] = [];
    filteredCourses: Course[] = [];
    courses: Course[] = [];


    courseModalForm!: FormGroup;
    modalMode: 'create' | 'edit' = 'create';
    editingCourseId: number | null = null;

    courseTypeOptions: { value: number, label: string }[] = []; // Actualizar tipo

    // Estado de los Modales
    showModal = false;
    selectedCourseToEdit: Course | null = null;
    isSaving = false;

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

    // Elementos de migas de pan
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Cursos' }
    ];

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
        private courseTypeService: CourseTypeService, // Inyectar
        private router: Router,
        private notificationService: NotificationService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.initForms();
        this.initColumns();
        this.loadCourseTypes();

        this.loadCourseTypes();
    }

    initForms() {
        this.courseModalForm = this.fb.group({
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            duration: ['', [Validators.required]],
            courseTypeId: [null, [Validators.required]] // Renombrar a courseTypeId
        });
    }

    loadCourseTypes() {
        this.courseTypeService.getCourseTypes().pipe(
            timeout(5000)
        ).subscribe({
            next: (types) => {
                this.courseTypeOptions = types.map(t => ({
                    value: t.id,
                    label: t.name
                }));
                this.loadCourses(); // Cargar cursos después de tener los tipos
            },
            error: (err) => {
                console.error('Error loading course types', err);
                // Si falla, intentamos cargar cursos de todas formas, pero la tabla se quedará cargando si no lo manejamos.
                // Mejor llamamos a loadCourses igual para que intente y su error handler desactive el loading,
                // O desactivamos el loading aquí si loadCourses no se llama.
                this.loadCourses();
            }
        });
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '120px' },
            { key: 'courseTypeName', label: 'Tipo de Curso', sortable: true, minWidth: '150px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            {
                key: 'duration',
                label: 'Duración',
                type: 'duration',
                durationDisplay: 'long',
                durationUnit: 'minutes',
                sortable: true,
                minWidth: '100px'
            },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    getControl(name: string): FormControl {
        return this.courseModalForm.get(name) as FormControl;
    }

    loadCourses() {
        this.tableConfig.loading = true;
        this.coursesService.getCourses().pipe(
            timeout(5000)
        ).subscribe({
            next: (data) => {
                // Mapear cursos para incluir el nombre del tipo
                this.allCourses = data.map(course => { // Almacenar en allCourses
                    const type = this.courseTypeOptions.find(t => t.value === course.courseTypeId);
                    return {
                        ...course,
                        courseTypeName: type ? type.label : 'Sin Tipo'
                    };
                });
                this.filterData('');
                this.tableConfig.loading = false;
            },
            error: (err: HttpErrorResponse) => { // Tipar explícitamente err
                this.tableConfig.loading = false;
                this.notificationService.error('Error', 'No se pudieron cargar los cursos.');
                console.error('Error loading courses:', err); // Agregar registro para depuración
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
            this.filteredCourses = [...this.allCourses];
        } else {
            this.filteredCourses = this.allCourses.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term) ||
                (c as any).courseTypeName?.toLowerCase().includes(term)
            );
        }
        this.paginationConfig.totalItems = this.filteredCourses.length;
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.courses = this.filteredCourses.slice(start, end);
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
                error: (err: HttpErrorResponse) => {
                    console.error('Error deleting course:', err);
                    let msg = 'No se pudo eliminar el curso.';
                    if (err.error && err.error.message) {
                        msg += ` ${err.error.message}`;
                    } else if (err.status === 500) {
                        msg += ' Posiblemente tiene grupos asociados.';
                    }
                    this.notificationService.error('Error', msg);
                }
            });
        });
    }

    viewGroups(course: Course) {
        // Navegar a la lista de grupos de este curso
        // Pasar el nombre del curso como query param para que la vista de grupos
        // pueda mostrarlo en el breadcrumb
        this.router.navigate(['/cursos', course.id, 'grupos'], { queryParams: { courseName: course.name } });
    }

    openForm() {
        this.modalMode = 'create';
        this.courseModalForm.reset();
        this.showModal = true;
    }

    openEditForm(course: Course) {
        this.modalMode = 'edit';
        this.editingCourseId = course.id;
        this.courseModalForm.patchValue(course);
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.editingCourseId = null;
        this.courseModalForm.reset();
    }

    onModalSubmit() {
        if (this.courseModalForm.invalid) {
            this.courseModalForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.courseModalForm.value;

        if (this.modalMode === 'create') {
            this.coursesService.createCourse(formValue).subscribe({
                next: () => {
                    this.isSaving = false;
                    this.showModal = false;
                    this.loadCourses();
                    this.notificationService.success('Guardado', 'Curso guardado exitosamente.');
                },
                error: (err: HttpErrorResponse) => { // Tipar explícitamente err
                    this.isSaving = false;
                    console.error('Error saving course:', err);
                    this.notificationService.error('Error', 'No se pudo guardar el curso.');
                }
            });
        } else { // modo edición
            if (!this.editingCourseId) {
                this.notificationService.error('Error', 'ID de curso no definido para la edición.');
                this.isSaving = false;
                return;
            }
            const payload = {
                ...formValue,
                courseTypeId: Number(formValue.courseTypeId) // Asegurar número
            };
            this.coursesService.updateCourse(this.editingCourseId, payload).subscribe({
                next: () => {
                    this.isSaving = false;
                    this.showModal = false;
                    this.editingCourseId = null;
                    this.loadCourses();
                    this.notificationService.success('Actualizado', 'Curso actualizado correctamente.');
                },
                error: (err: HttpErrorResponse) => { // Tipar explícitamente err
                    this.isSaving = false;
                    console.error('Error updating course:', err);
                    this.notificationService.error('Error', 'No se pudo actualizar el curso.');
                }
            });
        }
    }
}
