import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TemplateService } from '../../services/template.service';
import { Concept, TemplateDocument, CreateTemplateDocumentPayload, UpdateTemplateDocumentPayload } from '../../../../../core/models/template.model';
// ConceptService removed, logic integrated in TemplateService
import { InstitutionalTableComponent, TableColumn, TableConfig, SortEvent } from '../../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../../shared/components/table-pagination/table-pagination.component';
import { TooltipDirective } from '../../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../../shared/components/modals/alert-modal.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalFormComponent } from '../../../../../shared/components/forms/modal-form.component';
import { InputEnhancedComponent } from '../../../../../shared/components/inputs/input-enhanced.component';
import { InstitutionalCardComponent } from '../../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { SelectComponent, SelectOption } from '../../../../../shared/components/inputs/select.component';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { BreadcrumbComponent } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.model';
// import { SelectComponent } from '@/app/shared/components'; // Duplicate import removed
// SelectSearchComponent removed to respect shared component constraints
// import { SelectSearchComponent, SelectSearchOption } from '../../../../../shared/components/inputs/select-search.component';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { UmasToPesosPipe } from '../../../../../shared/pipes/umas-to-pesos.pipe';

@Component({
    selector: 'app-templates-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ModalFormComponent,
        InputEnhancedComponent,
        SelectComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalCardComponent,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        InstitutionalButtonComponent,
        UniversalIconComponent,
        BreadcrumbComponent,
        TableFiltersComponent,
        UmasToPesosPipe
    ],
    templateUrl: './templates-list.component.html'
})
export class TemplatesListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('categoryTemplate', { static: true }) categoryTemplate!: TemplateRef<any>;
    @ViewChild('conceptTemplate', { static: true }) conceptTemplate!: TemplateRef<any>;
    @ViewChild('costTemplate', { static: true }) costTemplate!: TemplateRef<any>;

    allTemplates: TemplateDocument[] = [];
    filteredTemplates: TemplateDocument[] = [];
    templates: TemplateDocument[] = [];

    // Estado de ordenamiento y búsqueda
    sortColumn: string | null = null;
    sortDirection: 'asc' | 'desc' | null = null;
    lastSearchTerm: string = '';


    concepts: Concept[] = [];
    conceptOptions: SelectOption[] = [];

    // Form & modal state (adaptado desde CertificatesListComponent)
    form!: FormGroup;
    isSaving = false;
    createModalOpen = false;
    editModalOpen = false;
    selectedTemplate: TemplateDocument | null = null;

    tableConfig: TableConfig = {
        loading: true,
        striped: true, // cambia el color de las filas alternas
        hoverable: true,
        localSort: false // Desactivamos sort local para manejarlo globalmente antes de paginar
    };

    tableColumns: TableColumn[] = [];
    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Inicio', url: '/dashboard' },
        { label: 'Configuración' },
        { label: 'Formatos de Templates' }
    ];

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
            { key: 'paymentConcept', label: 'Concepto (Siox)', sortable: false, minWidth: '200px', template: this.conceptTemplate },
            { key: 'paymentConcept', label: 'Costo', sortable: false, minWidth: '100px', align: 'right', template: this.costTemplate },
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
                this.allTemplates = data;
                this.filterData('');
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

    openCreateForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            conceptId: [null, Validators.required],
            tipo: ['GENERAL'],
            description: [''],
            isFree: [false]
        });
        this.setupValidatorLogic();
        this.createModalOpen = true;
    }

    openEditForm(template: TemplateDocument) {
        this.selectedTemplate = template;
        const firstConcept = template.paymentConcept;
        const isFree = !firstConcept;
        this.form = this.fb.group({
            name: [template.name, Validators.required],
            conceptId: [firstConcept?.id || null, isFree ? [] : Validators.required],
            tipo: [template.category || 'GENERAL'],
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

        const payload: CreateTemplateDocumentPayload = {
            name: value.name,
            description: value.description || '',
            category: value.tipo || 'GENERAL'
        };

        if (!value.isFree && value.conceptId) {
            payload.paymentConcept = value.conceptId;
        }

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

        const payload: UpdateTemplateDocumentPayload = {
            name: value.name,
            description: value.description || '',
            category: value.tipo || 'GENERAL'
        };

        if (!value.isFree && value.conceptId) {
            payload.paymentConcept = value.conceptId;
        } else {
            payload.paymentConcept = null as any; // Para que el backend sepa que debe borrarse
        }

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

    editTemplateDesign(template: TemplateDocument) {
        this.router.navigate(['/config/templates/editor', template.id]);
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig = {
            ...this.paginationConfig,
            currentPage: event.page,
            pageSize: event.pageSize
        };
        this.updatePaginatedData();
    }

    filterData(query: string) {
        this.lastSearchTerm = query.toLowerCase().trim();

        if (!this.lastSearchTerm) {
            this.filteredTemplates = [...this.allTemplates];
        } else {
            this.filteredTemplates = this.allTemplates.filter(t =>
                t.name.toLowerCase().includes(this.lastSearchTerm) ||
                (t.paymentConcept?.concepto || '').toLowerCase().includes(this.lastSearchTerm) ||
                (t.description || '').toLowerCase().includes(this.lastSearchTerm)
            );
        }

        // Aplicar ordenamiento actual si existe
        if (this.sortColumn && this.sortDirection) {
            this.applySort();
        }

        // Resetear a página 1 cuando se filtra y actualizar total
        this.paginationConfig = {
            ...this.paginationConfig,
            currentPage: 1,
            totalItems: this.filteredTemplates.length
        };
        this.updatePaginatedData();
    }

    onSort(event: SortEvent) {
        this.sortColumn = event.column;
        this.sortDirection = event.direction;
        this.applySort();
        this.updatePaginatedData();
    }

    applySort() {
        if (!this.sortColumn || !this.sortDirection) return;

        this.filteredTemplates.sort((a: any, b: any) => {
            const valueA = this.getNestedValue(a, this.sortColumn!);
            const valueB = this.getNestedValue(b, this.sortColumn!);

            let comparison = 0;
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                comparison = valueA.localeCompare(valueB);
            } else {
                if (valueA < valueB) comparison = -1;
                if (valueA > valueB) comparison = 1;
            }

            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.templates = this.filteredTemplates.slice(start, end);
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
        this.router.navigate(['/config/templates/editor']);
    }

    editTemplate(template: TemplateDocument) {
        this.router.navigate(['/config/templates/editor', template.id]);
    }

    duplicateTemplate(template: TemplateDocument) {
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

    previewTemplate(template: TemplateDocument) {
        this.router.navigate(['/config/templates/preview', template.id]);
    }

    deleteTemplate(template: TemplateDocument) {
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
