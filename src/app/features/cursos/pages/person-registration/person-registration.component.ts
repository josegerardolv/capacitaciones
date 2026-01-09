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
        this.breadcrumbItems.push({ label: 'Personas', url: this.cursoId && this.groupId ? `/cursos/${this.cursoId}/grupos/${this.groupId}/conductores` : '/cursos' });
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
    tempDriverData: any = null;
    currentCourseType: 'LICENCIA' | 'GENERICO' | 'CAPACITACION_ESCOLAR' = 'LICENCIA'; // Default

    onDriverSaved(driverData: any) {
        this.tempDriverData = driverData;

        // Determine course type for the modal
        // We can get it from the group call in ngOnInit, but let's ensure we have it stored.
        // We'll update the class property in the subscription.

        this.isDocumentsModalOpen = true;
    }

    onDocumentsConfirmed(documents: DocumentOption[]) {
        this.isDocumentsModalOpen = false;

        // Map selected documents to driver data
        const wantsTarjeton = documents.some(d => d.id === 'tarjeton' && d.selected);

        // Merge with temp data
        const finalDriverData = {
            ...this.tempDriverData,
            requestTarjeton: wantsTarjeton,
            // We could store other docs if the backend supported it, e.g. requestedDocuments: documents.map(...)
        };

        this.finalizeRegistration(finalDriverData);
    }

    finalizeRegistration(driverData: any) {
        // Simulamos guardado exitoso
        console.log('Guardando conductor:', driverData);

        // 1. Preparamos el mensaje base (Siempre incluye el curso)
        let message = `El conductor <strong>${driverData.name}</strong> ha sido registrado correctamente.<br><br>
                       La línea de captura del <strong>Curso de Capacitación</strong> está lista.`;

        // 2. Agregamos nota sobre Tarjetón si fue solicitado
        if (driverData.requestTarjeton) {
            message += `<br><br>
                        <span class="text-sm text-gray-600">
                        * Solicitud de Tarjetón registrada. La línea de pago del Tarjetón se generará 
                        automáticamente <strong>una vez que apruebe el curso</strong>.
                        </span>`;
        }

        // 3. Configuramos el Modal con botones de acción (Descargar / Enviar)
        this.alertConfig = {
            title: '¡Registro Exitoso!',
            message: '', // Usamos content projection o innerHTML si el componente lo permite, o simplemente texto.
            // Nota: AlertModal usa {{ message }} string. Para HTML complejo mejor simplificar o usar componente custom.
            // Simplificaremos para texto plano por seguridad si AlertModal no soporta HTML safe.
            // Re-reading alert-modal: usa {{ config.message }}.
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

        // Ajuste para mensaje con saltos de linea (simulado)
        if (driverData.requestTarjeton) {
            this.alertConfig.message = `Conductor registrado.\n\nLa línea del CURSO está lista.\n\n(Nota: La línea del Tarjetón se generará y enviará al correo del conductor al aprobar el curso).`;
        } else {
            this.alertConfig.message = `Conductor registrado.\n\nLa línea de pago del CURSO está lista para entrega.`;
        }

        this.isAlertOpen = true;
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
        this.router.navigate(['../../'], { relativeTo: this.router.routerState.root.firstChild?.firstChild });
        // Fix simple de ruta:
        // Estamos en /cursos/grupos/ID/conductores/nuevo
        // Queremos ir a /cursos/grupos/ID/conductores
        // Mejor usamos Location o History, pero router es más seguro.
        // Asumiendo ruta relativa:
        window.history.back();
    }

    onCancel() {
        window.history.back();
    }
}
