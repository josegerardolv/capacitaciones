import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { GroupsService } from '../../../services/groups.service';
import { Person } from '../../../../../core/models/person.model';
import { AlertModalComponent, AlertConfig } from '../../../../../shared/components/modals/alert-modal.component';
import { ModalComponent, ModalConfig } from '../../../../../shared/components/modals/modal.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-license-search-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InstitutionalButtonComponent,
        AlertModalComponent,
        ModalComponent
    ],
    templateUrl: './license-search-modal.component.html'
})
export class LicenseSearchModalComponent implements OnInit {
    @Input() isOpen = false;
    @Input() requireTypesCD = false; // Nueva bandera para forzar búsqueda solo de Tipo C y D
    @Input() allowClose = true; 

    @Output() modalClose = new EventEmitter<void>();
    @Output() personFound = new EventEmitter<Person>();
    @Output() manualRegistration = new EventEmitter<string>(); // Emite la licencia buscada para registro manual

    searchLicense = '';
    isSearching = false;

    // Configuración de alerta para "No encontrado"
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'danger'
    };

    modalConfig: ModalConfig = {
        title: 'Registrar Persona',
        size: 'lg', // Ajustar según necesidad
        showCloseButton: true,
        padding: true
    };

    constructor(
        private notificationService: NotificationService,
        private groupsService: GroupsService
    ) { }

    ngOnInit() {
        this.modalConfig.showCloseButton = this.allowClose;
    }

    close() {
        if (!this.allowClose) return; // Prevenir cierre forzado si no está permitido
        this.searchLicense = '';
        this.modalClose.emit();
    }

    searchPerson() {
        if (!this.searchLicense.trim()) return;

        this.isSearching = true;
        const types = this.requireTypesCD ? ['TIPO_C', 'TIPO_D'] : [];
        this.groupsService.searchPersonByLicense(this.searchLicense, types).subscribe({
            next: (person) => {
                this.isSearching = false;

                if (person) {
                    this.personFound.emit(person);
                    this.close();
                } else {
                    this.showNotFoundAlert();
                }
            },
            error: (err) => {
                this.isSearching = false;
                console.error('Error buscando conductor:', err);
                
                // Extraer el mensaje específico del backend si existe (Capa de validación de tipo)
                const backendMessage = err.error?.message;
                this.showNotFoundAlert(backendMessage);
            }
        });
    }

    showNotFoundAlert(customMessage?: string) {
        // Ignoramos el mensaje del backend por estética (a petición del usuario)
        // y usamos nuestra versión refinada que menciona los tipos C y D.
        let errorMsg = 'No se encontró información con los datos proporcionados.';
        
        if (this.requireTypesCD) {
            errorMsg = 'No se encontró una licencia válida para este proceso. <br><br><b>Nota:</b> Solo se aceptan licencias de <b>Tipo C (Servicio Público)</b> o <b>Tipo D</b> actualmente. <br><br>Si tiene los datos correctos, puede ingresarlos manualmente o revisar el CURP.';
        }

        this.alertConfig = {
            title: 'Búsqueda sin resultados',
            message: errorMsg,
            type: 'warning',
            actions: [
                {
                    label: 'Reintentar',
                    variant: 'secondary',
                    action: () => {
                        this.isAlertOpen = false;
                        // Mantiene el modal abierto
                    }
                },
                {
                    label: 'Continuar',
                    variant: 'primary',
                    action: () => {
                        this.isAlertOpen = false;
                        this.manualRegistration.emit(this.searchLicense);
                        this.close();
                    }
                }
            ]
        };
        this.isAlertOpen = true;
    }
}
