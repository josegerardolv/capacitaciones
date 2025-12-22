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
}

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

    // --- MODALES GENÉRICOS ---

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
        { id: 1, name: 'Juan Pérez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', wantsTarjeton: false },
        { id: 2, name: 'María López', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', wantsTarjeton: true },
        { id: 3, name: 'Carlos Ruiz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', wantsTarjeton: true, paymentStatus: 'Pendiente' },
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
            driver.status = 'Aprobado';
            this.openAlert('Aprobado', `El conductor ${driver.name} ha sido APROBADO correctamente.\nAhora puede proceder a solicitar su Tarjetón.`, 'success');
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
        this.openConfirm({
            title: 'Generar Tarjetón',
            message: `Se generará la Orden de Pago del Tarjetón para ${driver.name}.\nEsta acción enviará la línea de captura a su correo.`,
            type: 'info',
            confirmText: 'Generar y Enviar',
            cancelText: 'Cancelar',
            showIcon: true
        }, () => {
            this.processTarjetonGeneration(driver);
        });
    }

    processTarjetonGeneration(driver: Driver) {
        console.log('>> PROCESANDO SOLICITUD DE TARJETÓN...');
        driver.wantsTarjeton = true;
        driver.paymentStatus = 'Pendiente';

        setTimeout(() => {
            this.openConfirm({
                title: 'Orden Generada',
                message: `✅ Orden enviada al correo de ${driver.name}.\n\n¿Desea descargar e imprimir el PDF ahora mismo?`,
                type: 'success',
                confirmText: 'Sí, Descargar',
                cancelText: 'No, solo correo'
            }, () => {
                this.printPaymentOrder(driver);
            });
        }, 300);
    }

    printPaymentOrder(driver: Driver) {
        console.log('Imprimiendo orden de pago para:', driver.name);
        this.openAlert('Descargando', 'Simulando descarga de PDF...', 'success');
    }

    viewCertificate(driver: Driver) {
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
