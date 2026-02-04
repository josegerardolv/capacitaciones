import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Componentes Compartidos
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { InputEnhancedComponent } from '../../../../shared/components/inputs/input-enhanced.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '@/app/shared/components/table-pagination/table-pagination.component';
import { TemplatePreviewModalComponent } from '../../components/modals/template-preview-modal/template-preview-modal.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';

// Modelos y Servicios
import { CourseTypeConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS, DocumentConfig } from '../../../../core/models/course-type-config.model';
import { CertificateTemplate } from '../../../../core/models/template.model';
import { TemplateService } from '../../templates/services/template.service';
import { CourseTypeService } from '../../../../core/services/course-type.service';

@Component({
    selector: 'app-course-type-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        UniversalIconComponent,
        InstitutionalButtonComponent,
        InputEnhancedComponent,
        InstitutionalCardComponent,
        InstitutionalTableComponent,
        BreadcrumbComponent,
        TemplatePreviewModalComponent,
        TableFiltersComponent,
        TablePaginationComponent,
        TooltipDirective
    ],
    templateUrl: './course-type-form.component.html',
    styles: []
})
export class CourseTypeFormComponent implements OnInit, AfterViewInit {
    form!: FormGroup;
    isEditMode = false;
    courseTypeId: number | null = null;
    isLoading = false;

    // Ruta de navegación
    breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Inicio', url: '/dashboard' },
        { label: 'Configuración' },
        { label: 'Tipos de Curso', url: '/config/config-cursos' },
        { label: 'Nuevo Tipo de Curso' }
    ];

    // Configuración de Campos
    registrationFields: RegistrationFieldConfig[] = [];

    // Configuración de Templates
    templates: CertificateTemplate[] = [];
    filteredTemplates: CertificateTemplate[] = [];
    selectedTemplates: CertificateTemplate[] = [];

    // Seguimiento de documentos obligatorios (Conjunto de IDs de Template)
    mandatoryDocuments: Set<number> = new Set();

    // Configuración de Tabla
    tableConfig: TableConfig = {
        selectable: true,
        hoverable: true,
        striped: false,
        loading: false,
        emptyMessage: 'No se encontraron templates'
    };

    paginationConfig: PaginationConfig = {
        pageSize: 5,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [5, 10, 20, 50],
        showInfo: true
    };

    tableColumns: TableColumn[] = [
        { key: 'name', label: 'Código / Nombre', sortable: true, width: '25%' },
        { key: 'description', label: 'Descripción', sortable: true, width: '25%' }, // Added description column
        { key: 'conceptName', label: 'Concepto de Pago', sortable: true, minWidth: '20%' },
        { key: 'mandatory', label: 'Obligatorio', align: 'center', width: '100px' }, // Se asignará en ngAfterViewInit
        { key: 'conceptCosto', label: 'Costo', sortable: true, width: '100px', align: 'right' }, // Se asignará en ngAfterViewInit
        { key: 'actions', label: 'Vista Previa', align: 'center', width: '100px' } // Se asignará en ngAfterViewInit
    ];

    @ViewChild('actionsTemplate') actionsTemplate!: any;
    @ViewChild('costTemplate') costTemplate!: any;
    @ViewChild('categoryTemplate') categoryTemplate!: any;
    @ViewChild('mandatoryTemplate') mandatoryTemplate!: any;

    // Modal de Vista Previa
    showPreviewModal = false;
    previewTemplate: CertificateTemplate | null = null;
    displayedTemplates: CertificateTemplate[] = [];

    constructor(
        private fb: FormBuilder,
        private templateService: TemplateService,
        private courseTypeService: CourseTypeService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.initFields();

        // Verificar Modo Edición
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.courseTypeId = +params['id'];
                this.breadcrumbItems[3].label = 'Editar Tipo de Curso';
                this.loadCourseType(this.courseTypeId);
            } else {
                // Modo Nuevo: Cargar templates inmediatamente
                this.loadTemplates();
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            // Asignar templates a las columnas
            const actionsCol = this.tableColumns.find(c => c.key === 'actions');
            if (actionsCol) actionsCol.template = this.actionsTemplate;

            const costCol = this.tableColumns.find(c => c.key === 'conceptCosto');
            if (costCol) costCol.template = this.costTemplate;

            const categoryCol = this.tableColumns.find(c => c.key === 'category');
            if (categoryCol) categoryCol.template = this.categoryTemplate;

            const mandatoryCol = this.tableColumns.find(c => c.key === 'mandatory');
            if (mandatoryCol) mandatoryCol.template = this.mandatoryTemplate;
        });
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            category: ['', Validators.required]
        });
    }

    // Campos que SIEMPRE deben mostrarse (Visibilidad bloqueada en TRUE)
    readonly VISIBILITY_LOCKED = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'phone'];

    // Campos que SIEMPRE deben ser obligatorios (Required bloqueado en TRUE)
    // Se removió 'paternal_lastName' y 'maternal_lastName' de aquí para permitir que sean opcionales.
    readonly REQUIREMENT_LOCKED = ['name', 'curp', 'email'];

    /**
     * Inicializa los campos combinando la configuración por defecto
     * con las reglas de negocio (bloqueos).
     */
    initFields() {
        this.registrationFields = JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_FIELDS));
        this.registrationFields.forEach(f => {
            // Regla 1: Si la visibilidad está bloqueada, forzar visible = true
            if (this.VISIBILITY_LOCKED.includes(f.fieldName)) {
                f.visible = true;
            } else {
                // Si no está bloqueada, respetar el default (usualmente false para opcionales)
                f.visible = false;
            }

            // Regla 2: Si el requerimiento está bloqueado, forzar required = true
            if (this.REQUIREMENT_LOCKED.includes(f.fieldName)) {
                f.required = true;
            }
            // Nota: Si no está bloqueado, se respeta el default del modelo o lo que el usuario configure
        });
    }

    loadCourseType(id: number) {
        this.isLoading = true;
        this.courseTypeService.getCourseTypeById(id).subscribe({
            next: (data) => {
                if (data) {
                    this.fillForm(data);
                    // Cargar templates DESPUÉS de cargar datos del curso para marcar correctamente seleccionados/obligatorios
                    this.loadTemplates(data);
                } else {
                    this.router.navigate(['/config/config-cursos']);
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading course type', err);
                this.router.navigate(['/config/config-cursos']);
            }
        });
    }

    loadTemplates(existingData?: CourseTypeConfig) {
        this.tableConfig.loading = true;
        this.templateService.getTemplates().subscribe({
            next: (data) => {
                this.templates = data;
                // Ordenar por cantidad de uso descendente
                this.templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

                this.mandatoryDocuments.clear();

                if (existingData && existingData.availableDocuments) {
                    const selectedIds = existingData.availableDocuments.map(d => d.templateId);
                    this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));

                    // 1. Restaurar obligatoriedad de lo GUARDADO (Respeta decisión previa del usuario)
                    existingData.availableDocuments.forEach(doc => {
                        if (doc.isMandatory && doc.templateId) {
                            this.mandatoryDocuments.add(doc.templateId);
                        }
                    });

                    // 2. Para los NO seleccionados (o nuevos en la lista), si son GRATUITOS, marcarlos como obligatorios por defecto.
                    // Esto asegura que si el usuario decide seleccionarlos ahora, ya vengan marcados.
                    this.templates.forEach(t => {
                        // Si NO está en los documentos guardados Y es gratuito -> Obligatorio por defecto
                        const isSaved = selectedIds.includes(t.id);
                        if (!isSaved && t.conceptCosto === 0) {
                            this.mandatoryDocuments.add(t.id);
                        }
                    });

                    if (this.selectedTemplates.length > 0) {
                        this.filteredTemplates = [...this.selectedTemplates];
                    } else {
                        this.filteredTemplates = [...this.templates];
                    }

                } else {
                    // Modo Nuevo: Todos los gratuitos son obligatorios por defecto
                    this.selectedTemplates = [];
                    // Por defecto: Los templates gratuitos son obligatorios
                    this.templates.forEach(t => {
                        if (t.conceptCosto === 0) {
                            this.mandatoryDocuments.add(t.id);
                        }
                    });

                    this.filteredTemplates = [...this.templates];
                }

                this.paginationConfig.totalItems = this.filteredTemplates.length;
                this.updatePaginatedData();
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error loading templates', err);
                this.tableConfig.loading = false;
            }
        });
    }

    fillForm(data: CourseTypeConfig) {
        this.form.patchValue({
            name: data.name,
            description: data.description,
            category: (data as any).category
        });

        if (data.registrationFields) {
            data.registrationFields.forEach(savedField => {
                const match = this.registrationFields.find(f => f.fieldName === savedField.fieldName);
                if (match) {
                    // Logic for Visibility
                    if (this.isVisibilityLocked(match)) {
                        match.visible = true; // Force visible logic
                    } else {
                        match.visible = savedField.visible;
                    }

                    // Logic for Requirement
                    if (this.isRequirementLocked(match)) {
                        match.required = true; // Force required logic
                    } else {
                        match.required = savedField.required;
                    }
                }
            });
        }
    }

    filterTemplates(query: string) {
        const term = query?.toLowerCase() || '';

        if (!term) {
            this.filteredTemplates = [...this.templates];
        } else {
            this.filteredTemplates = this.templates.filter(t =>
                t.name.toLowerCase().includes(term) ||
                (t.conceptName && t.conceptName.toLowerCase().includes(term))
            );
        }

        this.paginationConfig.currentPage = 1;
        this.paginationConfig.totalItems = this.filteredTemplates.length;
        this.updatePaginatedData();
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.displayedTemplates = this.filteredTemplates.slice(start, end);
    }

    // Nueva lógica de validación para la vista

    isVisibilityLocked(field: RegistrationFieldConfig): boolean {
        return this.VISIBILITY_LOCKED.includes(field.fieldName);
    }

    isRequirementLocked(field: RegistrationFieldConfig): boolean {
        return this.REQUIREMENT_LOCKED.includes(field.fieldName);
    }

    toggleField(field: RegistrationFieldConfig) {
        // Si la visibilidad está bloqueada, no hacer nada
        if (this.isVisibilityLocked(field)) {
            return;
        }
        field.visible = !field.visible;
    }

    toggleRequired(field: RegistrationFieldConfig, event: Event) {
        event.stopPropagation();

        // Si el requerimiento está bloqueado, no permitir cambios
        if (this.isRequirementLocked(field)) return;

        field.required = !field.required;
    }

    // Eliminamos isFieldLocked ya que se reemplaza por las 2 funciones específicas anterior
    // isFieldLocked(field: RegistrationFieldConfig): boolean { ... }



    onSelectionChange(event: any) {
        this.selectedTemplates = event.selectedItems;
    }

    openPreview(template: CertificateTemplate) {
        this.previewTemplate = template;
        this.showPreviewModal = true;
    }

    toggleMandatory(templateId: number, event: Event) {
        event.stopPropagation();
        if (this.mandatoryDocuments.has(templateId)) {
            this.mandatoryDocuments.delete(templateId);
        } else {
            this.mandatoryDocuments.add(templateId);
        }
    }

    isMandatory(templateId: number): boolean {
        return this.mandatoryDocuments.has(templateId);
    }

    onSave() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.value;

        const availableDocuments: DocumentConfig[] = this.selectedTemplates.map(t => ({
            id: `doc_temp_${t.id}`, // Lógica de generación
            name: t.name,
            description: t.description || t.name,
            templateId: t.id,
            cost: t.conceptCosto || 0,
            requiresApproval: false,
            isMandatory: this.mandatoryDocuments.has(t.id)
        }));

        const hasPaidDocument = availableDocuments.some(doc => doc.cost && doc.cost > 0);
        const paymentType = hasPaidDocument ? 'De Paga' : 'Gratuito';

        const config: Partial<CourseTypeConfig> = {
            ...formValue,
            status: 'Activo',
            paymentType: paymentType,
            registrationFields: this.registrationFields,
            availableDocuments: availableDocuments
        };

        this.isLoading = true;

        if (this.isEditMode && this.courseTypeId) {
            this.courseTypeService.updateCourseType(this.courseTypeId, config).subscribe({
                next: () => {
                    this.router.navigate(['/config/config-cursos']);
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error updating', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.courseTypeService.createCourseType(config as any).subscribe({
                next: () => {
                    this.router.navigate(['/config/config-cursos']);
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error creating', err);
                    this.isLoading = false;
                }
            });
        }
    }

    onCancel() {
        this.router.navigate(['/config/config-cursos']);
    }
}
