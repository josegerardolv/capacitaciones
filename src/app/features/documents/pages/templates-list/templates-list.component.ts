import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CertificateTemplate } from '../../../../core/models/template.model';
import { TemplateService } from '../../services/template.service';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';

@Component({
    selector: 'app-templates-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        UniversalIconComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent
    ],
    templateUrl: './templates-list.component.html'
})
export class TemplatesListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('categoryTemplate', { static: true }) categoryTemplate!: TemplateRef<any>;

    templates: CertificateTemplate[] = [];

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
        private templateService: TemplateService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.initColumns();
        this.loadTemplates();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '200px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            { 
                key: 'category', 
                label: 'Categoría', 
                sortable: true, 
                minWidth: '150px',
                template: this.categoryTemplate
            },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '200px',
                template: this.actionsTemplate
            }
        ];
    }

    loadTemplates() {
        this.tableConfig.loading = true;
        this.templateService.getTemplates().subscribe({
            next: (data) => {
                this.templates = data;
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

    createNewTemplate() {
        this.router.navigate(['/documentos/templates/editor']);
    }

    editTemplate(template: CertificateTemplate) {
        this.router.navigate(['/documentos/templates/editor', template.id]);
    }

    duplicateTemplate(template: CertificateTemplate) {
        this.openConfirm({
            title: 'Duplicar Template',
            message: `¿Deseas crear una copia de "${template.name}"?`,
            type: 'info',
            confirmText: 'Duplicar',
            cancelText: 'Cancelar'
        }, () => {
            this.templateService.duplicateTemplate(template.id).subscribe(() => {
                this.loadTemplates();
                this.openAlert('Duplicado', 'Template duplicado exitosamente.', 'success');
            });
        });
    }

    previewTemplate(template: CertificateTemplate) {
        this.router.navigate(['/documentos/templates/preview', template.id]);
    }

    deleteTemplate(template: CertificateTemplate) {
        this.openConfirm({
            title: 'Eliminar Template',
            message: `¿Estás seguro de eliminar "${template.name}"? Esta acción no se puede deshacer.`,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.templateService.deleteTemplate(template.id).subscribe(() => {
                this.loadTemplates();
                this.openAlert('Eliminado', 'Template eliminado correctamente.', 'success');
            });
        });
    }

    goToCertificates() {
        this.router.navigate(['/documentos/certificados']);
    }

    goToTarjetones() {
        this.router.navigate(['/documentos/tarjetones']);
    }
}
