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
import { NotificationService } from '../../../../shared/services/notification.service';
import { FormsModule } from '@angular/forms';
import { UniversalIconComponent } from "@/app/shared/components";

interface Driver {
    id: number;
    name: string;
    license: string;
    curp: string;
    status: 'Pendiente' | 'Aprobado' | 'No Aprobado';
    wantsTarjeton: boolean; // Intención original del usuario
    paymentStatus?: 'Pendiente' | 'Pagado'; // Para Tarjetón
    coursePaymentStatus?: 'Pendiente' | 'Pagado'; // Para el Curso
}

// ... existing code ...


@Component({
    selector: 'app-group-drivers',
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
    FormsModule,
    UniversalIconComponent
],
    templateUrl: './group-persons.component.html'
})
export class GroupPersonsComponent implements OnInit {
    @Input() groupId: string = '';

    cursoId: string | null = null;
    currentGroupId: string | null = null;
    courseLabel: string = '';
    groupLabel: string = '';

    // Referencias a Templates del HTML
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    // Configuración de Tabla
    tableColumns: TableColumn[] = [];
    tableConfig: TableConfig = {
        loading: false,
        localSort: true,
        emptyMessage: 'No hay conductores registrados en este grupo.'
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

    // Datos Mock
    drivers: Driver[] = [
        { id: 1, name: 'Juan Pérez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', wantsTarjeton: false, coursePaymentStatus: 'Pagado' },
        { id: 2, name: 'María López', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', wantsTarjeton: true, coursePaymentStatus: 'Pendiente' },
        { id: 3, name: 'Carlos Ruiz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', wantsTarjeton: true, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pagado' },
    ];

    // Breadcrumb items (se construyen en ngOnInit según params)
    breadcrumbItems: BreadcrumbItem[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        console.log('GroupDriversComponent initialized for Group:', this.groupId);
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
        this.loadDrivers();
    }

    loadDrivers() {
        this.tableConfig.loading = true;
        // Simulación de carga de datos
        setTimeout(() => {
            this.paginationConfig.totalItems = this.drivers.length;
            this.tableConfig.loading = false;
        }, 800);
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        // Aquí llamaríamos al backend con (page, pageSize)
        console.log('Paginación:', event);
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre' },
            { key: 'license', label: 'Licencia' },
            { key: 'curp', label: 'CURP' },
            { key: 'status', label: 'Estatus', template: this.statusTemplate, align: 'center' },
            { key: 'actions', label: 'Acciones', template: this.actionsTemplate, align: 'center' }
        ];
    }

    openNewDriverForm() {
        this.router.navigate(['nuevo'], { relativeTo: this.route });
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

    // --- LÓGICA DE NEGOCIO ---

    setExamResult(driver: Driver, result: 'Aprobado' | 'No Aprobado') {
        if (result === 'Aprobado') {
            this.openConfirm({
                title: 'Aprobar Conductor',
                message: `¿Está seguro de que desea APROBAR a ${driver.name}?\nEsta acción habilitará la gestión del Tarjetón.`,
                type: 'success',
                confirmText: 'Sí, Aprobar',
                cancelText: 'Cancelar'
            }, () => {
                driver.status = 'Aprobado';
                this.notificationService.success('Aprobado', `El conductor ${driver.name} ha sido aprobado exitosamente.`);
            });
        } else {
            this.openConfirm({
                title: 'Reprobar Conductor',
                message: `¿Está seguro de que desea REPROBAR a ${driver.name}?`,
                type: 'danger',
                confirmText: 'Sí, Reprobar',
                cancelText: 'Cancelar'
            }, () => {
                driver.status = 'No Aprobado';
                console.log(`Conductor ${driver.name} reprobado.`);
            });
        }
    }

    requestTarjeton(driver: Driver) {
        // 1. Ya pagado -> Descargar Final
        if (driver.paymentStatus === 'Pagado') {
            this.downloadFinalTarjeton(driver);
            return;
        }

        // 2. Pago Pendiente -> Verificar
        if (driver.paymentStatus === 'Pendiente') {
            this.openConfirm({
                title: 'Verificar Pago',
                message: `Existe una orden de pago pendiente para ${driver.name}.\n¿Desea verificar el estatus del pago ahora?`,
                type: 'info',
                confirmText: 'Verificar Pago',
                cancelText: 'Cerrar'
            }, () => this.simulatePaymentVerification(driver));
            return;
        }

        // 3. Generación de Orden
        // CASO ESPECIAL: Si NO solicitó tarjetón, preguntar primero (Upsell)
        if (!driver.wantsTarjeton) {
            this.openConfirm({
                title: 'Solicitud Adicional',
                message: `El conductor ${driver.name} NO solicitó tarjetón originalmente.\n\n¿Desea generar una orden de pago de todas formas?`,
                type: 'warning',
                confirmText: 'Sí, Generar Orden',
                cancelText: 'Cancelar'
            }, () => {
                // Si acepta, procedemos a mostrar las opciones de generación
                this.showGenerationOptions(driver);
            });
            return;
        }

        // Si SÍ lo solicitó, pasar directo a las opciones
        this.showGenerationOptions(driver);
    }

    showGenerationOptions(driver: Driver) {
        this.alertConfig = {
            title: 'Generar Orden de Pago',
            message: `Seleccione cómo desea entregar la Línea de Captura a ${driver.name}:`,
            type: 'info',
            actions: [
                {
                    label: 'Descargar PDF',
                    variant: 'primary',
                    icon: 'download',
                    action: () => this.generatePaymentOrder(driver, 'download')
                },
                {
                    label: 'Enviar por Correo',
                    variant: 'secondary',
                    icon: 'send',
                    action: () => this.generatePaymentOrder(driver, 'email')
                }
            ]
        };
        this.isAlertOpen = true;
    }

    generatePaymentOrder(driver: Driver, mode: 'download' | 'email') {
        console.log(`>> GENERANDO ORDEN (${mode})...`);
        driver.wantsTarjeton = true;
        driver.paymentStatus = 'Pendiente';

        setTimeout(() => {
            if (mode === 'email') {
                this.notificationService.success(
                    'Orden Enviada',
                    `Se ha enviado la Línea de Captura al correo de ${driver.name}.`
                );
            } else {
                this.notificationService.success(
                    'Orden Descargada',
                    `Se ha descargado la Línea de Captura correctamente.`
                );
            }
        }, 800);
    }


    simulatePaymentVerification(driver: Driver) {
        // Simulamos que el sistema busca el pago
        this.openAlert('Verificando', 'Consultando estatus de pago...', 'info');

        setTimeout(() => {
            driver.paymentStatus = 'Pagado'; // Marcamos como pagado
            this.notificationService.success(
                'Pago Confirmado',
                `El pago de ${driver.name} ha sido validado correctamente.`
            );
        }, 1500);
    }

    downloadFinalTarjeton(driver: Driver) {
        console.log('Descargando Tarjetón Final para:', driver.name);
        this.notificationService.success('Descargando', 'Generando PDF del Tarjetón Oficial...');
    }


    viewCertificate(driver: Driver) {
        // Validación: El curso debe estar pagado para descargar constancia
        if (driver.coursePaymentStatus !== 'Pagado') {
            this.openConfirm({
                title: 'Pago de Curso Pendiente',
                message: `El conductor ${driver.name} no ha pagado el curso.\n¿Desea validar el pago ahora?`,
                type: 'warning',
                confirmText: 'Validar Pago',
                cancelText: 'Cancelar'
            }, () => {
                this.openAlert('Verificando', 'Validando pago del curso...', 'info');
                setTimeout(() => {
                    driver.coursePaymentStatus = 'Pagado';
                    this.notificationService.success('Pago Validado', 'El pago ha sido registrado. Descargando constancia...');
                }, 1000);
            });
            return;
        }

        this.openAlert('Visualizando', 'Simulando vista de Constancia...', 'info');
    }

    deleteDriver(driver: Driver) {
        this.openConfirm({
            title: 'Eliminar Conductor',
            message: `¿Está seguro de que desea eliminar a ${driver.name} del grupo?`,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }, () => {
            this.drivers = this.drivers.filter(d => d.id !== driver.id);
        });
    }
}
