import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
    breadcrumbItems: BreadcrumbItem[] = [];
    prefilledData: any = null;

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
        private courseTypeService: CourseTypeService
    ) { }

    ngOnInit(): void {
        let route = this.route;
        while (route) {
            if (route.snapshot.paramMap.has('cursoId')) this.cursoId = route.snapshot.paramMap.get('cursoId');
            if (route.snapshot.paramMap.has('groupId')) this.groupId = route.snapshot.paramMap.get('groupId');
            route = route.parent!;
        }

        this.breadcrumbItems = [
            { label: 'Cursos', url: '/cursos' },
        ];
        if (this.cursoId) {
            this.breadcrumbItems.push({ label: 'Grupos', url: `/cursos/${this.cursoId}/grupos` });
        } else {
            this.breadcrumbItems.push({ label: 'Grupos', url: '/cursos' });
        }
        this.breadcrumbItems.push({ label: 'Personas', url: this.cursoId && this.groupId ? `/cursos/${this.cursoId}/grupos/${this.groupId}/conductores` : '/cursos' });
        this.breadcrumbItems.push({ label: 'Agregar' });

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.prefilledData = { ...params };
            }
        });

        if (this.groupId) {
            this.groupsService.getGroupById(+this.groupId).subscribe((group: any) => {
                if (group) {
                    this.currentCourseType = 'GENERICO';

                    // 1. INTENTAR USAR CONFIGURACIÓN YA POBLADA (RICH)
                    // Si el grupo ya trae el courseConfigField con relaciones, lo usamos de inmediato.
                    const populatedConfig = group.course?.courseType;

                    if (populatedConfig && populatedConfig.courseConfigField && populatedConfig.courseConfigField.length > 0 && populatedConfig.courseConfigField[0].requirementFieldPerson) {
                        console.log('[PersonRegistration] Usando configuración rica del grupo...');
                        this.setupFormFields(populatedConfig);
                    } else {
                        // 2. FALLBACK: CONSULTA DINÁMICA (Si viene incompleto o shallow)
                        const courseTypeId = group.courseTypeId ||
                            (group.course && typeof group.course === 'object' ? group.course.courseType?.id : undefined) ||
                            (group.course && typeof group.course === 'object' ? group.course.id : undefined);

                        if (courseTypeId) {
                            this.courseTypeService.getCourseTypeById(courseTypeId).subscribe(config => {
                                if (config) {
                                    this.setupFormFields(config);
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
            console.log('[PersonRegistration] Requisito de Licencia/NUC detectado en config, abriendo buscador...');
            this.isSearchModalOpen = true;
            this.showForm = false;
        } else {
            console.log('[PersonRegistration] No se requiere búsqueda por Licencia/NUC, saltando al formulario...');
            this.showForm = true;
            this.isSearchModalOpen = false;
        }
    }

    onPersonFound(person: Person) {
        console.log('[PersonRegistration] Persona encontrada:', person);
        this.prefilledData = { ...person };
        this.showForm = true;
        this.isSearchModalOpen = false;
    }

    onManualRegistration(license: string) {
        console.log('[PersonRegistration] Registro manual iniciado con licencia:', license);
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
        this.tempPersonData = personData;

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
        console.log('[PersonRegistration] Iniciando proceso de inscripción...', personData);

        const groupId = this.groupId ? +this.groupId : 1;

        // 1. SEPARAR DATOS: Person Table vs Dynamic Responses
        // Columnas fijas en la tabla Person según el usuario
        const personTableFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'license', 'nuc'];

        const personDataForPayload: any = {};
        const responses: any[] = [];

        // Mapear campos del formulario
        Object.keys(personData).forEach(key => {
            const value = personData[key];
            if (personTableFields.includes(key)) {
                // Va a la tabla Person
                personDataForPayload[key] = value;
            } else {
                // Va a Responses si tiene un ID de configuración
                const fieldConfig = this.fieldsConfig![key];
                if (fieldConfig && fieldConfig.courseConfigFieldId) {
                    responses.push({
                        courseConfigFieldId: fieldConfig.courseConfigFieldId,
                        value: value?.toString() || ''
                    });
                }
            }
        });

        // Asegurar que isActive esté en la persona
        personDataForPayload.isActive = true;

        const enrollmentPayload = {
            group: groupId,
            isAcepted: false, // Default
            person: personDataForPayload,
            responses: responses
        };

        console.log('[PersonRegistration] Payload final para /enrollment:', enrollmentPayload);

        this.notificationService.showInfo('Guardando', 'Procesando inscripción...');

        this.groupsService.createEnrollment(enrollmentPayload).subscribe({
            next: (response) => {
                let message = `La persona <strong>${personData.name}</strong> ha sido inscrita correctamente.`;

                // 2. Agregamos nota sobre Tarjetón si fue solicitado
                if (personData.requestTarjeton) {
                    message += `<br><br>
                                <span class="text-sm text-gray-600">
                                * Solicitud de Tarjetón registrada. La línea de pago del Tarjetón se generará 
                                automáticamente <strong>una vez que apruebe el curso</strong>.
                                </span>`;
                }

                // 3. Configuramos el Modal con botones de acción
                this.alertConfig = {
                    title: '¡Registro Exitoso!',
                    message: message, // AlertModal might not check type safely, but we kept string logic below
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

                // Sobreescribimos el mensaje con texto plano si el modal no soporta HTML (según código previo y comentarios)
                // Usamos la lógica de texto que había antes
                if (personData.requestTarjeton) {
                    this.alertConfig.message = `Persona registrada.\n\nLa línea del CURSO está lista.\n\n(Nota: La línea del Tarjetón se generará y enviará al correo de la persona al aprobar el curso).`;
                } else {
                    this.alertConfig.message = `Persona registrada.\n\nLa línea de pago del CURSO está lista para entrega.`;
                }

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
    downloadPaymentOrder() {
        this.notificationService.showSuccess('Descarga iniciada', 'La orden de pago se está descargando.');
        this.closeAndRedirect();
    }

    sendEmail() {
        this.notificationService.showSuccess('Correo enviado', 'Se ha enviado la orden de pago al conductor.');
        this.closeAndRedirect();
    }

    closeAndRedirect() {
        this.isAlertOpen = false;
        // Redirigir a la lista de conductores
        // Redirigir a la lista de conductores (../ relativa a la ruta actual 'nuevo')
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onCancel() {
        window.history.back();
    }
}
