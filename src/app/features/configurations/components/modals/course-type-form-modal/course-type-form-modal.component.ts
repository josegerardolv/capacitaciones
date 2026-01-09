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
    size: '2xl', // Enhanced width to avoid table scroll
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
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'category', label: 'Categoría', sortable: true, width: '170px' }, // Added Category
    { key: 'usageCount', label: 'Uso', sortable: true, width: '100px', align: 'center' },
    { key: 'actions', label: 'Ver documento', align: 'center', width: '120px' }
  ];

  // Modal de Vista Previa
  showPreviewModal = false;
  previewTemplate: CertificateTemplate | null = null;

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initFields();
    this.loadTemplates();

    // Lógica de búsqueda
    this.searchControl.valueChanges.subscribe(val => {
      this.filterTemplates(val || '');
    });

    if (this.courseTypeToEdit) {
      this.fillForm(this.courseTypeToEdit);
    }
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
    this.templateService.getTemplates().subscribe(data => {
      this.templates = data;
      // Ordenar por uso descendente por defecto ("Más usados")
      this.templates.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

      this.filteredTemplates = [...this.templates];
      this.tableConfig.loading = false;

      // Si estamos editando, sincronizar selección
      if (this.courseTypeToEdit && this.courseTypeToEdit.availableDocuments) {
        const selectedIds = this.courseTypeToEdit.availableDocuments.map(d => d.templateId);
        this.selectedTemplates = this.templates.filter(t => selectedIds.includes(t.id));
      }
    });
  }

  filterTemplates(query: string) {
    if (!query) {
      this.filteredTemplates = [...this.templates];
      return;
    }
    const lower = query.toLowerCase();
    this.filteredTemplates = this.templates.filter(t => t.name.toLowerCase().includes(lower));
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      paymentType: ['Gratuito', Validators.required]
    });
  }

  initFields() {
    this.registrationFields = JSON.parse(JSON.stringify(DEFAULT_REGISTRATION_FIELDS));
  }

  fillForm(data: CourseTypeConfig) {
    this.form.patchValue({
      name: data.name,
      description: data.description,
      paymentType: data.paymentType
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
    // La lógica de selección se maneja en loadTemplates debido a la naturaleza asíncrona
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
      cost: 0,
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
