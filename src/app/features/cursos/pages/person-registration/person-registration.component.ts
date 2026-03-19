import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PersonFormComponent } from '../../components/person-form/person-form.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { DocumentSelectionModalComponent, DocumentOption } from '../../components/modals/document-selection-modal/document-selection-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../../../core/models/group.model';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../../../shared/components/breadcrumb/breadcrumb.model';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { LicenseSearchModalComponent } from '../../components/modals/license-search-modal/license-search-modal.component';
import { Person } from '../../../../core/models/person.model';

import { CourseType } from '../../../../core/models/group.model';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { CourseTypeConfig, DocumentConfig, RegistrationFieldConfig } from '../../../../core/models/course-type-config.model';
import { MailService } from '../../services/mail.service';

@Component({
    selector: 'app-person-registration',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PersonFormComponent,
        AlertModalComponent,
        InstitutionalCardComponent,
        BreadcrumbComponent,
        UniversalIconComponent,
        DocumentSelectionModalComponent,
        LicenseSearchModalComponent
    ],
    templateUrl: './person-registration.component.html'
})
export class PersonRegistrationComponent implements OnInit {

    cursoId: string | null = null;
    groupId: string | null = null;
    currentGroupUuid: string | null = null; // UUID del grupo para el payload
    breadcrumbItems: BreadcrumbItem[] = [];
    prefilledData: any = null;
    currentPersonId: number | null = null; // ID de la persona encontrada
    currentGroup: any = null;
    personEmail: string | null = null;
    isGroupFull: boolean = false;
    acceptedCount: number = 0;

    // Configuración dinámica
    fieldsConfig: Record<string, RegistrationFieldConfig> = {};
    showForm = false;
    isSearchModalOpen = false;

    // Configuración del Modal Alerta
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'success'
    };

    currentAvailableDocuments: DocumentConfig[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService,
        private groupsService: GroupsService,
        private courseTypeService: CourseTypeService,
        private mailService: MailService
    ) { }


    ngOnInit(): void {
        let route = this.route;
        while (route) {
            if (route.snapshot.paramMap.has('cursoId')) this.cursoId = route.snapshot.paramMap.get('cursoId');
            if (route.snapshot.paramMap.has('groupId')) this.groupId = route.snapshot.paramMap.get('groupId');
            route = route.parent!;
        }

        const courseName = this.route.snapshot.queryParamMap.get('courseName');
        const courseLabel = courseName ? courseName : (this.cursoId ? `Curso ${this.cursoId}` : 'Curso');
        let cleanCourseLabel = courseLabel.replace(/^Curso[:\s]+/i, '').trim();
        const shortCourseName = cleanCourseLabel.length > 30 ? cleanCourseLabel.substring(0, 30) + '...' : cleanCourseLabel;

        this.breadcrumbItems = [
            { label: 'Cursos', url: '/cursos' },
            {
                label: `Curso: ${shortCourseName}`,
                url: `/cursos/${this.cursoId}/grupos`,
                queryParams: { courseName: courseLabel }
            }
        ];

        const groupLabelParam = this.route.snapshot.queryParamMap.get('groupLabel');

        // El nombre del grupo lo cargaremos cuando tengamos los detalles del grupo más abajo
        this.breadcrumbItems.push({
            label: groupLabelParam ? `Grupo: ${groupLabelParam.replace(/^Grupo[:\s]+/i, '').trim()}` : `Grupo: Cargando...`,
            url: `/cursos/${this.cursoId}/grupos/${this.groupId}/conductores`,
            queryParams: { courseName: courseLabel, groupLabel: groupLabelParam }
        });

        this.breadcrumbItems.push({ label: 'Nueva persona' });

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.prefilledData = { ...params };
            }
        });

        if (this.groupId) {
            this.groupsService.getGroupById(+this.groupId).subscribe((group: any) => {
                if (group) {
                    this.currentGroup = group;
                    this.currentGroupUuid = group.uuid; // Guardar UUID para el payload
                    this.currentCourseType = 'GENERICO';

                    // Actualizar nombre del grupo en las migas de pan ahora que lo tenemos
                    if (this.breadcrumbItems.length > 1) {
                        const rawGroupName = group.name ? group.name.replace(/^Grupo[:\s]+/i, '').trim() : `Grupo ${group.id}`;
                        const shortGroupName = rawGroupName.length > 25 ? rawGroupName.substring(0, 25) + '...' : rawGroupName;
                        this.breadcrumbItems[2].label = `Grupo: ${shortGroupName}`;
                    }

                    // Actualizar nombre del curso en las migas de pan si el backend lo trae (Respaldo robusto para F5/Recarga)
                    if (group.course && group.course.name && this.breadcrumbItems.length > 1) {
                        const rawCourseName = group.course.name.replace(/^Curso[:\s]+/i, '').trim();
                        const shortCourseName = rawCourseName.length > 30 ? rawCourseName.substring(0, 30) + '...' : rawCourseName;
                        this.breadcrumbItems[1].label = `Curso: ${shortCourseName}`;
                    }

                    // Optimización de Cupo: Usar contadores directos del servidor (Sin latencia de descarga)
                    this.acceptedCount = group.acceptedCount || 0;
                    const pendingCount = group.pendingRequestsCount || 0;

                    if (group.availablePlaces !== undefined) {
                        this.isGroupFull = group.availablePlaces <= 0;
                    } else if (group.limitStudents) {
                        this.isGroupFull = (this.acceptedCount + pendingCount) >= group.limitStudents;
                    } else {
                        this.isGroupFull = false;
                    }

                    if (this.isGroupFull) {
                        this.showForm = false;
                        this.isSearchModalOpen = false;
                        return; // Detenemos la secuencia
                    }

                    // 1. INTENTAR USAR CONFIGURACIÓN YA POBLADA (RICH)
                    // Si el grupo ya trae el courseConfigField con relaciones, lo usamos de inmediato.
                    const populatedConfig = group.course?.courseType;

                    if (populatedConfig && populatedConfig.courseConfigField && populatedConfig.courseConfigField.length > 0 && populatedConfig.courseConfigField[0].requirementFieldPerson) {
                        this.setupFormFields(populatedConfig);
                        // Poblar documentos disponibles si vienen poblados
                        if (group.documents && group.documents.length > 0) {
                            this.currentAvailableDocuments = group.documents.map((d: any) => {
                                let calculatedCost = d.cost || 0;
                                if (d.paymentConcept && d.paymentConcept.umas) {
                                    calculatedCost = Number(d.paymentConcept.umas) * 117.31;
                                }
                                return {
                                    id: d.documentCourses || d.id || d.name || 'doc_unknown',
                                    name: d.name || 'Documento sin nombre',
                                    description: d.description || '',
                                    templateId: d.templateId || d.id,
                                    isMandatory: d.isRequired !== undefined ? d.isRequired : (d.isMandatory !== undefined ? d.isMandatory : false),
                                    cost: calculatedCost
                                };
                            });
                        } else if (populatedConfig.documentCourses) {
                            const docs = populatedConfig.documentCourses || [];
                            this.currentAvailableDocuments = docs.map((d: any) => {
                                let calculatedCost = 0;
                                if (d.templateDocument?.paymentConcept?.umas) {
                                    calculatedCost = Number(d.templateDocument.paymentConcept.umas) * 117.31;
                                } else if (d.templateDocumentObject?.paymentConcept?.umas) {
                                    calculatedCost = Number(d.templateDocumentObject.paymentConcept.umas) * 117.31;
                                }
                                return {
                                    id: d.id || d.templateDocument?.id || d.templateDocument || 'doc_unknown',
                                    name: d.name || d.templateDocument?.name || d.templateDocumentObject?.name || 'Documento',
                                    description: d.description || d.templateDocument?.description || d.templateDocumentObject?.description || '',
                                    templateId: d.templateDocument?.id || d.templateDocument,
                                    isMandatory: d.isRequired !== undefined ? d.isRequired : (d.isMandatory !== undefined ? d.isMandatory : false),
                                    cost: calculatedCost
                                };
                            });
                        } else if (populatedConfig.availableDocuments) {
                            this.currentAvailableDocuments = populatedConfig.availableDocuments;
                        }
                    } else {
                        // 2. FALLBACK: CONSULTA DINÁMICA (Si viene incompleto o shallow)
                        const courseTypeId = group.courseTypeId ||
                            (group.course && typeof group.course === 'object' ? group.course.courseType?.id : undefined) ||
                            (group.course && typeof group.course === 'object' ? group.course.id : undefined);

                        if (courseTypeId) {
                            this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
                                if (config) {
                                    this.setupFormFields(config);
                                    // Poblar documentos disponibles
                                    if (group.documents && group.documents.length > 0) {
                                        this.currentAvailableDocuments = group.documents.map((d: any) => {
                                            let calculatedCost = d.cost || 0;
                                            if (d.paymentConcept && d.paymentConcept.umas) {
                                                calculatedCost = Number(d.paymentConcept.umas) * 117.31;
                                            }
                                            return {
                                                id: d.documentCourses || d.id || d.name || 'doc_unknown',
                                                name: d.name || 'Documento sin nombre',
                                                description: d.description || '',
                                                templateId: d.templateId || d.id,
                                                isMandatory: d.isRequired !== undefined ? d.isRequired : (d.isMandatory !== undefined ? d.isMandatory : false),
                                                cost: calculatedCost
                                            };
                                        });
                                    } else if (config.documentCourses) {
                                        const docs = config.documentCourses || [];
                                        this.currentAvailableDocuments = docs.map((d: any) => {
                                            let calculatedCost = 0;
                                            if (d.templateDocument?.paymentConcept?.umas) {
                                                calculatedCost = Number(d.templateDocument.paymentConcept.umas) * 117.31;
                                            } else if (d.templateDocumentObject?.paymentConcept?.umas) {
                                                calculatedCost = Number(d.templateDocumentObject.paymentConcept.umas) * 117.31;
                                            }
                                            return {
                                                id: d.id || d.templateDocument?.id || d.templateDocument || 'doc_unknown',
                                                name: d.templateDocument?.name || d.templateDocumentObject?.name || d.name || 'Documento',
                                                description: d.description || d.templateDocument?.description || d.templateDocumentObject?.description || '',
                                                templateId: d.templateDocument?.id || d.templateDocument,
                                                isMandatory: d.isRequired !== undefined ? d.isRequired : (d.isMandatory !== undefined ? d.isMandatory : false),
                                                cost: calculatedCost
                                            };
                                        });
                                    } else if (config.availableDocuments) {
                                        this.currentAvailableDocuments = config.availableDocuments;
                                    }
                                } else {
                                    this.setupFallbackFields('GENERICO');
                                }
                            });
                        } else {
                            this.setupFallbackFields('GENERICO');
                        }
                    }
                }
            });
        }
    }

    setupFormFields(config: CourseTypeConfig) {
        // A. Mapear campos de registro (Soporta nuevo courseConfigField y legacy registrationFields)
        this.fieldsConfig = {
            // CAMPOS BASE: Siempre visibles. Nombre/CURP/Email son obligatorios.
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
            // Nuevo formato: Mapear IDs a nombres de campo
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
                        // Campo base o pre-configurado: habilitar y actualizar required
                        this.fieldsConfig![fieldName].visible = true;
                        this.fieldsConfig![fieldName].required = cf.required;
                        this.fieldsConfig![fieldName].courseConfigFieldId = cf.id;
                    } else {
                        // Campo dinámico: agregar completo
                        this.fieldsConfig![fieldName] = {
                            fieldName: fieldName,
                            label: fieldName,
                            visible: true,
                            required: cf.required,
                            courseConfigFieldId: cf.id
                        };
                    }
                }
            });
        }

        // B. Determinar si mostrar búsqueda
        // Solo abrimos el buscador automáticamente si el curso EXPLÍCITAMENTE pide Licencia o NUC en su config
        let needsLicenseSearch = false;
        if (config.courseConfigField) {
            needsLicenseSearch = config.courseConfigField.some((cf: any) => {
                const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                return id === 9 || id === 5; // 9 = Licencia, 5 = NUC
            });
        }

        if (needsLicenseSearch && !this.prefilledData) {
            this.isSearchModalOpen = true;
            this.showForm = false;
        } else {
            this.showForm = true;
            this.isSearchModalOpen = false;
        }
    }

    onPersonFound(person: Person) {
        this.currentPersonId = (person as any).id; // Guardamos el ID para el payload final

        // Solo prellenar campos que son bases o están marcados como visibles en este curso
        const data: any = { found: true };
        const alwaysPrefill = ['name', 'paternal_lastName', 'maternal_lastName', 'curp'];

        alwaysPrefill.forEach(key => {
            if ((person as any)[key]) data[key] = (person as any)[key];
        });

        // Solo prellenar campos adicionales si el curso ACTUAL los pide
        if (this.fieldsConfig) {
            Object.keys(this.fieldsConfig).forEach(key => {
                if (this.fieldsConfig![key]?.visible && (person as any)[key]) {
                    data[key] = (person as any)[key];
                }
            });
        }

        this.prefilledData = data;
        this.showForm = true;
        this.isSearchModalOpen = false;
    }

    onManualRegistration(license: string) {
        this.prefilledData = { license };
        this.showForm = true;
        this.isSearchModalOpen = false;
    }

    setupFallbackFields(courseType: string) {
        if (courseType === 'LICENCIA') {
            this.fieldsConfig = {
                license: { fieldName: 'license', label: 'Licencia', visible: true, required: true },
                nuc: { fieldName: 'nuc', label: 'NUC', visible: true, required: false },
                requestTarjeton: { fieldName: 'requestTarjeton', label: 'Tarjetón', visible: false, required: false }
            };
        } else {
            this.fieldsConfig = {
                license: { fieldName: 'license', label: 'Licencia', visible: false, required: false },
                nuc: { fieldName: 'nuc', label: 'NUC', visible: false, required: false },
                requestTarjeton: { fieldName: 'requestTarjeton', label: 'Tarjetón', visible: false, required: false }
            };
        }
    }

    // Modal State
    isDocumentsModalOpen = false;
    tempPersonData: any = null;
    currentCourseType: CourseType = 'LICENCIA'; // Default

    onPersonSaved(personData: any) {
        if (this.isGroupFull) {
            this.notificationService.showError('Cupo Agotado', 'El grupo está lleno. No se pueden realizar más inscripciones.');
            return;
        }

        this.tempPersonData = personData;
        this.personEmail = personData.email || null;

        // Determine course type for the modal
        // We can get it from the group call in ngOnInit, but let's ensure we have it stored.
        // We'll update the class property in the subscription.

        this.isDocumentsModalOpen = true;
    }

    onDocumentsConfirmed(documents: DocumentOption[]) {
        this.isDocumentsModalOpen = false;

        // Map selected documents to person data
        const selectedDocIds = documents.filter(d => d.selected).map(d => d.id);
        const wantsTarjeton = selectedDocIds.includes('doc_tarjeton') || selectedDocIds.includes('tarjeton');

        // Merge with temp data
        const finalPersonData = {
            ...this.tempPersonData,
            requestTarjeton: wantsTarjeton,
            requestedDocuments: selectedDocIds // Store all selected IDs
        };

        this.finalizeRegistration(finalPersonData);
    }

    finalizeRegistration(personData: any) {

        const groupId = this.groupId ? +this.groupId : 1;

        // 1. SEPARAR DATOS: Person Table vs Dynamic Responses
        // Columnas fijas en la tabla Person según el usuario
        const personTableFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'license', 'nuc'];

        const personDataForPayload: any = {};
        const responses: any[] = [];

        // Mapear campos del formulario
        Object.keys(personData).forEach(key => {
            const value = personData[key];
            const fieldConfig = this.fieldsConfig![key];
            const isPersonTableField = personTableFields.includes(key);

            // Valores procesados (limpiar vacíos)
            const processedValue = (typeof value === 'string' && value.trim() === '') ? null : value;

            // 1. Si es un campo dinámico (tiene ID de configuración)
            if (fieldConfig && fieldConfig.courseConfigFieldId) {
                responses.push({
                    courseConfigFieldId: fieldConfig.courseConfigFieldId,
                    value: value?.toString() || ''
                });

                // Si TAMBIÉN es un campo de la tabla Person, lo enviamos allí también
                if (isPersonTableField && fieldConfig.visible) {
                    personDataForPayload[key] = processedValue;
                }
            }
            // 2. Si NO es dinámico pero SÍ es un campo base de la tabla Person
            else if (isPersonTableField) {
                // Solo lo enviamos si no tiene configuración restrictiva o si es visible
                if (!fieldConfig || fieldConfig.visible) {
                    personDataForPayload[key] = processedValue;
                }
            }
            // 3. Cualquier otro campo (ej. address, sex si no son requerimientos) se IGNORA para evitar Error 400
        });

        const enrollmentPayload: any = {
            groupId: Number(groupId),
            isAcepted: true,
            isActive: true,
            isApproved: 'CURSANDO',
            dateReject: null,
            personId: this.currentPersonId,
            person: personDataForPayload,
            responses: responses,
            documentCourseIds: personData.requestedDocuments || []
        };

        this.notificationService.showInfo('Guardando', 'Procesando inscripción...');

        this.groupsService.createEnrollment(enrollmentPayload).subscribe({
            next: (response) => {
                let messageText = `La persona ${personData.name} ha sido inscrita correctamente.`;

                if (personData.requestTarjeton) {
                    messageText += `\n\n(Nota: La solicitud de Tarjetón ha sido registrada. La línea de pago se generará y enviará al correo de la persona al aprobar el curso).`;
                }

                this.alertConfig = {
                    title: '¡Inscripción Exitosa!',
                    message: messageText,
                    type: 'success',
                    actions: [
                        {
                            label: 'Enterado',
                            variant: 'primary',
                            action: () => this.closeAndRedirect()
                        },
                        {
                            label: 'Enviar a Correo',
                            variant: 'secondary',
                            action: () => this.sendEmail()
                        }
                    ]
                };

                this.isAlertOpen = true;
            },
            error: (err) => {
                // Loading finished
                this.notificationService.showError('Error', 'No se pudo guardar el registro.');
                console.error(err);
            }
        });
    }

    // Acciones del Modal
    sendEmail() {
        if (!this.personEmail) {
            this.notificationService.showError('Error', 'No se detectó un correo electrónico válido para enviar la notificación.');
            return;
        }

        this.notificationService.showInfo('Enviando', 'Enviando correo...');
        this.mailService.sendEnrollmentEmail(this.personEmail, this.currentGroup).subscribe({
            next: () => {
                this.notificationService.showSuccess('Correo enviado', 'Se ha enviado la confirmación al conductor.');
                this.closeAndRedirect();
            },
            error: (err: any) => {
                console.error('Error sending email', err);
                this.notificationService.showError('Error', 'Hubo un problema al enviar el correo.');
            }
        });
    }

    closeAndRedirect() {
        this.isAlertOpen = false;
        // Redirigir a la lista de conductores
        // Redirigir a la lista de conductores (../ relativa a la ruta actual 'nuevo')
        this.router.navigate(['../'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
    }

    onCancel() {
        window.history.back();
    }
}
