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
import { LicenseSearchModalComponent } from '../../components/modals/license-search-modal/license-search-modal.component';

@Component({
    selector: 'app-public-registration',
    standalone: true,
    imports: [CommonModule, PersonFormComponent, AlertModalComponent, InstitutionalCardComponent, DocumentSelectionModalComponent, LicenseSearchModalComponent],
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
    isSearchModalOpen = false; // Nuevo estado para el modal de búsqueda
    showForm = false; // Nuevo estado para controlar cuándo mostrar el formulario
    tempPersonData: any = null; // Renamed from tempDriverData
    currentCourseType: CourseType = 'LICENCIA'; // Fallback
    prefilledData: any = null; // Datos precargados de la búsqueda

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private groupsService: GroupsService,
        private courseTypeService: CourseTypeService
    ) { }

    currentGroupId: number | null = null;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        this.currentGroupId = id ? Number(id) : null;

        if (this.currentGroupId) {
            this.loadGroupData(this.currentGroupId);
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
                slotsAvailable: group.limitStudents - (group.requests || 0), // Calculo simple
                deadline: this.calculateDeadline(group)
            };
            this.currentCourseType = 'GENERICO'; // Fixed fallback falta

            // 2. Cargar Configuración del Tipo de Curso
            if (group.courseTypeId) {
                this.loadCourseTypeConfig(group.courseTypeId);
            } else {
                // Fallback para grupos legacy sin courseTypeId
                this.setupLegacyFields('GENERICO');
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

                // C. Determinar si mostramos modal de búsqueda o formulario directo
                const licenseField = config.registrationFields.find(f => f.fieldName === 'license');
                if (licenseField && licenseField.visible) {
                    this.isSearchModalOpen = true; // Abrir modal de búsqueda
                    this.showForm = false;
                } else {
                    this.showForm = true; // Mostrar formulario directo
                    this.isSearchModalOpen = false;
                }
            }
        });
    }

    isExpired = false;

    calculateDeadline(group: any): string {
        if (!group.linkExpiration) return 'Sin vigencia';

        const expirationDate = new Date(group.linkExpiration);
        const today = new Date();
        // Reset time part for accurate date comparison
        today.setHours(0, 0, 0, 0);
        // We'll treat expirationDate as end-of-day or strict date? Usually strict date comparison.
        // Assuming linkExpiration string is YYYY-MM-DD

        // Fix timezone offset issue by treating string as local or creating UTC
        // Simple string comparison for 'YYYY-MM-DD' works if local time matches
        // Better:
        const exp = new Date(group.linkExpiration + 'T23:59:59');

        if (today > exp) {
            this.isExpired = true;
            return 'Enlace Vencido';
        }

        // Calculate days remaining
        const diffTime = Math.abs(exp.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} días restantes`;
    }

    setupLegacyFields(courseType: string) {
        if (courseType === 'LICENCIA') {
            this.fieldsConfig = {
                // requestTarjeton: { visible: false } // Removed
                nuc: { visible: false }
            };
            this.isSearchModalOpen = true; // Asumir licencia por defecto para legacy
            this.showForm = false;
        } else {
            this.fieldsConfig = {
                license: { visible: false, required: false },
                nuc: { visible: false }
            };
            this.showForm = true;
            this.isSearchModalOpen = false;
        }
    }

    onPersonRegistered(personData: any) {
        this.tempPersonData = personData;
        this.isDocumentsModalOpen = true;
    }

    onDocumentsConfirmed(documents: DocumentOption[]) {
        this.isDocumentsModalOpen = false;

        // Mapear documentos seleccionados
        const selectedDocs = documents.filter(d => d.selected);

        // Calcular costo total
        const totalCost = selectedDocs.reduce((acc, doc) => acc + (doc.cost || 0), 0);

        // En el futuro, esto se guardaría como IDs de documentos solicitados en el backend
        // Por ahora mantenemos la compatibilidad con el campo "requestTarjeton" si existe
        const wantsTarjeton = selectedDocs.some(d => d.name.toLowerCase().includes('tarjetón'));

        const finalPersonData = {
            ...this.tempPersonData,
            requestTarjeton: wantsTarjeton,
            requestedDocuments: selectedDocs.map(d => d.id)
        };

        this.finalizeRegistration(finalPersonData, totalCost);
    }

    finalizeRegistration(personData: any, totalCost: number) {
        console.log('Solicitud de registro pública:', personData);
        console.log('Costo total calculado:', totalCost);

        let message = '';

        if (totalCost === 0) {
            // MENSAJE PARA TRÁMITE GRATUITO
            message = `Tu solicitud ha sido enviada correctamente.<br><br>
                       Una vez que el instructor acepte tu solicitud, recibirás una confirmación en tu correo electrónico con los detalles del curso. 
                       <br><br><strong>Este trámite es gratuito.</strong>`;
        } else {
            // MENSAJE PARA TRÁMITE CON COSTO (PAGADO)
            message = `Tu solicitud ha sido enviada correctamente.<br><br>
                       La línea de captura para el pago será enviada a tu correo electrónico una vez que el instructor acepte tu solicitud.`;

            if (personData.requestedDocuments && personData.requestedDocuments.length > 0) {
                message += `<br><br><span class="text-sm text-gray-600">
                            El costo total estimado es de <strong>$${totalCost} MXN</strong>.
                            </span>`;
            }
        }

        this.alertConfig = {
            title: '¡Solicitud Enviada!',
            message: message,
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

    // --- MANEJO DEL MODAL DE BÚSQUEDA ---
    onPersonFound(person: any) {
        console.log('Persona encontrada en registro público:', person);
        this.prefilledData = {
            name: person.name,
            firstSurname: person.firstSurname,
            secondSurname: person.secondSurname,
            license: person.license,
            curp: person.curp,
            sex: person.sex,
            address: person.address,
            found: true
        };
        this.isSearchModalOpen = false;
        this.showForm = true;
    }

    onManualRegistration(license: string) {
        console.log('Registro manual con licencia:', license);
        this.prefilledData = {
            license: license
        };
        this.isSearchModalOpen = false;
        this.showForm = true;
    }
}
