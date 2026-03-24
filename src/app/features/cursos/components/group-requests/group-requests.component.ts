import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, switchMap } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Group } from '../../../../core/models/group.model';
import { Person } from '../../../../core/models/person.model';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import {
    InstitutionalTableComponent,
    TableColumn,
    TableConfig,
    SelectionEvent
} from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { ModalComponent } from '../../../../shared/components/modals/modal.component';
import { GroupsService } from '../../services/groups.service';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { MailService } from '../../services/mail.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InstitutionalBadgeComponent } from '../../../../shared/components/badge/institutional-badge.component';

@Component({
    selector: 'app-group-requests',
    standalone: true,
    imports: [
        CommonModule,
        InstitutionalButtonComponent,
        InstitutionalTableComponent,
        ConfirmationModalComponent,
        TablePaginationComponent,
        ReactiveFormsModule,
        ModalComponent,
        InstitutionalBadgeComponent,
        TableFiltersComponent,
        LoadingSpinnerComponent,
        AlertModalComponent],
    templateUrl: './group-requests.component.html'
})
export class GroupRequestsComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() group: Group | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() requestsUpdated = new EventEmitter<void>();

    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    allRequests: Person[] = [];
    filteredRequests: Person[] = [];
    requests: Person[] = [];
    selectedRequests: Person[] = [];
    acceptedCount: number = 0;
    pendingRequestsCount: number = 0;
    rejectCount: number = 0;
    availablePlaces: number = 0;
    isLoadingAction: boolean = false;
    loadingActionMessage: string = '';

    // Modales de Alerta de Resultado
    isResultModalOpen = false;
    resultModalConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'success'
    };



    tableConfig: TableConfig = {
        loading: false,
        selectable: true,
        hoverable: true,
        striped: true,
        localSort: true,
        emptyMessage: 'No hay solicitudes pendientes.'
    };

    tableColumns: TableColumn[] = [];
    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    dummyFormGroup: FormGroup; // Grupo de formulario ficticio declarado

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
        private fb: FormBuilder,
        private groupsService: GroupsService,
        private mailService: MailService,
        private notificationService: NotificationService
    ) {
        this.dummyFormGroup = this.fb.group({});
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen && this.group) {
            this.loadGroupRequests();
        }
    }

    loadGroupRequests() {
        if (!this.group) return;
        this.tableConfig.loading = true;

        const page = this.paginationConfig.currentPage;
        const limit = this.paginationConfig.pageSize;

        // Cargar estadísticas del grupo primero (para que los badges no estén en 0)
        this.groupsService.getGroupById(this.group.id).subscribe({
            next: (updatedGroup: any) => {
                this.group = updatedGroup;
                this.acceptedCount = updatedGroup.acceptedCount || 0;
                this.pendingRequestsCount = updatedGroup.pendingRequestsCount || 0;
                this.rejectCount = updatedGroup.rejectCount || 0;
                this.availablePlaces = updatedGroup.availablePlaces !== undefined ? updatedGroup.availablePlaces : 0;
            }
        });
        // Cargar la lista de solicitudes
        this.groupsService.getRequestsByGroupId(this.group.id, page, limit).subscribe({
            next: (response: any) => {
                let items = [];
                if (response.data) {
                    // FILTRO TEMPORAL: El backend está regresando rechazados en la lista de solicitudes.
                    // Solo mostramos aquellos que NO tienen dateReject.
                    items = response.data.filter((item: any) => !item.dateReject);

                    if (response.meta) {
                        this.paginationConfig = {
                            ...this.paginationConfig,
                            totalItems: items.length // Usar el conteo filtrado localmente
                        };
                    }
                } else if (Array.isArray(response)) {
                    items = response.filter((item: any) => !item.dateReject);
                    this.paginationConfig.totalItems = items.length;
                }

                // Sincronizar contador de pendientes si el backend está enviando datos sucios
                this.pendingRequestsCount = items.length;

                this.allRequests = items;
                this.selectedRequests = [];
                this.initColumns();
                this.filterData(this.currentSearchTerm);
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error loading group requests', err);
                this.notificationService.showError('Error', 'No se pudieron cargar las solicitudes.');
                this.tableConfig.loading = false;
            }
        });
    }

    // Guardar término de búsqueda si existe
    currentSearchTerm: string = '';

    get isGroupFull(): boolean {
        if (!this.group || !this.group.limitStudents) return false;
        return this.acceptedCount >= this.group.limitStudents;
    }

    initColumns() {
        // Columnas base estrictas solicitadas por reglas de negocio
        const columns: TableColumn[] = [
            { key: 'name', label: 'Nombre Completo', sortable: true },
            { key: 'curp', label: 'CURP', sortable: true },
            { key: 'phone', label: 'Teléfono', sortable: true }
        ];

        // Columnas dinámicas limitadas a Licencia y NUC
        if (this.group?.course?.courseType?.courseConfigField) {
            this.group.course.courseType.courseConfigField.forEach((field: any) => {
                const configField = field.requirementFieldPerson;
                if (configField) {
                    const label = configField.fieldName;
                    const key = label.toLowerCase();

                    if (key.includes('licencia')) {
                        if (!columns.find(c => c.key === 'license')) {
                            columns.push({ key: 'license', label: label, sortable: true });
                        }
                    } else if (key.includes('nuc')) {
                        if (!columns.find(c => c.key === 'nuc')) {
                            columns.push({ key: 'nuc', label: label, sortable: true });
                        }
                    }
                }
            });
        }

        // Columna de acciones siempre al final
        columns.push({ key: 'actions', label: 'Solicitud', align: 'center', template: this.actionsTemplate });

        this.tableColumns = columns;
    }

    closeModal() {
        this.close.emit();
    }

    onSelectionChange(event: SelectionEvent) {
        this.selectedRequests = event.selectedItems;
    }
    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        this.loadGroupRequests();
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

    acceptRequest(personId: number, enrollmentId?: number, email?: string) {
        if (!enrollmentId) return;

        this.openConfirm({
            title: 'Aceptar Solicitud',
            message: '¿Estás seguro de aceptar esta solicitud?',
            type: 'success',
            confirmText: 'Aceptar',
            cancelText: 'Cancelar'
        }, () => {
            this.isLoadingAction = true;
            this.loadingActionMessage = 'Procesando aceptación y enviando correo de confirmación...';

            this.groupsService.acceptEnrollment(enrollmentId).pipe(
                switchMap(() => {
                    if (email) {
                        return this.mailService.sendAcceptanceEmail(email, this.group);
                    }
                    return of({ message: 'No email provided' });
                })
            ).subscribe({
                next: (mailRes: any) => {
                    this.isLoadingAction = false;
                    const msg = (email && mailRes?.status === 200)
                        ? `La solicitud de <b>${this.allRequests.find(r => r.enrollmentId === enrollmentId)?.name || 'la persona'}</b> ha sido aceptada y el correo de aviso se envió con éxito.`
                        : 'La solicitud ha sido aceptada exitosamente.';
                    
                    this.resultModalConfig = {
                        title: 'Aceptación Exitosa',
                        message: msg,
                        type: 'success'
                    };
                    this.isResultModalOpen = true;

                    this.allRequests = this.allRequests.filter(r => r.enrollmentId !== enrollmentId);
                    this.filterData(this.currentSearchTerm);
                    this.clearSelection();
                    this.requestsUpdated.emit();
                    this.loadGroupRequests();
                },
                error: (err) => {
                    this.isLoadingAction = false;
                    console.error('Error in acceptance flow', err);
                    this.notificationService.showError('Error', 'No se pudo completar el proceso o hubo un fallo en el envío del correo.');
                }
            });
        });
    }

    rejectRequest(personId: number, enrollmentId?: number, email?: string) {
        if (!enrollmentId) return;

        this.openConfirm({
            title: 'Rechazar Solicitud',
            message: '¿Estás seguro de rechazar esta solicitud?',
            type: 'danger',
            confirmText: 'Rechazar',
            cancelText: 'Cancelar'
        }, () => {
            this.isLoadingAction = true;
            this.loadingActionMessage = 'Procesando rechazo y notificando por correo...';

            this.groupsService.rejectEnrollment(enrollmentId).pipe(
                switchMap(() => {
                    if (email) {
                        return this.mailService.sendRejectionEmail(email, this.group);
                    }
                    return of({ message: 'No email provided' });
                })
            ).subscribe({
                next: (mailRes: any) => {
                    this.isLoadingAction = false;
                    const msg = (email && mailRes?.status === 200)
                        ? `La solicitud de <b>${this.allRequests.find(r => r.enrollmentId === enrollmentId)?.name || 'la persona'}</b> ha sido rechazada y el correo de aviso se envió con éxito.`
                        : 'La solicitud ha sido rechazada exitosamente.';
                    
                    this.resultModalConfig = {
                        title: 'Rechazo Completado',
                        message: msg,
                        type: 'success'
                    };
                    this.isResultModalOpen = true;

                    this.allRequests = this.allRequests.filter(r => r.enrollmentId !== enrollmentId);
                    this.filterData(this.currentSearchTerm);
                    this.clearSelection();
                    this.requestsUpdated.emit();
                    this.loadGroupRequests();
                },
                error: (err) => {
                    this.isLoadingAction = false;
                    console.error('Error in rejection flow', err);
                    this.notificationService.showError('Error', 'No se pudo completar el proceso de rechazo.');
                }
            });
        });
    }

    processSelected(action: 'accept' | 'reject') {
        if (this.selectedRequests.length === 0) return;

        const isAccept = action === 'accept';
        this.openConfirm({
            title: isAccept ? 'Aceptar Solicitudes' : 'Rechazar Solicitudes',
            message: `¿${isAccept ? 'Aceptar' : 'Rechazar'} ${this.selectedRequests.length} solicitudes seleccionadas?`,
            type: isAccept ? 'success' : 'danger',
            confirmText: isAccept ? 'Aceptar Todas' : 'Rechazar Todas',
            cancelText: 'Cancelar'
        }, () => {
            const requestsToProcess = this.selectedRequests.filter(r => r.enrollmentId);
            if (requestsToProcess.length === 0) return;

            this.isLoadingAction = true;
            this.loadingActionMessage = `Procesando ${requestsToProcess.length} solicitudes...`;

            const observables = requestsToProcess.map(r =>
                isAccept
                    ? this.groupsService.acceptEnrollment(r.enrollmentId!)
                    : this.groupsService.rejectEnrollment(r.enrollmentId!)
            );

            forkJoin(observables).pipe(
                switchMap(() => {
                    this.loadingActionMessage = 'Enviando correos de notificación...';
                    const mailObservables = requestsToProcess
                        .filter(r => r.email)
                        .map(r => isAccept 
                            ? this.mailService.sendAcceptanceEmail(r.email!, this.group) 
                            : this.mailService.sendRejectionEmail(r.email!, this.group)
                        );
                    return mailObservables.length > 0 ? forkJoin(mailObservables) : of([]);
                })
            ).subscribe({
                next: () => {
                    this.isLoadingAction = false;
                    const actionLabel = isAccept ? 'aceptadas' : 'rechazadas';
                    this.resultModalConfig = {
                        title: isAccept ? 'Carga Masiva Exitosa' : 'Rechazo Masivo Completado',
                        message: `Se han <b>${actionLabel} ${requestsToProcess.length} solicitudes</b> correctamente y se han enviado los correos de notificación correspondientes.`,
                        type: 'success'
                    };
                    this.isResultModalOpen = true;

                    const processedEnrollmentIds = requestsToProcess.map(r => r.enrollmentId);
                    this.allRequests = this.allRequests.filter(r => !processedEnrollmentIds.includes(r.enrollmentId));
                    this.filterData(this.currentSearchTerm);
                    this.clearSelection();
                    this.requestsUpdated.emit();
                    this.loadGroupRequests();
                },
                error: (err) => {
                    this.isLoadingAction = false;
                    console.error('Error in bulk flow', err);
                    this.notificationService.showError('Error', 'Ocurrió un error al procesar las solicitudes masivamente.');
                }
            });
        });
    }

    private clearSelection() {
        this.selectedRequests = [];
        this.filterData(this.currentSearchTerm);
    }

    // onPageChange eliminado (duplicado)

    filterData(query: string) {
        const term = query.toLowerCase().trim();
        if (this.currentSearchTerm !== term) {
            this.currentSearchTerm = term;
            this.paginationConfig.currentPage = 1;
            this.loadGroupRequests();
        } else {
            // Si el término es el mismo, solo actualizar vista local (o nada si ya se cargó)
            this.requests = [...this.allRequests];
        }
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.requests = this.filteredRequests.slice(start, end);
    }

    get modalTitle(): string {
        return this.group ? `Solicitudes para el Grupo: ${this.group.name}` : 'Solicitudes';
    }

    get showBulkActions(): boolean {
        return this.selectedRequests.length > 0;
    }
}
