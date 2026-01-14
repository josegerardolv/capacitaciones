import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CertificateTemplate } from '../../../../core/models/template.model';
import { TemplateService } from '../../services/template.service';
import { Concept } from '../../../../core/models/template.model';
// ConceptService removed, logic integrated in TemplateService
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
import { SelectComponent, SelectOption } from '../../../../shared/components/inputs/select.component';
// import { SelectComponent } from '@/app/shared/components'; // Duplicate import removed
// SelectSearchComponent removed to respect shared component constraints
// import { SelectSearchComponent, SelectSearchOption } from '../../../../shared/components/inputs/select-search.component';

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
        InputComponent,
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
    @ViewChild('conceptTemplate', { static: true }) conceptTemplate!: TemplateRef<any>;
    @ViewChild('costTemplate', { static: true }) costTemplate!: TemplateRef<any>;

    templates: CertificateTemplate[] = [];
    concepts: Concept[] = [];
    conceptOptions: SelectOption[] = [];

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
    ) { }

    ngOnInit(): void {
        this.initColumns();
        this.loadTemplates();
        this.loadConcepts();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '200px' },
            { key: 'conceptName', label: 'Concepto', sortable: true, minWidth: '200px', template: this.conceptTemplate },
            { key: 'claveConcepto', label: 'Clave', sortable: true, minWidth: '120px' },
            { key: 'conceptCosto', label: 'Costo', sortable: true, minWidth: '100px', align: 'right', template: this.costTemplate },
            {
                key: 'category',
                label: 'Categoría',
                sortable: true,
                minWidth: '150px',
                template: this.categoryTemplate
            },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
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

    loadConcepts() {
        this.templateService.getConcepts().subscribe(data => {
            this.concepts = data;
            this.conceptOptions = data.map(c => ({
                value: c.id,
                label: `${c.clave} - ${c.concepto}`
            }));
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
            conceptId: [null, Validators.required],
            tipo: [''], // Category
            description: [''],
            isFree: [false]
        });
        this.setupValidatorLogic();
        this.createModalOpen = true;
    }

    openEditForm(template: CertificateTemplate) {
        this.selectedTemplate = template;
        const isFree = !template.conceptId;
        this.form = this.fb.group({
            name: [template.name, Validators.required],
            conceptId: [template.conceptId || null, isFree ? [] : Validators.required],
            tipo: [template.category || ''],
            description: [template.description || ''],
            isFree: [isFree]
        });
        this.setupValidatorLogic();
        this.editModalOpen = true;
    }

    private setupValidatorLogic() {
        this.form.get('isFree')?.valueChanges.subscribe(isFree => {
            const conceptCtrl = this.form.get('conceptId');
            if (isFree) {
                conceptCtrl?.clearValidators();
                conceptCtrl?.setValue(null);
            } else {
                conceptCtrl?.setValidators(Validators.required);
            }
            conceptCtrl?.updateValueAndValidity();
        });
    }

    get nameControl(): FormControl { return this.form.get('name') as FormControl; }
    get conceptIdControl(): FormControl { return this.form.get('conceptId') as FormControl; }
    get descriptionControl(): FormControl { return this.form.get('description') as FormControl; }
    get tipoControl(): FormControl { return this.form.get('tipo') as FormControl; }
    get isFreeControl(): FormControl { return this.form.get('isFree') as FormControl; }

    onCreateSubmit(value: any) {
        if (this.form.invalid) return;
        this.isSaving = true;

        let selectedConcept = null;
        if (!value.isFree) {
            selectedConcept = this.concepts.find(c => c.id === value.conceptId);
        }

        const payload: any = {
            ...value,
            // Si es gratuito, mandamos campos vacíos/null
            claveConcepto: selectedConcept?.clave || '',
            conceptId: selectedConcept?.id || null,
            conceptName: selectedConcept?.concepto || (value.isFree ? 'Gratuito' : ''),
            conceptClave: selectedConcept?.clave || '',
            conceptCosto: selectedConcept?.costo || 0,
            category: value.tipo,
            pageConfig: this.defaultTemplate().pageConfig,
            elements: [],
            variables: []
        };
        // Remove virtual field
        delete payload.isFree;

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
        if (!this.selectedTemplate || this.form.invalid) return;
        this.isSaving = true;

        let selectedConcept = null;
        if (!value.isFree) {
            selectedConcept = this.concepts.find(c => c.id === value.conceptId);
        }

        const payload: any = {
            ...value,
            claveConcepto: selectedConcept?.clave || '',
            conceptId: selectedConcept?.id || null,
            conceptName: selectedConcept?.concepto || (value.isFree ? 'Gratuito' : ''),
            conceptClave: selectedConcept?.clave || '',
            conceptCosto: selectedConcept?.costo || 0,
            category: value.tipo
        };
        delete payload.isFree;

        this.templateService.updateTemplate(this.selectedTemplate.id, payload).subscribe({
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
}
