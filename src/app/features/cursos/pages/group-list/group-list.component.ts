import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig, SelectionEvent } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { GroupFormComponent } from '../../components/group-form/group-form.component';
import { GroupRequestsComponent } from '../../components/group-requests/group-requests.component';
import { Group } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
    selector: 'app-group-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        UniversalIconComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalButtonComponent,
        GroupFormComponent,
        GroupRequestsComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent
    ],
    templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('requestsTemplate', { static: true }) requestsTemplate!: TemplateRef<any>;
    @ViewChild('urlTemplate', { static: true }) urlTemplate!: TemplateRef<any>;
    @ViewChild('selectTemplate', { static: true }) selectTemplate!: TemplateRef<any>;

    groups: Group[] = [];
    selectedGroups: Group[] = []; // Track selected items

    // Estado de los modales
    isNewGroupModalOpen = false;
    isRequestsModalOpen = false;
    editingGroup: Group | null = null;
    selectedRequestGroup: Group | null = null;

    tableConfig: TableConfig = {
        loading: true,
        striped: false,
        hoverable: true,
        localSort: true,
        selectable: true // Enable checkboxes
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

    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'info'
    };

    constructor(
        private groupsService: GroupsService,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.initColumns();
        this.loadGroups();

        // Simulación de notificación de registro (Demo)
        setTimeout(() => {
            this.notificationService.success(
                'Nueva Solicitud',
                'Juan Pérez se ha registrado al Grupo A05',
                5000
            );
        }, 3000);
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '120px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '200px' },
            { key: 'location', label: 'Ubicación', sortable: true, minWidth: '150px' },
            { key: 'dateTime', label: 'Fecha y hora', sortable: true, minWidth: '150px' },
            { key: 'quantity', label: 'Cantidad', sortable: true, minWidth: '100px', align: 'center' },
            {
                key: 'url',
                label: 'Enlace',
                sortable: false,
                minWidth: '100px',
                align: 'center',
                template: this.urlTemplate
            },
            {
                key: 'status',
                label: 'Estatus',
                sortable: true,
                align: 'center',
                minWidth: '100px',
                template: this.statusTemplate
            },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '180px', // Aumentado para caber más botones
                template: this.actionsTemplate
            }
        ];
    }

    loadGroups() {
        this.tableConfig.loading = true;
        this.groupsService.getGroups().subscribe({
            next: (data) => {
                this.groups = data;
                this.paginationConfig.totalItems = data.length;
                this.tableConfig.loading = false;
            },
            error: () => {
                this.tableConfig.loading = false;
                this.notificationService.error(
                    'Error de Conexión',
                    'No se pudieron cargar los grupos. Intente más tarde.'
                );
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
        this.alertConfig = {
            title,
            message,
            type
        };
        this.isAlertOpen = true;
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
                error: () => {
                    this.notificationService.error('Error', 'No se pudo eliminar el grupo');
                }
            });
        });
    }

    onSelectionChange(event: SelectionEvent) {
        this.selectedGroups = event.selectedItems;
        console.log('Selection:', this.selectedGroups);
    }

    // Acciones temporales para demostración
    exportData() {
        if (this.selectedGroups.length === 0) return;
        this.openAlert('Exportación', `Exportando ${this.selectedGroups.length} grupos.`, 'info');
    }

    generateUrl() {
        if (this.selectedGroups.length !== 1) return;

        const group = this.selectedGroups[0];
        // Logging for now as previously reverted
        console.log('Generating URL for', group.name);

        // Generamos el link dinámico usando el dominio actual (funciona en localhost y en producción)
        const baseUrl = window.location.origin; // Ej: http://localhost:4200 o https://midominio.com
        const newUrl = `${baseUrl}/registro-publico/${group.id}`;
        group.url = newUrl;

        // Refresh
        this.groups = [...this.groups];
    }

    copyUrl(url: string) {
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            this.openAlert('URL Copiada', 'URL copiada al portapapeles', 'success');
        }).catch(err => {
            console.error('Error al copiar URL', err);
        });
    }

    openNewGroupForm() {
        this.editingGroup = null;
        this.isNewGroupModalOpen = true;
    }

    onGroupSaved() {
        this.loadGroups();
        this.notificationService.success(
            'Éxito',
            this.editingGroup ? 'Grupo actualizado correctamente' : 'Grupo creado exitosamente'
        );
        this.isNewGroupModalOpen = false;
        this.editingGroup = null;
    }

    openEditGroupForm(group: Group) {
        console.log('Edit Group', group);
        this.editingGroup = group;
        this.isNewGroupModalOpen = true;
    }

    openRequests(group: Group) {
        this.selectedRequestGroup = group;
        this.isRequestsModalOpen = true;
    }

    viewDrivers(group: Group) {
        // Navegamos a la vista completa de conductores del grupo
        this.router.navigate(['/cursos/grupos', group.id, 'conductores']);
    }
}
