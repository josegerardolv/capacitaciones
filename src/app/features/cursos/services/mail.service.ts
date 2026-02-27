import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class MailService {

    constructor(private http: HttpClient) {}

    sendEnrollmentEmail(recipientEmail: string, group: any): Observable<any> {
        const courseName = group?.course?.name || '';
        const startDate = group?.groupStartDate
            ? new Date(group.groupStartDate).toLocaleDateString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : '';
        const schedule = group?.schedule || '';
        const location = group?.location || '';

        const html = `<h1>Inscripción Exitosa al Curso</h1><p><strong>Curso:</strong> ${courseName}</p><p><strong>Fecha de inicio:</strong> ${startDate}</p><p><strong>Horario:</strong> ${schedule}</p><p><strong>Lugar:</strong> ${location}</p>`;

        return this.http.post(`${environment.apiUrl}/mail/send`, {
            to: recipientEmail,
            subject: 'Inscripción Exitosa al curso',
            html
        });
    }

    sendAcceptanceEmail(recipientEmail: string, group: any): Observable<any> {
        const courseName = group?.course?.name || '';
        const startDate = group?.groupStartDate
            ? new Date(group.groupStartDate).toLocaleDateString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : '';
        const schedule = group?.schedule || '';
        const location = group?.location || '';

        const html = `<h1>Solicitud Aceptada</h1><p>Tu solicitud de inscripción ha sido <strong>aceptada</strong>.</p><p><strong>Curso:</strong> ${courseName}</p><p><strong>Fecha de inicio:</strong> ${startDate}</p><p><strong>Horario:</strong> ${schedule}</p><p><strong>Lugar:</strong> ${location}</p>`;

        return this.http.post(`${environment.apiUrl}/mail/send`, {
            to: recipientEmail,
            subject: 'Solicitud Aceptada',
            html
        });
    }

    sendRejectionEmail(recipientEmail: string, group: any): Observable<any> {
        const courseName = group?.course?.name || '';

        const html = `<h1>Solicitud Rechazada</h1><p>Lamentamos informarte que tu solicitud de inscripción al curso <strong>${courseName}</strong> ha sido <strong>rechazada</strong>.</p>Para más información, comunícate con el instructor.</p>`;

        return this.http.post(`${environment.apiUrl}/mail/send`, {
            to: recipientEmail,
            subject: 'Solicitud Rechazada',
            html
        });
    }
}