import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { NotificationService } from '../../../../../core/services/notification.service';
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
export class LicenseSearchModalComponent {
    @Input() isOpen = false;
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

    close() {
        this.searchLicense = '';
        this.modalClose.emit();
    }

    searchPerson() {
        if (!this.searchLicense.trim()) return;

        this.isSearching = true;
        this.groupsService.searchPersonByLicense(this.searchLicense).subscribe({
            next: (person) => {
                this.isSearching = false;

                if (person) {
                    // ENCONTRADO: Emitir datos del conductor
                    this.personFound.emit(person);
                    this.close();
                } else {
                    // NO ENCONTRADO: Mostrar alerta
                    this.showNotFoundAlert();
                }
            },
            error: (err) => {
                this.isSearching = false;
                console.error('Error buscando conductor:', err);
                this.notificationService.showError('Error', 'Error en el servicio de búsqueda.');
            }
        });
    }

    showNotFoundAlert() {
        this.alertConfig = {
            title: 'Error',
            message: 'Ha ocurrido un error al procesar la solicitud (no encontrado). Por favor, ingrese manualmente la información.',
            type: 'danger',
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
