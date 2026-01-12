import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonFormComponent } from '../../components/person-form/person-form.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { DocumentSelectionModalComponent, DocumentOption } from '../../components/modals/document-selection-modal/document-selection-modal.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { CourseType } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';
import { CourseTypeService } from '../../../../core/services/course-type.service';

@Component({
    selector: 'app-public-registration',
    standalone: true,
    imports: [CommonModule, PersonFormComponent, AlertModalComponent, InstitutionalCardComponent, DocumentSelectionModalComponent],
    templateUrl: './public-registration.component.html'
})
export class PublicRegistrationComponent implements OnInit {

    // Datos del Grupo
    groupInfo = {
        courseName: 'Cargando...',
        groupName: '',
        slotsAvailable: 0,
        deadline: ''
    };

    // Configuración dinámica
    fieldsConfig: Record<string, { visible?: boolean; required?: boolean }> = {};
    availableDocuments: any[] = []; // Para el modal de documentos

    // Configuración del Modal de Alerta
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'success'
    };

    // Estados
    isDocumentsModalOpen = false;
    tempDriverData: any = null;
    currentCourseType: CourseType = 'LICENCIA'; // Fallback

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private groupsService: GroupsService,
        private courseTypeService: CourseTypeService
    ) { }

    ngOnInit() {
        const groupId = Number(this.route.snapshot.paramMap.get('id'));
        if (groupId) {
            this.loadGroupData(groupId);
        }
    }

    loadGroupData(groupId: number) {
        this.groupsService.getGroupById(groupId).subscribe(group => {
            if (!group) {
                this.router.navigate(['/404']);
                return;
            }

            // 1. Actualizar Info del Header
            this.groupInfo = {
                courseName: group.name, // O el nombre del curso si tuvieramos la relación completa
                groupName: group.name,
                slotsAvailable: group.quantity - (group.requests || 0), // Calculo simple
                deadline: this.calculateDeadline(group)
            };

            this.currentCourseType = group.courseType; // Para lógica legacy si hiciera falta

            // 2. Cargar Configuración del Tipo de Curso
            if (group.courseTypeId) {
                this.loadCourseTypeConfig(group.courseTypeId);
            } else {
                // Fallback para grupos legacy sin courseTypeId
                this.setupLegacyFields(group.courseType);
            }
        });
    }

    loadCourseTypeConfig(courseTypeId: number) {
        this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
            if (config) {
                // Update Course Name if we have the config name
                this.groupInfo.courseName = config.name;

                // A. Mapear campos de registro
                this.fieldsConfig = {};
                config.registrationFields.forEach(field => {
                    this.fieldsConfig[field.fieldName] = {
                        visible: field.visible,
                        required: field.required
                    };
                });

                // B. Guardar documentos disponibles para el modal
                this.availableDocuments = config.availableDocuments || [];
            }
        });
    }

    calculateDeadline(group: any): string {
        // Lógica simple de visualización
        return `${group.autoRegisterLimit} días restantes`;
    }

    setupLegacyFields(courseType: string) {
        if (courseType === 'LICENCIA') {
            this.fieldsConfig = {
                // requestTarjeton: { visible: false } // Removed
            };
        } else {
            this.fieldsConfig = {
                license: { visible: false, required: false },
                nuc: { visible: false }
            };
        }
    }

    onDriverRegistered(driverData: any) {
        this.tempDriverData = driverData;
        this.isDocumentsModalOpen = true;
    }

    onDocumentsConfirmed(documents: DocumentOption[]) {
        this.isDocumentsModalOpen = false;

        // Mapear documentos seleccionados
        // En el futuro, esto se guardaría como IDs de documentos solicitados en el backend
        // Por ahora mantenemos la compatibilidad con el campo "requestTarjeton" si existe
        const wantsTarjeton = documents.some(d => d.name.toLowerCase().includes('tarjetón') && d.selected);

        const finalDriverData = {
            ...this.tempDriverData,
            requestTarjeton: wantsTarjeton,
            requestedDocuments: documents.filter(d => d.selected).map(d => d.id)
        };

        this.finalizeRegistration(finalDriverData);
    }

    finalizeRegistration(driverData: any) {
        console.log('Solicitud de registro pública:', driverData);

        let message = `Tu solicitud ha sido enviada correctamente.<br><br>
                       La línea de captura para el <strong>${this.groupInfo.courseName}</strong> será enviada a tu correo electrónico una vez que el instructor acepte tu solicitud.`;

        // Lógica visual para documentos con costo (ejemplo)
        if (driverData.requestedDocuments && driverData.requestedDocuments.length > 0) {
            message += `<br><br><span class="text-sm text-gray-600">
                        Has solicitado documentos adicionales. Las líneas de pago correspondientes se generarán si apruebas el curso.
                        </span>`;
        }

        this.alertConfig = {
            title: '¡Solicitud Enviada!',
            message: message, // AlertModal debe soportar HTML o usaremos texto plano
            type: 'info',
            actions: [
                {
                    label: 'Entendido',
                    variant: 'primary',
                    action: () => this.close()
                }
            ]
        };

        this.isAlertOpen = true;
    }

    close() {
        this.isAlertOpen = false;
        // Navegar fuera o resetear
        // this.router.navigate(['/']); 
    }
}
