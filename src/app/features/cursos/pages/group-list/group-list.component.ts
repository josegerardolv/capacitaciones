import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { catchError, timeout } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
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
import { InputEnhancedComponent } from '@/app/shared/components';
import { GroupRequestsComponent } from '../../components/group-requests/group-requests.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { UniversalIconComponent } from '@/app/shared/components';
import { HttpErrorResponse } from '@angular/common/http';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';

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
        BreadcrumbComponent,
        UniversalIconComponent,
        BreadcrumbComponent,
        UniversalIconComponent,
        AlertModalComponent,
        TableFiltersComponent
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

    allGroups: Group[] = [];
    filteredGroups: Group[] = [];
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
    maxDateForUrl: string = ''; // Restricción para el selector
    maxDateForForm: string = ''; // Restricción para el selector en Formulario de Grupo
    minDateForForm: string = ''; // Restricción para fecha de inicio (Hoy)

    urlModalActions: FormAction[] = [
        {
            label: 'Continuar',
            type: 'submit',
            variant: 'primary',
            icon: 'arrow_forward'
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
    get canGenerateUrl(): boolean {
        // Debe haber seleccionados
        if (this.selectedGroups.length === 0) return false;
        // Solo se activa si TODOS los seleccionados NO tienen URL
        // Si al menos uno tiene URL, se desactiva (para obligar al usuario a filtrar)
        return this.selectedGroups.every(g => !g.inscriptionURL);
    }

    get canExport(): boolean {
        return this.selectedGroups.length > 0;
    }

    currentCourse: any = null; // Almacenar objeto completo del curso

    constructor(
        private groupsService: GroupsService,
        private coursesService: CoursesService, // Inyectar
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private fb: FormBuilder
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
            this.breadcrumbItems = [
                { label: 'Cursos', url: '/cursos' },
                { label: `Curso ${this.courseLabel}` },
                { label: 'Grupos', url: `/cursos/${this.cursoId}/grupos` }
            ];

            // Cargar detalles del curso para obtener courseTypeId, LUEGO cargar grupos
            this.coursesService.getCourses().pipe(timeout(5000)).subscribe({
                next: (courses) => {
                    this.currentCourse = courses.find(c => c.id === +this.cursoId!);
                    this.loadGroups(); // Llamar DESPUÉS de establecer currentCourse
                },
                error: (err) => {
                    console.error('Error loading course details:', err);
                    this.tableConfig.loading = false;
                    this.notificationService.error('Error', 'No se pudieron cargar los detalles del curso.');
                }
            });
        } else {
            // Si no hay contexto de curso, cargar todos los grupos inmediatamente
            this.loadGroups();
        }

    }



    loadGroups() {
        this.tableConfig.loading = true;
        this.groupsService.getGroups().pipe(timeout(5000)).subscribe({
            next: (data) => {
                if (this.currentCourse) {
                    // Filter handling both Number and Object (Backend returns object relation)
                    this.allGroups = data.filter(g => {
                        const gCourseId = (typeof g.course === 'object' && g.course !== null) ? (g.course as any).id : g.course;
                        return gCourseId == this.currentCourse.id;
                    });
                } else {
                    this.allGroups = data;
                }
                this.selectedGroups = []; // Limpiar selección al recargar
                this.filterData('');
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
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        this.updatePaginatedData();
    }

    filterData(query: string) {
        const term = query.toLowerCase().trim();
        if (!term) {
            this.filteredGroups = [...this.allGroups];
        } else {
            this.filteredGroups = this.allGroups.filter(g =>
                g.name.toLowerCase().includes(term) ||
                (g.location || '').toLowerCase().includes(term) ||
                (g.status || '').toLowerCase().includes(term)
            );
        }
        this.filteredGroups.sort((a, b) => {
            const dateA = new Date(a.groupStartDate).getTime();
            const dateB = new Date(b.groupStartDate).getTime();
            return dateB - dateA; // Descending
        });
        this.paginationConfig.totalItems = this.filteredGroups.length;
        this.updatePaginatedData();
    }


    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.groups = this.filteredGroups.slice(start, end);
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
            dateVal = group.groupStartDate.split('T')[0]; // Simple split since we store raw logic
        }
        if (group.schedule) {
            timeVal = group.schedule;
        }

        this.groupModalForm.patchValue({
            ...group,
            ...group,
            date: dateVal,
            time: timeVal
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
                inscriptionURL: formValue.inscriptionURL || 'https://example.com/pendiente',
                groupStartDate: formValue.date,
                endInscriptionDate: formValue.linkExpiration || formValue.date, // Fallback to Start Date to pass "NotEmpty"
                course: this.currentCourse ? this.currentCourse.id : undefined
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
            // Recuperar el grupo original para mantener datos que no están en el formulario (url, status)
            const originalGroup = this.groups.find(g => g.id === this.editingGroupId);

            const payload = {
                id: this.editingGroupId,
                name: formValue.name,
                location: formValue.location,
                schedule: formValue.time, // "14:00"
                limitStudents: Number(formValue.limitStudents),
                inscriptionURL: originalGroup?.inscriptionURL || '',
                groupStartDate: formValue.date,
                endInscriptionDate: formValue.linkExpiration || formValue.date, // Fallback to Start Date
                course: this.currentCourse ? this.currentCourse.id : undefined,
                status: originalGroup?.status || 'Activo' // Preservar estatus
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

        // Escuchar cambios en la fecha del curso para actualizar el límite máximo
        this.groupModalForm.get('date')?.valueChanges.subscribe(dateVal => {
            if (dateVal) {
                // Determinar fecha máxima (estrictamente antes de la fecha del curso)
                // Para el input date HTML 'max', este incluye la fecha.
                // Para ser "estrictamente antes", podríamos establecer max al día anterior.
                // Usuario solicitó "deshabilitar días".
                // Si el curso es 2026-10-30, max debería ser 2026-10-29.
                const dt = new Date(dateVal);
                dt.setDate(dt.getDate() - 1); // Restar 1 día
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

            if (lDate >= cDate) {
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

    // Lógica para Generar URL
    generateUrl() {
        console.log('Generating URL...');
        // Filtramos grupos que ya están seleccionados pero no tienen URL (doble validación)
        const groupsToGenerate = this.selectedGroups.filter(g => !g.inscriptionURL);
        console.log('Groups to generate:', groupsToGenerate);

        if (groupsToGenerate.length === 0) {
            this.notificationService.info('Información', 'Todos los grupos seleccionados ya tienen una URL generada.');
            return;
        }

        // 2. Comprobar si falta fecha de expiración en algún grupo
        const missingDateGroups = groupsToGenerate.filter(g => !g.endInscriptionDate);
        console.log('Missing date groups:', missingDateGroups);

        if (missingDateGroups.length > 0) {
            // Regla de Negocio: Si falta fecha, SOLO se puede procesar uno a la vez
            if (missingDateGroups.length > 1) {
                this.notificationService.warning(
                    'Selección Múltiple no permitida',
                    'Has seleccionado varios grupos que no tienen "Fecha Límite" configurada. Por favor, selecciona solo uno para establecer su fecha individualmente.'
                );
                return;
            }

            // Calcular fecha máxima más estricta (fecha de inicio del grupo único)
            const group = missingDateGroups[0];
            const startDate = group.groupStartDate ? new Date(group.groupStartDate) : null;

            if (startDate) {
                // Restar 1 día para que el límite sea "estrictamente antes" (Usuario: "si es 31, elegir hasta 30")
                startDate.setDate(startDate.getDate() - 1);
                this.maxDateForUrl = startDate.toISOString().split('T')[0];
            } else {
                this.maxDateForUrl = '';
            }

            // Preparar modal
            this.pendingUrlGroups = missingDateGroups; // Será un array de 1 elemento
            this.urlForm.reset();
            this.isUrlDateModalOpen = true;
            return;
        }

        this.proceedWithUrlGeneration(groupsToGenerate);
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

        // Combinar con los que ya tenían fecha (si existieran en un flujo mixto, aunque aquí pendingUrlGroups son los que faltaban)
        // En este flujo, si entramos al modal, es porque SOLO había grupos sin fecha (o el usuario seleccionó uno sin fecha).
        // Procedemos a generar URLs para estos.
        this.proceedWithUrlGeneration(this.pendingUrlGroups);
        this.isUrlDateModalOpen = false;
    }

    proceedWithUrlGeneration(groupsToGenerate: Group[]) {
        // Confirmar generación masiva
        this.openConfirm({
            title: 'Generar URL Pública',
            message: `Se generarán enlaces de registro para ${groupsToGenerate.length} grupo(s).\n\nEstos enlaces respetarán la "Fecha Límite de Auto-registro" configurada.\n¿Continuar?`,
            type: 'info',
            confirmText: 'Generar',
            cancelText: 'Cancelar'
        }, () => {
            const updateObservables: any[] = [];

            groupsToGenerate.forEach(group => {
                if (!group.inscriptionURL) {
                    // 1. Generar URL
                    const newUrl = `${origin}/public/register/${group.id}`;

                    // 2. Preparar payload de actualización
                    // Clonamos el objeto para no modificar la referencia local antes de que el back confirme
                    // Pero necesitamos enviar todos los campos o al menos los requeridos por PUT
                    // En este punto, 'group' ya tiene datos nativos (groupStartDate, etc).
                    const payload = {
                        ...group,
                        inscriptionURL: newUrl,
                        status: 'Activo' // Activamos al generar URL
                    };

                    updateObservables.push(this.groupsService.updateGroup(group.id, payload));
                }
            });

            if (updateObservables.length > 0) {
                this.tableConfig.loading = true;
                forkJoin(updateObservables).subscribe({
                    next: () => {
                        this.tableConfig.loading = false;
                        this.notificationService.success('URL Generada', `Se generaron y guardaron ${updateObservables.length} enlaces correctamente.`);
                        this.selectedGroups = [];
                        this.loadGroups(); // Recargar para ver cambios reales
                    },
                    error: (err) => {
                        this.tableConfig.loading = false;
                        console.error('Error generating/saving URLs:', err);
                        this.notificationService.error('Error', 'Ocurrió un error al guardar las URLs generadas.');
                    }
                });
            } else {
                this.notificationService.warning('Advertencia', 'No se generaron URLs (posiblemente ya existían).');
            }
        });
    }

    // --- SELECTION LOGIC ---
    onSelectionChange(event: any) {
        // Seleccionamos todo lo que venga del evento, sin filtrar.
        // La validación de acciones se hace en los getters canGenerateUrl/canExport
        this.selectedGroups = event.selectedItems;
    }

    copyUrl(url: string) {
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            this.notificationService.success('Copiado', 'Enlace copiado al portapapeles.');
        });
    }

    exportData() {
        this.notificationService.info('Exportar', 'Descargando reporte de grupos...');
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
