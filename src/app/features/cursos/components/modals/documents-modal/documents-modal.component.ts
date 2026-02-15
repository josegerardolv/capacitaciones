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
        if (!this.person || !this.courseTypeId) return;

        this.checkSioxStatus();

        this.courseTypeService.getCourseTypeById(this.courseTypeId).subscribe(config => {
            if (!config) return;

            const requestedIds = this.person?.requestedDocuments || [];

            // 1. Verificar si los Documentos Obligatorios están pagados
            // Usamos paidDocumentIds para un control preciso.
            const paidIds = this.person?.paidDocumentIds || [];

            const mandatoryDocs = config.availableDocuments.filter(d => d.isMandatory);
            // Son obligatorios pagados si costo es 0 O si su ID está en la lista de pagados
            const areMandatoryPaid = mandatoryDocs.every(d => d.cost === 0 || paidIds.includes(d.id));

            this.documents = config.availableDocuments
                .filter(doc => requestedIds.includes(doc.id) || doc.isMandatory)
                .map(doc => {
                    let isPaid = false;
                    if (doc.cost === 0) {
                        isPaid = true;
                    } else {
                        // Verificar si el ID específico está en la lista de pagados
                        isPaid = paidIds.includes(doc.id);
                    }

                    // LÓGICA DE BLOQUEO:
                    // Si el doc NO es obligatorio Y los obligatorios NO están pagados -> BLOQUEADO
                    const isLocked = !doc.isMandatory && !areMandatoryPaid;

                    // Preservar estado local (emailSent) de la lista existente
                    const existingDoc = this.documents.find(d => d.id === doc.id);

                    return {
                        id: doc.id,
                        name: doc.name,
                        description: doc.description || doc.name,
                        cost: Number(doc.cost) || 0,
                        isPaid: isPaid,
                        templateId: doc.templateId,
                        emailSent: existingDoc ? existingDoc.emailSent : false,
                        isLocked: isLocked
                    };
                });
            console.log('Documents Modal Loaded:', this.documents);
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
        console.log('Downloading payment order:', doc.name);
        this.notificationService.showSuccess('Descargando', 'Generando PDF de la orden de pago...');
    }

    downloadCertificate(doc: DocumentRow) {
        console.log('Admin downloading certificate:', doc.name);
        this.notificationService.showSuccess('Descarga Admin', `Recuperando archivo de: ${doc.name}`);
    }

    emailCertificate(doc: DocumentRow) {
        console.log('Emailing certificate to:', this.person?.email);
        this.notificationService.showSuccess('Enviado', `Constancia enviada a: ${this.person?.email || 'Correo del usuario'}`);
    }

    // --- SIOX INTEGRATION ---
    private checkSioxStatus() {
        // TODO: Cuando el backend esté listo, conectar a:
        // GET /api/payments/status?personId={id}

        this.isCheckingPayment = true;
        console.log('Consultando SIOX...');

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
        if (!this.courseTypeId) return;

        this.courseTypeService.getCourseTypeById(this.courseTypeId).subscribe(config => {
            if (!config) return;

            const requestedIds = this.person?.requestedDocuments || [];

            // Re-calcular estatus de obligatorios al actualizar
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

                    // LÓGICA DE BLOQUEO
                    const isLocked = !doc.isMandatory && !areMandatoryPaid;

                    // Preservar estado local (emailSent) de la lista existente
                    const existingDoc = this.documents.find(d => d.id === doc.id);

                    return {
                        id: doc.id,
                        name: doc.name,
                        description: doc.description || doc.name,
                        cost: doc.cost || 0,
                        isPaid: isPaid,
                        templateId: doc.templateId,
                        emailSent: existingDoc ? existingDoc.emailSent : false,
                        isLocked: isLocked
                    };
                });
        });
    }
}
