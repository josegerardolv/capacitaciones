import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Person } from "../../../../../core/models/person.model";
import { UniversalIconComponent } from "../../../../../shared/components/universal-icon/universal-icon.component";
import { CourseTypeService } from "../../../../../core/services/course-type.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import {
  AlertModalComponent,
  AlertConfig,
} from "../../../../../shared/components/modals/alert-modal.component";
import { InstitutionalButtonComponent } from "../../../../../shared/components/buttons/institutional-button.component";
import { TooltipDirective } from "../../../../../shared/components/tooltip/tooltip.directive";
import { PDFGeneratorService } from "../../../../../core/services/pdf-generator.service";
import { TemplateService } from "../../../../configurations/templates/services/template.service";
import { MailService } from "../../../services/mail.service";
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
}

@Component({
  selector: "app-documents-modal",
  standalone: true,
  imports: [
    CommonModule,
    UniversalIconComponent,
    AlertModalComponent,
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

  @Output() onClose = new EventEmitter<void>();

  documents: DocumentRow[] = [];
  isCheckingPayment = false;

  private readonly UMA_VALUE = 117.31;

  // Alert Config
  isAlertOpen = false;
  alertConfig: AlertConfig = {
    title: "",
    message: "",
    type: "info",
  };

  isDownloading = false;

  constructor(
    private courseTypeService: CourseTypeService,
    private notificationService: NotificationService,
    private pdfGenerator: PDFGeneratorService,
    private templateService: TemplateService,
    private mailService: MailService,
  ) { }

  ngOnInit() { }

  loadDocuments() {
    if (!this.person) return;

    this.checkSioxStatus();

    // 1. NUEVA FORMA: Leer desde la respuesta del JSON directamente
    const enrollmentsDocs: any[] = (this.person as any)
      .documentCoursesEnrollments;

    if (enrollmentsDocs && enrollmentsDocs.length > 0) {
      this.documents = enrollmentsDocs.map((dce) => {
        const docCourse = dce.documentCourse;
        const template = docCourse?.templateDocument;
        const payment = template?.paymentConcept;
        const umas = payment?.umas ? Number(payment.umas) : 0;
        const cost = umas * this.UMA_VALUE;

        const paymentsList = dce.payments || [];
        const hasPaidStatus = paymentsList.some((p: any) => p.isPaid === true || p.status === 'PAID' || p.status === 'succeeded');
        
        const isPaidFlag = (cost === 0) ? true : hasPaidStatus;

        // Si ya hay un pagó generado pendiente de pagar, podemos precargar el url en el cache
        const pendingPayment = paymentsList.find((p: any) => p.stripeUrl && p.status === 'PENDING');
        const defaultStripeUrl = pendingPayment ? pendingPayment.stripeUrl : undefined;
        // El PDF no viene en ese objeto, pero podríamos derivarlo o dejarlo undefined

        // Mantenemos estado local (emailSent) si ya existía en pantalla
        const existingDoc = this.documents.find(
          (d) => d.id === dce.id.toString(),
        );

        return {
          id: dce.id.toString(), // Usamos el ID de la relación como univoco
          name: template?.name || "Documento",
          description: template?.description || "Sin descripción",
          cost: cost,
          isPaid: isPaidFlag,
          templateId: template?.id,
          emailSent: existingDoc ? existingDoc.emailSent : false,
          isLocked: false, // O lo que defina la regla de dependencias
          stripeUrl: existingDoc?.stripeUrl || defaultStripeUrl,
          stripePdf: existingDoc?.stripePdf 
        };
      });
      return;
    }

    // 2. FALLBACK ANTIGUO: (Si la data se carga vieja o no tiene enrollments)
    if (!this.courseTypeId) return;

    this.courseTypeService
      .getCourseTypeById(this.courseTypeId)
      .subscribe((config) => {
        if (!config) return;

        const requestedIds = this.person?.requestedDocuments || [];
        const paidIds = this.person?.paidDocumentIds || [];
        const mandatoryDocs = config.availableDocuments.filter(
          (d) => d.isMandatory,
        );
        const areMandatoryPaid = mandatoryDocs.every(
          (d) => d.cost === 0 || paidIds.includes(d.id),
        );

        this.documents = config.availableDocuments
          .filter((doc) => requestedIds.includes(doc.id) || doc.isMandatory)
          .map((doc) => {
            let isPaid = false;
            if (doc.cost === 0) {
              isPaid = true;
            } else {
              isPaid = paidIds.includes(doc.id);
            }

            const isLocked = !doc.isMandatory && !areMandatoryPaid;
            const existingDoc = this.documents.find((d) => d.id === doc.id);

            return {
              id: doc.id.toString(),
              name: doc.name,
              description: doc.description || doc.name,
              cost: (Number(doc.cost) || 0) * this.UMA_VALUE,
              isPaid: isPaid,
              templateId: doc.templateId,
              emailSent: existingDoc ? existingDoc.emailSent : false,
              isLocked: isLocked,
            };
          });
      });
  }

  ngOnChanges(changes: any) {
    if (changes.isOpen) {
      if (this.isOpen && this.person) {
        this.loadDocuments();
      } else if (!this.isOpen) {
        this.documents = []; // Limpiar para que no muestre datos anteriores
      }
    } else if (changes.person && this.isOpen) {
      this.loadDocuments();
    }
  }

  close() {
    this.isOpen = false;
    this.documents = [];
    this.onClose.emit();
  }

  printPaymentOrder(doc: DocumentRow) {
    if (!this.person?.id) {
        this.notificationService.showError("Error", "No se encontró el ID de la persona para generar el pago.");
        return;
    }

    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    if (!enrollmentData) {
      this.notificationService.showError("Error", "No se encontraron datos de inscripción.");
      return;
    }

    const dce = enrollmentData.documentCoursesEnrollments?.find((d: any) => d.id?.toString() === doc.id);
    const templateDoc = dce?.documentCourse?.templateDocument;
    
    const fullName = [this.person.name, this.person.paternal_lastName, this.person.maternal_lastName]
        .filter(Boolean).join(" ").trim();

    // 1. Si ya generamos los links en esta sesión, mostramos el modal directamente sin llamar a la API
    if (doc.stripeUrl && doc.stripePdf) {
        this.showStripeModal(doc, doc.stripeUrl, doc.stripePdf, fullName);
        return;
    }

    // Construir el payload que espera el endpoint /stripe/invoice
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

    this.notificationService.showSuccess("Generando", "Contactando a Stripe para generar la línea de captura...");

    this.mailService.sendStripeInvoice(payload).subscribe({
        next: (response: any) => {
            // 2. Guardamos en cache local para no volver a pedirlo
            doc.stripeUrl = response.url;
            doc.stripePdf = response.pdf;
            this.showStripeModal(doc, response.url, response.pdf, fullName);
        },
        error: (err: any) => {
            console.error("Error en Stripe Invoice:", err);
            const errorMsg = err.error?.message || "Ocurrió un error al contactar el servidor de pagos.";
            this.alertConfig = {
              title: "Error de Pago",
              message: errorMsg,
              type: "danger",
              actions: [ { label: 'Entendido', variant: 'outline', action: () => { this.isAlertOpen = false; } } ]
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
          actions: [
            { 
              label: 'Enviar por Correo', 
              variant: 'primary', 
              action: () => { 
                  this.isAlertOpen = false;
                  this.notificationService.showSuccess("Enviando", "Mandando el enlace de pago por correo...");
                  this.mailService.sendPaymentUrlByMail(this.person?.email || '', doc.name, fullName, url).subscribe({
                      next: () => this.notificationService.showSuccess("Enviado", `Línea de pago enviada a ${this.person?.email || 'su correo'}`),
                      error: () => this.notificationService.showError("Error", "Ocurrió un problema al enviar el correo")
                  });
              } 
            },
            { 
              label: 'Descargar PDF', 
              variant: 'secondary', 
              action: () => { window.open(pdf, '_blank'); this.isAlertOpen = false; } 
            }
          ]
      };
      this.isAlertOpen = true;
  }

  private downloadPaymentOrder(doc: DocumentRow) {
    this.notificationService.showSuccess(
      "Descargando",
      "Generando PDF de la orden de pago...",
    );
  }

  async downloadCertificate(doc: DocumentRow) {
    if (this.isDownloading) return;

    // 1. Buscar el documentCoursesEnrollment que corresponde a este documento
    const enrollmentData =
      this.enrollment || (this.person as any)?._rawEnrollment;
    if (!enrollmentData) {
      this.notificationService.showError(
        "Error",
        "No se encontraron datos de inscripción para generar el PDF.",
      );
      return;
    }

    // Encontrar el documentCoursesEnrollment correcto
    const dce = enrollmentData.documentCoursesEnrollments?.find(
      (d: any) => d.id?.toString() === doc.id,
    );
    const templateDoc = dce?.documentCourse?.templateDocument;
    if (!templateDoc?.fields?.length) {
      this.notificationService.showError(
        "Error",
        "No se encontró el diseño del template para este documento.",
      );
      return;
    }

    // 2. Parsear el diseño del template
    let design: CanvasDesign | null = null;
    try {
      design = TemplateService.parseDesign(templateDoc.fields);
    } catch (e) {
      this.notificationService.showError(
        "Error",
        "El diseño del template no es válido.",
      );
      return;
    }
    if (!design) {
      this.notificationService.showError(
        "Error",
        "No se pudo interpretar el diseño del template.",
      );
      return;
    }

    // 3. Extraer variables de la persona/enrollment
    const extractedVars =
      TemplateService.extractVariablesFromEnrollment(enrollmentData);
    const variableValues: Record<string, string> = {};
    extractedVars.forEach((v) => {
      if (v.sampleValue) {
        variableValues[v.name] = v.sampleValue;
      }
    });

    // 4. Agregar folio si existe
    if (dce?.folio != null) {
      variableValues["folio"] = String(dce.folio);
    }

    // 5. Agregar nombre completo como variable compuesta
    const person = enrollmentData.person;
    if (person) {
      const fullName = [
        person.name,
        person.paternal_lastName,
        person.maternal_lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName && !variableValues["nombre_completo"]) {
        variableValues["nombre_completo"] = fullName;
      }
    }

    // 6. Construir CertificateTemplate para el generador de PDF
    const certTemplate: CertificateTemplate = {
      id: templateDoc.id,
      name: templateDoc.name || doc.name,
      description: templateDoc.description || "",
      category: templateDoc.category || "GENERAL",
      claveConcepto: "",
      pageConfig:
        design.pageConfig || this.templateService.getDefaultPageConfig(),
      elements: design.elements || [],
      variables: design.variables || [],
    };

    // 7. Generar PDF
    this.isDownloading = true;
    this.notificationService.showSuccess(
      "Generando",
      `Generando PDF de ${doc.name}...`,
    );

    try {
      const result = await this.pdfGenerator.generateFromTemplate(
        certTemplate,
        variableValues,
        {
          filename: `${doc.name}_${person?.name || "documento"}`,
          action: "download",
        },
      );

      if (result.success) {
        this.notificationService.showSuccess(
          "Descargado",
          `El PDF de ${doc.name} se ha descargado correctamente.`,
        );
      } else {
        this.notificationService.showError(
          "Error",
          result.error || "No se pudo generar el PDF.",
        );
      }
    } catch (err: any) {
      console.error("Error generating certificate PDF:", err);
      this.notificationService.showError(
        "Error",
        "Ocurrió un error al generar el PDF.",
      );
    } finally {
      this.isDownloading = false;
    }
  }

  async emailCertificate(doc: DocumentRow) {
    if (!this.person?.id) {
        this.notificationService.showError("Error", "Falta el ID de la persona para enviar el correo.");
        return;
    }

    this.notificationService.showSuccess("Enviando", "Generando Constancia y preparando envío...");
    const subject = `Constancia: ${doc.name}`;

    // --- LÓGICA DE GENERACIÓN DE PDF BASE64 ---
    const enrollmentData = this.enrollment || (this.person as any)?._rawEnrollment;
    if (!enrollmentData) {
      this.notificationService.showError("Error", "No se encontraron datos de inscripción para generar el PDF.");
      return;
    }

    const dce = enrollmentData.documentCoursesEnrollments?.find((d: any) => d.id?.toString() === doc.id);
    const templateDoc = dce?.documentCourse?.templateDocument;
    
    if (!templateDoc?.fields?.length) {
      this.notificationService.showError("Error", "No se encontró el diseño del template para adjuntar la constancia.");
      return;
    }

    let design: CanvasDesign | null = null;
    try {
      design = TemplateService.parseDesign(templateDoc.fields);
    } catch (e) {
      this.notificationService.showError("Error", "El diseño del template no es válido.");
      return;
    }

    if (!design) return;

    const extractedVars = TemplateService.extractVariablesFromEnrollment(enrollmentData);
    const variableValues: Record<string, string> = {};
    extractedVars.forEach((v) => {
      if (v.sampleValue) variableValues[v.name] = v.sampleValue;
    });

    if (dce?.folio != null) variableValues["folio"] = String(dce.folio);

    const person = enrollmentData.person;
    if (person) {
      const fullName = [person.name, person.paternal_lastName, person.maternal_lastName]
        .filter(Boolean).join(" ").trim();
      if (fullName && !variableValues["nombre_completo"]) {
        variableValues["nombre_completo"] = fullName;
      }
    }

    const certTemplate: CertificateTemplate = {
      id: templateDoc.id,
      name: templateDoc.name || doc.name,
      description: templateDoc.description || "",
      category: templateDoc.category || "GENERAL",
      claveConcepto: "",
      pageConfig: design.pageConfig || this.templateService.getDefaultPageConfig(),
      elements: design.elements || [],
      variables: design.variables || [],
    };

    let base64Pdf: string | undefined = undefined;
    try {
      const result = await this.pdfGenerator.generateFromTemplate(certTemplate, variableValues, {
          filename: `${doc.name}.pdf`,
          action: "base64", // IMPORTANTE: Pedimos Base64 en lugar de descargar
          imageQuality: 0.2 // REDUCIDO AL 20% DE CALIDAD PARA EVITAR ERROR 500 EN BASE64
      });

      if (result.success && result.dataUrl) {
          // Extraer la cadena base64 limpia (quitar el prefijo de data URI si lo trae)
          base64Pdf = result.dataUrl.includes('base64,') ? result.dataUrl.split('base64,')[1] : result.dataUrl;
      } else {
          this.notificationService.showError("Error", "No se adjuntó el PDF. Error interno de generación.");
          return;
      }
    } catch(err) {
        console.error("Error generating base64 PDF:", err);
        return;
    }
    // ------------------------------------------

    console.log("Enviando payload JSON a /mail/send-with-template:", {
        personId: this.person.id,
        template: 'constancia',
        subject: subject,
        file: base64Pdf ? `${base64Pdf.substring(0, 50)}... [TRUNCADO BASE64 VÁLIDO DE ${base64Pdf.length} CARACTERES]` : 'No se adjuntó'
    });

    this.mailService.sendWithTemplate(this.person.id, 'constancia', subject, base64Pdf, `${doc.name}.pdf`).subscribe({
        next: () => {
            this.alertConfig = {
              title: "Envío Exitoso",
              message: `La constancia se envió correctamente al correo: <strong>${this.person?.email || "del usuario"}</strong>.`,
              type: "success",
              actions: [ { label: 'Aceptar', variant: 'primary', action: () => { this.isAlertOpen = false; } } ]
            };
            this.isAlertOpen = true;
        },
        error: (err: any) => {
            console.error(err);
            
            let errorTitle = "Error del Servidor";
            let errorMessage = err.error?.message || "No se pudo enviar el correo de la constancia.";

            if (err.status === 413) {
               errorTitle = "Archivo Demasiado Grande";
               errorMessage = "El tamaño del archivo PDF excede el límite permitido por el servidor de correos. Intente contactar a soporte.";
            } else if (err.status === 404) {
               errorTitle = "Error 404";
               errorMessage = "La plantilla 'constancia' no existe en el servidor Backend.";
            }

            this.alertConfig = {
              title: errorTitle,
              message: errorMessage,
              type: "danger",
              actions: [ { label: 'Entendido', variant: 'outline', action: () => { this.isAlertOpen = false; } } ]
            };
            this.isAlertOpen = true;
        }
    });
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
