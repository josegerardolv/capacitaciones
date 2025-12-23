import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Certificate } from '../../../../core/models/document.model';
import { DocumentsService } from '../../services/documents.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ModalFormComponent } from '../../../../shared/components/forms/modal-form.component';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';

@Component({
    selector: 'app-certificates-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageHeaderComponent,
            ReactiveFormsModule,
            ModalFormComponent,
            InputComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalCardComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        InstitutionalButtonComponent
    ],
    templateUrl: './certificates-list.component.html'
})
export class CertificatesListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;


    certificates: Certificate[] = [];

    showForm = false;
    showEditForm = false;
    selectedCertificate: Certificate | null = null;
    // Form state
    form!: FormGroup;
    isSaving = false;
    createModalOpen = false;
    editModalOpen = false;
    actionButtonConfig: any = { text: 'Nuevo Certificado', icon: 'add', onClick: () => this.openForm() };

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
        private router: Router,
        private fb: FormBuilder
    ) {}

    // Helper para template por defecto del certificado
    private defaultTemplate() {
        return {
            pageConfig: {
                width: 279.4,
                height: 215.9,
                orientation: 'landscape',
                margins: { top: 20, right: 20, bottom: 20, left: 20 },
                backgroundColor: '#ffffff'
            },
            elements: [],
            variables: []
        };
    }

    ngOnInit(): void {
        this.initColumns();
        this.loadCertificates();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '180px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    loadCertificates() {
        this.tableConfig.loading = true;
        this.documentsService.getCertificates().subscribe({
            next: (data) => {
                this.certificates = data;
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

    deleteCertificate(id: number) {
        this.openConfirm({
            title: 'Eliminar Certificado',
            message: '¿Estás seguro de eliminar este certificado?',
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.documentsService.deleteCertificate(id).subscribe(() => {
                this.loadCertificates();
                this.openAlert('Eliminado', 'Certificado eliminado correctamente.', 'success');
            });
        });
    }

    openForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
        this.createModalOpen = true;
    }

    closeForm() {
        this.createModalOpen = false;
    }

    onFormSaved() {
        this.showForm = false;
        this.loadCertificates();
        this.openAlert('Guardado', 'Certificado guardado exitosamente.', 'success');
    }

    openEditForm(certificate: Certificate) {
        this.selectedCertificate = certificate;
        this.form = this.fb.group({
            name: [certificate.name, Validators.required],
            description: [certificate.description || '']
        });
        this.editModalOpen = true;
    }

    get nameControl(): FormControl | undefined {
        return this.form ? (this.form.get('name') as FormControl) : undefined;
    }

    get descriptionControl(): FormControl | undefined {
        return this.form ? (this.form.get('description') as FormControl) : undefined;
    }

    closeEditForm() {
        this.editModalOpen = false;
        this.selectedCertificate = null;
    }

    onCreateSubmit(value: any) {
        this.isSaving = true;
        const payload = { ...value, template: this.defaultTemplate() };
        this.documentsService.createCertificate(payload).subscribe({
            next: () => {
                this.isSaving = false;
                this.createModalOpen = false;
                this.loadCertificates();
                this.openAlert('Guardado', 'Certificado guardado exitosamente.', 'success');
            },
            error: () => {
                this.isSaving = false;
            }
        });
    }

    onEditSubmit(value: any) {
        if (!this.selectedCertificate) return;
        this.isSaving = true;
        this.documentsService.updateCertificate(this.selectedCertificate.id, value).subscribe({
            next: () => {
                this.isSaving = false;
                this.editModalOpen = false;
                this.selectedCertificate = null;
                this.loadCertificates();
                this.openAlert('Actualizado', 'Certificado actualizado correctamente.', 'success');
            },
            error: () => {
                this.isSaving = false;
            }
        });
    }

    onEditSaved() {
        this.showEditForm = false;
        this.selectedCertificate = null;
        this.loadCertificates();
        this.openAlert('Actualizado', 'Certificado actualizado correctamente.', 'success');
    }

    editTemplateDesign(certificate: Certificate) {
        this.router.navigate(['/documentos/certificados/editor', certificate.id]);
    }
}
