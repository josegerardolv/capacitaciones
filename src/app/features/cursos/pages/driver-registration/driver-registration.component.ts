import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DriverFormComponent } from '../../components/driver-form/driver-form.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';

@Component({
    selector: 'app-driver-registration',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        DriverFormComponent,
        AlertModalComponent
    ],
    templateUrl: './driver-registration.component.html'
})
export class DriverRegistrationComponent {

    // Configuración del Modal
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'success'
    };

    constructor(private router: Router) { }

    onDriverSaved(driverData: any) {
        // Simulamos guardado exitoso
        console.log('Guardando conductor:', driverData);

        // 1. Preparamos el mensaje base (Siempre incluye el curso)
        let message = `El conductor <strong>${driverData.name}</strong> ha sido registrado correctamente.<br><br>
                       La línea de captura del <strong>Curso de Capacitación</strong> está lista.`;

        // 2. Agregamos nota sobre Tarjetón si fue solicitado
        if (driverData.requestTarjeton) {
            message += `<br><br>
                        <span class="text-sm text-gray-600">
                        * Solicitud de Tarjetón registrada. La línea de pago del Tarjetón se generará 
                        automáticamente <strong>una vez que apruebe el curso</strong>.
                        </span>`;
        }

        // 3. Configuramos el Modal con botones de acción (Descargar / Enviar)
        this.alertConfig = {
            title: '¡Registro Exitoso!',
            message: '', // Usamos content projection o innerHTML si el componente lo permite, o simplemente texto.
            // Nota: AlertModal usa {{ message }} string. Para HTML complejo mejor simplificar o usar componente custom.
            // Simplificaremos para texto plano por seguridad si AlertModal no soporta HTML safe.
            // Re-reading alert-modal: usa {{ config.message }}.
            type: 'success',
            actions: [
                {
                    label: 'Descargar Orden de Pago',
                    variant: 'primary',
                    action: () => this.downloadPaymentOrder()
                },
                {
                    label: 'Enviar por Correo',
                    variant: 'secondary',
                    action: () => this.sendEmail()
                }
            ]
        };

        // Ajuste para mensaje con saltos de linea (simulado)
        if (driverData.requestTarjeton) {
            this.alertConfig.message = `Conductor registrado.\n\nLa línea del CURSO está lista.\n\n(Nota: La línea del Tarjetón se generará y enviará al correo del conductor al aprobar el curso).`;
        } else {
            this.alertConfig.message = `Conductor registrado.\n\nLa línea de pago del CURSO está lista para entrega.`;
        }

        this.isAlertOpen = true;
    }

    // Acciones del Modal
    downloadPaymentOrder() {
        alert('Simulando descarga de PDF del Curso...');
        this.closeAndRedirect();
    }

    sendEmail() {
        alert('Simulando envío de correo al conductor...');
        this.closeAndRedirect();
    }

    closeAndRedirect() {
        this.isAlertOpen = false;
        // Redirigir a la lista de conductores
        this.router.navigate(['../../'], { relativeTo: this.router.routerState.root.firstChild?.firstChild });
        // Fix simple de ruta:
        // Estamos en /cursos/grupos/ID/conductores/nuevo
        // Queremos ir a /cursos/grupos/ID/conductores
        // Mejor usamos Location o History, pero router es más seguro.
        // Asumiendo ruta relativa:
        window.history.back();
    }

    onCancel() {
        window.history.back();
    }
}
