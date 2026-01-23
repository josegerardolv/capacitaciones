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

import { CourseType } from '../../../../core/models/group.model';
import { CourseTypeService } from '../../../../core/services/course-type.service';
import { CourseTypeConfig, DocumentConfig } from '../../../../core/models/course-type-config.model';

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
        DocumentSelectionModalComponent
    ],
    templateUrl: './person-registration.component.html'
})
export class PersonRegistrationComponent implements OnInit {

    cursoId: string | null = null;
    groupId: string | null = null;
    breadcrumbItems: BreadcrumbItem[] = [];
    prefilledData: any = null;

    // Configuración de campos del formulario
    fieldsConfig: Record<string, { visible?: boolean; required?: boolean }> = {};

    // Configuración del Modal
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
        this.breadcrumbItems.push({ label: 'Personas', url: this.cursoId && this.groupId ? `/cursos/${this.cursoId}/grupos/${this.groupId}/personas` : '/cursos' });
        this.breadcrumbItems.push({ label: 'Agregar' });

        this.route.queryParams.subscribe(params => {
            if (Object.keys(params).length > 0) {
                this.prefilledData = { ...params };
            }
        });

        if (this.groupId) {
            this.groupsService.getGroupById(+this.groupId).subscribe((group: Group | undefined) => {
                if (group) {
                    this.currentCourseType = group.courseType;

                    // NEW DYNAMIC LOGIC
                    if (group.courseTypeId) {
                        this.courseTypeService.getCourseTypeById(group.courseTypeId).subscribe(config => {
                            if (config) {
                                this.setupFormFields(config);
                            } else {
                                // Fallback if config not found but we have type string
                                this.setupFallbackFields(group.courseType);
                            }
                        });
                    } else {
                        // Fallback logic
                        this.setupFallbackFields(group.courseType);
                    }
                }
            });
        }
    }

    setupFormFields(config: CourseTypeConfig) {
        this.fieldsConfig = {};
        config.registrationFields.forEach(field => {
            this.fieldsConfig[field.fieldName] = {
                visible: field.visible,
                required: field.required
            };
        });

        // Setup Documents
        this.currentAvailableDocuments = config.availableDocuments;
    }

    setupFallbackFields(courseType: string) {
        if (courseType === 'LICENCIA') {
            this.fieldsConfig = {
                license: { visible: true, required: true },
                nuc: { visible: true },
                requestTarjeton: { visible: false }
            };
        } else {
            this.fieldsConfig = {
                license: { visible: false, required: false },
                nuc: { visible: false },
                requestTarjeton: { visible: false }
            };
        }
    }

    // Modal State
    isDocumentsModalOpen = false;
    tempPersonData: any = null;
    currentCourseType: 'LICENCIA' | 'GENERICO' | 'CAPACITACION_ESCOLAR' = 'LICENCIA'; // Default

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
        const wantsTarjeton = documents.some(d => d.id === 'tarjeton' && d.selected);

        // Merge with temp data
        const finalPersonData = {
            ...this.tempPersonData,
            requestTarjeton: wantsTarjeton,
            // We could store other docs if the backend supported it, e.g. requestedDocuments: documents.map(...)
        };

        this.finalizeRegistration(finalPersonData);
    }

    finalizeRegistration(personData: any) {
        // Simulamos guardado exitoso
        console.log('Guardando persona:', personData);

        // 0. Guardamos en el servicio
        const groupId = this.groupId ? +this.groupId : 1; // Fallback 1 si es null (no debería)

        this.notificationService.showInfo('Guardando', 'Procesando registro...');

        this.groupsService.registerPerson(groupId, personData).subscribe({
            next: (success) => {
                // Loading finished

                // 1. Preparamos el mensaje base (Siempre incluye el curso)
                let message = `La persona <strong>${personData.name}</strong> ha sido registrada correctamente.<br><br>
                            La línea de captura del <strong>Curso de Capacitación</strong> está lista.`;

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
        // Redirigir a la lista de personas
        // Redirigir a la lista de personas (../ relativa a la ruta actual 'nuevo')
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    onCancel() {
        window.history.back();
    }
}
