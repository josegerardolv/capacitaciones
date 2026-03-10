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
import { ModalComponent } from '../../../../shared/components/modals/modal.component';
import { MailService } from '../../services/mail.service';
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
        DocumentsModalComponent,
        ModalComponent
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
    isGroupFull: boolean = false;
    acceptedCount: number = 0;

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

    // Datos de Personas (Ahora Enrollment Data)
    allEnrollments: any[] = [];
    filteredEnrollments: any[] = [];
    persons: any[] = []; // Los datos finales para la tabla

    // ---> NUEVO: Modal de Información
    isInfoModalOpen = false;
    selectedPersonForInfo: any | null = null;
    selectedPersonInfoFields: { label: string, value: any }[] = [];

    // --- BÚSQUEDA ---
    isSearchModalOpen = false;
    currentSearchTerm: string = '';

    // Breadcrumb items (se construyen en ngOnInit según params)
    breadcrumbItems: BreadcrumbItem[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private groupsService: GroupsService,
        private courseTypeService: CourseTypeService,
        private mailService: MailService
    ) { }

    ngOnInit(): void {
        // Leer parámetros de ruta para construir breadcrumbs y contexto
        this.cursoId = this.route.snapshot.paramMap.get('cursoId');

        // El paramMap puede tener 'groupId' como ID numérico o UUID según la ruta
        const routeGroupId = this.route.snapshot.paramMap.get('groupId');
        this.currentGroupId = routeGroupId || this.groupId || null;

        // Leer posible nombre del curso y del grupo pasados por query params
        const courseName = this.route.snapshot.queryParamMap.get('courseName');
        const groupLabel = this.route.snapshot.queryParamMap.get('groupLabel');

        // Construir breadcrumbs
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
        } else if (this.currentGroupId) {
            this.groupLabel = `Grupo ${this.currentGroupId}`;
        }
        this.breadcrumbItems.push({ label: this.groupLabel || 'Detalle' });
        this.breadcrumbItems.push({ label: 'Personas' });

        this.initColumns();
        this.loadGroupDetails();
        this.loadPersons();
    }

    loadGroupDetails() {
        if (!this.currentGroupId) return;
        this.groupsService.getGroupById(+this.currentGroupId).subscribe((group: any) => {
            if (group) {
                this.currentGroup = group;
                // Actualizar etiqueta si está disponible
                if (group.name) this.groupLabel = `Grupo ${group.name}`;

                // 1. Priorizar configuración RICH (Ya poblada en el grupo)
                const populatedConfig = group.course?.courseType;
                if (populatedConfig && populatedConfig.courseConfigField && populatedConfig.courseConfigField.length > 0 && populatedConfig.courseConfigField[0].requirementFieldPerson) {
                    this.updateColumns(populatedConfig);
                } else {
                    // 2. Fallback: Configuración SIMPLE
                    const courseTypeId = group.courseTypeId ||
                        (group.course && typeof group.course === 'object' ? group.course.courseType?.id : undefined) ||
                        (group.course && typeof group.course === 'object' ? group.course.id : undefined);

                    if (courseTypeId) {
                        this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
                            if (config) {
                                this.updateColumns(config);
                            }
                        });
                    } else {
                        this.initColumns();
                    }
                }
            }
        });
    }

    loadPersons() {
        if (!this.currentGroupId) return;
        this.tableConfig.loading = true;
        this.allEnrollments = [];
        this.filteredEnrollments = [];
        this.persons = [];
        this.acceptedCount = 0;
        this.isGroupFull = false;

        this.groupsService.getEnrollmentsByGroupId(+this.currentGroupId).subscribe({
            next: (data: any[]) => {
                // Adaptamos la estructura: el componente de tabla espera las propiedades a nivel raíz
                this.allEnrollments = data.map(item => {
                    // Concatenar nombre completo para mostrar
                    const fullName = [item.person?.name, item.person?.paternal_lastName, item.person?.maternal_lastName]
                        .filter(Boolean)
                        .join(' ')
                        .trim();

                    const flattened: any = {
                        ...item.person,
                        name: fullName || 'Sin Nombre',
                        enrollmentId: item.enrollmentId,
                        responses: item.enrollmentResponse,
                        documentCoursesEnrollments: item.documentCoursesEnrollments || [],
                        // Mapeo de estatus del curso (CURSANDO, APROBADO, REPROBADO)
                        // Para compatibilidad con mocks o el endpoint real
                        status: item.status || item.isApproved || 'CURSANDO',
                        _rawEnrollment: item // Preservar enrollment completo para generación de PDF
                    };

                    // Extraer respuestas dinámicas a la raíz para que la tabla las vea
                    if (item.enrollmentResponse && Array.isArray(item.enrollmentResponse)) {
                        const idToFieldName: Record<number, string> = {
                            4: 'address', 5: 'nuc', 6: 'sex', 7: 'email',
                            8: 'phone', 9: 'license', 10: 'curp'
                        };

                        item.enrollmentResponse.forEach((resp: any) => {
                            const fieldData = resp.courseConfigField?.requirementFieldPerson;
                            const rfpId = typeof fieldData === 'object' ? fieldData.id : fieldData;

                            if (rfpId) {
                                // 1. Usar nombre amigable si existe
                                const friendlyName = idToFieldName[rfpId];
                                if (friendlyName) {
                                    flattened[friendlyName] = resp.value;
                                }
                                // 2. Siempre guardar por ID por si acaso
                                flattened[`field_${rfpId}`] = resp.value;
                            } else {
                                // Tratar de mapear por el fieldName directamente
                                const fName = fieldData?.fieldName || resp.courseConfigField?.fieldName;
                                if (fName) {
                                    const lower = fName.toLowerCase();
                                    if (lower.includes('dirección')) flattened['address'] = resp.value;
                                    else if (lower.includes('sexo')) flattened['sex'] = resp.value;
                                    else if (lower.includes('telefono') || lower.includes('celular') || lower.includes('contacto')) flattened['phone'] = resp.value;
                                    else if (lower.includes('licencia')) flattened['license'] = resp.value;
                                    else if (lower.includes('nuc')) flattened['nuc'] = resp.value;
                                    else if (lower.includes('correo') || lower.includes('email')) flattened['email'] = resp.value;
                                    else flattened[fName] = resp.value;
                                }
                            }
                        });
                    }

                    return flattened;
                });
                this.filterData('');

                // Calcular estado de ocupación global (Priorizar conteo total del server)
                this.acceptedCount = (this.currentGroup && this.currentGroup.acceptedCount !== undefined)
                    ? this.currentGroup.acceptedCount
                    : this.allEnrollments.length;

                if (this.currentGroup && this.currentGroup.limitStudents) {
                    this.isGroupFull = this.acceptedCount >= this.currentGroup.limitStudents;
                }

                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error loading enrollments', err);
                this.notificationService.showError('Error', 'No se pudieron cargar los inscritos.');
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
        this.currentSearchTerm = term;
        if (!term) {
            this.filteredEnrollments = [...this.allEnrollments];
        } else {
            this.filteredEnrollments = this.allEnrollments.filter(p =>
                p.name.toLowerCase().includes(term) ||
                (p.paternal_lastName || '').toLowerCase().includes(term) ||
                (p.maternal_lastName || '').toLowerCase().includes(term) ||
                (p.license || '').toLowerCase().includes(term) ||
                (p.curp || '').toLowerCase().includes(term)
            );
        }
        this.paginationConfig.totalItems = this.filteredEnrollments.length;
        this.updatePaginatedData();
    }

    updatePaginatedData() {
        const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.pageSize;
        const end = start + this.paginationConfig.pageSize;
        this.persons = this.filteredEnrollments.slice(start, end);
    }

    initColumns() {
        // Columnas por defecto (Respaldo)
        this.tableColumns = [
            { key: 'name', label: 'Nombre Completo', template: this.nameTemplate },
            { key: 'curp', label: 'CURP' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'status', label: 'Estatus', template: this.statusTemplate, align: 'center' },
            { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center' }
        ];
    }

    updateColumns(config: any) {
        // Columnas base estrictas solicitadas por reglas de negocio
        const dynamicColumns: TableColumn[] = [
            { key: 'name', label: 'Nombre Completo', template: this.nameTemplate },
            { key: 'curp', label: 'CURP' },
            { key: 'phone', label: 'Teléfono' }
        ];

        // Columnas dinámicas limitadas a Licencia y NUC
        if (config.courseConfigField) {
            config.courseConfigField.forEach((cf: any) => {
                const configField = cf.requirementFieldPerson;
                if (configField) {
                    const label = configField.fieldName || '';
                    const key = label.toLowerCase();

                    if (key.includes('licencia')) {
                        if (!dynamicColumns.find(c => c.key === 'license')) {
                            dynamicColumns.push({ key: 'license', label: label, sortable: true });
                        }
                    } else if (key.includes('nuc')) {
                        if (!dynamicColumns.find(c => c.key === 'nuc')) {
                            dynamicColumns.push({ key: 'nuc', label: label, sortable: true });
                        }
                    }
                }
            });
        }

        // Columnas fijas de sistema al final
        dynamicColumns.push({ key: 'status', label: 'Estatus', template: this.statusTemplate, align: 'center' });
        dynamicColumns.push({ key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center' });

        this.tableColumns = dynamicColumns;
    }

    openNewPersonForm() {
        if (this.currentGroup) {
            const group = this.currentGroup;
            const courseTypeId = group.courseTypeId ||
                (group.course && typeof group.course === 'object' ? (group.course as any).courseType?.id : undefined) ||
                (group.course && typeof group.course === 'object' ? (group.course as any).id : undefined);

            if (courseTypeId) {
                this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
                    if (config) {
                        // Nueva lógica: Buscar IDs 9 (Licencia) o 5 (NUC)
                        let needsSearch = false;
                        if (config.courseConfigField) {
                            needsSearch = config.courseConfigField.some((cf: any) => {
                                const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                                return id === 9 || id === 5;
                            });
                        }

                        if (needsSearch) {
                            this.isSearchModalOpen = true;
                        } else {
                            this.router.navigate(['nuevo'], { relativeTo: this.route });
                        }
                    } else {
                        this.isSearchModalOpen = true;
                    }
                });
            } else {
                this.isSearchModalOpen = true;
            }
        } else {
            this.isSearchModalOpen = true;
        }
    }

    onPersonFound(person: Person) {
        // SI SE ENCUENTRA: Navegar con datos precargados
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

    setExamResult(person: any, result: 'APROBADO' | 'REPROBADO') {
        const title = result === 'APROBADO' ? 'Aprobar Persona' : 'Reprobar Persona';
        const message = result === 'APROBADO'
            ? `¿Está seguro de que desea APROBAR a ${person.name}?\nEsta acción habilitará la gestión de documentos.`
            : `¿Está seguro de que desea REPROBAR a ${person.name}?`;
        const type = result === 'APROBADO' ? 'success' : 'danger';
        const confirmBtn = result === 'APROBADO' ? 'Sí, Aprobar' : 'Sí, Reprobar';

        this.openConfirm({
            title: title,
            message: message,
            type: type,
            confirmText: confirmBtn,
            cancelText: 'Cancelar'
        }, () => {
            if (!person.enrollmentId) {
                this.notificationService.showError('Error', 'No se encontró ID de inscripción.');
                return;
            }

            this.tableConfig.loading = true;
            this.groupsService.updateEnrollmentStatus(person.enrollmentId, result).subscribe({
                next: () => {
                    person.status = result;
                    this.notificationService.showSuccess(
                        result === 'APROBADO' ? 'Aprobado' : 'Reprobado',
                        `El estatus de ${person.name} ha sido actualizado a ${result}.`
                    );
                    this.tableConfig.loading = false;
                },
                error: (err) => {
                    console.error('Error updating status', err);
                    this.notificationService.showError('Error', 'No se pudo actualizar el estatus.');
                    this.tableConfig.loading = false;
                }
            });
        });
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

    cancelPerson(person: any) {
        if (!person.enrollmentId) {
            this.notificationService.showError('Error', 'No se pudo identificar la inscripción a cancelar.');
            return;
        }

        this.openConfirm({
            title: 'Cancelar Inscripción',
            message: `Esta acción dará de baja a ${person.name} y liberará 1 lugar del cupo del grupo.\n¿Desea continuar?`,
            type: 'danger',
            confirmText: 'Cancelar Inscripción',
            cancelText: 'Volver'
        }, () => {
            this.groupsService.cancelEnrollment(person.enrollmentId).subscribe({
                next: () => {

                    // ✅ ENVIAR CORREO
                    if (person.email) {
                        this.mailService.sendRemovalEmail(person.email, this.currentGroup)
                            .subscribe({
                                next: () => console.log('Correo de cancelación enviado'),
                                error: (err) => console.error('Error enviando correo', err)
                            });
                    }

                    this.notificationService.showSuccess(
                        'Cancelado',
                        `Se ha dado de baja la inscripción de ${person.name}.`
                    );

                    // Filtrar de la tabla local
                    this.allEnrollments = this.allEnrollments.filter(
                        d => d.enrollmentId !== person.enrollmentId
                    );

                    // Actualizar cupo
                    this.acceptedCount = Math.max(0, this.acceptedCount - 1);
                    if (this.currentGroup && this.currentGroup.limitStudents) {
                        this.isGroupFull = this.acceptedCount >= this.currentGroup.limitStudents;
                    }

                    this.filterData(this.currentSearchTerm || '');
                },
                error: (err) => {
                    console.error('Error canceling enrollment', err);
                    this.notificationService.showError(
                        'Error',
                        'Ocurrió un error al intentar cancelar la inscripción.'
                    );
                }
            });
        });
    }

    deletePerson(person: any) {
        if (!person.enrollmentId) {
            this.notificationService.showError('Error', 'No se pudo identificar la inscripción a eliminar.');
            return;
        }

        this.openConfirm({
            title: 'Eliminar Persona',
            message: `¿Está seguro de que desea eliminar a ${person.name} del grupo?`,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.groupsService.deleteEnrollment(person.enrollmentId).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Eliminado', `Se ha eliminado la inscripción de ${person.name}.`);
                    // Filtrar asincrónicamente
                    this.allEnrollments = this.allEnrollments.filter(d => d.enrollmentId !== person.enrollmentId);
                    this.filterData(this.currentSearchTerm || '');
                },
                error: (err) => {
                    console.error('Error deleting enrollment', err);
                    this.notificationService.showError('Error', 'Ocurrió un error al intentar eliminar la inscripción.');
                }
            });
        });
    }

    openInfoModal(person: any) {
        this.selectedPersonForInfo = person;
        this.selectedPersonInfoFields = [];

        // Campos base
        this.selectedPersonInfoFields.push({ label: 'Nombre completo', value: person.name || 'N/A' });
        if (person.address) this.selectedPersonInfoFields.push({ label: 'Dirección', value: person.address });
        this.selectedPersonInfoFields.push({ label: 'CURP', value: person.curp || 'N/A' });
        this.selectedPersonInfoFields.push({ label: 'Número de contacto', value: person.phone || 'N/A' });
        if (person.email) this.selectedPersonInfoFields.push({ label: 'Correo electrónico', value: person.email });
        if (person.license) this.selectedPersonInfoFields.push({ label: 'Licencia', value: person.license });
        if (person.nuc) this.selectedPersonInfoFields.push({ label: 'NUC', value: person.nuc });
        if (person.sex) this.selectedPersonInfoFields.push({ label: 'Sexo', value: person.sex });

        // Agregar campos capturados dinámicamente que faltan en el mapeo base
        if (this.currentGroup?.course?.courseType?.courseConfigField) {
            this.currentGroup.course.courseType.courseConfigField.forEach((cf: any) => {
                const configField = cf.requirementFieldPerson;
                if (configField) {
                    const label = configField.fieldName;
                    const fieldId = typeof configField === 'object' ? configField.id : configField;

                    // Evitar duplicar campos base agregados manualmente arriba
                    const labelLower = (label || '').toLowerCase();
                    const isBaseField = labelLower.includes('dirección') || labelLower.includes('curp') ||
                        labelLower.includes('telefono') || labelLower.includes('contacto') ||
                        labelLower.includes('correo') || labelLower.includes('email') ||
                        labelLower.includes('licencia') || labelLower.includes('nuc') ||
                        labelLower.includes('sexo');

                    if (!isBaseField && label) {
                        let value = person[`field_${fieldId}`];
                        if (!value && person[label]) value = person[label];
                        if (!value && person.responses) {
                            const r = person.responses.find((res: any) => res.courseConfigField?.requirementFieldPerson?.id === fieldId);
                            if (r) value = r.value;
                        }
                        this.selectedPersonInfoFields.push({ label: label, value: value || 'N/A' });
                    }
                }
            });
        }

        this.isInfoModalOpen = true;
    }

    closeInfoModal() {
        this.isInfoModalOpen = false;
        this.selectedPersonForInfo = null;
        this.selectedPersonInfoFields = [];
    }
}
