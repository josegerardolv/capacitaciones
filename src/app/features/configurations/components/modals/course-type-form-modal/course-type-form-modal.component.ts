import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { InputEnhancedComponent } from '../../../../../shared/components/inputs/input-enhanced.component';
import { CourseTypeConfig, DocumentConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../../../../../core/models/course-type-config.model';
import { TemplateService } from '../../../templates/services/template.service';
import { CertificateTemplate } from '../../../../../core/models/template.model';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../../shared/components/institutional-table/institutional-table.component';
import { ModalComponent, ModalConfig } from '../../../../../shared/components/modals/modal.component';
import { TemplatePreviewModalComponent } from '../template-preview-modal/template-preview-modal.component';

@Component({
  selector: 'app-course-type-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UniversalIconComponent,
    InstitutionalButtonComponent,
    InputEnhancedComponent,
    InstitutionalTableComponent,
    TemplatePreviewModalComponent,
    ModalComponent
  ],
  templateUrl: './course-type-form-modal.component.html',
  styles: [`
    .modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
    }
  `]
})
export class CourseTypeFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() courseTypeToEdit: CourseTypeConfig | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<CourseTypeConfig>>();

  form!: FormGroup;

  modalConfig: ModalConfig = {
    title: 'Configuración Curso',
    size: 'fullscreen',
    showCloseButton: true,
    padding: true
  };

  // Configuración de campos
  registrationFields: RegistrationFieldConfig[] = [];

  // Configuración de Templates y Tabla
  templates: CertificateTemplate[] = [];
  filteredTemplates: CertificateTemplate[] = [];
  selectedTemplates: CertificateTemplate[] = [];
  searchControl = new FormControl('');

  tableConfig: TableConfig = {
    selectable: true,
    hoverable: true,
    striped: false,
    loading: false,
    emptyMessage: 'No se encontraron templates'
  };

  @ViewChild('actionsTemplate') actionsTemplate!: any;
  @ViewChild('costTemplate') costTemplate!: any;
  @ViewChild('categoryTemplate') categoryTemplate!: any;
  @ViewChild('mandatoryTemplate') mandatoryTemplate!: any; // Nuevo Template para checkbox

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, width: '220px' },
    { key: 'category', label: 'Tipo', sortable: true, width: '150px', template: this.categoryTemplate },
    { key: 'conceptName', label: 'Concepto (Siox)', sortable: true, minWidth: '300px' },
    { key: 'mandatory', label: 'Obligatorio', align: 'center', width: '100px', template: this.mandatoryTemplate }, // Nueva Columna
    { key: 'conceptCosto', label: 'Costo', sortable: true, width: '130px', align: 'right' },
    { key: 'actions', label: 'Documento', align: 'center', width: '120px' }
  ];

  // Resto de propiedades...
  showPreviewModal = false;
  previewTemplate: CertificateTemplate | null = null;
  displayedTemplates: CertificateTemplate[] = [];

  // Set para rastrear obligatorios por ID de template
  mandatoryDocuments: Set<number> = new Set();

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService
  ) { }

  ngOnChanges(changes: any): void {
    if (changes['isOpen'] && this.isOpen) {
      // Recargar templates y estado al abrir
      this.loadTemplates();
      if (this.courseTypeToEdit) {
        this.fillForm(this.courseTypeToEdit);
      } else {
        this.form.reset();
        this.selectedTemplates = [];
        this.mandatoryDocuments.clear(); // Limpiar obligatorios
        this.initFields();
      }
    }
  }

  // ... (ngOnInit, initForm, etc. ok)

  ngAfterViewInit() {
    setTimeout(() => {
      // Asignar templates a columnas
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

  loadTemplates() {
    this.tableConfig.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

        if (this.courseTypeToEdit && this.courseTypeToEdit.availableDocuments) {
          const selectedIds = this.courseTypeToEdit.availableDocuments.map(d => d.templateId);
          this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));

          // Cargar estado de obligatorios
          this.mandatoryDocuments.clear();
          this.courseTypeToEdit.availableDocuments.forEach(doc => {
            if (doc.isMandatory && doc.templateId) {
              this.mandatoryDocuments.add(doc.templateId);
            }
          });

          // Asegurar que los gratuitos sean obligatorios por defecto (si no se guardó explícitamente lo contrario, o siempre?)
          // "todo lo que es gratuito ... debe de venir marcado por defecto"
          this.templates.forEach(t => {
            if (t.conceptCosto === 0) {
              this.mandatoryDocuments.add(t.id);
            }
          });


          if (this.selectedTemplates.length > 0) {
            this.filteredTemplates = [...this.selectedTemplates];
          }
        } else {
          this.selectedTemplates = [];
          this.mandatoryDocuments.clear();

          // Nuevos registros: Gratuitos son obligatorios por defecto
          this.templates.forEach(t => {
            if (t.conceptCosto === 0) {
              this.mandatoryDocuments.add(t.id);
            }
          });

          this.filteredTemplates = [...this.templates];
        }

        this.updateDisplayedTemplates();
        this.tableConfig.loading = false;
      },
      error: (err) => {
        console.error('Error cargando templates', err);
        this.tableConfig.loading = false;
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.initFields();

    // Lógica de búsqueda
    this.searchControl.valueChanges.subscribe(val => {
      this.filterTemplates(val || '');
    });
  }

  filterTemplates(query: string) {
    if (!query) {
      // Si se limpia el filtro, mostrar TODOS los templates (para permitir agregar nuevos)
      this.filteredTemplates = [...this.templates];
    } else {
      const lower = query.toLowerCase();
      this.filteredTemplates = this.templates.filter(t => t.name.toLowerCase().includes(lower));
    }

    this.updateDisplayedTemplates();
  }

  updateDisplayedTemplates() {
    // Mostrar todos los filtrados (el scroll del contenedor maneja el desbordamiento)
    this.displayedTemplates = this.filteredTemplates;
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required]
      // paymentType removed as it depends on template cost
    });
  }

  initFields() {
    this.registrationFields = JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_FIELDS));
    // Ocultar todos los campos por defecto para nuevos tipos de curso
    this.registrationFields.forEach(f => f.visible = false);
  }

  fillForm(data: CourseTypeConfig) {
    this.form.patchValue({
      name: data.name,
      description: data.description,
      category: (data as any).category // Se asume que vendrá en el objeto o se manejará como extra
      // paymentType removed
    });

    if (data.registrationFields) {
      data.registrationFields.forEach(savedField => {
        const match = this.registrationFields.find(f => f.fieldName === savedField.fieldName);
        if (match) {
          match.visible = savedField.visible;
          match.required = savedField.required;
        }
      });
    }
  }

  toggleField(field: RegistrationFieldConfig) {
    field.visible = !field.visible;
  }

  // Manejar selección de tabla
  onSelectionChange(event: any) {
    this.selectedTemplates = event.selectedItems;
  }

  openPreview(template: CertificateTemplate) {
    this.previewTemplate = template;
    this.showPreviewModal = true;
  }

  toggleMandatory(templateId: number, event: Event) {
    event.stopPropagation(); // Evitar que seleccione la fila si es click en checkbox
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
      requiresApproval: false,
      isMandatory: this.mandatoryDocuments.has(t.id) // Guardar estado
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

    this.save.emit(config);
  }

  onClose() {
    this.close.emit();
  }
}
