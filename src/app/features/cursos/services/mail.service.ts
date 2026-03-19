import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@/environments/environment";
import { getEmailTemplate } from "./mail-template";

@Injectable({ providedIn: "root" })
export class MailService {
  constructor(private http: HttpClient) {}

  private getGroupInfo(group: any) {
    const courseName = group?.course?.name || "Curso";
    const groupName = group?.name || "Grupo";

    const rawDate = group?.groupStartDate;
    let startDate = "Por definir";

    if (rawDate) {
      let d: Date;
      if (typeof rawDate === 'string') {
        const datePart = rawDate.split('T')[0];
        const [y, m, day] = datePart.split('-').map(Number);
        d = new Date(y, m - 1, day);
      } else {
        d = new Date(rawDate);
      }

      startDate = d.toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const schedule = group?.schedule || "Por definir";
    const location = group?.location || "Por definir";

    return { courseName, groupName, startDate, schedule, location };
  }

  sendEnrollmentEmail(recipientEmail: string, group: any): Observable<any> {
    const { courseName, groupName, startDate, schedule, location } =
      this.getGroupInfo(group);

    const body = `
        <p>Hola,</p>
        <p>Te confirmamos que tu inscripción al curso <strong>${courseName}</strong> se ha realizado exitosamente.</p>

        <div class="info-box">
            <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
            <div class="info-row"><span class="info-label">Grupo:</span> ${groupName}</div>
            <div class="info-row"><span class="info-label">Fecha de inicio:</span> ${startDate}</div>
            <div class="info-row"><span class="info-label">Horario:</span> ${schedule}</div>
            <div class="info-row"><span class="info-label">Lugar:</span> ${location}</div>
        </div>

        <p>Te esperamos.</p>
    `;

    const html = getEmailTemplate("Inscripción Exitosa", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Inscripción Exitosa: ${courseName} - ${groupName}`,
      html,
    });
  }

  sendAcceptanceEmail(recipientEmail: string, group: any): Observable<any> {
    const { courseName, groupName, startDate, schedule, location } =
      this.getGroupInfo(group);

    const body = `
        <p>¡Buenas noticias!</p>
        <p>Tu solicitud de inscripción para el curso <strong>${courseName}</strong> ha sido <strong>ACEPTADA</strong>.</p>

        <div class="info-box">
            <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
            <div class="info-row"><span class="info-label">Grupo:</span> ${groupName}</div>
            <div class="info-row"><span class="info-label">Fecha de inicio:</span> ${startDate}</div>
            <div class="info-row"><span class="info-label">Horario:</span> ${schedule}</div>
            <div class="info-row"><span class="info-label">Lugar:</span> ${location}</div>
        </div>

        <p>Tu lugar ha sido reservado. ¡Te esperamos!</p>
    `;

    const html = getEmailTemplate("Solicitud Aceptada", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Solicitud Aceptada: ${courseName} - ${groupName}`,
      html,
    });
  }

  sendRejectionEmail(recipientEmail: string, group: any): Observable<any> {
    const { courseName, groupName } = this.getGroupInfo(group);

    const body = `
        <p>Estimado usuario,</p>
        <p>Lamentamos informarte que tu solicitud de inscripción al curso <strong>${courseName}</strong> para el grupo <strong>${groupName}</strong> no ha podido ser aprobada en esta ocasión.</p>
        <p>Para más información, por favor comunícate con la administración.</p>
    `;

    const html = getEmailTemplate("Actualización de Solicitud", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Solicitud Rechazada: ${courseName} - ${groupName}`,
      html,
    });
  }

  sendRemovalEmail(recipientEmail: string, group: any): Observable<any> {
    const { courseName, groupName, startDate, schedule, location } =
      this.getGroupInfo(group);

    const body = `
        <p>Estimado usuario,</p>

        <p>Te informamos que has sido <strong>removido</strong> del siguiente grupo:</p>

        <div class="info-box">
            <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
            <div class="info-row"><span class="info-label">Grupo:</span> ${groupName}</div>
            <div class="info-row"><span class="info-label">Fecha de inicio:</span> ${startDate}</div>
            <div class="info-row"><span class="info-label">Horario:</span> ${schedule}</div>
            <div class="info-row"><span class="info-label">Lugar:</span> ${location}</div>
        </div>

        <p>Si consideras que esto ha sido un error o deseas más información, por favor comunícate con la administración.</p>
    `;

    const html = getEmailTemplate("Actualización de Inscripción", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Eliminación del grupo ${groupName} - ${courseName}`,
      html,
    });
  }

  sendWithTemplate(personId: number, template: string = 'constancia', subject: string, fileBase64String?: string, fileName?: string): Observable<any> {
    const payload: any = {
      personId,
      template,
      subject
    };

    if (fileBase64String) {
      payload.fileBase64 = fileBase64String;
      payload.fileName = fileName || "constancia.pdf";
    }

    return this.http.post(`${environment.apiUrl}/mail/send-with-template-json`, payload);
  }

  sendStripeInvoice(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stripe/invoice`, payload);
  }

  sendPaymentUrlByMail(recipientEmail: string, courseName: string, studentName: string, stripeUrl: string): Observable<any> {
    const body = `
        <p>Hola <strong>${studentName}</strong>,</p>
        <p>Se ha generado tu línea de captura para el curso o constancia: <strong>${courseName}</strong>.</p>
        <p>Puedes realizar tu pago de manera rápida y segura con tarjeta bancaria usando el siguiente enlace de cobro:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${stripeUrl}" style="background-color: #6a1b31; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-family: sans-serif; display: inline-block;">Pagar en Línea ahora</a>
        </div>
        <p>Si prefieres pagar en efectivo (OXXO/Bancos), presiona el enlace y busca la opción de descargar formato en formato PDF o descárgalo directamente desde el sistema de Capacitaciones.</p>
    `;

    const html = getEmailTemplate("Línea de Pago de Formato", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Línea de Captura Generada: ${courseName}`,
      html,
    });
  }

  sendCourseStatusEmail(recipientEmail: string, group: any, studentName: string, status: 'CURSANDO' | 'APROBADO' | 'REPROBADO'): Observable<any> {
    const { courseName, groupName } = this.getGroupInfo(group);
    
    const isApproved = status === 'APROBADO';
    const statusColor = isApproved ? '#28a745' : '#dc3545';
    const statusText = isApproved ? 'APROBADO' : 'REPROBADO';

    const body = `
        <p>Estimado(a) <strong>${studentName}</strong>,</p>
        <p>Te informamos que se ha procesado el resultado de tu evaluación para el siguiente curso:</p>

        <div class="info-box">
            <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
            <div class="info-row"><span class="info-label">Grupo:</span> ${groupName}</div>
            <div class="info-row" style="margin-top: 15px; text-align: center;">
                <span style="font-size: 1.2em; font-weight: bold; color: ${statusColor}; border: 2px solid ${statusColor}; padding: 10px 20px; border-radius: 8px; display: inline-block;">
                    ESTATUS: ${statusText}
                </span>
            </div>
        </div>

        <p>${isApproved 
            ? '¡Felicidades! Ya puedes proceder con la gestión de tu constancia y pagos en nuestro portal.' 
            : 'Lamentamos informarte que no has acreditado la evaluación en esta ocasión. Comunícate con la administración para más detalles.'}</p>
        
        <p>Si tienes alguna duda, estamos para servirte.</p>
    `;

    const title = isApproved ? 'Curso Aprobado' : 'Resultado de Evaluación';
    const html = getEmailTemplate(title, body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Actualización de Estatus: ${statusText} - ${courseName}`,
      html,
    });
  }
}