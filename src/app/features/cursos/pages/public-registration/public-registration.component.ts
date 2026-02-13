import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonFormComponent } from '../../components/person-form/person-form.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { DocumentSelectionModalComponent, DocumentOption } from '../../components/modals/document-selection-modal/document-selection-modal.component';
import { Person } from '../../../../core/models/person.model';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { CourseType } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { LicenseSearchModalComponent } from '../../components/modals/license-search-modal/license-search-modal.component';
import { CourseTypeConfig, RegistrationFieldConfig } from '../../../../core/models/course-type-config.model';
import { NotificationService } from '../../../../core/services/notification.service';

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
    fieldsConfig: Record<string, RegistrationFieldConfig> = {};
    availableDocuments: any[] = []; // Para el modal de documentos

    // Configuración del Modal de Alerta
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
    };

    groupData: any = null; // Guardar datos completos del grupo
    registrationSuccess = false; // Estado de éxito
    isVerifying = false; // Estado de carga (spinner)

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
        private courseTypeService: CourseTypeService,
        private notificationService: NotificationService
    ) { }

    currentGroupId: number | null = null;

    ngOnInit() {
        const idParam = this.route.snapshot.paramMap.get('id');

        if (idParam) {
            if (!isNaN(Number(idParam))) {
                // Legacy: Buscar por ID
                this.loadGroupData(Number(idParam), false);
            } else {
                // Actual: Buscar por UUID
                this.loadGroupData(idParam, true);
            }
        }
    }

    loadGroupData(identifier: number | string, isUuid: boolean) {
        const request = isUuid
            ? this.groupsService.getGroupByUuid(identifier as string)
            : this.groupsService.getGroupById(identifier as number);

        request.subscribe({
            next: (response: any) => {
                // Soportar respuesta directa o envuelta en { data: Group }
                const group = response?.data || response;
                this.groupData = group; // Almacenar para uso en guardado

                if (!group || !group.name) {
                    console.error('Grupo no válido o no encontrado:', response);
                    this.showError('Grupo no encontrado', 'El enlace de registro no es válido o el grupo ya no existe.');
                    return;
                }

                // 1. Actualizar Info del Header
                this.groupInfo = {
                    courseName: group.name,
                    groupName: group.name,
                    slotsAvailable: (group.limitStudents || 0) - (group.requests || 0),
                    deadline: this.calculateDeadline(group)
                };

                // Determinar tipo de curso para campos dinámicos
                // 1. Priorizar configuración RICH (Ya poblada en el grupo)
                const populatedConfig = group.course?.courseType;
                if (populatedConfig && populatedConfig.courseConfigField && populatedConfig.courseConfigField.length > 0 && populatedConfig.courseConfigField[0].requirementFieldPerson) {
                    console.log('[PublicRegistration] Usando configuración rica del grupo...');

                    // Actualizar Info del Header con el nombre real del curso si está disponible
                    this.groupInfo.courseName = populatedConfig.name || group.name;

                    this.setupFormFields(populatedConfig);

                    // C. Determinar si mostrar búsqueda (Sincronizado con setupFormFields lógica)
                    let needsLicenseSearch = false;
                    if (populatedConfig.courseConfigField) {
                        needsLicenseSearch = populatedConfig.courseConfigField.some((cf: any) => {
                            const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                            return id === 9 || id === 5;
                        });
                    }

                    if (needsLicenseSearch) {
                        this.isSearchModalOpen = true;
                        this.showForm = false;
                    } else {
                        this.showForm = true;
                        this.isSearchModalOpen = false;
                    }
                } else {
                    // 2. Fallback: Configuración SIMPLE
                    const courseTypeId = group.courseTypeId || (group.course?.courseType?.id) || (group.course?.id);

                    if (courseTypeId) {
                        this.loadCourseTypeConfig(courseTypeId);
                    } else {
                        this.setupLegacyFields('GENERICO');
                    }
                }
            },
            error: (err) => {
                console.error('Error cargando datos del grupo:', err);
                this.showError('Error de Conexión', 'No se pudo obtener la información del grupo. Por favor, intenta de nuevo más tarde.');
            }
        });
    }

    showError(title: string, message: string) {
        this.alertConfig = {
            title: title,
            message: message,
            type: 'danger',
            actions: [
                {
                    label: 'Volver al Inicio',
                    variant: 'primary',
                    action: () => this.router.navigate(['/'])
                }
            ]
        };
        this.isAlertOpen = true;
    }

    loadCourseTypeConfig(courseTypeId: number) {
        this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
            if (config) {
                // Update Course Name if we have the config name
                this.groupInfo.courseName = config.name;

                this.setupFormFields(config);

                const licenseField = this.fieldsConfig['license'];

                // C. Determinar si mostrar búsqueda (Sincronizado con setupFormFields lógica)
                let needsLicenseSearch = false;
                if (config.courseConfigField) {
                    needsLicenseSearch = config.courseConfigField.some((cf: any) => {
                        const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                        return id === 9 || id === 5;
                    });
                }

                if (needsLicenseSearch) {
                    this.isSearchModalOpen = true;
                    this.showForm = false;
                } else {
                    this.showForm = true;
                    this.isSearchModalOpen = false;
                }
            }
        });
    }

    isExpired = false;

    calculateDeadline(group: any): string {
        // Soporte para endInscriptionDate (nuevo) o linkExpiration (legacy)
        const expirationStr = group.endInscriptionDate || group.linkExpiration;
        if (!expirationStr) return 'Sin vigencia';

        const expirationDate = new Date(expirationStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ajuste para fin de día local
        const exp = new Date(expirationStr + 'T23:59:59');

        if (today > exp) {
            this.isExpired = true;
            return 'Enlace Vencido';
        }

        const diffTime = Math.abs(exp.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} días restantes`;
    }

    setupFormFields(config: CourseTypeConfig) {
        this.fieldsConfig = {
            'name': { fieldName: 'name', label: 'Nombre', visible: true, required: true },
            'paternal_lastName': { fieldName: 'paternal_lastName', label: 'Primer Apellido', visible: true, required: false },
            'maternal_lastName': { fieldName: 'maternal_lastName', label: 'Segundo Apellido', visible: true, required: false },
            'curp': { fieldName: 'curp', label: 'CURP', visible: true, required: true },
            'email': { fieldName: 'email', label: 'Correo Electrónico', visible: true, required: true },
            'phone': { fieldName: 'phone', label: 'Teléfono', visible: true, required: false },
            'license': { fieldName: 'license', label: 'Licencia', visible: false, required: false },
            'nuc': { fieldName: 'nuc', label: 'NUC', visible: false, required: false }
        };

        if (config.courseConfigField && config.courseConfigField.length > 0) {
            const idToFieldName: Record<number, string> = {
                4: 'address', 5: 'nuc', 6: 'sex', 7: 'email',
                8: 'phone', 9: 'license', 10: 'curp'
            };

            config.courseConfigField.forEach((cf: any) => {
                const fieldId = typeof cf.requirementFieldPerson === 'object'
                    ? cf.requirementFieldPerson.id
                    : cf.requirementFieldPerson;

                const fieldName = idToFieldName[fieldId];

                if (fieldName) {
                    if (this.fieldsConfig![fieldName]) {
                        this.fieldsConfig![fieldName].visible = true;
                        this.fieldsConfig![fieldName].required = cf.required;
                        this.fieldsConfig![fieldName].courseConfigFieldId = cf.id;
                    } else {
                        this.fieldsConfig![fieldName] = {
                            visible: true,
                            required: cf.required,
                            fieldName: fieldName,
                            label: fieldName,
                            courseConfigFieldId: cf.id
                        };
                    }
                }
            });
        }
    }

    setupLegacyFields(courseType: string) {
        if (courseType === 'LICENCIA') {
            this.fieldsConfig = {
                license: { fieldName: 'license', label: 'Licencia', visible: true, required: true },
                nuc: { fieldName: 'nuc', label: 'NUC', visible: true, required: false }
            };
            this.isSearchModalOpen = true; // Asumir licencia por defecto para legacy
            this.showForm = false;
        } else {
            this.fieldsConfig = {
                license: { fieldName: 'license', label: 'Licencia', visible: false, required: false },
                nuc: { fieldName: 'nuc', label: 'NUC', visible: false, required: false }
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
        console.log('[PublicRegistration] Iniciando inscripción...', personData);

        // 1. SEPARAR DATOS: Person Table vs Dynamic Responses (Sincronizado)
        const personTableFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'license', 'nuc'];

        const personDataForPayload: any = {};
        const responses: any[] = [];

        Object.keys(personData).forEach(key => {
            const value = personData[key];
            if (personTableFields.includes(key)) {
                personDataForPayload[key] = value;
            } else {
                const fieldConfig = this.fieldsConfig![key];
                if (fieldConfig && fieldConfig.courseConfigFieldId) {
                    responses.push({
                        courseConfigFieldId: fieldConfig.courseConfigFieldId,
                        value: value?.toString() || ''
                    });
                }
            }
        });

        personDataForPayload.isActive = true;

        const enrollmentPayload = {
            group: this.groupData.id,
            isAcepted: false,
            person: personDataForPayload,
            responses: responses
        };

        console.log('[PublicRegistration] Payload para /enrollment:', enrollmentPayload);

        this.notificationService.showInfo('Enviando', 'Procesando tu solicitud...');

        this.groupsService.createEnrollment(enrollmentPayload).subscribe({
            next: (response) => {
                // Configurar mensaje de éxito
                let successMessage = '';
                if (totalCost === 0) {
                    successMessage = `Tu solicitud ha sido enviada correctamente.<br><br>
                               Una vez que el instructor la acepte, recibirás una confirmación en tu correo. 
                               <br><br><strong>Este trámite es gratuito.</strong>`;
                } else {
                    successMessage = `Tu solicitud ha sido enviada correctamente.<br><br>
                               La línea de captura para el pago será enviada a tu correo una vez que se acepte la solicitud.`;
                    if (totalCost > 0) {
                        successMessage += `<br><br><span class="text-sm text-gray-600">Costo total estimado: <strong>$${totalCost} MXN</strong></span>`;
                    }
                }

                this.alertConfig = {
                    title: '¡Inscripción Exitosa!',
                    message: successMessage,
                    type: 'success',
                    actions: [{ label: 'Entendido', variant: 'primary', action: () => this.close() }]
                };
                this.isAlertOpen = true;
                this.registrationSuccess = true;
            },
            error: (err) => {
                this.notificationService.showError('Error', 'No se pudo completar la inscripción.');
                console.error(err);
            }
        });
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
            paternal_lastName: person.paternal_lastName,
            maternal_lastName: person.maternal_lastName,
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
