import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Person, PaymentStatus } from "../../../../../core/models/person.model";
import { UniversalIconComponent } from "../../../../../shared/components/universal-icon/universal-icon.component";
import { CourseTypeService } from "../../../../../core/services/course-type.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import {
  AlertModalComponent,
  AlertConfig,
} from "../../../../../shared/components/modals/alert-modal.component";
import {
  LoadingModalComponent,
  LoadingConfig
} from "../../../../../shared/components/modals/loading-modal.component";
import { InstitutionalButtonComponent } from "../../../../../shared/components/buttons/institutional-button.component";
import { TooltipDirective } from "../../../../../shared/components/tooltip/tooltip.directive";
import { PDFGeneratorService } from "../../../../../core/services/pdf-generator.service";
import { TemplateService } from "../../../../configurations/templates/services/template.service";
import { MailService } from "../../../services/mail.service";
import { GroupsService } from "../../../services/groups.service";
import {
  CertificateTemplate,
  CanvasDesign,
} from "../../../../../core/models/template.model";

export interface DocumentRow {
  id: string;
  name: string;
  description: string;
  cost: number;
  isPaid: boolean;
  templateId?: number;
  emailSent?: boolean; // Mantiene el estado local del envío de correo
  isLocked?: boolean; // Propiedad para la lógica de dependencias (bloqueo)
  stripeUrl?: string; // Cache de la URL de pago para evitar múltiples llamadas
  stripePdf?: string; // Cache del PDF de Stripe
  orderProcessed?: boolean; // Bloqueo de botón tras entrega
  paymentStatus?: PaymentStatus; // Estatus detallado del pago (PENDING, PAID, DUE, FAILED)
}

@Component({
  selector: "app-documents-modal",
  standalone: true,
  imports: [
    CommonModule,
    UniversalIconComponent,
    AlertModalComponent,
    LoadingModalComponent,
    InstitutionalButtonComponent,
    TooltipDirective,
  ],
  templateUrl: "./documents-modal.component.html",
})
export class DocumentsModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() person: Person | null = null;
  @Input() enrollment: any = null;
  @Input() courseTypeId: number | null = null;
  @Input() group: any = null;

  @Output() onClose = new EventEmitter<void>();

  documents: DocumentRow[] = [];
  isCheckingPayment = false;
  isDownloading = false;
  isSendingEmail = false;
  isGeneratingPayment = false;

  private readonly UMA_VALUE = 117.31;

  // Alert Config
  isAlertOpen = false;
  alertConfig: AlertConfig = {
    title: "",
    message: "",
    type: "info",
  };

  // Loading Modal Config
  isLoadingModalOpen = false;
  loadingConfig: LoadingConfig = {
    title: "Procesando",
    message: "Por favor espere...",
    size: 'md'
  };

  get canClose(): boolean {
    return !this.isGeneratingPayment && !this.isDownloading && !this.isSendingEmail;
  }

  constructor(
    private courseTypeService: CourseTypeService,
    private notificationService: NotificationService,
    private pdfService: PDFGeneratorService,
    private templateService: TemplateService,
    private mailService: MailService,
    private groupsService: GroupsService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: any) {
    if (changes.isOpen?.currentValue === true) {
      if (this.person) {
        this.refreshData();
      }
    } else if (changes.isOpen?.currentValue === false) {
      this.documents = [];
    }
  }

  private refreshData() {
    // Resolver IDs de cualquier fuente disponible
    const enrollmentId = this.enrollment?.enrollmentId || this.enrollment?.id || (this.person as any)?.enrollmentId;
    const groupId = this.group?.id || this.enrollment?.group?.id || this.enrollment?.groupId ||
      (this.person as any)?._rawEnrollment?.group?.id;

    if (!enrollmentId) {
      console.warn("Falta enrollmentId para recarga");
      this.loadDocuments();
      return;
    }

    const isFirstLoad = this.documents.length === 0;
    if (isFirstLoad) {
      this.isCheckingPayment = true;
    }

    // OPTIMIZACIÓN: Usar el endpoint individual en lugar de descargar TODO el grupo
    this.groupsService.getEnrollmentById(Number(enrollmentId)).subscribe({
      next: (freshEnrollment: any) => {
        if (freshEnrollment) {
          // Mantener la inscripción actualizada para estatus de pago
          this.enrollment = { ...this.enrollment, ...freshEnrollment };

          // Actualizar la relación de documentos y datos de la persona
          if (this.person && freshEnrollment.person) {
            // Unir datos frescos de la persona manteniéndolos actualizados (teléfono, dirección, etc.)
            this.person = {
              ...this.person, 
              ...freshEnrollment.person,
              documentCourseEnrollments: freshEnrollment.documentCourseEnrollments || []
            };
            // Guardar objeto raw para descargas posteriores
            (this.person as any)._rawEnrollment = freshEnrollment;
          }
        }

        this.loadDocuments();
        this.isCheckingPayment = false;
      },
      error: (err) => {
        console.error("Error al refrescar inscripción individual:", err);
        this.loadDocuments();
        this.isCheckingPayment = false;
      },
    });
  }

  loadDocuments() {
    if (!this.person) return;

    // Priorizar datos de la inscripción (fresca o pasada por el padre)
    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    const enrollmentsDocs: any[] = enrollmentData?.documentCourseEnrollments || [];

    if (enrollmentsDocs && enrollmentsDocs.length > 0) {
      this.documents = enrollmentsDocs.map((dce) => {
        const docCourse = dce.documentCourse;
        const template = docCourse?.templateDocument;
        const payment = template?.paymentConcept;
        // Usar la función auxiliar para seguridad
        const umas = payment?.umas ? Number(pumasValue(payment.umas)) : 0;
        const cost = umas * this.UMA_VALUE;

        const paymentsList = dce.payments || [];
        const hasPaidStatus = paymentsList.some((p: any) => {
          // PRIORIDAD: Si el estatus es PENDING, NO está pagado (aunque isPaid sea true por error del backend)
          if (p.status === PaymentStatus.PENDING) return false;
          return p.isPaid === true || p.status === PaymentStatus.PAID || p.status === 'succeeded' || p.status === 'COMPLETED';
        });

        const isPaidFlag = (cost === 0) ? true : hasPaidStatus;

        // NUEVO: Obtener el estatus más reciente para mostrarlo en el badge
        const lastPayment = paymentsList.length > 0 ? paymentsList[paymentsList.length - 1] : null;
        const currentStatus = lastPayment ? lastPayment.status : (isPaidFlag ? PaymentStatus.PAID : PaymentStatus.PENDING);

        const pendingPayment = paymentsList.find((p: any) => p.stripeUrl && p.status === 'PENDING');
        const defaultStripeUrl = pendingPayment ? pendingPayment.stripeUrl : undefined;
        const defaultStripePdf = pendingPayment ? (pendingPayment.stripePdf || pendingPayment.pdf) : undefined;

        // Mantener estados locales como 'emailSent' si ya estaban en la lista actual
        const existingDoc = this.documents.find(d => d.id === dce.id.toString());

        return {
          id: dce.id.toString(),
          name: template?.name || "Documento",
          description: template?.description || "Sin descripción",
          cost: cost,
          isPaid: isPaidFlag,
          templateId: template?.id,
          emailSent: existingDoc ? existingDoc.emailSent : (dce.emailSent || false),
          isLocked: false,
          orderProcessed: existingDoc ? existingDoc.orderProcessed : (!!defaultStripeUrl || dce.emailSent || false),
          stripeUrl: existingDoc?.stripeUrl || defaultStripeUrl,
          stripePdf: existingDoc?.stripePdf || defaultStripePdf
        };
      });
      return;
    }

    // 2. FALLBACK ANTIGUO
    if (!this.courseTypeId) return;

    this.courseTypeService.getCourseTypeById(this.courseTypeId).subscribe((config) => {
      if (!config) return;
      const requestedIds = this.person?.requestedDocuments || [];
      const paidIds = this.person?.paidDocumentIds || [];
      const mandatoryDocs = config.availableDocuments.filter(d => d.isMandatory);
      const areMandatoryPaid = mandatoryDocs.every(d => d.cost === 0 || paidIds.includes(d.id));

      this.documents = config.availableDocuments
        .filter((doc) => requestedIds.includes(doc.id) || doc.isMandatory)
        .map((doc) => {
          let isPaid = (doc.cost === 0) || paidIds.includes(doc.id);
          const isLocked = !doc.isMandatory && !areMandatoryPaid;
          return {
            id: doc.id.toString(),
            name: doc.name,
            description: doc.description || doc.name,
            cost: (Number(doc.cost) || 0) * this.UMA_VALUE,
            isPaid: isPaid,
            templateId: doc.templateId,
            isLocked: isLocked,
            paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING
          };
        });
    });
  }

  close() {
    this.isOpen = false;
    this.documents = [];
    this.onClose.emit();
  }

  printPaymentOrder(doc: DocumentRow) {
    if (!this.person?.id) {
      this.notificationService.showError("Error", "No se encontró el ID de la persona.");
      return;
    }

    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    if (!enrollmentData) {
      this.notificationService.showError("Error", "No se encontraron datos de inscripción.");
      return;
    }

    const dce = enrollmentData.documentCourseEnrollments?.find((d: any) => d.id?.toString() === doc.id);
    const templateDoc = dce?.documentCourse?.templateDocument;

    const p = this.person;
    const fullName = (p.paternal_lastName && p.name.includes(p.paternal_lastName))
      ? p.name
      : [p.name, p.paternal_lastName, p.maternal_lastName].filter(Boolean).join(" ").trim();

    if (doc.stripeUrl && doc.stripePdf) {
      this.showStripeModal(doc, doc.stripeUrl, doc.stripePdf, fullName);
      return;
    }

    const payload = {
      customer: {
        email: this.person.email,
        name: fullName,
        personId: Number(this.person.id)
      },
      invoice: {
        paymentConceptID: Number(templateDoc?.paymentConcept?.id) || 0,
        description: doc.name
      },
      enrollment: Number(enrollmentData.enrollmentId || enrollmentData.id) || 0,
      documentCourseEnrollment: Number(dce?.id) || 0
    };

    this.isGeneratingPayment = true;
    this.isLoadingModalOpen = true;
    this.loadingConfig = {
      title: "Generando Línea de Captura",
      message: "Obteniendo información de SIOX...",
      size: 'md',
      preventClose: true
    };

    this.mailService.sendStripeInvoice(payload).subscribe({
      next: (response: any) => {
        this.isGeneratingPayment = false;
        this.isLoadingModalOpen = false;
        doc.stripeUrl = response.url;
        doc.stripePdf = response.pdf;
        this.showStripeModal(doc, response.url, response.pdf, fullName);
      },
      error: (err: any) => {
        this.isGeneratingPayment = false;
        this.isLoadingModalOpen = false;
        console.error("Error en Stripe Invoice:", err);
        const errorMsg = err.error?.message || "Ocurrió un error al contactar el servidor de pagos.";
        this.alertConfig = {
          title: "Error de Pago",
          message: errorMsg,
          type: "danger",
          actions: [{ label: 'Entendido', variant: 'outline', action: () => { this.isAlertOpen = false; } }]
        };
        this.isAlertOpen = true;
      }
    });
  }

  private showStripeModal(doc: DocumentRow, url: string, pdf: string, fullName: string) {
    this.alertConfig = {
      title: "Línea de Captura",
      message: `Seleccione cómo desea entregar la Línea de Captura para: <strong>${doc.name}</strong>`,
      type: "success",
      showCloseButton: false,
      closeOnEscape: false,
      closeOnOverlay: false,
      actions: [
        {
          label: 'Enviar por Correo',
          variant: 'primary',
          action: () => {
            this.isAlertOpen = false;

            // Mostrar cargando para el envío de mail de Stripe
            this.isLoadingModalOpen = true;
            this.loadingConfig = {
              title: "Enviando Línea de Captura",
              message: `Obteniendo información de SIOX para el envío a ${this.person?.email || 'su correo'}...`,
              size: 'md'
            };

            this.mailService.sendPaymentUrlByMail(this.person?.email || '', doc.name, fullName, url).subscribe({
              next: () => {
                this.isLoadingModalOpen = false;
                doc.orderProcessed = true; // Bloquear botón
                this.alertConfig = {
                  title: "¡Envío Exitoso!",
                  message: `La línea de pago para <b>${doc.name}</b> ha sido enviada correctamente a <b>${this.person?.email}</b>.`,
                  type: "success",
                  actions: [{ label: 'Entendido', variant: 'outline', action: () => { this.isAlertOpen = false; } }]
                };
                this.isAlertOpen = true;
              },
              error: (err) => {
                this.isLoadingModalOpen = false;
                this.notificationService.showError("Error", "Ocurrió un problema al enviar el correo");
              }
            });
          }
        },
        {
          label: 'Descargar PDF',
          variant: 'secondary',
          action: () => {
            window.open(pdf, '_blank');
            this.isAlertOpen = false;
            doc.orderProcessed = true; // Bloquear botón
            this.notificationService.showSuccess("Descargado", "La línea de captura se abrió en una nueva pestaña.");
          }
        }
      ]
    };
    this.isAlertOpen = true;
  }

  async downloadCertificate(doc: DocumentRow) {
    if (this.isDownloading) return;

    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    if (!enrollmentData) {
      this.notificationService.showError("Error", "No se encontraron datos de inscripción.");
      return;
    }

    const dce = enrollmentData.documentCourseEnrollments?.find((d: any) => d.id?.toString() === doc.id);
    const templateDoc = dce?.documentCourse?.templateDocument;
    if (!templateDoc?.fields?.length) {
      this.notificationService.showError("Error", "No se encontró el diseño del template.");
      return;
    }

    let design: CanvasDesign | null = null;
    try {
      design = TemplateService.parseDesign(templateDoc.fields);
    } catch (e) {
      this.notificationService.showError("Error", "El diseño del template no es válido.");
      return;
    }

    const extractedVars = TemplateService.extractVariablesFromEnrollment(enrollmentData);
    const variableValues: Record<string, string> = {};
    extractedVars.forEach(v => { if (v.sampleValue) variableValues[v.name] = v.sampleValue; });
    if (dce?.folio != null) variableValues["folio"] = String(dce.folio);

    const person = enrollmentData.person;
    if (person) {
      const p = enrollmentData.person || person;
      const fullName = (p.paternal_lastName && p.name.includes(p.paternal_lastName))
        ? p.name
        : [p.name, p.paternal_lastName, p.maternal_lastName].filter(Boolean).join(" ").trim();
      if (fullName && !variableValues["nombre_completo"]) variableValues["nombre_completo"] = fullName;
    }

    const groupData = this.group;
    const courseData = groupData?.course;
    if (courseData?.name) {
      variableValues["nombre_curso"] = String(courseData.name);
    }
    if (courseData?.duration != null) {
      const hours = Math.round(Number(courseData.duration) / 60);
      variableValues["tiempo_curso"] = `${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    if (groupData?.groupStartDate) {
      const d = new Date(groupData.groupStartDate);
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      variableValues["fecha_curso"] = `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} del ${d.getUTCFullYear()}`;
    }

    const certTemplate: CertificateTemplate = {
      id: templateDoc.id,
      name: templateDoc.name || doc.name,
      description: templateDoc.description || "",
      category: templateDoc.category || "GENERAL",
      claveConcepto: "",
      pageConfig: design?.pageConfig || this.templateService.getDefaultPageConfig(),
      elements: design?.elements || [],
      variables: design?.variables || [],
    };

    this.isDownloading = true;
    this.isLoadingModalOpen = true;
    this.loadingConfig = {
      title: "Generando Documento",
      message: `Preparando la descarga de ${doc.name}...`,
      size: 'md',
      preventClose: true
    };

    try {
      const result = await this.pdfService.generateFromTemplate(certTemplate, variableValues, {
        filename: `${doc.name}_${person?.name || "documento"}`,
        action: "download",
      });

      this.isLoadingModalOpen = false;
      if (result.success) {
        this.alertConfig = {
          title: "¡Descarga Exitosa!",
          message: `El documento <b>${doc.name}</b> se ha generado y descargado correctamente.`,
          type: "success",
          actions: [{ label: 'Excelente', variant: 'outline', action: () => { this.isAlertOpen = false; } }]
        };
        this.isAlertOpen = true;
      } else {
        this.notificationService.showError("Error", result.error || "No se pudo generar el PDF.");
      }
    } catch (err: any) {
      console.error("Error generating certificate PDF:", err);
      this.notificationService.showError("Error", "Ocurrió un error al generar el PDF.");
    } finally {
      this.isDownloading = false;
    }
  }

  async emailCertificate(doc: DocumentRow) {
    if (this.isSendingEmail) return;
    if (!this.person?.id) {
      this.notificationService.showError("Error", "ID de persona no encontrado.");
      return;
    }

    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    const dce = enrollmentData?.documentCourseEnrollments?.find((d: any) => d.id?.toString() === doc.id);
    const templateDoc = dce?.documentCourse?.templateDocument;

    if (!templateDoc?.fields?.length) {
      this.notificationService.showError("Error", "No se encontró el diseño del template.");
      return;
    }

    let design: CanvasDesign | null = null;
    try {
      design = TemplateService.parseDesign(templateDoc.fields);
    } catch (e) {
      this.notificationService.showError("Error", "Diseño no válido.");
      return;
    }

    const extractedVars = TemplateService.extractVariablesFromEnrollment(enrollmentData);
    const variableValues: Record<string, string> = {};
    extractedVars.forEach(v => { if (v.sampleValue) variableValues[v.name] = v.sampleValue; });
    if (dce?.folio != null) variableValues["folio"] = String(dce.folio);

    const person = enrollmentData?.person;
    if (person) {
      const p = enrollmentData?.person || person;
      const fullName = (p.paternal_lastName && p.name.includes(p.paternal_lastName))
        ? p.name
        : [p.name, p.paternal_lastName, p.maternal_lastName].filter(Boolean).join(" ").trim();
      if (fullName && !variableValues["nombre_completo"]) variableValues["nombre_completo"] = fullName;
    }

    const groupData = this.group;
    const courseData = groupData?.course;
    if (courseData?.name) {
      variableValues["nombre_curso"] = String(courseData.name);
    }
    if (courseData?.duration != null) {
      const hours = Math.round(Number(courseData.duration) / 60);
      variableValues["tiempo_curso"] = `${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    if (groupData?.groupStartDate) {
      const d = new Date(groupData.groupStartDate);
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      variableValues["fecha_curso"] = `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} del ${d.getUTCFullYear()}`;
    }

    const certTemplate: CertificateTemplate = {
      id: templateDoc.id,
      name: templateDoc.name || doc.name,
      description: templateDoc.description || "",
      category: templateDoc.category || "GENERAL",
      claveConcepto: "",
      pageConfig: design?.pageConfig || this.templateService.getDefaultPageConfig(),
      elements: design?.elements || [],
      variables: design?.variables || [],
    };

    this.isSendingEmail = true;
    this.isLoadingModalOpen = true;
    this.loadingConfig = {
      title: "Enviando Correo",
      message: `Generando PDF y enviando ${doc.name} a ${this.person.email}...`,
      size: 'md',
      preventClose: true
    };

    try {
      const result = await this.pdfService.generateFromTemplate(certTemplate, variableValues, {
        filename: `${doc.name}.pdf`,
        action: "base64",
        imageQuality: 0.2
      });

      if (result.success && result.dataUrl) {
        const base64Pdf = result.dataUrl.includes('base64,') ? result.dataUrl.split('base64,')[1] : result.dataUrl;

        this.mailService.sendWithTemplate(
          this.person.id,
          'constancia',
          `Tu ${doc.name} - SEMOVI`,
          base64Pdf,
          `${doc.name}.pdf`
        ).subscribe({
          next: (res: any) => {
            this.isSendingEmail = false;
            this.isLoadingModalOpen = false;

            const successMsg = res?.message || "La constancia se envió correctamente.";
            this.alertConfig = {
              title: "¡Envío Exitoso!",
              message: `<b>${doc.name}</b> se envió correctamente a <b>${this.person?.email}</b>.<br><small>${successMsg}</small>`,
              type: "success",
              actions: [{ label: 'Cerrar', variant: 'outline', action: () => { this.isAlertOpen = false; } }]
            };
            this.isAlertOpen = true;
            doc.emailSent = true;
          },
          error: (err: any) => {
            this.isSendingEmail = false;
            this.isLoadingModalOpen = false;
            console.error(err);
            this.notificationService.showError("Error", err.error?.message || "No se pudo enviar el correo de la constancia.");
          }
        });
      } else {
        this.isSendingEmail = false;
        this.isLoadingModalOpen = false;
        this.notificationService.showError("Error", "No se pudo generar el PDF para el envío.");
      }
    } catch (err) {
      this.isSendingEmail = false;
      this.notificationService.showError("Error", "Error interno al procesar el documento.");
    }
  }
}

function pumasValue(val: any): number {
  return val ? Number(val) : 0;
}
