import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
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

    // Modal de Aprobación
    approvalModalOpen = false;
    tempIncludeTarjeton = false;
    pendingDriver: Driver | null = null;
    approvalConfig: ConfirmationConfig = {
        title: 'Confirmar Aprobación',
        message: '¿Desea aprobar a este conductor?',
        type: 'success',
        confirmText: 'Aprobar y Generar',
        cancelText: 'Cancelar'
    };

    drivers: Driver[] = [
        { id: 1, name: 'Juan Pérez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', wantsTarjeton: false },
        { id: 2, name: 'María López', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', wantsTarjeton: true },
        { id: 3, name: 'Carlos Ruiz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', wantsTarjeton: true, paymentStatus: 'Pendiente' },
    ];

    constructor(private router: Router) { }

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
        this.router.navigate(['new'], { relativeTo: this.router.routerState.root.firstChild?.firstChild });
    }

    // Interceptamos la acción de aprobar
    setExamResult(driver: Driver, result: 'Aprobado' | 'No Aprobado') {
        if (result === 'Aprobado') {
            this.openApprovalModal(driver);
        } else {
            if (confirm(`¿Seguro que desea REPROBAR a ${driver.name}?`)) {
                driver.status = result;
                console.log(`Conductor ${driver.name} reprobado.`);
            }
        }
    }

    openApprovalModal(driver: Driver) {
        this.pendingDriver = driver;
        // Inicializamos el checkbox con la preferencia original del usuario
        this.tempIncludeTarjeton = driver.wantsTarjeton;

        this.approvalConfig = {
            title: 'Confirmar Aprobación',
            message: `Está a punto de aprobar a <strong>${driver.name}</strong>.<br>Verifique si se generará el pago del Tarjetón.`,
            type: 'success',
            confirmText: 'Confirmar Aprobación',
            cancelText: 'Cancelar',
            showIcon: true
        };
        this.approvalModalOpen = true;
    }

    confirmApproval() {
        if (!this.pendingDriver) return;

        const driver = this.pendingDriver;
        driver.status = 'Aprobado';

        // Actualizamos la intención final basada en la decisión del Admin (Upsell)
        driver.wantsTarjeton = this.tempIncludeTarjeton;

        console.log('--- PROCESANDO APROBACIÓN ---');
        console.log(`Conductor: ${driver.name}`);
        console.log(`Incluir Tarjetón: ${driver.wantsTarjeton ? 'SÍ' : 'NO'}`);

        if (driver.wantsTarjeton) {
            console.log('>> GENERANDO LÍNEA DE CAPTURA DE TARJETÓN...');
            driver.paymentStatus = 'Pendiente';
            alert(`Conductor Aprobado.\n\nSe ha generado la ORDEN DE PAGO DEL TARJETÓN para ${driver.name} y se ha enviado a su correo electrónico.`);
        } else {
            console.log('>> SOLO CURSO APROBADO. Sin cobro extra.');
            alert(`Conductor Aprobado.\n\nEl conductor NO solicitó Tarjetón. Finalizado.`);
        }

        this.approvalModalOpen = false;
        this.pendingDriver = null;
    }

    printPaymentOrder(driver: Driver) {
        console.log('Imprimiendo orden de pago para:', driver.name);
        alert('Simulando descarga de PDF del Curso (y Tarjetón si aplica)');
    }

    viewCertificate(driver: Driver) {
        console.log('Viendo constancia para:', driver.name);
        alert('Simulando vista de Constancia');
    }

    requestTarjeton(driver: Driver) {
        console.log('Solicitando tarjetón para:', driver.name);
        if (confirm('¿Generar pago de Tarjetón ahora?')) {
            driver.wantsTarjeton = true;
            driver.paymentStatus = 'Pendiente';
            alert('Orden de pago de Tarjetón generada manualmente.');
        }
    }

    deleteDriver(driver: Driver) {
        if (confirm('¿Eliminar conductor?')) {
            this.drivers = this.drivers.filter(d => d.id !== driver.id);
        }
    }
}
