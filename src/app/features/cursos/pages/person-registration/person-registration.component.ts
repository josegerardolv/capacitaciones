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
        if (!cleanCourseLabel) cleanCourseLabel = courseLabel;
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
        const groupRawPrefix = groupLabelParam ? groupLabelParam.replace(/^Grupo[:\s]+/i, '').trim() : '';
        const groupLabelToShow = groupRawPrefix || groupLabelParam || 'Cargando...';

        // El nombre del grupo lo cargaremos cuando tengamos los detalles del grupo más abajo
        this.breadcrumbItems.push({
            label: `Grupo: ${groupLabelToShow}`,
            url: `/cursos/${this.cursoId}/grupos/${this.groupId}/conductores`,
            queryParams: { courseName: courseLabel, groupLabel: groupLabelParam }
        });

        this.breadcrumbItems.push({ label: 'Nueva persona' });

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.prefilledData = { ...params };
            }
        });

        // OPTIMIZACIÓN: Intentar obtener los datos del grupo desde la navegación (Router State)
        const navigation = this.router.getCurrentNavigation();
        const stateData = navigation?.extras.state as { groupData: any };
        const historyData = window.history.state?.groupData; // Respaldo por si se recarga parcialmente

        if (stateData?.groupData || historyData) {
            const group = stateData?.groupData || historyData;
            this.processGroupData(group);
        } else if (this.groupId) {
            // Fallback: Si no hay estado (ej: recarga F5), hacemos el hit
            this.groupsService.getGroupById(+this.groupId).subscribe((group: any) => {
                if (group) {
                    this.processGroupData(group);
                }
            });
        }
    }

    private processGroupData(group: any) {
        this.currentGroup = group;
        this.currentGroupUuid = group.uuid;
        this.currentCourseType = 'GENERICO';

        // Update breadcrumbs
        if (this.breadcrumbItems.length > 2) {
            let cleanName = group.name ? group.name.replace(/^Grupo[:\s]+/i, '').trim() : '';
            if (!cleanName) cleanName = group.name || `Grupo ${group.id}`;
            const shortGroupName = cleanName.length > 25 ? cleanName.substring(0, 25) + '...' : cleanName;
            this.breadcrumbItems[2].label = `Grupo: ${shortGroupName}`;
        }

        if (group.course?.name && this.breadcrumbItems.length > 1) {
            const rawCourseName = group.course.name.replace(/^Curso[:\s]+/i, '').trim();
            const shortCourseName = rawCourseName.length > 30 ? rawCourseName.substring(0, 30) + '...' : rawCourseName;
            this.breadcrumbItems[1].label = `Curso: ${shortCourseName}`;
        }

        this.acceptedCount = group.acceptedCount || 0;
        const pendingCount = group.pendingRequestsCount || 0;
        this.isGroupFull = group.availablePlaces !== undefined ? group.availablePlaces <= 0 : (group.limitStudents ? (this.acceptedCount + pendingCount) >= group.limitStudents : false);

        if (this.isGroupFull) {
            this.showForm = false;
            this.isSearchModalOpen = false;
            return;
        }

        const populatedConfig = group.course?.courseType;
        if (populatedConfig?.courseConfigField?.length) {
            this.setupFormFields(populatedConfig);
            this.loadAvailableDocuments(group, populatedConfig);
        } else {
            const courseTypeId = group.courseTypeId || group.course?.id;
            if (courseTypeId) {
                this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
                    if (config) {
                        this.setupFormFields(config);
                        this.loadAvailableDocuments(group, config);
                    } else {
                        this.setupFallbackFields('GENERICO');
                    }
                });
            } else {
                this.setupFallbackFields('GENERICO');
            }
        }
    }

    private loadAvailableDocuments(group: any, config: any) {
        if (group.documents?.length) {
            this.currentAvailableDocuments = group.documents.map((d: any) => this.mapDocument(d));
        } else if (config.documentCourses?.length) {
            this.currentAvailableDocuments = config.documentCourses.map((d: any) => this.mapDocument(d));
        } else if (config.availableDocuments) {
            this.currentAvailableDocuments = config.availableDocuments;
        }
    }

    private mapDocument(d: any): DocumentConfig {
        let calculatedCost = d.cost || 0;
        const payment = d.paymentConcept || d.templateDocument?.paymentConcept || d.templateDocumentObject?.paymentConcept;
        if (payment?.umas) calculatedCost = Number(payment.umas) * 117.31;
        
        return {
            id: d.id || d.templateDocument?.id || 'doc_unknown',
            name: d.name || d.templateDocument?.name || d.templateDocumentObject?.name || 'Documento',
            description: d.description || d.templateDocument?.description || d.templateDocumentObject?.description || '',
            templateId: d.templateDocument?.id || d.id,
            isMandatory: d.isRequired !== undefined ? d.isRequired : (d.isMandatory !== undefined ? d.isMandatory : false),
            cost: calculatedCost
        };
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
            'nuc': { fieldName: 'nuc', label: 'NUC', visible: false, required: false },
            'address': { fieldName: 'address', label: 'Dirección', visible: false, required: false },
            'sex': { fieldName: 'sex', label: 'Sexo', visible: false, required: false }
        };

        if (config.courseConfigField?.length) {
            const idToFieldName: Record<number, string> = { 4: 'address', 5: 'nuc', 6: 'sex', 8: 'phone', 9: 'license'};
            config.courseConfigField.forEach((cf: any) => {
                // SEGURIDAD: Validar que el campo no sea nulo antes de procesarlo
                if (cf.requirementFieldPerson) {
                    const fieldId = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
                    const fieldName = idToFieldName[fieldId];
                    if (fieldName && this.fieldsConfig![fieldName]) {
                        this.fieldsConfig![fieldName].visible = true;
                        this.fieldsConfig![fieldName].required = cf.required;
                        this.fieldsConfig![fieldName].courseConfigFieldId = cf.id;
                    }
                }
            });
        }

        let needsLicenseSearch = config.courseConfigField?.some((cf: any) => {
            // SEGURIDAD: Validar que el campo no sea nulo antes de procesarlo
            if (!cf.requirementFieldPerson) return false;
            const id = typeof cf.requirementFieldPerson === 'object' ? cf.requirementFieldPerson.id : cf.requirementFieldPerson;
            return id === 9 || id === 5;
        });

        if (needsLicenseSearch && !this.prefilledData) {
            this.isSearchModalOpen = true;
            this.showForm = false;
        } else {
            this.showForm = true;
            this.isSearchModalOpen = false;
        }
    }

    onPersonFound(person: Person) {
        this.currentPersonId = (person as any).id;
        const data: any = { found: true };
        const alwaysPrefill = ['name', 'paternal_lastName', 'maternal_lastName', 'curp'];
        alwaysPrefill.forEach(key => { if ((person as any)[key]) data[key] = (person as any)[key]; });
        if (this.fieldsConfig) {
            Object.keys(this.fieldsConfig).forEach(key => {
                if (this.fieldsConfig![key]?.visible && (person as any)[key]) data[key] = (person as any)[key];
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
                nuc: { fieldName: 'nuc', label: 'NUC', visible: true, required: false }
            };
        } else {
            this.fieldsConfig = {
                license: { fieldName: 'license', label: 'Licencia', visible: false, required: false },
                nuc: { fieldName: 'nuc', label: 'NUC', visible: false, required: false }
            };
        }
    }

    // Document Select Modal Logic
    isDocumentsModalOpen = false;
    tempPersonData: any = null;
    currentCourseType: CourseType = 'GENERICO';

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
        const personTableFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'license', 'nuc'];

        const personDataForPayload: any = {};
        const responses: any[] = [];

        // Mapear campos del formulario
        Object.keys(personData).forEach(key => {
            const value = personData[key];
            const fieldConfig = this.fieldsConfig![key];
            const isPersonTableField = personTableFields.includes(key);

            // Valores procesados (limpiar vacíos para base de datos)
            const processedValue = (typeof value === 'string' && value.trim() === '') ? null : value;

            // REGLA: Si es campo de tabla Person, va ahí (Curp, Email, etc. NUNCA van a responses)
            if (isPersonTableField) {
                personDataForPayload[key] = processedValue;
            } 
            // REGLA: Si es dinámico Y NO es de tabla Person (Phone, Sex, Address, etc.) va a responses
            else if (fieldConfig && fieldConfig.courseConfigFieldId) {
                responses.push({
                    courseConfigFieldId: fieldConfig.courseConfigFieldId,
                    value: value?.toString() || ''
                });
            }
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
