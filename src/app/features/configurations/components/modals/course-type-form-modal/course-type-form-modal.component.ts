import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { InputEnhancedComponent } from '../../../../../shared/components/inputs/input-enhanced.component';
import { CourseTypeConfig, DocumentConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../../../../../core/models/course-type-config.model';
import { TemplateService } from '../../../../templates/services/template.service';
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
    title: 'Registro Tipo de Curso',
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

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre', sortable: true, width: '200px' },
    { key: 'conceptName', label: 'Concepto', sortable: true, width: '200px' }, // Show full concept name
    { key: 'category', label: 'Tipo', sortable: true, width: '120px' },
    { key: 'conceptCosto', label: 'Costo', sortable: true, width: '100px', align: 'right' }, // Added Cost column
    { key: 'actions', label: 'Documento', align: 'center', width: '80px' } // Renamed to Documento for clarity
  ];

  // Modal de Vista Previa
  showPreviewModal = false;
  previewTemplate: CertificateTemplate | null = null;

  displayedTemplates: CertificateTemplate[] = [];

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
        this.form.reset(); // Removed default paymentType
        this.selectedTemplates = [];
        this.initFields();
      }
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.initFields();

    // Lógica de búsqueda
    this.searchControl.valueChanges.subscribe(val => {
      this.filterTemplates(val || '');
    });
  }

  ngAfterViewInit() {
    // Asignar el template a la configuración de la columna una vez que la vista se inicialice
    const actionsCol = this.tableColumns.find(c => c.key === 'actions');
    if (actionsCol) {
      actionsCol.template = this.actionsTemplate;
    }
  }

  loadTemplates() {
    this.tableConfig.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        // Ordenar por uso descendente por defecto ("Más usados")
        this.templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

        if (this.courseTypeToEdit && this.courseTypeToEdit.availableDocuments) {
          const selectedIds = this.courseTypeToEdit.availableDocuments.map(d => d.templateId);
          this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));

          if (this.selectedTemplates.length > 0) {
            this.filteredTemplates = [...this.selectedTemplates];
          }
        } else {
          // Modo Crear: Limpiar seleccion y mostrar todo
          this.selectedTemplates = [];
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
      description: ['', Validators.required]
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
      description: data.description
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

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    // Mapear templates seleccionados a DocumentConfigs
    const availableDocuments: DocumentConfig[] = this.selectedTemplates.map(t => ({
      id: `doc_temp_${t.id}`,
      name: t.name,
      description: t.description || t.name,
      templateId: t.id,
      cost: t.conceptCosto || 0, // Inherit cost from template concept
      requiresApproval: false
    }));

    const config: Partial<CourseTypeConfig> = {
      ...formValue,
      status: 'Activo',
      registrationFields: this.registrationFields,
      availableDocuments: availableDocuments
    };

    this.save.emit(config);
  }

  onClose() {
    this.close.emit();
  }
}
