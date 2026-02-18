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
import { CourseTypeConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../../../../core/models/course-type-config.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { REQUIREMENT_FIELD_NAMES, normalizeFieldName } from '../../../../core/constants/requirement-names.constants';

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
    idToFieldName: Record<number, string> = {};
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
    currentPersonId: number | null = null; // ID de la persona encontrada

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

        // Procesar el grupo directamente (Sin descargar lista maestra por seguridad)
        if (idParam) {
            if (!isNaN(Number(idParam))) {
                this.loadGroupData(Number(idParam), false);
            } else {
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
                // Soportar respuesta directa o envuelta en { id: number, data: Group }
                const group = response?.data || response;
                const groupId = response?.id || group?.id || response?.groupId || group?.groupId;

                // Asegurar que el ID numérico esté presente en groupData
                this.groupData = { ...group, id: groupId };

                if (!group || !group.name) {
                    console.error('Grupo no válido o no encontrado:', response);
                    this.showError('Grupo no encontrado', 'El enlace de registro no es válido o el grupo ya no existe.');
                    return;
                }

                if (groupId) {
                    this.currentGroupId = Number(groupId);
                }

                // 1. Actualizar Info del Header
                this.groupInfo = {
                    courseName: group.courseTypeName || group.course?.name || group.name,
                    groupName: group.name,
                    slotsAvailable: group.availablePlaces !== undefined ? group.availablePlaces : ((group.limitStudents || 0) - (group.requests || 0)),
                    deadline: this.calculateDeadline(group)
                };

                // Determinar tipo de curso para campos dinámicos
                // 1. Priorizar configuración RICH (Ya poblada en el grupo o campos directos del UUID)
                const populatedConfig = group.course?.courseType;
                const directFields = group.fields; // Arreglo detectado en respuesta de UUID

                if ((populatedConfig && populatedConfig.courseConfigField && populatedConfig.courseConfigField.length > 0) || (directFields && directFields.length > 0)) {

                    // Actualizar Info del Header con el nombre real del curso si está disponible
                    if (populatedConfig) {
                        this.groupInfo.courseName = populatedConfig.name || group.name;
                        this.currentCourseType = populatedConfig.type || (populatedConfig.name?.toUpperCase().includes('CONSTANCIA') ? 'CONSTANCIA' : 'LICENCIA');
                    }

                    // Poblar templates/documentos disponibles si existen
                    if (populatedConfig && populatedConfig.availableDocuments) {
                        this.availableDocuments = populatedConfig.availableDocuments;
                    } else if (group.course?.templates) {
                        this.availableDocuments = group.course.templates;
                    } else if (group.templates) {
                        this.availableDocuments = group.templates;
                    }

                    this.setupFormFields(populatedConfig || {} as any, directFields);

                    // C. Determinar si mostrar búsqueda
                    let needsLicenseSearch = false;
                    const fieldsToCheck = directFields || populatedConfig?.courseConfigField || [];

                    needsLicenseSearch = fieldsToCheck.some((cf: any) => {
                        let internalKey = '';
                        if (cf.fieldName) {
                            const normalized = normalizeFieldName(cf.fieldName);
                            Object.entries(REQUIREMENT_FIELD_NAMES).forEach(([key, value]) => {
                                if (cf.fieldName.toLowerCase() === value.toLowerCase() || normalized === normalizeFieldName(value)) {
                                    internalKey = key.toLowerCase();
                                }
                            });
                        } else {
                            const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                            internalKey = this.idToFieldName[id];
                        }
                        return internalKey === 'license' || internalKey === 'nuc';
                    });

                    if (needsLicenseSearch) {
                        this.isSearchModalOpen = true;
                        this.showForm = false;
                    } else {
                        this.showForm = true;
                        this.isSearchModalOpen = false;
                    }
                } else {
                    // Fallback: Si no hay campos, mostrar formulario básico
                    this.showForm = true;
                    this.isSearchModalOpen = false;
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
                this.availableDocuments = config.availableDocuments || [];
                this.setupFormFields(config);

                const licenseField = this.fieldsConfig['license'];

                // C. Determinar si mostrar búsqueda (Sincronizado con setupFormFields lógica)
                let needsLicenseSearch = false;
                if (config.courseConfigField) {
                    needsLicenseSearch = config.courseConfigField.some((cf: any) => {
                        const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                        const internalKey = this.idToFieldName[id];
                        return internalKey === 'license' || internalKey === 'nuc';
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

        // Manejar tanto ISO strings como fechas simples
        let exp: Date;
        if (expirationStr.includes('T')) {
            exp = new Date(expirationStr);
        } else {
            exp = new Date(expirationStr + 'T23:59:59');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (today > exp) {
            this.isExpired = true;
            return 'Enlace Vencido';
        }

        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (isNaN(diffDays)) return 'Sin vigencia';

        return `${diffDays} días restantes`;
    }

    setupFormFields(config: CourseTypeConfig, directFields?: any[]) {
        // 1. Inicializar con los campos por defecto (ADN del formulario)
        this.fieldsConfig = {};
        DEFAULT_REGISTRATION_FIELDS.forEach(f => {
            // Clonamos y ocultamos por defecto (excepto core fields)
            this.fieldsConfig[f.fieldName] = { ...f, visible: false };
        });

        // Forzar visibilidad de los campos núcleo que no se pueden ocultar
        // Email, CURP y Phone son críticos y siempre deben mostrarse
        const coreFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'phone'];
        coreFields.forEach(key => {
            if (this.fieldsConfig[key]) {
                this.fieldsConfig[key].visible = true;
            }
        });

        // 2. Aplicar configuración dinámica (Priorizar directFields si vienen del UUID)
        const fieldsToProcess = directFields || config.courseConfigField || [];

        if (fieldsToProcess.length > 0) {
            fieldsToProcess.forEach((cf: any) => {
                let fieldName = '';

                // El ID de configuración puede venir como 'courseConfigField' (UUID) o 'id' (Admin)
                const configId = cf.courseConfigField || cf.id;

                // Caso A: Si tiene nombre (UUID suele mandarlo)
                if (cf.fieldName) {
                    const normalizedBackend = normalizeFieldName(cf.fieldName);
                    Object.entries(REQUIREMENT_FIELD_NAMES).forEach(([key, value]) => {
                        const normValue = normalizeFieldName(value);
                        if (cf.fieldName.toLowerCase() === value.toLowerCase() || normalizedBackend === normValue || normalizedBackend.startsWith(normValue) || normValue.startsWith(normalizedBackend)) {
                            fieldName = key.toLowerCase();
                        }
                    });
                    if (!fieldName) fieldName = normalizedBackend;
                }
                // Caso B: Si no tiene nombre (Fallback a mapeo por ID si estuviéramos en Admin, pero aquí no hay master list)
                else if (cf.requirementFieldPerson) {
                    const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                    fieldName = this.idToFieldName[id];
                }

                if (fieldName && this.fieldsConfig[fieldName]) {
                    this.fieldsConfig[fieldName].visible = true;
                    this.fieldsConfig[fieldName].required = cf.required;
                    this.fieldsConfig[fieldName].courseConfigFieldId = configId;
                } else if (fieldName) {
                    this.fieldsConfig[fieldName] = {
                        fieldName: fieldName,
                        label: cf.fieldName || fieldName,
                        visible: true,
                        required: cf.required,
                        courseConfigFieldId: configId
                    };
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

        // Determinar si quiere tarjetón
        const wantsTarjeton = selectedDocs.some(d => d.name.toLowerCase().includes('tarjetón'));

        const finalPersonData = {
            ...this.tempPersonData,
            requestTarjeton: wantsTarjeton,
            requestedDocuments: selectedDocs.map(d => d.id)
        };

        this.finalizeRegistration(finalPersonData, totalCost);
    }

    finalizeRegistration(personData: any, totalCost: number) {

        // 1. SEPARAR DATOS: Person Table vs Dynamic Responses
        // Solo los campos CORE y los que NO tienen courseConfigFieldId van a la tabla Person
        // El resto (dinámicos) van a la tabla de Responses.
        const personDataForPayload: any = {};
        const responses: any[] = [];
        const personTableFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'license', 'nuc'];

        Object.keys(personData).forEach(key => {
            const value = personData[key];
            const fieldConfig = this.fieldsConfig[key];

            // Mejorar: Convertir cadenas vacías en null para campos opcionales en BD
            const processedValue = (typeof value === 'string' && value.trim() === '') ? null : value;

            // Si es un campo dinámico (tiene ID de configuración)
            if (fieldConfig && fieldConfig.courseConfigFieldId) {
                responses.push({
                    courseConfigFieldId: fieldConfig.courseConfigFieldId,
                    value: value?.toString() || ''
                });

                // Si el campo también existe en la tabla Person (ej. email, phone), lo enviamos ahí también
                if (personTableFields.includes(key)) {
                    personDataForPayload[key] = processedValue;
                }
            } else if (!['requestTarjeton', 'requestedDocuments'].includes(key)) {
                // Es un campo base (name, curp, etc.) o no configurado dinámicamente
                personDataForPayload[key] = processedValue;
            }
        });

        const enrollmentPayload = {
            group: Number(this.groupData.id),
            isAcepted: false,
            dateReject: null,
            personId: this.currentPersonId,
            person: personDataForPayload,
            responses: responses,
            documentCourseIds: personData.requestedDocuments || []
        };

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
        this.currentPersonId = person.id; // Guardamos el ID para el payload final
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
        this.prefilledData = {
            license: license
        };
        this.isSearchModalOpen = false;
        this.showForm = true;
    }
}
