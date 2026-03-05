import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@/environments/environment";

@Injectable({ providedIn: "root" })
export class MailService {
  constructor(private http: HttpClient) {}

  private getEmailTemplate(title: string, bodyContent: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .email-container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .email-header { background-color: #9D2449; color: #ffffff; padding: 30px 20px; text-align: center; }
        .email-header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .email-body { padding: 30px 20px; }
        .info-box { background-color: #f8f9fa; border-left: 4px solid #9D2449; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-row { margin-bottom: 8px; }
        .info-label { font-weight: bold; color: #555; min-width: 120px; display: inline-block; }
        .email-footer { background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e0e0e0; }
        @media only screen and (max-width: 600px) {
            .email-container { width: 100%; margin: 0; border-radius: 0; }
            .info-label { display: block; margin-bottom: 2px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <img src="https://www.oaxaca.gob.mx/semovi/wp-content/uploads/sites/34/2024/06/logo-contorno.png" alt="SEMOVI" style="max-width: 180px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
            <h1>${title}</h1>
        </div>
        <div class="email-body">
            ${bodyContent}
        </div>
        <div class="email-footer">
            <p>Este es un mensaje automático del Sistema de Capacitaciones.</p>
            <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

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

    const html = this.getEmailTemplate("Inscripción Exitosa", body);

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

    const html = this.getEmailTemplate("Solicitud Aceptada", body);

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

    const html = this.getEmailTemplate("Actualización de Solicitud", body);

    return this.http.post(`${environment.apiUrl}/mail/send`, {
      to: recipientEmail,
      subject: `Solicitud Rechazada: ${courseName}`,
      html,
    });
  }
}

