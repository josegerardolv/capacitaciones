import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@/environments/environment";
import { getEmailTemplate } from "./mail-template";


@Injectable({ providedIn: "root" })
export class MailService {
  constructor(private http: HttpClient) { }

  sendEnrollmentEmail(recipientEmail: string, group: any): Observable<any> {
    const courseName = group?.course?.name || "Curso";
    const startDate = group?.groupStartDate
      ? new Date(group.groupStartDate).toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "Por definir";
    const schedule = group?.schedule || "Por definir";
    const location = group?.location || "Por definir";

    const body = `
            <p>Hola,</p>
            <p>Te confirmamos que tu inscripción al curso <strong>${courseName}</strong> se ha realizado exitosamente.</p>
            <div class="info-box">
                <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
                <div class="info-row"><span class="info-label">Fecha de inicio:</span> ${startDate}</div>
                <div class="info-row"><span class="info-label">Horario:</span> ${schedule}</div>
                <div class="info-row"><span class="info-label">Lugar:</span> ${location}</div>
            </div>
            <p>Te esperamos.</p>
        `;

    const html = getEmailTemplate("Inscripción Exitosa", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Inscripción Exitosa: ${courseName}`,
      html,
    });
  }

  sendAcceptanceEmail(recipientEmail: string, group: any): Observable<any> {
    const courseName = group?.course?.name || "Curso";
    const startDate = group?.groupStartDate
      ? new Date(group.groupStartDate).toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "Por definir";
    const schedule = group?.schedule || "Por definir";
    const location = group?.location || "Por definir";

    const body = `
            <p>¡Buenas noticias!</p>
            <p>Tu solicitud de inscripción para el curso <strong>${courseName}</strong> ha sido <strong>ACEPTADA</strong>.</p>
            <div class="info-box">
                <div class="info-row"><span class="info-label">Curso:</span> ${courseName}</div>
                <div class="info-row"><span class="info-label">Fecha de inicio:</span> ${startDate}</div>
                <div class="info-row"><span class="info-label">Horario:</span> ${schedule}</div>
                <div class="info-row"><span class="info-label">Lugar:</span> ${location}</div>
            </div>
            <p>Tu lugar ha sido reservado. ¡Te esperamos!</p>
        `;

    const html = getEmailTemplate("Solicitud Aceptada", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Solicitud Aceptada: ${courseName}`,
      html,
    });
  }

  sendRejectionEmail(recipientEmail: string, group: any): Observable<any> {
    const courseName = group?.course?.name || "Curso";

    const body = `
            <p>Estimado usuario,</p>
            <p>Lamentamos informarte que tu solicitud de inscripción al curso <strong>${courseName}</strong> no ha podido ser aprobada en esta ocasión.</p>
            <p>Para más información, por favor comunícate con la administración.</p>
        `;

    const html = getEmailTemplate("Actualización de Solicitud", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Solicitud Rechazada: ${courseName}`,
      html,
    });
  }
}
