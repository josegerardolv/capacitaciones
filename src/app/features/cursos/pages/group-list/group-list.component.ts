import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Group } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { ModalFormComponent } from '../../../../shared/components/forms/modal-form.component';
import { InputEnhancedComponent } from '@/app/shared/components';
import { GroupRequestsComponent } from '../../components/group-requests/group-requests.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { UniversalIconComponent } from '@/app/shared/components';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

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
        AlertModalComponent
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
    @ViewChild('timeTemplate', { static: true }) timeTemplate!: TemplateRef<any>; // Template para Hora

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

    // Breadcrumb items
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
        return this.selectedGroups.every(g => !g.url);
    }

    get canExport(): boolean {
        return this.selectedGroups.length > 0;
    }

    constructor(
        private groupsService: GroupsService,
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
        }
        this.loadGroups();
    }

    // Inicialización del formulario con los campos requeridos por diseño
    initForms() {
        this.groupModalForm = this.fb.group({
            name: ['', [Validators.required]],
            duration: ['', [Validators.required]],
            location: ['', [Validators.required]],
            date: ['', [Validators.required]], // Separated date
            time: ['', [Validators.required]], // Separated time
            quantity: ['', [Validators.required, Validators.min(1)]],
            autoRegisterLimit: ['', [Validators.required, Validators.min(1)]],
            course: ['', []]
        });
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '100px' },
            { key: 'location', label: 'Ubicación', sortable: true, minWidth: '150px' },
            { key: 'date', label: 'Fecha', template: this.dateTemplate, minWidth: '100px' },
            { key: 'time', label: 'Hora', template: this.timeTemplate, minWidth: '80px' },
            { key: 'quantity', label: 'Cantidad', sortable: true, minWidth: '80px', align: 'center' },
            { key: 'autoRegisterLimit', label: 'Límite de autoregistro', sortable: true, minWidth: '120px', align: 'center' },
            { key: 'url', label: 'URL', align: 'center', template: this.urlTemplate, minWidth: '80px' },
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

    loadGroups() {
        this.tableConfig.loading = true;
        this.groupsService.getGroups().subscribe({
            next: (data) => {
                this.groups = data;
                this.selectedGroups = []; // Limpiar selección al recargar
                this.paginationConfig.totalItems = data.length;
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
        if (group.dateTime) {
            const dt = new Date(group.dateTime);
            if (!isNaN(dt.getTime())) {
                // Formato YYYY-MM-DD
                dateVal = dt.toISOString().split('T')[0];
                // Formato HH:mm
                timeVal = dt.toTimeString().substring(0, 5);
            } else {
                // Fallback si es string simple
                const parts = group.dateTime.split(' ');
                if (parts.length > 0) dateVal = parts[0];
                if (parts.length > 1) timeVal = parts[1];
            }
        }

        this.groupModalForm.patchValue({
            ...group,
            date: dateVal,
            time: timeVal
        });
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
            this.groupsService.createGroup(formValue).subscribe({
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
        } else { // edit mode
            if (!this.editingGroupId) {
                this.notificationService.error('Error', 'ID de grupo no definido para la edición.');
                this.isSaving = false;
                return;
            }
            const payload = {
                id: this.editingGroupId,
                ...formValue
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

    openRequests(group: Group) {
        this.selectedRequestGroup = group;
        this.isRequestsModalOpen = true;
    }

    viewDrivers(group: Group) {
        // Navegamos a la vista completa de conductores del grupo
        if (this.cursoId) {
            this.router.navigate(['/cursos', this.cursoId, 'grupos', group.id, 'conductores'], { queryParams: { courseName: this.courseNameFromQuery ?? undefined, groupLabel: group.name } });
            return;
        }
        // No existe ruta global /cursos/grupos; redirigimos a la lista de cursos
        this.notificationService.info('Selecciona un curso', 'Para ver los conductores del grupo, primero selecciona el curso asociado.');
        this.router.navigate(['/cursos']);
    }

    // Lógica para Generar URL
    generateUrl() {
        // Filtramos grupos que ya están seleccionados pero no tienen URL (doble validación)
        const groupsToGenerate = this.selectedGroups.filter(g => !g.url);

        if (groupsToGenerate.length === 0) {
            this.notificationService.info('Información', 'Todos los grupos seleccionados ya tienen una URL generada.');
            return;
        }

        // Confirmar generación masiva
        this.openConfirm({
            title: 'Generar URL Pública',
            message: `Se generará el enlace de registro para ${groupsToGenerate.length} grupo(s). \n\n¿Continuar?`,
            type: 'info',
            confirmText: 'Generar',
            cancelText: 'Cancelar'
        }, () => {
            let count = 0;
            const origin = window.location.origin; // Ej: http://localhost:4200

            groupsToGenerate.forEach(group => {
                // Solo si tiene cupo (aunque esto es lógica de negocio extra, la mantenemos si existe)
                // y doble check de que no tenga url
                if (!group.url) {
                    // FORMATO SOLICITADO: Ruta al registro público
                    group.url = `${origin}/public/register/${group.id}`;
                    group.status = 'Activo'; // Asumimos que al generar URL se activa
                    count++;
                }
            });

            if (count > 0) {
                this.notificationService.success('URL Generada', `Se generaron ${count} enlaces correctamente.`);
                this.selectedGroups = []; // Limpiar selección opcionalmente, o dejarla
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
}
