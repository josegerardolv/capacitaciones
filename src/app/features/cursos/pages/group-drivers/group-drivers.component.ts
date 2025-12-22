import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { FormsModule } from '@angular/forms';

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
        InstitutionalTableComponent,
        InstitutionalButtonComponent,
        RouterModule,
        TooltipDirective,
        ConfirmationModalComponent,
        AlertModalComponent,
        FormsModule
    ],
    templateUrl: './group-drivers.component.html'
})
export class GroupDriversComponent implements OnInit {
    @Input() groupId: string = '';

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

    constructor(private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        console.log('GroupDriversComponent initialized for Group:', this.groupId);
        this.initColumns();
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
                this.openAlert('Aprobado', `El conductor ${driver.name} ha sido aprobado exitosamente.`, 'success');
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

        // 3. Generación de Orden (Selección de Método)
        // Usamos AlertModal con acciones personalizadas para ofrecer opciones múltiples
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
                this.openAlert(
                    'Orden Enviada',
                    `Se ha enviado la Línea de Captura al correo de ${driver.name}.`,
                    'success'
                );
            } else {
                this.openAlert(
                    'Orden Descargada',
                    `Se ha descargado la Línea de Captura correctamente.\nEntréguela al conductor para su pago.`,
                    'success'
                );
            }
        }, 800);
    }


    simulatePaymentVerification(driver: Driver) {
        // Simulamos que el sistema busca el pago
        this.openAlert('Verificando', 'Consultando estatus de pago...', 'info');

        setTimeout(() => {
            driver.paymentStatus = 'Pagado'; // Marcamos como pagado
            this.openAlert(
                'Pago Confirmado',
                `El pago de ${driver.name} ha sido validado correctamente.\nAhora puede descargar el Tarjetón.`,
                'success'
            );
        }, 1500);
    }

    downloadFinalTarjeton(driver: Driver) {
        console.log('Descargando Tarjetón Final para:', driver.name);
        this.openAlert('Descargando', 'Generando PDF del Tarjetón Oficial...', 'success');
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
                    this.openAlert('Pago Validado', 'El pago del curso ha sido registrado.\nAhora puede descargar la constancia.', 'success');
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
