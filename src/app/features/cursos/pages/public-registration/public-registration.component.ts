import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverFormComponent } from '../../components/driver-form/driver-form.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';

@Component({
    selector: 'app-public-registration',
    standalone: true,
    imports: [CommonModule, DriverFormComponent, AlertModalComponent],
    templateUrl: './public-registration.component.html'
})
export class PublicRegistrationComponent implements OnInit {

    // Datos del Grupo (Simulados por ahora, luego vendrán del backend usando el ID de la URL)
    groupInfo = {
        courseName: 'Manejo Defensivo',
        groupName: 'Grupo A05',
        slotsAvailable: 5,
        deadline: '20 Oct 2025'
    };

    // Configuración del Modal
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'success'
    };

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        const groupId = this.route.snapshot.paramMap.get('id');
        // Aquí llamaríamos al servicio: this.groupsService.getPublicGroupInfo(groupId)...
        console.log('Cargando información pública para el grupo:', groupId);
    }

    onDriverRegistered(driverData: any) {
        console.log('Solicitud de registro pública:', driverData);

        // 1. Preparamos el mensaje base (Enfoque: Envío por correo)
        let message = `Tu solicitud ha sido enviada correctamente.<br><br>
                       La línea de captura para el <strong>Curso de Capacitación</strong> será enviada a tu correo electrónico una vez que el instructor acepte tu solicitud.`;

        // 2. Agregamos nota sobre Tarjetón si fue solicitado (Enfoque: Futuro)
        if (driverData.requestTarjeton) {
            message += `<br><br>
                        <span class="text-sm text-gray-600">
                        * Solicitaste el Tarjetón. La línea de pago correspondiente se generará y enviará 
                        automáticamente <strong>a tu correo electrónico</strong> solo si apruebas el curso.
                        </span>`;
        }

        // 3. Configuramos el Modal (Solo botón de cerrar/entendido)
        this.alertConfig = {
            title: '¡Solicitud Enviada!',
            message: '',
            type: 'info', // Info o Success
            actions: [
                {
                    label: 'Entendido',
                    variant: 'primary',
                    action: () => this.close()
                }
            ]
        };

        // Simplificación de mensaje para AlertModal (si no soporta HTML rico, usar \n)
        if (driverData.requestTarjeton) {
            this.alertConfig.message = `Solicitud enviada.\n\nLa línea de pago del CURSO llegará a tu correo cuando seas aceptado.\n\n(Nota: La línea del Tarjetón se generará SI apruebas el curso).`;
        } else {
            this.alertConfig.message = `Solicitud enviada.\n\nLa línea de pago del CURSO llegará a tu correo cuando seas aceptado.`;
        }

        this.isAlertOpen = true;
    }

    close() {
        this.isAlertOpen = false;
        // Opcional: Recargar o limpiar formulario
    }
}
