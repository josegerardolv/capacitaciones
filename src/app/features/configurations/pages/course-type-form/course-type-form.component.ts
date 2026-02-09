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
import { SelectComponent } from '../../../../shared/components/inputs/select.component';

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
        SelectComponent,
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

    courseTypesOptions: any[] = [
        { value: 'Licencia', label: 'Licencia' },
        { value: 'Curso', label: 'Curso' },
        { value: 'Taller', label: 'Taller' },
        { value: 'Diplomado', label: 'Diplomado' },
        { value: 'Certificación', label: 'Certificación' },
        { value: 'Plática', label: 'Plática' },
        { value: 'Otro', label: 'Otro' }
    ];

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            type: ['', Validators.required] // Changed from category
        });
    }

    get typeControl(): FormControl {
        return this.form.get('type') as FormControl;
    }

    // Campos que SIEMPRE deben mostrarse (Visibilidad bloqueada en TRUE)
    readonly VISIBILITY_LOCKED = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'phone'];

    // Campos que SIEMPRE deben ser obligatorios (Required bloqueado en TRUE)
    readonly REQUIREMENT_LOCKED_MANDATORY = ['name', 'curp',];

    // Campos que SIEMPRE deben ser opcionales (Required bloqueado en FALSE - No se puede activar)
    readonly REQUIREMENT_LOCKED_OPTIONAL = ['paternal_lastName', 'maternal_lastName'];

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
                f.visible = false;
            }

            // Regla 2: Bloqueo de Requerido (Mandatory vs Optional)
            if (this.REQUIREMENT_LOCKED_MANDATORY.includes(f.fieldName)) {
                f.required = true;
            } else if (this.REQUIREMENT_LOCKED_OPTIONAL.includes(f.fieldName)) {
                f.required = false;
            }
            // Si no está bloqueado, respeta el default
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
        const existingType = data.type || (data as any).category;

        // Si el tipo existente no está en las opciones, agregarlo para mostrarlo
        if (existingType && !this.courseTypesOptions.find(o => o.value === existingType)) {
            this.courseTypesOptions = [
                ...this.courseTypesOptions,
                { value: existingType, label: existingType }
            ];
        }

        this.form.patchValue({
            name: data.name,
            description: data.description,
            type: existingType
        });

        // Cargar configuración guardada
        // El backend nos devuelve 'courseConfigField' con los IDs (requirementFieldPerson)
        const savedConfigFields = (data as any).courseConfigField || data.registrationFields;

        if (savedConfigFields) {
            savedConfigFields.forEach((savedField: any) => {
                let match = null;

                // 1. Intentar buscar por ID (Backend)
                if (savedField.requirementFieldPerson) {
                    match = this.registrationFields.find(f => f.requirementId === savedField.requirementFieldPerson);
                }
                // 2. Fallback: Buscar por nombre (Frontend antiguo o cache)
                else if (savedField.fieldName) {
                    match = this.registrationFields.find(f => f.fieldName === savedField.fieldName);
                }

                if (match) {
                    // Si existe el ID en la respuesta, el campo es Visible
                    const isVisible = savedField.visible !== undefined ? savedField.visible : true;
                    const isRequired = savedField.required;

                    // Aplicar reglas de bloqueo (Business Rules)
                    if (this.isVisibilityLocked(match)) {
                        match.visible = true;
                    } else {
                        match.visible = isVisible;
                    }

                    if (this.REQUIREMENT_LOCKED_MANDATORY.includes(match.fieldName)) {
                        match.required = true;
                    } else if (this.REQUIREMENT_LOCKED_OPTIONAL.includes(match.fieldName)) {
                        match.required = false;
                    } else {
                        match.required = isRequired;
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
        return this.REQUIREMENT_LOCKED_MANDATORY.includes(field.fieldName) ||
            this.REQUIREMENT_LOCKED_OPTIONAL.includes(field.fieldName);
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
            id: `doc_temp_${t.id}`,
            name: t.name,
            description: t.description || t.name,
            templateId: t.id,
            cost: t.conceptCosto || 0,
            hasCost: (t.conceptCosto || 0) > 0, // Asegurar compatibilidad
            requiresApproval: false,
            isMandatory: this.mandatoryDocuments.has(t.id)
        }));

        const hasPaidDocument = availableDocuments.some(doc => doc.cost !== undefined && doc.cost > 0);
        const paymentType = hasPaidDocument ? 'De Paga' : 'Gratuito';

        // Lógica manual recuperada (según solicitud del usuario)
        const courseConfigField = this.registrationFields
            .filter(f => f.visible && f.requirementId)
            .map(f => ({
                requirementFieldPerson: f.requirementId,
                required: f.required,
                typeCourse: this.courseTypeId
            }));

        const config: any = {
            name: formValue.name,
            description: formValue.description,
            type: formValue.type,
            // paymentType: paymentType, // El backend calcula esto o no lo requiere en body? (Lo dejamos comentado si antes daba error, o lo enviamos si es necesario)
            // Se envía courseConfigField directo
            courseConfigField: courseConfigField
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
