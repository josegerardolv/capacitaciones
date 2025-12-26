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
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalFormComponent } from '../../../../shared/components/forms/modal-form.component';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SelectComponent } from '@/app/shared/components';
@Component({
    selector: 'app-templates-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageHeaderComponent,
        ReactiveFormsModule,
        ModalFormComponent,
        InputComponent,
        UniversalIconComponent,
        SelectComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalCardComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        InstitutionalButtonComponent
    ],
    templateUrl: './templates-list.component.html'
})
export class TemplatesListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('categoryTemplate', { static: true }) categoryTemplate!: TemplateRef<any>;

    templates: CertificateTemplate[] = [];
    // Alias para la plantilla HTML que espera "certificates"
    get certificates(): CertificateTemplate[] {
        return this.templates;
    }

    // Form & modal state (adaptado desde CertificatesListComponent)
    form!: FormGroup;
    isSaving = false;
    createModalOpen = false;
    editModalOpen = false;
    selectedTemplate: CertificateTemplate | null = null;
    actionButtonConfig: any = { text: 'Nuevo Template', icon: 'add', onClick: () => this.openForm() };

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
        private router: Router,
        private fb: FormBuilder
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

    // Form helpers and CRUD adapted to certificates-style UI
    private defaultTemplate() {
        return {
            pageConfig: this.templateService.getDefaultPageConfig(),
            elements: [],
            variables: []
        };
    }

    openForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            claveConcepto: ['', Validators.required],
            tipo: [''],
            description: ['']
        });
        this.createModalOpen = true;
    }

    openEditForm(template: CertificateTemplate) {
        this.selectedTemplate = template;
        this.form = this.fb.group({
            name: [template.name, Validators.required],
            claveConcepto: [template.claveConcepto, Validators.required],
            tipo: [(template as any)['tipo'] || ''],
            description: [template.description || '']
        });
        this.editModalOpen = true;
    }

    get nameControl(): FormControl | undefined {
        return this.form ? (this.form.get('name') as FormControl) : undefined;
    }

    get claveConceptoControl(): FormControl | undefined {
        return this.form ? (this.form.get('claveConcepto') as FormControl) : undefined;
    }

    get descriptionControl(): FormControl | undefined {
        return this.form ? (this.form.get('description') as FormControl) : undefined;
    }

    get tipoControl(): FormControl | undefined {
        return this.form ? (this.form.get('tipo') as FormControl) : undefined;
    }

    onCreateSubmit(value: any) {
        this.isSaving = true;
        const payload: any = { ...value, pageConfig: this.defaultTemplate().pageConfig, elements: [], variables: [] };
        this.templateService.createTemplate(payload).subscribe({
            next: () => {
                this.isSaving = false;
                this.createModalOpen = false;
                this.loadTemplates();
                this.openAlert('Guardado', 'Template guardado exitosamente.', 'success');
            },
            error: () => {
                this.isSaving = false;
            }
        });
    }

    onEditSubmit(value: any) {
        if (!this.selectedTemplate) return;
        this.isSaving = true;
        this.templateService.updateTemplate(this.selectedTemplate.id, value).subscribe({
            next: () => {
                this.isSaving = false;
                this.editModalOpen = false;
                this.selectedTemplate = null;
                this.loadTemplates();
                this.openAlert('Actualizado', 'Template actualizado correctamente.', 'success');
            },
            error: () => {
                this.isSaving = false;
            }
        });
    }

    // Método para eliminar templates por id si es necesario (no expuesto en UI)
    private deleteTemplateById(id: number) {
        this.openConfirm({
            title: 'Eliminar Template',
            message: '¿Estás seguro de eliminar este template?',
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.templateService.deleteTemplate(id).subscribe(() => {
                this.loadTemplates();
                this.openAlert('Eliminado', 'Template eliminado correctamente.', 'success');
            });
        });
    }

    editTemplateDesign(template: CertificateTemplate) {
        this.router.navigate(['/documentos/templates/editor', template.id]);
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

    closeModal() {
        this.createModalOpen = false;
        this.editModalOpen = false;
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

    // Navegación a editor/preview se maneja vía rutas de templates
}
