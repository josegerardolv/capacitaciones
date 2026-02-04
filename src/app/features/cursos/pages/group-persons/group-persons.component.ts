import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { InstitutionalBadgeComponent } from '../../../../shared/components/badge/institutional-badge.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { UniversalIconComponent } from "@/app/shared/components";
// ... (imports)
import { Person } from '../../../../core/models/person.model';
import { GroupsService } from '../../services/groups.service';

import { LicenseSearchModalComponent } from '../../components/modals/license-search-modal/license-search-modal.component';
import { Group } from '../../../../core/models/group.model';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { TableFiltersComponent } from '@/app/shared/components/table-filters/table-filters.component';
import { DocumentsModalComponent } from '../../components/modals/documents-modal/documents-modal.component';

// ... existing code ...


@Component({
    selector: 'app-group-persons', // Selector actualizado
    standalone: true,
    imports: [
        CommonModule,
        InstitutionalBadgeComponent,
        InstitutionalTableComponent,
        InstitutionalCardComponent,
        InstitutionalButtonComponent,
        TablePaginationComponent,
        RouterModule,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        BreadcrumbComponent,
        BreadcrumbComponent, // Duplicado de BreadcrumbComponent mantenido para coincidir con la estructura original
        FormsModule,
        UniversalIconComponent,
        LicenseSearchModalComponent,
        TableFiltersComponent,
        DocumentsModalComponent
    ],
    templateUrl: './group-persons.component.html'
})
export class GroupPersonsComponent implements OnInit {
    @Input() groupId: string = '';

    cursoId: string | null = null;
    currentGroupId: string | null = null;
    currentGroup: Group | null = null; // Almacenar detalles completos del grupo
    courseLabel: string = '';
    groupLabel: string = '';

    // Referencias a Templates del HTML
    @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    // Configuración de Tabla
    tableColumns: TableColumn[] = [];
    tableConfig: TableConfig = {
        loading: false,
        localSort: true,
        emptyMessage: 'No hay personas registradas en este grupo.'
    };

    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    // 1. Modal de Confirmación
    isConfirmOpen = false;
    confirmConfig: ConfirmationConfig = {
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar'
    };
    private pendingConfirmAction: (() => void) | null = null;

    // 2. Modal de Alerta/Info
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'info'
    };

    // 3. Modal de Selección de Documentos
    isDocumentsModalOpen = false;
    selectedPersonForDocs: Person | null = null;

    // Datos de Personas
    allPersons: Person[] = [];
    filteredPersons: Person[] = [];
    persons: Person[] = [];



    // --- BÚSQUEDA ---
    isSearchModalOpen = false;

    // Breadcrumb items (se construyen en ngOnInit según params)
    breadcrumbItems: BreadcrumbItem[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private groupsService: GroupsService,
        private courseTypeService: CourseTypeService
    ) { }

    ngOnInit(): void {
        console.log('GroupPersonsComponent initialized for Group:', this.groupId);
        // Leer parámetros de ruta para construir breadcrumbs y contexto
        this.cursoId = this.route.snapshot.paramMap.get('cursoId');
        this.currentGroupId = this.route.snapshot.paramMap.get('groupId') || this.groupId || null;

        // Leer posible nombre del curso y del grupo pasados por query params
        const courseName = this.route.snapshot.queryParamMap.get('courseName');
        const groupLabel = this.route.snapshot.queryParamMap.get('groupLabel');

        // Construir breadcrumbs según la jerarquía solicitada:
        // Cursos (url) > Nombre del curso (SIN url) > Grupos (url al curso) > Nombre del grupo (SIN url) > Personas (SIN url)
        this.courseLabel = courseName ? courseName : (this.cursoId ? `Curso ${this.cursoId}` : 'Curso');

        this.breadcrumbItems = [
            { label: 'Cursos', url: '/cursos' },
            { label: this.courseLabel }
        ];

        if (this.cursoId) {
            this.breadcrumbItems.push({ label: 'Grupos', url: `/cursos/${this.cursoId}/grupos` });
        } else {
            this.breadcrumbItems.push({ label: 'Grupos', url: '/cursos' });
        }

        if (groupLabel) {
            this.groupLabel = groupLabel;
            this.breadcrumbItems.push({ label: this.groupLabel });
        } else if (this.currentGroupId) {
            this.groupLabel = `Grupo ${this.currentGroupId}`;
            this.breadcrumbItems.push({ label: this.groupLabel });
        }

        this.breadcrumbItems.push({ label: 'Personas' });

        this.initColumns();
        this.loadGroupDetails();
        this.loadGroupDetails();
        this.loadPersons();
    }

    loadGroupDetails() {
        if (!this.currentGroupId) return;
        this.groupsService.getGroupById(+this.currentGroupId).subscribe(group => {
            if (group) {
                this.currentGroup = group;
                // Actualizar etiqueta si está disponible
                if (group.name) this.groupLabel = `Grupo ${group.name}`;

                // Cargar configuración de columnas dinámica
                if (group.courseTypeId) {
                    this.courseTypeService.getCourseTypeById(group.courseTypeId).subscribe(config => {
                        if (config) {
                            this.updateColumns(config);
                        }
                    });
                } else {
                    // Respaldo si no hay configuración
                    this.initColumns();
                }
            }
        });
    }

    loadPersons() {
        if (!this.currentGroupId) return;
        this.tableConfig.loading = true;
        this.groupsService.getPersonsByGroupId(+this.currentGroupId).subscribe({
            next: (data) => {
                this.allPersons = data;
                this.filterData('');
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error loading persons', err);
                this.notificationService.showError('Error', 'No se pudieron cargar las personas.');
                this.tableConfig.loading = false;
            }
        });
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        this.updatePaginatedData();
    }



    filterData(query: string) {
        const term = query.toLowerCase().trim();
        if (!term) {
            this.filteredPersons = [...this.allPersons];
        } else {
            this.filteredPersons = this.allPersons.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.paternal_lastName || '').toLowerCase().includes(term) ||
                (p.maternal_lastName || '').toLowerCase().includes(term) ||
                (p.license || '').toLowerCase().includes(term) ||
                (p.curp || '').toLowerCase().includes(term)
            );
        }
        this.paginationConfig.totalItems = this.filteredPersons.length;
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.persons = this.filteredPersons.slice(start, end);
    }

    initColumns() {
        // Columnas por defecto (Respaldo)
        this.tableColumns = [
            { key: 'name', label: 'Nombre Completo', template: this.nameTemplate },
            { key: 'license', label: 'Licencia' },
            { key: 'curp', label: 'CURP' },
            { key: 'status', label: 'Estatus', template: this.statusTemplate, align: 'center' },
            { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center' }
        ];
    }

    updateColumns(config: any) {
        const dynamicColumns: TableColumn[] = [];

        // 1. Siempre mostrar nombre combinado
        dynamicColumns.push({ key: 'name', label: 'Nombre Completo', template: this.nameTemplate });

        // 2. Mapear campos visibles de la configuración
        // Campos que queremos ordernar/mostrar si son visibles
        // EXCLUIMOS 'paternal_lastName' y 'maternal_lastName' porque ya van en nombre
        const possibleFields = ['license', 'curp', 'nuc', 'phone', 'email', 'address'];

        // Iteramos los campos registrados en el config
        config.registrationFields.forEach((field: any) => {
            if (field.visible && possibleFields.includes(field.fieldName)) {
                // Evitamos duplicar si ya está (aunque el array base solo tiene name/firstSurname)
                dynamicColumns.push({
                    key: field.fieldName,
                    label: field.label
                });
            }
        });

        // 3. Columnas fijas de sistema al final
        dynamicColumns.push({ key: 'status', label: 'Estatus', template: this.statusTemplate, align: 'center' });
        dynamicColumns.push({ key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center' });

        this.tableColumns = dynamicColumns;
    }

    openNewPersonForm() {
        // Verificar configuración del Tipo de Curso
        if (this.currentGroup && this.currentGroup.courseTypeId) {
            this.courseTypeService.getCourseTypeById(this.currentGroup.courseTypeId).subscribe(config => {
                if (config) {
                    // Buscar configuración del campo 'license'
                    const licenseField = config.registrationFields.find(f => f.fieldName === 'license');

                    // Si la licencia es visible, usamos el modal de búsqueda (flujo original)
                    if (licenseField && licenseField.visible) {
                        this.isSearchModalOpen = true;
                    } else {
                        // Si NO es visible, saltamos la búsqueda y vamos directo al formulario manual
                        console.log('Licencia no requerida para este curso, saltando búsqueda...');
                        this.router.navigate(['nuevo'], { relativeTo: this.route });
                    }
                } else {
                    // Respaldo si no hay config
                    this.isSearchModalOpen = true;
                }
            });
        } else {
            // Respaldo si no hay grupo cargado
            this.isSearchModalOpen = true;
        }
    }

    onPersonFound(person: Person) {
        // SI SE ENCUENTRA: Navegar con datos precargados
        console.log('Persona encontrada (vía modal):', person);
        this.router.navigate(['nuevo'], {
            relativeTo: this.route,
            queryParams: {
                found: 'true',
                name: person.name,
                paternal_lastName: person.paternal_lastName,
                maternal_lastName: person.maternal_lastName,
                license: person.license,
                curp: person.curp,
                sex: person.sex,
                address: person.address
            }
        });
        this.isSearchModalOpen = false;
    }

    onManualRegistration(license: string) {
        // NO SE ENCUENTRA o RESPALDO: Navegar solo con licencia
        this.router.navigate(['nuevo'], {
            relativeTo: this.route,
            queryParams: {
                license: license
            }
        });
        this.isSearchModalOpen = false;
    }



    // --- HELPERS PARA MODALES ---
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
        this.alertConfig = {
            title,
            message,
            type
        };
        this.isAlertOpen = true;
    }

    // LÓGICA DE NEGOCIO 

    setExamResult(person: Person, result: 'Aprobado' | 'No Aprobado') {
        if (result === 'Aprobado') {
            this.openConfirm({
                title: 'Aprobar Persona',
                message: `¿Está seguro de que desea APROBAR a ${person.name}?\nEsta acción habilitará la gestión de documentos.`,
                type: 'success',
                confirmText: 'Sí, Aprobar',
                cancelText: 'Cancelar'
            }, () => {
                person.status = 'Aprobado';
                this.notificationService.showSuccess('Aprobado', `La persona ${person.name} ha sido aprobada exitosamente.`);
            });
        } else {
            this.openConfirm({
                title: 'Reprobar Persona',
                message: `¿Está seguro de que desea REPROBAR a ${person.name}?`,
                type: 'danger',
                confirmText: 'Sí, Reprobar',
                cancelText: 'Cancelar'
            }, () => {
                person.status = 'No Aprobado';
                console.log(`Persona ${person.name} reprobada.`);
            });
        }
    }

    requestTarjeton(person: Person) {
        // 1. Ya pagado -> Descargar Final
        if (person.paymentStatus === 'Pagado') {
            this.downloadFinalTarjeton(person);
            return;
        }

        // 2. Pago Pendiente -> Verificar
        if (person.paymentStatus === 'Pendiente') {
            this.openConfirm({
                title: 'Verificar Pago',
                message: `Existe una orden de pago pendiente para ${person.name}.\n¿Desea verificar el estatus del pago ahora?`,
                type: 'info',
                confirmText: 'Verificar Pago',
                cancelText: 'Cerrar'
            }, () => this.simulatePaymentVerification(person));
            return;
        }

        // 3. Generación de Orden
        // CASO ESPECIAL: Si NO solicitó tarjetón, preguntar primero (Upsell)
        if (!person.requestTarjeton) {
            this.openConfirm({
                title: 'Solicitud Adicional',
                message: `La persona ${person.name} NO solicitó tarjetón originalmente.\n\n¿Desea generar una orden de pago de todas formas?`,
                type: 'warning',
                confirmText: 'Sí, Generar Orden',
                cancelText: 'Cancelar'
            }, () => {
                // Si acepta, procedemos a mostrar las opciones de generación
                person.requestTarjeton = true;
                this.openDocumentsModal(person);
            });
            return;
        }

        // Si SÍ lo solicitó, abrir el modal de gestión directamente
        this.openDocumentsModal(person);
    }

    // --- GESTIÓN DE CONSTANCIAS (NUEVO MODAL) ---
    // Usamos las mismas variables pero con el nuevo propósito
    openDocumentsModal(person: Person) {
        this.selectedPersonForDocs = person;
        this.isDocumentsModalOpen = true;
    }

    closeDocumentsModal() {
        this.isDocumentsModalOpen = false;
        this.selectedPersonForDocs = null;
    }

    // --- (MÉTODOS OBSOLETOS O REUTILIZABLES) ---
    // El método onDocumentsConfirmed ya no se usa directamente desde el modal anterior,
    // pero mantenemos showGenerationOptions por si acaso se requiere lógica legacy momentáneamente.

    showGenerationOptions(person: Person, details: string = '') {
        this.alertConfig = {
            title: 'Generar Orden de Pago',
            message: `Conceptos: ${details || 'Tarjetón'}\n\nSeleccione cómo desea entregar la Línea de Captura a ${person.name}:`,
            type: 'info',
            actions: [
                {
                    label: 'Descargar PDF',
                    variant: 'primary',
                    icon: 'download',
                    action: () => this.generatePaymentOrder(person, 'download')
                },
                {
                    label: 'Enviar por Correo',
                    variant: 'secondary',
                    icon: 'send',
                    action: () => this.generatePaymentOrder(person, 'email')
                }
            ]
        };
        this.isAlertOpen = true;
    }

    generatePaymentOrder(person: Person, mode: 'download' | 'email') {
        console.log(`>> GENERANDO ORDEN (${mode})...`);
        person.requestTarjeton = true; // Actualizado a requestTarjeton
        person.paymentStatus = 'Pendiente';

        setTimeout(() => {
            if (mode === 'email') {
                this.notificationService.showSuccess(
                    'Orden Enviada',
                    `Se ha enviado la Línea de Captura al correo de ${person.name}.`
                );
            } else {
                this.notificationService.showSuccess(
                    'Orden Descargada',
                    `Se ha descargado la Línea de Captura correctamente.`
                );
            }
        }, 800);
    }


    simulatePaymentVerification(person: Person) {
        // Simulamos que el sistema busca el pago
        this.openAlert('Verificando', 'Consultando estatus de pago...', 'info');

        setTimeout(() => {
            person.paymentStatus = 'Pagado'; // Marcamos como pagado
            this.notificationService.showSuccess(
                'Pago Confirmado',
                `El pago de ${person.name} ha sido validado correctamente.`
            );
        }, 1500);
    }

    downloadFinalTarjeton(person: Person) {
        console.log('Descargando Tarjetón Final para:', person.name);
        this.notificationService.showSuccess('Descargando', 'Generando PDF del Tarjetón Oficial...');
    }


    viewCertificate(person: Person) {
        // Validación: El curso debe estar pagado para descargar constancia
        if (person.coursePaymentStatus !== 'Pagado') {
            this.openConfirm({
                title: 'Pago de Curso Pendiente',
                message: `La persona ${person.name} no ha pagado el curso.\n¿Desea validar el pago ahora?`,
                type: 'warning',
                confirmText: 'Validar Pago',
                cancelText: 'Cancelar'
            }, () => {
                this.openAlert('Verificando', 'Validando pago del curso...', 'info');
                setTimeout(() => {
                    person.coursePaymentStatus = 'Pagado';
                    this.notificationService.showSuccess('Pago Validado', 'El pago ha sido registrado. Descargando constancia...');
                }, 1000);
            });
            return;
        }

        this.openAlert('Visualizando', 'Simulando vista de Constancia...', 'info');
    }

    deletePerson(person: Person) {
        this.openConfirm({
            title: 'Eliminar Persona',
            message: `¿Está seguro de que desea eliminar a ${person.name} del grupo?`,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.persons = this.persons.filter(d => d.id !== person.id);
        });
    }
}
