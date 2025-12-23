import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Tarjeton } from '../../../../core/models/document.model';
import { DocumentsService } from '../../services/documents.service';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
@Component({
    selector: 'app-tarjetones-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        InstitutionalTableComponent,
        TablePaginationComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        InstitutionalButtonComponent,
        InstitutionalCardComponent,
        PageHeaderComponent,
    ],
    templateUrl: './tarjetones-list.component.html'
})
export class TarjetonesListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Documentos' },
        { label: 'Tarjetones' },
    ];
    actionButtonConfig: any = { text: 'Nuevo Tarjetón', icon: 'add', onClick: () => this.openForm() };

    tarjetones: Tarjeton[] = [];

    showForm = false;
    showEditForm = false;
    selectedTarjeton: Tarjeton | null = null;

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
        private documentsService: DocumentsService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initColumns();
        this.loadTarjetones();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '180px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            { key: 'format', label: 'Formato', sortable: true, minWidth: '120px' },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    loadTarjetones() {
        this.tableConfig.loading = true;
        this.documentsService.getTarjetones().subscribe({
            next: (data) => {
                this.tarjetones = data;
                this.paginationConfig.totalItems = data.length;
                this.tableConfig.loading = false;
            },
            error: () => {
                this.tableConfig.loading = false;
            }
        });
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
    }

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

    deleteTarjeton(id: number) {
        this.openConfirm({
            title: 'Eliminar Tarjetón',
            message: '¿Estás seguro de eliminar este tarjetón?',
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.documentsService.deleteTarjeton(id).subscribe(() => {
                this.loadTarjetones();
                this.openAlert('Eliminado', 'Tarjetón eliminado correctamente.', 'success');
            });
        });
    }

    openForm() {
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
    }

    onFormSaved() {
        this.showForm = false;
        this.loadTarjetones();
        this.openAlert('Guardado', 'Tarjetón guardado exitosamente.', 'success');
    }

    openEditForm(tarjeton: Tarjeton) {
        this.selectedTarjeton = tarjeton;
        this.showEditForm = true;
    }

    closeEditForm() {
        this.showEditForm = false;
        this.selectedTarjeton = null;
    }

    onEditSaved() {
        this.showEditForm = false;
        this.selectedTarjeton = null;
        this.loadTarjetones();
        this.openAlert('Actualizado', 'Tarjetón actualizado correctamente.', 'success');
    }

    editTemplateDesign(tarjeton: Tarjeton) {
        this.router.navigate(['/documentos/tarjetones/editor', tarjeton.id]);
    }
}
