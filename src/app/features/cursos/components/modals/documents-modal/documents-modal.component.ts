import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../../../../../core/models/person.model';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { CourseTypeService } from '../../../../../core/services/course-type.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AlertModalComponent, AlertConfig } from '../../../../../shared/components/modals/alert-modal.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { TooltipDirective } from '../../../../../shared/components/tooltip/tooltip.directive';

export interface DocumentRow {
    id: string;
    name: string;
    description: string;
    cost: number;
    isPaid: boolean;
    templateId?: number;
    emailSent?: boolean; // Mantiene el estado local del envío de correo
    isLocked?: boolean; // Propiedad para la lógica de dependencias (bloqueo)
}

@Component({
    selector: 'app-documents-modal',
    standalone: true,
    imports: [CommonModule, UniversalIconComponent, AlertModalComponent, InstitutionalButtonComponent, TooltipDirective],
    templateUrl: './documents-modal.component.html'
})
export class DocumentsModalComponent implements OnInit {
    @Input() isOpen = false;
    @Input() person: Person | null = null;
    @Input() courseTypeId: number | null = null;

    @Output() onClose = new EventEmitter<void>();

    documents: DocumentRow[] = [];
    isCheckingPayment = false;

    // Alert Config
    isAlertOpen = false;
    alertConfig: AlertConfig = {
        title: '',
        message: '',
        type: 'info'
    };

    constructor(
        private courseTypeService: CourseTypeService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
    }

    loadDocuments() {
        if (!this.person) return;

        this.checkSioxStatus();

        // 1. NUEVA FORMA: Leer desde la respuesta del JSON directamente
        const enrollmentsDocs: any[] = (this.person as any).documentCoursesEnrollments;

        if (enrollmentsDocs && enrollmentsDocs.length > 0) {
            this.documents = enrollmentsDocs.map(dce => {
                const docCourse = dce.documentCourse;
                const template = docCourse?.templateDocument;
                const payment = template?.paymentConcept;
                const cost = payment?.umas ? Number(payment.umas) : 0;

                // Mantenemos estado local (emailSent) si ya existía en pantalla
                const existingDoc = this.documents.find(d => d.id === dce.id.toString());

                return {
                    id: dce.id.toString(), // Usamos el ID de la relación como univoco
                    name: template?.name || 'Documento',
                    description: template?.description || 'Sin descripción',
                    cost: cost,
                    isPaid: cost === 0, // Por ahora asumimos verdadero si no cuesta
                    templateId: template?.id,
                    emailSent: existingDoc ? existingDoc.emailSent : false,
                    isLocked: false // O lo que defina la regla de dependencias
                };
            });
            return;
        }

        // 2. FALLBACK ANTIGUO: (Si la data se carga vieja o no tiene enrollments)
        if (!this.courseTypeId) return;

        this.courseTypeService.getCourseTypeById(this.courseTypeId).subscribe(config => {
            if (!config) return;

            const requestedIds = this.person?.requestedDocuments || [];
            const paidIds = this.person?.paidDocumentIds || [];
            const mandatoryDocs = config.availableDocuments.filter(d => d.isMandatory);
            const areMandatoryPaid = mandatoryDocs.every(d => d.cost === 0 || paidIds.includes(d.id));

            this.documents = config.availableDocuments
                .filter(doc => requestedIds.includes(doc.id) || doc.isMandatory)
                .map(doc => {
                    let isPaid = false;
                    if (doc.cost === 0) {
                        isPaid = true;
                    } else {
                        isPaid = paidIds.includes(doc.id);
                    }

                    const isLocked = !doc.isMandatory && !areMandatoryPaid;
                    const existingDoc = this.documents.find(d => d.id === doc.id);

                    return {
                        id: doc.id.toString(),
                        name: doc.name,
                        description: doc.description || doc.name,
                        cost: Number(doc.cost) || 0,
                        isPaid: isPaid,
                        templateId: doc.templateId,
                        emailSent: existingDoc ? existingDoc.emailSent : false,
                        isLocked: isLocked
                    };
                });
        });
    }

    ngOnChanges() {
        if (this.isOpen && this.person) {
            this.loadDocuments();
        }
    }

    close() {
        this.isOpen = false;
        this.onClose.emit();
    }

    printPaymentOrder(doc: DocumentRow) {
        // Build actions dynamically based on state
        const actions: any[] = [];

        // 1. Download Option (Always available)
        actions.push({
            label: 'Descargar PDF',
            variant: 'secondary',
            action: () => {
                this.downloadPaymentOrder(doc);
                this.isAlertOpen = false;
            }
        });

        // 2. Email Option (Only if not sent yet)
        if (!doc.emailSent) {
            actions.unshift({ // Add to start (Primary)
                label: 'Enviar por Correo',
                variant: 'primary',
                action: () => {
                    this.sendPaymentOrderEmail(doc);
                    this.isAlertOpen = false;
                }
            });
        }

        this.alertConfig = {
            title: doc.emailSent ? 'Orden de Pago Enviada' : 'Generar Orden de Pago',
            message: doc.emailSent
                ? `La orden de pago ya fue enviada a ${this.person?.email}.<br>¿Desea descargar una copia PDF?`
                : `Seleccione cómo desea entregar la Línea de Captura para: <strong>${doc.name}</strong>`,
            type: 'info',
            actions: actions
        };
        this.isAlertOpen = true;
    }

    private sendPaymentOrderEmail(doc: DocumentRow) {
        doc.emailSent = true;
        this.notificationService.showSuccess('Enviado', `La orden de pago se envió a: ${this.person?.email}`);
    }

    private downloadPaymentOrder(doc: DocumentRow) {
        this.notificationService.showSuccess('Descargando', 'Generando PDF de la orden de pago...');
    }

    downloadCertificate(doc: DocumentRow) {
        this.notificationService.showSuccess('Descarga Admin', `Recuperando archivo de: ${doc.name}`);
    }

    emailCertificate(doc: DocumentRow) {
        this.notificationService.showSuccess('Enviado', `Constancia enviada a: ${this.person?.email || 'Correo del usuario'}`);
    }

    // --- SIOX INTEGRATION ---
    private checkSioxStatus() {
        // TODO: Cuando el backend esté listo, conectar a:
        // GET /api/payments/status?personId={id}

        this.isCheckingPayment = true;

        // Simulamos delay de red
        setTimeout(() => {
            this.isCheckingPayment = false;
            // Aquí actualizaríamos el estatus si SIOX dice que ya pagó
            // if (response.status === 'PAID') this.person.paymentStatus = 'Pagado';

            // Refrescamos la vista de documentos
            this.updateDocumentsList();
        }, 800);
    }

    private updateDocumentsList() {
        // En el futuro, si el pago de SIOX se verifica, actualizamos la vista
        // Por ahora, simplemente recargamos la lista con la misma lógica
        this.loadDocuments();
    }
}
