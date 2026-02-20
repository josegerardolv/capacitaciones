import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms'; // FormControl agregado
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
import { ModalComponent } from '../../../../shared/components/modals/modal.component';
import { GroupsService } from '../../services/groups.service';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';

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
        ReactiveFormsModule,
        ModalComponent,
        TableFiltersComponent],
    templateUrl: './group-requests.component.html'
})
export class GroupRequestsComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() group: Group | null = null;
    @Output() close = new EventEmitter<void>();

    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    allRequests: Person[] = [];
    filteredRequests: Person[] = [];
    requests: Person[] = [];
    selectedRequests: Person[] = [];



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
        private groupsService: GroupsService
    ) {
        this.dummyFormGroup = this.fb.group({});
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen && this.group) {
            this.loadGroupRequests();
        }
    }

    loadGroupRequests() {
        this.tableConfig.loading = true;
        if (!this.group) return;

        this.groupsService.getRequestsByGroupId(this.group.id).subscribe(data => {
            this.allRequests = data;
            this.selectedRequests = [];
            this.initColumns(); // Re-vinculamos templates
            this.filterData('');
            this.tableConfig.loading = false;
        });
    }

    initColumns() {
        // Columnas base
        const columns: TableColumn[] = [
            { key: 'name', label: 'Nombre', sortable: true },
            { key: 'curp', label: 'CURP', sortable: true },
            { key: 'email', label: 'Correo', sortable: true }
        ];

        // Columnas dinámicas de la configuración del curso
        if (this.group?.course?.courseType?.courseConfigField) {
            this.group.course.courseType.courseConfigField.forEach((field: any) => {
                const configField = field.requirementFieldPerson;
                if (configField) {
                    const label = configField.fieldName;
                    let key = label.toLowerCase();

                    // Normalizar llaves para que coincidan con el flatten de GroupsService
                    if (key.includes('dirección')) key = 'address';
                    else if (key.includes('sexo')) key = 'sex';
                    else if (key.includes('telefono')) key = 'phone';
                    else if (key.includes('licencia')) key = 'license';
                    else if (key.includes('nuc')) key = 'nuc';
                    else if (key.includes('correo') || key.includes('email')) key = 'email';

                    // Evitar duplicados si hay campos core
                    if (!columns.find(c => c.key === key)) {
                        columns.push({ key: key, label: label, sortable: true });
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
        this.updatePaginatedData();
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

    acceptRequest(personId: number, enrollmentId?: number) {
        if (!enrollmentId) {
            console.error('No enrollment ID provided');
            return;
        }

        this.openConfirm({
            title: 'Aceptar Solicitud',
            message: '¿Estás seguro de aceptar esta solicitud?',
            type: 'success',
            confirmText: 'Aceptar',
            cancelText: 'Cancelar'
        }, () => {
            this.groupsService.acceptEnrollment(enrollmentId).subscribe({
                next: () => {
                    this.allRequests = this.allRequests.filter(r => r.enrollmentId !== enrollmentId);
                    this.filterData('');
                    this.clearSelection();
                },
                error: (err) => console.error('Error accepting enrollment', err)
            });
        });
    }

    rejectRequest(personId: number, enrollmentId?: number) {
        if (!enrollmentId) {
            console.error('No enrollment ID provided');
            return;
        }

        this.openConfirm({
            title: 'Rechazar Solicitud',
            message: '¿Estás seguro de rechazar esta solicitud?',
            type: 'danger',
            confirmText: 'Rechazar',
            cancelText: 'Cancelar'
        }, () => {
            this.groupsService.rejectEnrollment(enrollmentId).subscribe({
                next: () => {
                    this.allRequests = this.allRequests.filter(r => r.enrollmentId !== enrollmentId);
                    this.filterData('');
                    this.clearSelection();
                },
                error: (err) => console.error('Error rejecting enrollment', err)
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
            // Filtrar solo los que tienen enrollmentId válido
            const requestsToProcess = this.selectedRequests.filter(r => r.enrollmentId);
            if (requestsToProcess.length === 0) return;

            // Crear array de observables
            const observables = requestsToProcess.map(r =>
                isAccept
                    ? this.groupsService.acceptEnrollment(r.enrollmentId!)
                    : this.groupsService.rejectEnrollment(r.enrollmentId!)
            );

            forkJoin(observables).subscribe({
                next: () => {
                    // Remover todos los procesados de la lista local usando enrollmentId
                    const processedEnrollmentIds = requestsToProcess.map(r => r.enrollmentId);
                    this.allRequests = this.allRequests.filter(r => !processedEnrollmentIds.includes(r.enrollmentId));
                    this.filterData('');
                    this.clearSelection();
                },
                error: (err) => console.error('Error processing bulk requests', err)
            });
        });
    }

    private clearSelection() {
        this.selectedRequests = [];
        this.filterData('');
    }

    // onPageChange eliminado (duplicado)

    filterData(query: string) {
        const term = query.toLowerCase().trim();
        if (!term) {
            this.filteredRequests = [...this.allRequests];
        } else {
            this.filteredRequests = this.allRequests.filter(r =>
                r.name.toLowerCase().includes(term) ||
                (r.curp || '').toLowerCase().includes(term)
            );
        }
        this.paginationConfig.totalItems = this.filteredRequests.length;
        this.updatePaginatedData();
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
