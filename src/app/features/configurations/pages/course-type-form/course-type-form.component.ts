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
import { TemplateDocument } from '../../../../core/models/template.model';
import { TemplateService } from '../../templates/services/template.service';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { CoursesService } from '../../../cursos/services/courses.service';
import { RequirementsService } from '../../../../core/services/requirements.service';
import { SelectComponent } from '../../../../shared/components/inputs/select.component';
import { REQUIREMENT_FIELD_NAMES, normalizeFieldName } from '../../../../core/constants/requirement-names.constants';
import { UmasToPesosPipe } from '../../../../shared/pipes/umas-to-pesos.pipe';

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
        TooltipDirective,
        UmasToPesosPipe
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

    // Almacena los requisitos traídos del backend para mapeo
    backendRequirements: any[] = [];

    // Configuración de Templates
    templates: TemplateDocument[] = [];
    filteredTemplates: TemplateDocument[] = [];
    selectedTemplates: TemplateDocument[] = [];

    // Seguimiento de documentos obligatorios (Conjunto de IDs de Template)
    mandatoryDocuments: Set<number> = new Set();

    // Conjunto de IDs de Template que ya fueron guardados (No Editables)
    savedTemplateIds: Set<number> = new Set();

    // Mapeo entre templateId y el ID de la relación (document_course_id)
    documentCoursePivotIds: Map<number, number> = new Map();

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
        { key: 'description', label: 'Descripción', sortable: true, width: '25%' },
        { key: 'paymentConcept', label: 'Concepto de Pago', sortable: false, minWidth: '20%' },
        { key: 'mandatory', label: 'Obligatorio', align: 'center', width: '100px' },
        { key: 'cost', label: 'Costo', sortable: false, width: '100px', align: 'right' },
        { key: 'actions', label: 'Vista Previa', align: 'center', width: '100px' }
    ];

    @ViewChild('actionsTemplate') actionsTemplate!: any;
    @ViewChild('costTemplate') costTemplate!: any;
    @ViewChild('categoryTemplate') categoryTemplate!: any;
    @ViewChild('mandatoryTemplate') mandatoryTemplate!: any;
    @ViewChild('conceptTemplate') conceptTemplate!: any;

    // Modal de Vista Previa
    showPreviewModal = false;
    previewTemplate: TemplateDocument | null = null;
    displayedTemplates: TemplateDocument[] = [];
    lockedTemplates: any[] = [];

    // Modal de templates
    showTemplateModal = false;
    tempSelectedTemplates: any[] = [];

    constructor(
        private fb: FormBuilder,
        private templateService: TemplateService,
        private courseTypeService: CourseTypeService,
        private coursesService: CoursesService, // Inyectamos CoursesService para verificar uso
        private requirementsService: RequirementsService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.filteredTypeOptions = [...this.courseTypesOptions];

        // 1. Cargar Requisitos del Backend primero
        this.requirementsService.getRequirements().subscribe({
            next: (reqs) => {
                this.backendRequirements = reqs;
                this.initFields(); // Inicializar campos combinando Default + Backend

                // 2. Revisar parámetros de ruta (Modo Edición)
                this.route.params.subscribe(params => {
                    if (params['id']) {
                        this.isEditMode = true;
                        this.courseTypeId = +params['id'];
                        this.breadcrumbItems[3].label = 'Editar Tipo de Curso';
                        this.loadCourseType(this.courseTypeId);
                    } else {
                        // Modo Nuevo: Cargar templates inmediatamente
                        // (Los campos ya se inicializaron en initFields)
                        this.loadTemplates();
                    }
                });
            },
            error: (err) => {
                console.error('Error loading requirements:', err);
                // Fallback: Inicializar con defaults si falla backend
                this.initFields();
                // Continuar flujo (aunque sin IDs dinámicos, el usuario podrá ver algo)
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            // Asignar templates a las columnas
            const actionsCol = this.tableColumns.find(c => c.key === 'actions');
            if (actionsCol) actionsCol.template = this.actionsTemplate;

            const costCol = this.tableColumns.find(c => c.key === 'cost');
            if (costCol) costCol.template = this.costTemplate;

            const categoryCol = this.tableColumns.find(c => c.key === 'category');
            if (categoryCol) categoryCol.template = this.categoryTemplate;

            const mandatoryCol = this.tableColumns.find(c => c.key === 'mandatory');
            if (mandatoryCol) mandatoryCol.template = this.mandatoryTemplate;

            const conceptCol = this.tableColumns.find(c => c.key === 'paymentConcept');
            if (conceptCol) conceptCol.template = this.conceptTemplate;
        });
    }

    // CATALOGO DE TIPOS DE CURSO
    // Nota: Si necesitamos agregar un nuevo tipo (ej. Seminario), solo agregarlo a esta lista.
    // El valor seleccionado se guardará automáticamente en la base de datos.
    courseTypesOptions: any[] = [
        { value: 'Licencia', label: 'Licencia' },
        { value: 'Curso', label: 'Curso' },
        { value: 'Taller', label: 'Taller' },
        { value: 'Diplomado', label: 'Diplomado' },
        { value: 'Certificación', label: 'Certificación' },
        { value: 'Plática', label: 'Plática' }
    ];

    // Autocomplete Logic
    showTypeDropdown = false;
    filteredTypeOptions: any[] = [];

    filterTypes(query: string) {
        const term = query.toLowerCase();
        this.filteredTypeOptions = this.courseTypesOptions.filter(opt =>
            opt.label.toLowerCase().includes(term)
        );
        this.showTypeDropdown = true;
    }

    handleTypeInput(event: any) {
        // Safe casting/access for template strict mode
        const value = event?.target?.value || '';
        this.filterTypes(value);
    }

    selectType(option: any) {
        this.typeControl.setValue(option.value);
        this.showTypeDropdown = false;
    }

    onTypeFocus() {
        if (this.isLockedByUsage) return;
        // Al enfocar, mostramos todas las opciones o filtramos por lo que haya escrito
        const currentVal = this.typeControl.value || '';
        this.filterTypes(currentVal);
        this.showTypeDropdown = true;
    }

    onTypeBlur() {
        // Retrasamos el cierre para permitir el click en la opción
        setTimeout(() => {
            const currentVal = this.typeControl.value;
            // Validación Estricta: Si el valor actual no coincide EXACTAMENTE con una opción, limpiar
            const match = this.courseTypesOptions.find(opt => opt.value === currentVal);

            if (!match) {
                // Si no es válido, reseteamos el control (o lo dejamos inválido si se prefiere)
                // El requerimiento es "escribir y solo esos permitir", así que limpiamos si no es válido
                this.typeControl.setValue(null);
            }
            this.showTypeDropdown = false;
        }, 200);
    }

    initForm() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            type: ['', Validators.required]
        });
    }

    get typeControl(): FormControl {
        return this.form.get('type') as FormControl;
    }

    // Campos que SIEMPRE deben mostrarse (Visibilidad bloqueada en TRUE)
    // Email y Phone siempre visibles por solicitud del usuario.
    readonly VISIBILITY_LOCKED = ['name', 'curp', 'email', 'phone', 'maternal_lastName', 'paternal_lastName'];

    // Campos que SIEMPRE deben ser obligatorios (Required bloqueado en TRUE)
    readonly REQUIREMENT_LOCKED_MANDATORY = ['name', 'curp', 'email'];

    // Campos que SIEMPRE deben ser opcionales (Required bloqueado en FALSE - No se puede activar)
    readonly REQUIREMENT_LOCKED_OPTIONAL = ['paternal_lastName', 'maternal_lastName'];

    /**
     * Inicializa los campos combinando la configuración por defecto (Base)
     * con los requisitos dinámicos del Backend.
     */
    initFields() {
        // 1. Clonar los campos por defecto del MODELO (Ahora es la fuente de verdad)
        this.registrationFields = DEFAULT_REGISTRATION_FIELDS.map(f => ({ ...f }));

        // 2. Mapear requisitos del Backend a los campos existentes usando NOMBRES (Auto-descubrimiento)
        this.backendRequirements.forEach(req => {
            const backendName = req.fieldName.trim();
            const normalizedBackend = normalizeFieldName(backendName);

            // Buscar coincidencia en nuestro mapa de constantes y campos existentes
            // Mejorado con búsqueda "flexible" (si el nombre del backend es parte del valor o viceversa)
            let matchKey: string | null = null;
            Object.entries(REQUIREMENT_FIELD_NAMES).forEach(([key, value]) => {
                const normValue = normalizeFieldName(value);
                if (
                    value.toLowerCase() === backendName.toLowerCase() ||
                    normValue === normalizedBackend ||
                    normalizedBackend.startsWith(normValue) || // ej: "telefon_movil" coincide con "telefon"
                    normValue.startsWith(normalizedBackend)    // ej: "telefono" coincide con "telefon"
                ) {
                    matchKey = key.toLowerCase();
                }
            });

            // Buscar si ya existe en nuestra lista predefinida
            const existingField = this.registrationFields.find(f =>
                f.fieldName === matchKey ||
                normalizeFieldName(f.label) === normalizedBackend ||
                f.label.toLowerCase() === backendName.toLowerCase() ||
                (matchKey && f.fieldName === matchKey)
            );

            if (existingField) {
                // Sincronizar ID del backend
                existingField.requirementId = req.id;
                // Si el nombre del backend es ligeramente diferente, actualizamos la etiqueta para que el usuario no se confunda
                existingField.label = req.fieldName;
            } else {
                // Si es un campo totalmente nuevo del backend (no está en el modelo), agregarlo
                this.registrationFields.push({
                    fieldName: normalizedBackend,
                    label: req.fieldName,
                    visible: false,
                    required: false,
                    requirementId: req.id
                });
            }
        });

        // 3. Limpieza: Si un campo por defecto (ej. NUC) NO está en el backend,
        // lo eliminamos si no es un campo crítico "Base" (Nombre/CURP/Email)
        // Esto evita que aparezcan duplicados o campos vacíos si el backend cambió de estructura.
        const criticalBaseFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email'];
        this.registrationFields = this.registrationFields.filter(f =>
            criticalBaseFields.includes(f.fieldName) || f.requirementId
        );

        // 4. Aplicar Reglas de Bloqueo (Locks) sobre la lista final
        this.registrationFields.forEach(f => {
            if (this.isVisibilityLocked(f)) {
                f.visible = true;
            } else if (!f.requirementId) {
                // Si no tiene ID del backend y no es lockeado, por seguridad no lo mostramos 
                // activo (aunque ya deberían estar filtrados arriba)
                f.visible = false;
            }

            if (this.REQUIREMENT_LOCKED_MANDATORY.includes(f.fieldName)) {
                f.required = true;
            } else if (this.REQUIREMENT_LOCKED_OPTIONAL.includes(f.fieldName)) {
                f.required = false;
            }
        });
    }

    // Flag para controlar bloqueo por uso
    isLockedByUsage = false;

    loadCourseType(id: number) {
        this.isLoading = true;
        this.courseTypeService.getCourseTypeById(id).subscribe({
            next: (data) => {
                if (data) {
                    // 1. Detectar uso antes que nada para que los locks se apliquen correctamente en fillForm y loadTemplates
                    const associatedCourses = (data as any).courses || (data as any).groups || [];

                    if (associatedCourses && associatedCourses.length > 0) {
                        this.isLockedByUsage = true;
                        this.form.disable();
                    } else {
                        this.isLockedByUsage = false;
                        this.form.enable();
                    }

                    // 2. Llenar formulario y templates
                    this.fillForm(data);
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

    // La verificación de uso ahora se hace directamente con la respuesta del GET /course-type/{id}

    loadTemplates(existingData?: CourseTypeConfig) {
        this.tableConfig.loading = true;
        this.templateService.getTemplates().subscribe({
            next: (data) => {
                this.templates = data;

                this.selectedTemplates = [];
                this.lockedTemplates = [];
                this.savedTemplateIds.clear();

                const savedDocuments = (existingData as any)?.documentCourses || (existingData as any)?.documentCourse || existingData?.availableDocuments;

                if (savedDocuments) {
                    const selectedIds = savedDocuments.map((d: any) => {
                        const tId = (d.templateDocument && typeof d.templateDocument === 'object')
                            ? d.templateDocument.id
                            : (d.templateId || d.templateDocument);

                        this.savedTemplateIds.add(tId);
                        return tId;
                    });

                    this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));
                    // SOLO bloquear los templates si el tipo de curso está realmente EN USO
                    this.lockedTemplates = this.isLockedByUsage ? [...this.selectedTemplates] : [];

                    savedDocuments.forEach((doc: any) => {
                        const tId = (doc.templateDocument && typeof doc.templateDocument === 'object')
                            ? doc.templateDocument.id
                            : (doc.templateId || doc.templateDocument);

                        const isMandatoryField = doc.isMandatory !== undefined ? doc.isMandatory : doc.isRequired;

                        if (isMandatoryField && tId) {
                            this.mandatoryDocuments.add(tId);
                        }
                    });

                    this.templates.forEach(t => {
                        const isSaved = selectedIds.includes(t.id);
                        if (!isSaved && !t.paymentConcept) {
                            this.mandatoryDocuments.add(t.id);
                        }
                    });

                    if (this.selectedTemplates.length > 0) {
                        this.filteredTemplates = [...this.selectedTemplates];
                    } else {
                        this.filteredTemplates = [...this.templates];
                    }

                } else {
                    this.selectedTemplates = [];
                    this.templates.forEach(t => {
                        if (!t.paymentConcept) {
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
        const savedConfigFields = (data as any).courseConfigField || data.registrationFields;

        if (savedConfigFields) {
            // Reiniciar estado visible/required de dinámicos antes de aplicar guardados
            // (Manteniendo locks)
            this.registrationFields.forEach(f => {
                if (!this.isVisibilityLocked(f)) f.visible = false;
                if (!this.isRequirementLocked(f)) f.required = false;
            });

            savedConfigFields.forEach((savedField: any) => {
                let match = null;

                // 1. Prioridad: Buscar por ID (requirementFieldPerson)
                // MANEJO ROBUSTO: Puede venir como número (ID) o como objeto anidado ({ id: 1, ... })
                if (savedField.requirementFieldPerson) {
                    const reqId = typeof savedField.requirementFieldPerson === 'object'
                        ? savedField.requirementFieldPerson.id
                        : savedField.requirementFieldPerson;

                    if (reqId) {
                        match = this.registrationFields.find(f => f.requirementId === reqId);
                    }
                }
                // 2. Fallback: Buscar por nombre interno (fieldName)
                else if (savedField.fieldName) {
                    match = this.registrationFields.find(f => f.fieldName === savedField.fieldName);
                }

                if (match) {
                    (match as any).wasSaved = true; // Marcar como guardado para bloquear su edición
                    const isVisible = savedField.visible !== undefined ? savedField.visible : true; // Si está guardado, implícitamente es visible
                    const isRequired = savedField.required;

                    if (this.isVisibilityLocked(match)) {
                        match.visible = true;
                    } else {
                        match.visible = true; // Si vino del backend, es que estaba habilitado
                    }

                    if (this.isRequirementLocked(match)) {
                        // Respetar lock
                        if (this.REQUIREMENT_LOCKED_MANDATORY.includes(match.fieldName)) match.required = true;
                        if (this.REQUIREMENT_LOCKED_OPTIONAL.includes(match.fieldName)) match.required = false;
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
                (t.paymentConcept?.concepto || '').toLowerCase().includes(term)
            );
        }

        // Crear nueva referencia para disparar OnChanges en el componente de paginación
        this.paginationConfig = {
            ...this.paginationConfig,
            currentPage: 1,
            totalItems: this.filteredTemplates.length
        };

        this.updatePaginatedData();
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig = {
            ...this.paginationConfig,
            currentPage: event.page,
            pageSize: event.pageSize
        };
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.displayedTemplates = this.filteredTemplates.slice(start, end);
    }

    isVisibilityLocked(field: RegistrationFieldConfig): boolean {
        return this.VISIBILITY_LOCKED.includes(field.fieldName);
    }

    isRequirementLocked(field: RegistrationFieldConfig): boolean {
        return this.REQUIREMENT_LOCKED_MANDATORY.includes(field.fieldName) ||
            this.REQUIREMENT_LOCKED_OPTIONAL.includes(field.fieldName);
    }

    toggleField(field: RegistrationFieldConfig) {
        if (this.isVisibilityLocked(field)) {
            return;
        }

        // Bloqueo condicional: Si NO está en uso, permitir cualquier edición.
        // Si SÍ está en uso, solo permitir AGREGAR (no desmarcar lo ya guardado).
        if (this.isLockedByUsage && field.visible && (field as any).wasSaved) {
            return;
        }

        field.visible = !field.visible;
    }

    toggleRequired(field: RegistrationFieldConfig, event: Event) {
        event.stopPropagation();

        if (this.isRequirementLocked(field)) return;

        // Bloqueo condicional: Si está en uso, no modificar requerimiento de guardados.
        if (this.isLockedByUsage && (field as any).wasSaved) {
            return;
        }

        field.required = !field.required;
    }

    onModalSelectionChange(event: any) {
        let items = event.selectedItems || [];
        const selectedIds = new Set(items.map((t: any) => t.id));

        // Forzar selección de los guardados SOLO si el curso está en uso
        if (this.isLockedByUsage) {
            let forciblyAdded = false;
            this.savedTemplateIds.forEach(id => {
                if (!selectedIds.has(id)) {
                    const template = this.templates.find(t => t.id === id);
                    if (template) {
                        items.push(template);
                        selectedIds.add(id);
                        forciblyAdded = true;
                    }
                }
            });
            if (forciblyAdded) items = [...items];
        }

        this.tempSelectedTemplates = items;
    }

    openTemplateModal() {
        this.tempSelectedTemplates = [...this.selectedTemplates];
        this.showTemplateModal = true;
    }

    closeTemplateModal() {
        this.showTemplateModal = false;
        this.tempSelectedTemplates = [];
    }

    confirmTemplateSelection() {
        this.selectedTemplates = [...this.tempSelectedTemplates];
        this.showTemplateModal = false;

        // Limpiar mandatoryDocuments de templates que ya no están seleccionados y no están guardados
        const selectedIds = new Set(this.selectedTemplates.map((t: any) => t.id));
        this.mandatoryDocuments.forEach(mId => {
            if (!selectedIds.has(mId) && !this.savedTemplateIds.has(mId)) {
                this.mandatoryDocuments.delete(mId);
            }
        });
    }

    removeTemplate(template: any) {
        // Bloqueo condicional: No quitar si ya estaba guardado Y el curso está en uso
        if (this.isLockedByUsage && this.isSavedTemplate(template.id)) return;

        this.selectedTemplates = this.selectedTemplates.filter(t => t.id !== template.id);
        if (this.mandatoryDocuments.has(template.id)) {
            this.mandatoryDocuments.delete(template.id);
        }
    }

    // Método helper para la vista
    isSavedTemplate(templateId: number): boolean {
        return this.savedTemplateIds.has(templateId);
    }

    isSavedField(field: RegistrationFieldConfig): boolean {
        return !!(field as any).wasSaved;
    }

    openPreview(template: TemplateDocument) {
        this.previewTemplate = template;
        this.showPreviewModal = true;
    }

    toggleMandatory(templateId: number, event: Event) {
        event.stopPropagation();

        // Bloqueo condicional: Si está en uso, no permitir editar obligatoriedad de templates ya guardados
        if (this.isLockedByUsage && this.savedTemplateIds.has(templateId)) {
            return;
        }

        if (this.mandatoryDocuments.has(templateId)) {
            this.mandatoryDocuments.delete(templateId);
        } else {
            this.mandatoryDocuments.add(templateId);

            // Si se marca como obligatorio, seleccionar automáticamente la fila si no estaba seleccionada
            const template = this.templates.find(t => t.id === templateId);
            if (template && !this.selectedTemplates.some(t => t.id === templateId)) {
                this.selectedTemplates = [...this.selectedTemplates, template];
            }
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

        // Usar getRawValue() para obtener datos de campos deshabilitados (nombre, descripción)
        const formValue = this.form.getRawValue();

        // Construir courseConfigField
        // SEGÚN INSTRUCCIÓN DE BACKEND (JSON):
        // Solo enviar { requirementFieldPerson: number, required: boolean }
        const courseConfigField = this.registrationFields
            .filter(f => f.visible && f.requirementId)
            .map(f => ({
                requirementFieldPerson: f.requirementId,
                required: f.required
            }));

        const documentCourse = this.selectedTemplates.map(t => ({
            templateDocument: t.id,
            isRequired: this.isMandatory(t.id)
        }));

        const config: any = {
            name: formValue.name,
            description: formValue.description,
            type: formValue.type,
            courseConfigField: courseConfigField,
            documentCourse: documentCourse
        };

        // NOTA: Se eliminó 'availableDocuments' del payload ya que el backend lo rechaza con 400.

        this.isLoading = true;

        if (this.isEditMode && this.courseTypeId) {
            // El backend requiere validatedRequired = true para tipos de curso sin cursos asociados
            // y false para tipos de curso con cursos asociados (para permitir el PATCH parcial).
            const validatedRequired = !this.isLockedByUsage;

            this.courseTypeService.updateCourseType(this.courseTypeId, config, validatedRequired).subscribe({
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