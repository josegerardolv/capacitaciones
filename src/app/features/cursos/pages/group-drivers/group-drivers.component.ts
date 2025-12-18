import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';

interface Driver {
    id: number;
    name: string;
    curp: string;
    sex: 'H' | 'M';
    address: string;
    nuc: string;
    status: 'Aprobado' | 'No Aprobado' | 'Pendiente';
}

import { DriverFormComponent } from '../../components/driver-form/driver-form.component';

@Component({
    selector: 'app-group-drivers',
    standalone: true,
    imports: [CommonModule, RouterModule, InstitutionalTableComponent, InstitutionalButtonComponent, DriverFormComponent],
    templateUrl: './group-drivers.component.html'
})
export class GroupDriversComponent implements OnInit {
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    groupId: string | null = null;
    drivers: Driver[] = [];
    isNewDriverModalOpen = false; // State for modal

    tableConfig: TableConfig = {
        loading: false,
        striped: true,
        hoverable: true,
        localSort: true
    };
    // ... existing code ...

    exportList() { console.log('Exportar Lista'); }

    openNewDriverForm() {
        this.isNewDriverModalOpen = true;
    }

    onDriverSaved(driverData: any) {
        console.log('Driver Saved:', driverData);
        // Add mock driver to list
        const newDriver: Driver = {
            id: this.drivers.length + 1,
            name: driverData.name,
            curp: driverData.curp,
            sex: driverData.sex,
            address: driverData.address,
            nuc: driverData.nuc || '-----',
            status: 'Pendiente'
        };
        this.drivers = [...this.drivers, newDriver];
        this.isNewDriverModalOpen = false;
        alert('Conductor registrado temporalmente');
    }

    tableColumns: TableColumn[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.groupId = this.route.snapshot.paramMap.get('id');
        this.initColumns();
        this.loadDrivers();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'name', label: 'Nombre', sortable: true },
            { key: 'curp', label: 'CURP', sortable: true },
            { key: 'sex', label: 'Sexo', sortable: true, align: 'center' },
            { key: 'address', label: 'Dirección', sortable: true },
            { key: 'nuc', label: 'NUC', sortable: true },
            { key: 'status', label: 'Estatus', align: 'center', template: this.statusTemplate },
            { key: 'actions', label: 'Acciones', align: 'center', template: this.actionsTemplate }
        ];
    }

    loadDrivers() {
        this.tableConfig.loading = true;

        // Simulamos la carga de datos para ver el loading. 
        // TODO: Conectar con el servicio real cuando este listo el endpoint de conductores
        // this.groupsService.getDriversByGroup(this.groupId).subscribe(data => { ... })
        setTimeout(() => {
            this.drivers = [
                // Juan Perez está Pendiente de examen (Muestra botones)
                { id: 1, name: 'Juan Perez', curp: 'JLAL440721HGRKWY41', sex: 'H', address: 'Oaxaca, Centro', nuc: '01-191', status: 'Pendiente' },
                { id: 2, name: 'Miguel Costilla', curp: 'WRSW381205HGTSTK79', sex: 'M', address: 'Reforma, Centro', nuc: '25-545', status: 'No Aprobado' },
                { id: 3, name: 'Gerardo Gonzalez', curp: 'JWYH911014HMCQZT88', sex: 'M', address: 'Reforma, Centro', nuc: '53-643', status: 'Aprobado' },
            ];
            this.tableConfig.loading = false;
        }, 800);
    }

    // Calificamos el examen del conductor
    setExamResult(driver: Driver, result: 'Aprobado' | 'No Aprobado') {
        const action = result === 'Aprobado' ? 'aprobar' : 'reprobar';

        // Confirmamos antes de cambiar el estatus permanentemente
        if (confirm(`¿Estás seguro de que quieres ${action} el examen de ${driver.name}?`)) {
            // Aquí mandamos el estatus al backend para guardarlo
            driver.status = result;

            // Actualizamos la referencia del arreglo para que la tabla detecte el cambio visual
            this.drivers = [...this.drivers];
        }
    }

    // Acciones Generales
    printPaymentOrder(driver: Driver) { console.log('Imprimir Orden de Pago', driver); }
    viewCertificate(driver: Driver) { console.log('Ver Constancia', driver); }
    requestTarjeton(driver: Driver) { console.log('Solicitar Tarjetón', driver); }

    deleteDriver(driver: Driver) {
        if (confirm('¿Eliminar conductor?')) {
            this.drivers = this.drivers.filter(d => d.id !== driver.id);
        }
    }
}
