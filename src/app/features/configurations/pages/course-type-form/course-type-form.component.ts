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
import { CoursesService } from '../../../cursos/services/courses.service';
import { RequirementsService } from '../../../../core/services/requirements.service';
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

    // Almacena los requisitos traídos del backend para mapeo
    backendRequirements: any[] = [];

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
        { key: 'description', label: 'Descripción', sortable: true, width: '25%' },
        { key: 'conceptName', label: 'Concepto de Pago', sortable: true, minWidth: '20%' },
        { key: 'mandatory', label: 'Obligatorio', align: 'center', width: '100px' },
        { key: 'conceptCosto', label: 'Costo', sortable: true, width: '100px', align: 'right' },
        { key: 'actions', label: 'Vista Previa', align: 'center', width: '100px' }
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

            const costCol = this.tableColumns.find(c => c.key === 'conceptCosto');
            if (costCol) costCol.template = this.costTemplate;

            const categoryCol = this.tableColumns.find(c => c.key === 'category');
            if (categoryCol) categoryCol.template = this.categoryTemplate;

            const mandatoryCol = this.tableColumns.find(c => c.key === 'mandatory');
            if (mandatoryCol) mandatoryCol.template = this.mandatoryTemplate;
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
    readonly VISIBILITY_LOCKED = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'phone', 'email'];

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

        // 2. Mapear requisitos del Backend a los campos existentes o agregar nuevos
        this.backendRequirements.forEach(req => {
            // Normalizar nombre del backend para buscar coincidencia
            let internalName = req.fieldName.toLowerCase()
                .trim()
                .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
                .replace(/ñ/g, 'n').replace(/\s+/g, '_');

            // Caso especial: Correo (ID 7)
            if (req.id === 7) internalName = 'email';
            if (internalName.includes('telefono')) internalName = 'phone';
            if (internalName.includes('direccion')) internalName = 'address';

            // Buscar si ya existe en nuestra lista predefinida
            const existingField = this.registrationFields.find(f =>
                f.fieldName === internalName || f.label.toLowerCase() === req.fieldName.toLowerCase()
            );

            if (existingField) {
                // Sincronizar ID del backend
                existingField.requirementId = req.id;
            } else {
                // Si es un campo totalmente nuevo del backend (no está en el modelo), agregarlo
                this.registrationFields.push({
                    fieldName: internalName,
                    label: req.fieldName,
                    visible: false,
                    required: false,
                    requirementId: req.id
                });
            }
        });

        // 3. Aplicar Reglas de Bloqueo (Locks) sobre la lista final
        this.registrationFields.forEach(f => {
            if (this.isVisibilityLocked(f)) {
                f.visible = true;
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
                    this.fillForm(data);
                    // Cargar templates DESPUÉS de cargar datos del curso para marcar correctamente seleccionados/obligatorios
                    this.loadTemplates(data);

                    // Verificar si tiene cursos asignados para bloquear edición parcial
                    this.checkCourseUsage(id);
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

    checkCourseUsage(id: number) {
        // Consultar si existen cursos con este courseTypeId
        // Usamos limit=1 porque solo nos interesa saber si existe alguno (>0)
        this.coursesService.getCourses(1, 1, '', id).subscribe({
            next: (resp) => {
                let count = 0;
                if (resp.meta && resp.meta.total) count = resp.meta.total;
                else if (Array.isArray(resp)) count = resp.length;
                else if (resp.data) count = resp.data.length; // Fallback structure

                if (count > 0) {
                    this.isLockedByUsage = true;
                    this.form.disable(); // Bloquear formulario base (Nombre, Descripción, Tipo)
                }
            },
            error: (err) => {
                console.warn('No se pudo verificar el uso del tipo de curso', err);
            }
        });
    }

    loadTemplates(existingData?: CourseTypeConfig) {
        this.tableConfig.loading = true;
        this.templateService.getTemplates().subscribe({
            next: (data) => {
                this.templates = data;
                this.templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

                this.mandatoryDocuments.clear();

                if (existingData && existingData.availableDocuments) {
                    const selectedIds = existingData.availableDocuments.map(d => d.templateId);
                    this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));

                    existingData.availableDocuments.forEach(doc => {
                        if (doc.isMandatory && doc.templateId) {
                            this.mandatoryDocuments.add(doc.templateId);
                        }
                    });

                    this.templates.forEach(t => {
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
                    this.selectedTemplates = [];
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

        // Bloqueo 2: Si está bloqueado por uso (tiene cursos), NO se pueden quitar campos que ya estaban guardados
        // Solo se permite AGREGAR (de false a true), no QUITAR (de true a false)
        if (this.isLockedByUsage && field.visible && (field as any).wasSaved) {
            return; // No hacer nada, no permitir desmarcar
        }

        field.visible = !field.visible;
    }

    toggleRequired(field: RegistrationFieldConfig, event: Event) {
        event.stopPropagation();

        // Si el requerimiento está bloqueado, no permitir cambios
        if (this.isRequirementLocked(field)) return;

        // Bloqueo 2: Por Uso
        // Interpretación: No modificar campos existentes.
        if (this.isLockedByUsage && (field as any).wasSaved) {
            return;
        }

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

        // Construir courseConfigField
        // SEGÚN INSTRUCCIÓN DE BACKEND (JSON):
        // NO enviar 'id' (el backend reemplaza/recrea)
        // NO enviar 'typeCourse' dentro del item
        // Solo enviar { requirementFieldPerson: number, required: boolean }
        const courseConfigField = this.registrationFields
            .filter(f => f.visible && f.requirementId) // Solo visibles y con ID de requisito
            .map(f => ({
                requirementFieldPerson: f.requirementId,
                required: f.required
            }));

        const config: any = {
            name: formValue.name,
            description: formValue.description,
            type: formValue.type,
            courseConfigField: courseConfigField
        };

        // NOTA: Se eliminó 'availableDocuments' del payload ya que el backend lo rechaza con 400.

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
