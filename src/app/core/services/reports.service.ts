import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private apiUrl = `${environment.apiUrl}/reports/groups`;

    constructor(private http: HttpClient) { }

    exportGroupsCSV(courseId?: number): Observable<Blob> {
        const url = `${this.apiUrl}/export/csv${courseId ? `?courseId=${courseId}` : ''}`;// Endpoint para exportar grupos en formato CSV
        return this.http.get(url, { responseType: 'blob' });
    }

    exportGroupsExcel(courseId?: number): Observable<Blob> {
        const url = `${this.apiUrl}/export/excel${courseId ? `?courseId=${courseId}` : ''}`;// Endpoint para exportar grupos en formato Excel
        return this.http.get(url, { responseType: 'blob' });
    }

    /**
     * Utilidad para descargar un archivo Blob en el navegador
     */
    downloadFile(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
