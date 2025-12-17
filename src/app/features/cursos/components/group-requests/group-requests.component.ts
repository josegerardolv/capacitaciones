import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group } from '../../../../core/models/group.model';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import {
    InstitutionalTableComponent,
    TableColumn,
    TableConfig,
    SelectionEvent
} from '../../../../shared/components/institutional-table/institutional-table.component';

interface Request {
    id: number;
    name: string;
    curp: string;
    sex: 'Hombre' | 'Mujer';
    address: string;
    nuc: string;
}

@Component({
    selector: 'app-group-requests',
    standalone: true,
    imports: [CommonModule, InstitutionalButtonComponent, InstitutionalTableComponent],
    templateUrl: './group-requests.component.html'
})
export class GroupRequestsComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() group: Group | null = null;
    @Output() close = new EventEmitter<void>();

    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    requests: Request[] = [];
    selectedRequests: Request[] = [];

    tableConfig: TableConfig = {
        loading: false,
        selectable: true,
        hoverable: true,
        striped: true,
        localSort: true,
        emptyMessage: 'No hay solicitudes pendientes.'
    };

    tableColumns: TableColumn[] = [];

    ngOnInit() {
        // Inicializamos las columnas. Aunque actionsTemplate es static: true,
        // es buena práctica asegurarnos que el view esté listo.
        this.initColumns();
    }

    // Generador de datos de prueba para simular la respuesta del backend
    private generateMockRequests(): Request[] {
        return [
            { id: 1, name: 'Juan Perez', curp: 'EQPH100809MSPTPV34', sex: 'Hombre', address: 'Oaxaca, Centro', nuc: '01-191' },
            { id: 2, name: 'Sergio Gonzalez', curp: 'VXCE910803MCCRCK34', sex: 'Hombre', address: 'Reforma, Centro', nuc: '25-545' },
            { id: 3, name: 'Sofia Torres', curp: 'DVQU511101MYNHMF37', sex: 'Mujer', address: 'Oaxaca, Lomas del Bosque', nuc: '61-464' },
        ];
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen) {
            this.requests = this.generateMockRequests();
            this.selectedRequests = [];
            // Re-inicializamos columnas para asegurar que el template se vincule correctamente
            this.initColumns();
        }
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true },
            { key: 'curp', label: 'CURP', sortable: true },
            { key: 'sex', label: 'Sexo', sortable: true },
            { key: 'address', label: 'Dirección', sortable: true },
            { key: 'nuc', label: 'NUC', sortable: true },
            { key: 'actions', label: 'Solicitud', align: 'center', template: this.actionsTemplate }
        ];
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('institutional-modal-overlay')) {
            this.closeModal();
        }
    }

    closeModal() {
        this.close.emit();
    }

    onSelectionChange(event: SelectionEvent) {
        this.selectedRequests = event.selectedItems;
    }

    acceptRequest(id: number) {
        // Lógica de aceptación: Por ahora removemos de la lista local
        // TODO: Conectar con endpoint de aceptación de solicitudes
        if (confirm('¿Aceptar solicitud?')) {
            this.requests = this.requests.filter(r => r.id !== id);
            this.clearSelection();
        }
    }

    rejectRequest(id: number) {
        if (confirm('¿Rechazar solicitud?')) {
            this.requests = this.requests.filter(r => r.id !== id);
            this.clearSelection();
        }
    }

    processSelected(action: 'accept' | 'reject') {
        if (this.selectedRequests.length === 0) return;

        if (confirm(`¿${action === 'accept' ? 'Aceptar' : 'Rechazar'} ${this.selectedRequests.length} solicitudes?`)) {
            // Filtramos los items seleccionados simulando su procesamiento
            const selectedIds = this.selectedRequests.map(r => r.id);
            this.requests = this.requests.filter(r => !selectedIds.includes(r.id));
            this.clearSelection();
        }
    }

    private clearSelection() {
        this.selectedRequests = [];
        // Forzamos actualización de referencia para que la tabla detecte el cambio
        this.requests = [...this.requests];
    }

    get showBulkActions(): boolean {
        return this.selectedRequests.length > 0;
    }
}
