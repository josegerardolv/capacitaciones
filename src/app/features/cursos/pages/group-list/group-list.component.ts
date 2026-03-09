import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { timeout, switchMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Group } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';
import { CoursesService } from '../../services/courses.service';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { ModalFormComponent, FormAction } from '../../../../shared/components/forms/modal-form.component';
import { InputEnhancedComponent, DayPickerModule } from '@/app/shared/components';
import { GroupRequestsComponent } from '../../components/group-requests/group-requests.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { UniversalIconComponent } from '@/app/shared/components';
import { HttpErrorResponse } from '@angular/common/http';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { CompactDateInputComponent } from '@/app/shared/components/date-pickers/compact-date-input/compact-date-input.component';
import { TimePickerComponent } from '@/app/shared/components/date-pickers/time-picker/time-picker.component';
import { ReportsService } from '../../../../core/services/reports.service';

@Component({
    selector: 'app-group-list',
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
        InputEnhancedComponent,
        GroupRequestsComponent,
        UniversalIconComponent,
        BreadcrumbComponent,
        AlertModalComponent,
        TableFiltersComponent,
        DayPickerModule
    ],
    templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
    cursoId: string | null = null;
    courseLabel: string = '';
    courseNameFromQuery: string | null = null;
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('urlTemplate', { static: true }) urlTemplate!: TemplateRef<any>; // Template para URL
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>; // Template para Estatus
    @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>; // Template para Fecha
    @ViewChild('expirationDateTemplate', { static: true }) expirationDateTemplate!: TemplateRef<any>; // Template para Expiración
    @ViewChild('timeTemplate', { static: true }) timeTemplate!: TemplateRef<any>; // Template para Hora

    @ViewChild('datePicker') datePicker?: CompactDateInputComponent;
    @ViewChild('timePicker') timePicker?: TimePickerComponent;
    @ViewChild('limitPicker') limitPicker?: CompactDateInputComponent;

    // Referencias para inputs de texto para auto-focus
    @ViewChild('nameInput') nameInput?: any;
    @ViewChild('locationInput') locationInput?: any;
    @ViewChild('quantityInput') quantityInput?: any;

    groups: Group[] = [];
    selectedGroups: Group[] = []; // Array de grupos seleccionados (para la tabla institucional)



    groupModalForm!: FormGroup;
    modalMode: 'create' | 'edit' = 'create';
    editingGroupId: number | null = null;

    // Estado de los Modales
    showModal = false;
    isSaving = false;

    isRequestsModalOpen = false;
    selectedRequestGroup: Group | null = null;

    // Auto-Register URL Modal
    isUrlDateModalOpen = false;
    urlForm!: FormGroup; // FormGroup para el modal
    pendingUrlGroups: Group[] = [];
    readyUrlGroups: Group[] = [];
    maxDateForUrl: string = ''; // Restricción para el selector
    maxDateForForm: string = ''; // Restricción para el selector en Formulario de Grupo
    minDateForForm: string = ''; // Restricción para fecha de inicio (Hoy)

    urlModalActions: FormAction[] = [
        {
            label: 'Cancelar',
            type: 'button',
            variant: 'secondary',
            action: () => this.isUrlDateModalOpen = false
        },
        {
            label: 'Continuar',
            type: 'submit',
            variant: 'primary',
            icon: 'arrow_forward'
        }
    ];

    modalActionsPrimary: FormAction[] = [
        {
            label: 'Guardar',
            type: 'submit',
            variant: 'primary',
            icon: 'save'
        }
    ];

    modalActionsSecondary: FormAction[] = [
        {
            label: 'Cancelar',
            type: 'button',
            variant: 'outline',
            icon: 'close',
            action: () => this.closeModal()
        }
    ];



    tableConfig: TableConfig = {
        loading: true,
        striped: false,
        hoverable: true,
        localSort: true,
        selectable: true // Habilitar selección nativa
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
        { label: 'Cursos', url: '/cursos' },
        { label: 'Grupos' }
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

    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'info'
    };



    // --- HELPERS PARA UI ---
    getGroupUrl(group: Group): string {
        if (group.inscriptionURL) return group.inscriptionURL;
        if (group.uuid) {
            // Re-calcular dinámicamente si no existe URL guardada
            return `${window.location.origin}/public/register/${group.uuid}`;
        }
        return '';
    }

    isGroupExpired(group: Group): boolean {
        if (!group.endInscriptionDate) return false;
        // Normalizar fechas para comparar solo el día
        const expirationDate = new Date(group.endInscriptionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Si la fecha de expiración es estrictamente menor a hoy, está vencido
        return expirationDate < today;
    }

    getDynamicGroupStatus(group: Group): { text: string, type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' } {
        if (!group.groupStartDate) return { text: 'Sin fecha', type: 'neutral' };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(group.groupStartDate);
        startDate.setHours(0, 0, 0, 0);

        // 3. Finalizado (El curso ya pasó)
        if (today > startDate) {
            return { text: 'Finalizado', type: 'neutral' }; // Gris
        }

        // 2. En Curso (El curso es hoy)
        if (today.getTime() === startDate.getTime()) {
            return { text: 'En curso', type: 'info' }; // Azul
        }

        // 1. Próximo a Iniciar (Faltan días para arrancar el curso)
        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return { text: 'Inicia mañana', type: 'warning' };
        if (diffDays <= 3 && diffDays > 1) return { text: `Inicia en ${diffDays} días`, type: 'warning' };

        // Falta más de 3 días para iniciar
        return { text: 'Abierto', type: 'success' }; // Verde
    }

    getLinkStatus(group: Group): { state: 'create_blue' | 'create_red' | 'copy_green' | 'copy_red' | 'full_grey', icon: string, tooltip: string, colorClass: string } {
        const isExpired = this.isGroupExpired(group);
        const hasUrl = !!this.getGroupUrl(group);
        const isFull = group.acceptedCount !== undefined && group.limitStudents !== undefined && group.acceptedCount >= group.limitStudents;

        if (isFull) {
            return { state: 'full_grey', icon: 'link', tooltip: 'Cupo lleno. Alcanzó su límite máximo.', colorClass: 'text-gray-400 hover:text-gray-500' };
        }
        if (!hasUrl && !isExpired) {
            return { state: 'create_blue', icon: 'add_circle', tooltip: 'Generar enlace', colorClass: 'text-blue-600 hover:text-blue-800' };
        }
        if (!hasUrl && isExpired) {
            return { state: 'create_red', icon: 'add_circle', tooltip: 'Fecha vencida. Actualiza la fecha para generar enlace', colorClass: 'text-red-500 hover:text-red-700' };
        }
        if (hasUrl && !isExpired) {
            return { state: 'copy_green', icon: 'link', tooltip: 'Copiar enlace', colorClass: 'text-green-500 hover:text-green-700' };
        }
        if (hasUrl && isExpired) {
            return { state: 'copy_red', icon: 'link_off', tooltip: 'Enlace vencido. Actualiza la fecha para reactivar', colorClass: 'text-red-500 hover:text-red-700' };
        }
        return { state: 'create_blue', icon: 'add_circle', tooltip: 'Generar enlace', colorClass: 'text-gray-500' };
    }

    handleLinkAction(group: Group) {
        const status = this.getLinkStatus(group);
        if (status.state === 'create_blue') {
            this.generateUrlSingle(group);
        } else if (status.state === 'copy_green') {
            this.copyUrl(this.getGroupUrl(group));
        } else if (status.state === 'full_grey') {
            this.openAlert(
                'Cupo Lleno',
                `El grupo ha alcanzado su límite máximo de alumnos (<b>${group.limitStudents}</b>).<br><br>El enlace de registro público ya está inactivo y no se admitirán nuevas solicitudes a menos que liberes un lugar o aumentes la capacidad.`,
                'warning'
            );
        } else {
            // Manejar estados rojos (bloqueados por fecha expirada) con el Modal
            this.openAlert(
                'Acción no permitida',
                'No puedes interactuar con el enlace de registro porque la <b>fecha límite</b> (' +
                this.formatDateForTable(group.endInscriptionDate) +
                ') ya se ha vencido.<br><br>Por favor, edita las fechas del grupo si deseas continuar admitiendo registros.',
                'warning'
            );
        }
    }

    get groupsToGenerateCount(): number {
        //Solo contamos los que CUMPLEN la condición (Sin URL Y con Fecha Límite)
        return this.selectedGroups.filter(g => !this.getGroupUrl(g) && !!g.endInscriptionDate).length;
    }

    get canGenerateUrl(): boolean {
        // Habilitar si hay al menos un grupo seleccionado que NO tenga URL
        // Esto permite que el usuario le pique y el sistema le mande el mensaje informativo si faltan fechas
        return this.selectedGroups.some(g => !this.getGroupUrl(g));
    }

    get canExport(): boolean {
        // Habilitar Exportar si hay al menos un grupo seleccionado
        return this.selectedGroups.length > 0;
    }

    groupSelectionPredicate = (item: any): boolean => {
        // Regla: Marcar todo solo debe seleccionar los que están listos para Generar URL
        // (Sin URL y con fecha límite establecida)
        return !this.getGroupUrl(item) && !!item.endInscriptionDate;
    };

    showExportMenu = false;

    currentCourse: any = null; // Almacenar objeto completo del curso

    constructor(
        private groupsService: GroupsService,
        private coursesService: CoursesService, // Inyectar
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private fb: FormBuilder,
        private reportsService: ReportsService
    ) { }

    ngOnInit(): void {
        this.initForms();
        this.initColumns();
        // Leer cursoId desde la ruta si existe (rutas: /cursos/:cursoId/grupos)
        this.cursoId = this.route.snapshot.paramMap.get('cursoId');
        // Leer posible nombre del curso pasado desde la navegación (query param)
        this.courseNameFromQuery = this.route.snapshot.queryParamMap.get('courseName');

        if (this.cursoId) {
            this.courseLabel = this.courseNameFromQuery ? this.courseNameFromQuery : this.cursoId;
            let cleanCourseLabel = this.courseLabel.replace(/^Curso[:\s]+/i, '').trim();
            const shortCourseName = cleanCourseLabel.length > 30 ? cleanCourseLabel.substring(0, 30) + '...' : cleanCourseLabel;
            this.breadcrumbItems = [
                { label: 'Cursos', url: '/cursos' },
                { label: `Curso: ${shortCourseName}` }
            ];

            // Cargar detalles del curso para obtener courseTypeId, LUEGO cargar grupos
            this.coursesService.getCourses().pipe(timeout(5000)).subscribe({
                next: (response) => {
                    let courses: any[] = [];
                    if (Array.isArray(response)) {
                        courses = response;
                    } else if (response.data) {
                        courses = response.data;
                    } else if (response.items) {
                        courses = response.items;
                    }

                    this.currentCourse = courses.find((c: any) => c.id === +this.cursoId!);
                    this.loadGroups(); // Llamar DESPUÉS de establecer currentCourse
                },
                error: (err) => {
                    console.error('Error loading course details:', err);
                    this.tableConfig.loading = false;
                    this.notificationService.error('Error', 'No se pudieron cargar los detalles del curso.');
                    // Aún así cargamos grupos, aunque sin contexto del curso
                    this.loadGroups();
                }
            });
        } else {
            // Si no hay contexto de curso, cargar todos los grupos inmediatamente
            this.loadGroups();
        }

    }



    // Variables de estado para búsqueda server-side
    currentSearchTerm: string = '';

    loadGroups() {
        this.tableConfig.loading = true;

        const page = this.paginationConfig.currentPage;
        const limit = this.paginationConfig.pageSize;
        // Priorizar el param de la ruta antes que el objeto parseado (ya que el curso puede no encontrarse en la pag 1 de cursos)
        const courseId = this.cursoId ? Number(this.cursoId) : (this.currentCourse ? this.currentCourse.id : undefined);

        this.groupsService.getGroups(page, limit, this.currentSearchTerm, courseId)
            .pipe(timeout(5000))
            .subscribe({
                next: (response: any) => {
                    // 1. Extraer Lista de Items
                    let items: Group[] = [];
                    if (Array.isArray(response)) {
                        items = response; // Fallback si el backend devuelve array directo
                    } else if (response.data) {
                        items = response.data;
                    } else if (response.items) {
                        items = response.items;
                    }

                    // 2. Extraer Metadatos (Total, Pages, etc)
                    if (response.meta) {
                        // FIX: Backend devuelve strings en 'page' y 'limit'. Aseguramos números.
                        // Forzamos actualización de referencia para que el componente hijo detecte el cambio (ngOnChanges)
                        this.paginationConfig = {
                            ...this.paginationConfig,
                            totalItems: Number(response.meta.total)
                        };
                    } else {
                        // Fallback: Si no hay meta, asumimos que el total es lo que llegó (o desconocido)
                        this.paginationConfig = {
                            ...this.paginationConfig,
                            totalItems: items.length
                        };
                    }

                    // 3. (Opcional) Validación adicional
                    // Los datos ya vienen filtrados por servidor, pero asignamos directamente.

                    this.groups = items;
                    this.tableConfig.loading = false;
                },
                error: (err) => {
                    this.tableConfig.loading = false;
                    this.notificationService.error('Error', 'No se pudieron cargar los grupos.');
                    console.error('Error loading groups:', err);
                }
            });
    }

    onPageChange(event: PageChangeEvent) {
        // Actualizar config y recargar datos del servidor
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        this.loadGroups();
    }

    filterData(query: string) {
        const term = query.trim();
        // Solo recargar si cambia el término
        if (this.currentSearchTerm !== term) {
            this.currentSearchTerm = term;
            this.paginationConfig.currentPage = 1; // Reset a página 1 en nueva búsqueda
            this.loadGroups();
        }
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

    openAlert(title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger' = 'info') {
        this.alertConfig = { title, message, type };
        this.isAlertOpen = true;
    }



    openForm() {
        this.modalMode = 'create';
        this.groupModalForm.reset();
        this.showModal = true;
    }



    openEditForm(group: Group) {
        this.modalMode = 'edit';
        this.editingGroupId = group.id;

        // Separar dateTime en date y time
        let dateVal = '';
        let timeVal = '';
        if (group.groupStartDate) {
            dateVal = group.groupStartDate.split('T')[0];
        }
        if (group.schedule) {
            timeVal = group.schedule;
        }

        // Mapear fecha de expiración si existe
        let expirationVal = '';
        if (group.endInscriptionDate) {
            expirationVal = group.endInscriptionDate.split('T')[0];
        }

        this.groupModalForm.patchValue({
            name: group.name,
            location: group.location,
            limitStudents: group.limitStudents,
            date: dateVal,
            time: timeVal,
            linkExpiration: expirationVal
        });

        // Initialize max date for form
        if (dateVal) {
            const dt = new Date(dateVal);
            dt.setDate(dt.getDate() - 1);
            this.maxDateForForm = dt.toISOString().split('T')[0];
        }

        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.editingGroupId = null;
        this.groupModalForm.reset();
        // Aseguramos que se limpie completamente
        Object.keys(this.groupModalForm.controls).forEach(key => {
            this.groupModalForm.get(key)?.setErrors(null);
            this.groupModalForm.get(key)?.setValue('');
        });
    }

    onGroupModalSubmit() {
        if (this.groupModalForm.invalid) {
            this.groupModalForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formValue = this.groupModalForm.value;

        if (this.modalMode === 'create') {
            // Construimos el payload EXACTO como lo pide el Swagger/Backend
            const rawPayload = {
                name: formValue.name,
                location: formValue.location,
                schedule: formValue.time, // "14:00"
                limitStudents: Number(formValue.limitStudents),
                groupStartDate: formValue.date,
                endInscriptionDate: formValue.linkExpiration || undefined, // Enviar undefined (Si el usuario no selecciona fecha)
                course: this.cursoId ? Number(this.cursoId) : (this.currentCourse ? this.currentCourse.id : undefined)
            };

            this.groupsService.createGroup(rawPayload as any).subscribe({
                next: () => {
                    this.isSaving = false;
                    this.showModal = false;
                    this.loadGroups();
                    this.notificationService.success('Guardado', 'Grupo guardado exitosamente.');
                },
                error: (err: HttpErrorResponse) => {
                    this.isSaving = false;
                    console.error('Error saving group:', err);
                    this.notificationService.error('Error', 'No se pudo guardar el grupo.');
                }
            });
        } else { // modo edición
            if (!this.editingGroupId) {
                this.notificationService.error('Error', 'ID de grupo no definido para la edición.');
                this.isSaving = false;
                return;
            }

            const payload = {
                name: formValue.name,
                location: formValue.location,
                schedule: formValue.time, // "14:00"
                limitStudents: Number(formValue.limitStudents),
                groupStartDate: formValue.date,
                endInscriptionDate: formValue.linkExpiration || undefined, // Send undefined
                course: this.cursoId ? Number(this.cursoId) : (this.currentCourse ? this.currentCourse.id : undefined)
            };
            this.groupsService.updateGroup(this.editingGroupId, payload).subscribe({
                next: () => {
                    this.isSaving = false;
                    this.showModal = false;
                    this.editingGroupId = null;
                    this.loadGroups();
                    this.notificationService.success('Actualizado', 'Grupo actualizado correctamente.');
                },
                error: (err: HttpErrorResponse) => {
                    this.isSaving = false;
                    console.error('Error updating group:', err);
                    this.notificationService.error('Error', 'No se pudo actualizar el grupo.');
                }
            });
        }
    }

    deleteGroup(id: number) {
        this.openConfirm({
            title: 'Eliminar Grupo',
            message: '¿Estás seguro de eliminar este grupo?',
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.groupsService.deleteGroup(id).subscribe({
                next: () => {
                    this.loadGroups();
                    this.notificationService.success('Eliminado', 'Grupo eliminado correctamente');
                },
                error: (err: HttpErrorResponse) => {
                    this.notificationService.error('Error', 'No se pudo eliminar el grupo');
                    console.error('Error deleting group:', err);
                }
            });
        });
    }

    initForms() {
        this.groupModalForm = this.fb.group({
            name: ['', [Validators.required]],
            // duración removida, heredada del curso
            location: ['', [Validators.required]],
            date: ['', [Validators.required]], // Fecha separada
            time: ['', [Validators.required]], // Hora separada
            limitStudents: ['', [Validators.required, Validators.min(1)]],
            linkExpiration: ['', []], // Opcional inicialmente
            course: ['', []]
        }, { validators: this.dateSequenceValidator });

        // Establecer fecha mínima como HOY para evitar cursos en el pasado
        this.minDateForForm = new Date().toISOString().split('T')[0];

        // Inicializar form para URL
        this.urlForm = this.fb.group({
            expirationDate: ['', [Validators.required]]
        });

        // Auto-submit al elegir fecha si es generación individual o guiada
        this.urlForm.get('expirationDate')?.valueChanges.subscribe(val => {
            if (val && this.isUrlDateModalOpen && this.urlForm.valid) {
                // Pequeño delay para que el usuario vea la selección antes de cerrar
                setTimeout(() => {
                    if (this.isUrlDateModalOpen) this.submitUrlGeneration();
                }, 300);
            }
        });

        // Escuchar cambios en la fecha del curso para actualizar el límite máximo
        this.groupModalForm.get('date')?.valueChanges.subscribe(dateVal => {
            if (dateVal) {
                // Determinar fecha máxima (estrictamente antes de la fecha del curso)
                // Para el input date HTML 'max', este incluye la fecha.
                // Para ser "estrictamente antes", podríamos establecer max al día anterior.
                // Usuario solicitó "deshabilitar días".
                // Si el curso es 2026-10-30, max debería ser 2026-10-29.
                const dt = new Date(dateVal);
                dt.setDate(dt.getDate() - 1); // Restaurado: Se requiere máximo 1 día antes del inicio.
                this.maxDateForForm = dt.toISOString().split('T')[0];
            } else {
                this.maxDateForForm = '';
            }
        });
    }

    // Validador personalizado para fechas
    dateSequenceValidator(group: FormGroup): { [key: string]: any } | null {
        const courseDate = group.get('date')?.value;
        const linkExpiration = group.get('linkExpiration')?.value;

        if (courseDate && linkExpiration) {
            const cDate = new Date(courseDate);
            const lDate = new Date(linkExpiration);

            if (lDate >= cDate) { // Validación estricta: Límite debe ser ANTES del curso
                return { dateError: 'La fecha límite de registro debe ser ANTES de la fecha de inicio del curso.' };
            }
        }
        return null;
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '100px' },
            { key: 'location', label: 'Ubicación', sortable: true, minWidth: '150px' },
            { key: 'groupStartDate', label: 'Fecha', template: this.dateTemplate, minWidth: '100px' },
            { key: 'schedule', label: 'Hora', template: this.timeTemplate, minWidth: '80px' },
            { key: 'limitStudents', label: 'Cantidad', sortable: true, minWidth: '80px', align: 'center' },
            { key: 'endInscriptionDate', label: 'Límite de registro', template: this.expirationDateTemplate, minWidth: '120px', align: 'center' },
            { key: 'inscriptionURL', label: 'URL', align: 'center', template: this.urlTemplate, minWidth: '80px' },
            { key: 'status', label: 'Estatus', align: 'center', template: this.statusTemplate, minWidth: '100px' },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    openRequests(group: Group) {
        this.selectedRequestGroup = group;
        this.isRequestsModalOpen = true;
    }

    viewPersons(group: Group) {
        // Navegamos a la vista completa de personas del grupo
        if (this.cursoId) {
            this.router.navigate(['/cursos', this.cursoId, 'grupos', group.id, 'conductores'], { queryParams: { courseName: this.courseNameFromQuery ?? undefined, groupLabel: group.name } });
            return;
        }
        // No existe ruta global /cursos/grupos; redirigimos a la lista de cursos
        this.notificationService.info('Selecciona un curso', 'Para ver las personas del grupo, primero selecciona el curso asociado.');
        this.router.navigate(['/cursos']);
    }

    // Helper para evitar desfases de Zona Horaria (El navegador cambia '2025-02-10' a 'Feb 09')
    formatDateForDisplay(dateVal: string | Date | undefined): string {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        // Usamos métodos UTC para ignorar la zona horaria del navegador
        const day = d.getUTCDate().toString().padStart(2, '0');
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    generateUrlSingle(group: Group) {
        if (group.inscriptionURL) {
            this.notificationService.info('Información', 'Este grupo ya tiene una URL generada.');
            return;
        }

        if (!group.endInscriptionDate) {
            const startDate = group.groupStartDate ? new Date(group.groupStartDate) : null;
            if (startDate) {
                startDate.setDate(startDate.getDate() - 1);
                this.maxDateForUrl = startDate.toISOString().split('T')[0];
            } else {
                this.maxDateForUrl = '';
            }

            this.pendingUrlGroups = [group];
            this.urlForm.reset();
            this.isUrlDateModalOpen = true;
            return;
        }

        this.proceedWithUrlGeneration([group], true);
    }

    generateUrl() {
        // REGLA: El botón masivo solo procesa grupos que YA están listos (Sin URL y con Fecha)
        const readyToGenerate = this.selectedGroups.filter(g => !this.getGroupUrl(g) && !!g.endInscriptionDate);

        if (readyToGenerate.length === 0) {
            const hasMissingDate = this.selectedGroups.some(g => !this.getGroupUrl(g) && !g.endInscriptionDate);

            if (hasMissingDate) {
                this.openAlert(
                    'Configuración Individual Requerida',
                    'Los grupos seleccionados no tienen una "Fecha Límite" establecida. Estos deben configurarse y generarse por separado de forma individual.',
                    'info'
                );
            } else {
                this.notificationService.info(
                    'Información',
                    'No hay grupos seleccionados candidatos para generar URL (ya tienen enlace o no cumplen los requisitos).'
                );
            }
            return;
        }

        // Proceder directamente con los listos (Generación Masiva: Requiere Confirmación)
        this.proceedWithUrlGeneration(readyToGenerate, false);
    }
    submitUrlGeneration() {
        if (this.urlForm.invalid) {
            this.urlForm.markAllAsTouched();
            return;
        }

        const dateVal = this.urlForm.get('expirationDate')?.value;
        if (!dateVal) return;

        // Asignar fecha a los grupos pendientes
        this.pendingUrlGroups.forEach(g => {
            g.endInscriptionDate = dateVal;
        });

        // Combinamos los que acabamos de poner fecha con los que ya tenían
        const allGroupsToProcess = [...this.readyUrlGroups, ...this.pendingUrlGroups];

        // Resetear estados del modal antes de proceder
        this.isUrlDateModalOpen = false;
        this.readyUrlGroups = [];

        // Ejecutar (Viene de modal individual: Skip Confirm)
        this.proceedWithUrlGeneration(allGroupsToProcess, true);
    }

    proceedWithUrlGeneration(groupsToGenerate: Group[], skipConfirm: boolean = false) {
        if (groupsToGenerate.length === 0) return;

        // Si se indica skipConfirm (flujo individual/manual), ir directo al grano
        if (skipConfirm) {
            this.executeUrlGeneration(groupsToGenerate);
            return;
        }

        const excludedCount = this.selectedGroups.length - groupsToGenerate.length;

        let message = `Se generarán enlaces para ${groupsToGenerate.length} grupo(s).`;

        if (excludedCount > 0) {
            message += `\n\nNota: Se omitirán ${excludedCount} grupo(s) de la selección por no tener una fecha límite configurada o por ya tener un enlace activo.`;
        }

        message += `\n\n¿Deseas continuar con la generación masiva?`;

        this.openConfirm({
            title: 'Confirmar Generación Masiva',
            message: message,
            type: 'info',
            confirmText: 'Generar Todo',
            cancelText: 'Cancelar'
        }, () => {
            this.executeUrlGeneration(groupsToGenerate);
        });
    }

    /**
     * Lógica core de generación de UUID y actualización de grupos
     */
    private executeUrlGeneration(groupsToGenerate: Group[]) {
        this.tableConfig.loading = true;

        // Creamos un array de flujos encadenados: Generar UUID (si falta) -> Actualizar con URL
        const updateObservables = groupsToGenerate.map(group => {
            // Paso al backend: Si NO tiene uuid, lo generamos primero
            let uuidAction$: Observable<any> = of({ uuid: group.uuid });

            if (!group.uuid) {
                uuidAction$ = this.groupsService.generateGroupUuid(group.id);
            }

            return uuidAction$.pipe(
                switchMap((response: any) => {
                    const uuid = response?.uuid || response?.data?.uuid || group.uuid;

                    if (!uuid) {
                        throw new Error(`El servidor no proporcionó un código único para el grupo ${group.name}`);
                    }

                    // Construcción de URL con el UUID obtenido
                    const origin = window.location.origin;
                    const newUrl = `${origin}/public/register/${uuid}`;

                    const courseId = (typeof group.course === 'object' && group.course !== null)
                        ? (group.course as any).id
                        : group.course;

                    const payload: any = {
                        name: group.name,
                        location: group.location,
                        schedule: group.schedule,
                        limitStudents: group.limitStudents,
                        groupStartDate: group.groupStartDate,
                        endInscriptionDate: group.endInscriptionDate,
                        course: courseId
                    };

                    if (uuid) payload.uuid = uuid;

                    return this.groupsService.updateGroup(group.id, payload);
                })
            );
        });

        if (updateObservables.length > 0) {
            forkJoin(updateObservables).subscribe({
                next: () => {
                    this.tableConfig.loading = false;
                    const count = groupsToGenerate.length;
                    const title = count === 1 ? 'URL Generada' : 'URLs Generadas';
                    const message = count === 1
                        ? `Se ha activado el enlace para el grupo "${groupsToGenerate[0].name}" correctamente.`
                        : `Se han activado ${count} enlaces correctamente.`;

                    this.openAlert(title, message, 'success');

                    this.selectedGroups = [];
                    this.loadGroups();
                },
                error: (err) => {
                    this.tableConfig.loading = false;
                    console.error('Error in link generation chain:', err);
                    this.openAlert(
                        'Error de Generación',
                        'Ocurrió un problema al intentar generar los enlaces. Por favor, verifica la configuración del grupo o intenta más tarde.',
                        'danger'
                    );
                }
            });
        } else {
            this.tableConfig.loading = false;
        }
    }

    // --- SELECTION LOGIC ---
    onSelectionChange(event: any) {
        // Seleccionamos todo lo que venga del evento, sin filtrar.
        // La validación de acciones se hace en los getters canGenerateUrl/canExport
        this.selectedGroups = event.selectedItems;
    }

    /**
     * Activa el UUID de un grupo usando el nuevo endpoint del backend
     */
    activateUuid(group: Group) {
        this.tableConfig.loading = true;
        this.groupsService.generateGroupUuid(group.id).subscribe({
            next: (response) => {
                this.tableConfig.loading = false;
                this.notificationService.success('Código Generado', `Se ha generado el código único para el grupo ${group.name}.`);
                this.loadGroups(); // Recargar para obtener el UUID real
            },
            error: (err) => {
                this.tableConfig.loading = false;
                console.error('Error personalizando UUID:', err);
                this.notificationService.error('Error', 'No se pudo generar el código único del grupo.');
            }
        });
    }

    copyUrl(url: string) {
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            this.notificationService.success('Copiado', 'Enlace copiado al portapapeles.');
        });
    }

    exportData() {
        if (!this.canExport) return;
        this.showExportMenu = !this.showExportMenu;
    }

    exportAs(format: 'csv' | 'excel') {
        this.showExportMenu = false;
        const courseId = this.cursoId ? Number(this.cursoId) : undefined;
        const filename = `reporte-grupos-${new Date().getTime()}`;
        const extension = format === 'excel' ? 'xlsx' : 'csv';

        this.notificationService.info('Exportando', `Generando archivo ${format.toUpperCase()}...`);

        const request$ = format === 'csv'
            ? this.reportsService.exportGroupsCSV(courseId)
            : this.reportsService.exportGroupsExcel(courseId);

        request$.subscribe({
            next: (blob) => {
                this.reportsService.downloadFile(blob, `${filename}.${extension}`);
                this.notificationService.success('Completado', 'El archivo se ha descargado correctamente.');
            },
            error: (err) => {
                console.error(`Error exporting ${format}:`, err);
                this.notificationService.error('Error', `No se pudo generar el reporte en formato ${format.toUpperCase()}.`);
            }
        });
    }

    private formatDuration(minutes: number | undefined): string {
        if (!minutes) return '0 Horas';
        const hours = Math.floor(minutes / 60);
        return `${hours} ${hours === 1 ? 'Hora' : 'Horas'}`;
    }

    private parseCustomDate(dateStr: string): Date | null {
        if (!dateStr) return null;

        // Limpiar espacios extra
        dateStr = dateStr.trim();

        // 0. Si ya tiene T, es ISO probable
        if (dateStr.includes('T')) {
            const dt = new Date(dateStr);
            if (!isNaN(dt.getTime())) return dt;
        }

        // 1. Intentar formato "YYYY-MM-DD" directo (sin hora)
        let dt = new Date(dateStr);
        if (!isNaN(dt.getTime())) return dt;

        // 2. Intentar formato con coma creado por el formulario: "YYYY-MM-DD, HH:mm"
        if (dateStr.includes(',')) {
            const clean = dateStr.replace(',', ''); // "YYYY-MM-DD HH:mm"
            // Mejorar compatibilidad Safari/Firefox reemplazando espacio con T
            const safeIso = clean.replace(' ', 'T');
            dt = new Date(safeIso);
            if (!isNaN(dt.getTime())) return dt;

            // Fallback sin T
            dt = new Date(clean);
            if (!isNaN(dt.getTime())) return dt;
        }

        // 3. Intentar formato de Mocks: "DD/MM/YYYY, HH:mm" o "DD/MM/YYYY"
        // Regex para DD/MM/YYYY
        const dmyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/;
        const match = dateStr.match(dmyRegex);

        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];
            const timePart = match[4].replace(',', '').trim(); // Eliminar coma y espacios

            // Construir formato ISO: YYYY-MM-DDTHH:mm:ss
            // Si hay hora, agregarla, si no usar T00:00:00
            let isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            if (timePart) {
                // Asumimos formato HH:mm
                const timeParts = timePart.split(':');
                const hh = timeParts[0].padStart(2, '0');
                const mm = timeParts[1]?.padStart(2, '0') || '00';
                isoStr += `T${hh}:${mm}:00`;
            } else {
                isoStr += `T00:00:00`;
            }

            dt = new Date(isoStr);
            if (!isNaN(dt.getTime())) return dt;
        }

        console.warn('Could not parse date:', dateStr);
        return null;
    }

    // Helper para formato tabla DD/MM/YYYY
    formatDateForTable(dateStr: string | null | undefined): string {
        if (!dateStr) return '';
        const dt = this.parseCustomDate(dateStr);
        if (!dt) return dateStr || ''; // Fallback al original si falla

        const day = dt.getDate().toString().padStart(2, '0');
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const year = dt.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
