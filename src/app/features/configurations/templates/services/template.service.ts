import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CertificateTemplate, GeneratedCertificate, CertificateData,
  TemplateVariable, PageConfig, Concept,
  TemplateDocument, CreateTemplateDocumentPayload, UpdateTemplateDocumentPayload
} from '../../../../core/models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private apiUrl = `${environment.apiUrl}/api`;
  private templateDocUrl = `${environment.apiUrl}/template-document`;
  private conceptsUrl = `${environment.apiUrl}/payment-concepts`;

  constructor(private http: HttpClient) { }

  // ===== TEMPLATES (Backend: /template-document) =====
  getTemplates(): Observable<TemplateDocument[]> {
    return this.http.get<TemplateDocument[]>(this.templateDocUrl);
  }

  getTemplateById(id: number): Observable<TemplateDocument> {
    return this.http.get<TemplateDocument>(`${this.templateDocUrl}/${id}`);
  }

  createTemplate(payload: CreateTemplateDocumentPayload): Observable<TemplateDocument> {
    return this.http.post<TemplateDocument>(this.templateDocUrl, payload);
  }

  updateTemplate(id: number, payload: UpdateTemplateDocumentPayload): Observable<TemplateDocument> {
    return this.http.patch<TemplateDocument>(`${this.templateDocUrl}/${id}`, payload);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.templateDocUrl}/${id}`);
  }

  getTemplate(id: number): Observable<CertificateTemplate | undefined> {
    return this.http.get<CertificateTemplate>(`${this.apiUrl}/templates/${id}`);
  }

  duplicateTemplate(id: number): Observable<CertificateTemplate> {
    return this.http.post<CertificateTemplate>(`${this.apiUrl}/templates/${id}/duplicate`, {});
  }

  // ===== CONCEPTOS =====
  getConcepts(): Observable<Concept[]> {
    return this.http.get<Concept[]>(this.conceptsUrl);
  }

  searchConcepts(query: string): Observable<Concept[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Concept[]>(this.conceptsUrl, { params });
  }

  createConcept(concept: Omit<Concept, 'id'>): Observable<Concept> {
    return this.http.post<Concept>(this.conceptsUrl, concept);
  }

  updateConcept(id: number, changes: Partial<Concept>): Observable<Concept> {
    return this.http.patch<Concept>(`${this.conceptsUrl}/${id}`, changes);
  }

  deleteConcept(id: number): Observable<void> {
    return this.http.delete<void>(`${this.conceptsUrl}/${id}`);
  }

  // ===== GENERACIÓN DE CERTIFICADOS =====
  generateCertificate(data: CertificateData): Observable<GeneratedCertificate> {
    return this.http.post<GeneratedCertificate>(`${this.apiUrl}/certificates/generate`, data);
  }

  getGeneratedCertificates(): Observable<GeneratedCertificate[]> {
    return this.http.get<GeneratedCertificate[]>(`${this.apiUrl}/certificates`);
  }

  // ===== UTILIDADES =====
  getDefaultPageConfig(): PageConfig {
    return {
      width: 279.4,
      height: 215.9,
      orientation: 'landscape',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      backgroundColor: '#ffffff'
    };
  }

  // Las variables comunes suelen ser estáticas o config del sistema, no necesariamente un endpoint.
  // De momento las mantenemos hardcodeadas en el servicio limpio también, o podrían venir de un endpoint /config
  // Para simplificar, las dejaré aquí, ya que no "ensucian" con lógica de negocio compleja, solo definiciones.
  getCommonVariables(): TemplateVariable[] {
    return [
      // Participante
      { name: 'nombre', label: 'Nombre completo', type: 'text', required: true, icon: 'person', category: 'participante', description: 'Nombre del participante' },
      { name: 'curp', label: 'CURP', type: 'text', required: false, icon: 'badge', category: 'participante', description: 'CURP del participante' },
      { name: 'email', label: 'Correo electrónico', type: 'text', required: false, icon: 'email', category: 'participante', description: 'Email del participante' },

      // Curso
      { name: 'curso', label: 'Nombre del curso', type: 'text', required: true, icon: 'school', category: 'curso', description: 'Título del curso o capacitación' },
      { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: false, icon: 'event', category: 'curso', description: 'Fecha de inicio del curso' },
      { name: 'fecha_fin', label: 'Fecha de finalización', type: 'date', required: false, icon: 'event_available', category: 'curso', description: 'Fecha de término del curso' },
      { name: 'duracion', label: 'Duración', type: 'text', required: false, icon: 'schedule', category: 'curso', description: 'Duración total (ej: 40 horas)' },
      { name: 'instructor', label: 'Nombre del instructor', type: 'text', required: false, icon: 'record_voice_over', category: 'curso', description: 'Instructor o facilitador' },
      { name: 'modalidad', label: 'Modalidad', type: 'text', required: false, icon: 'devices', category: 'curso', description: 'Presencial, en línea, híbrido' },

      // Institución
      { name: 'folio', label: 'Número de folio', type: 'text', required: false, icon: 'tag', category: 'institucion', description: 'Folio único del documento' },
      { name: 'institucion', label: 'Nombre de la institución', type: 'text', required: false, icon: 'domain', category: 'institucion', description: 'Nombre de la institución emisora' },
      { name: 'director', label: 'Nombre del director', type: 'text', required: false, icon: 'supervisor_account', category: 'institucion', description: 'Director o responsable' },
      { name: 'cargo_director', label: 'Cargo del director', type: 'text', required: false, icon: 'work', category: 'institucion', description: 'Puesto del firmante' },

      // Media (imagen y QR dinámicos)
      { name: 'foto_participante', label: 'Foto del participante', type: 'image', required: false, icon: 'account_circle', category: 'media', description: 'Fotografía del participante desde API' },
      { name: 'logo_institucion', label: 'Logo de la institución', type: 'image', required: false, icon: 'image', category: 'media', description: 'Logo institucional desde API' },
      { name: 'firma_digital', label: 'Firma digital', type: 'image', required: false, icon: 'draw', category: 'media', description: 'Imagen de firma del responsable' },
      { name: 'qr_verificacion', label: 'QR de verificación', type: 'qr', required: false, icon: 'qr_code_2', category: 'media', description: 'Código QR para verificar autenticidad' },
      { name: 'qr_documento', label: 'QR del documento', type: 'qr', required: false, icon: 'qr_code', category: 'media', description: 'Código QR con enlace al documento' },
      { name: 'qr_validacion_api', label: 'Código de validación (API)', type: 'qr', required: false, icon: 'qr_code_2', category: 'media', description: 'Código QR de validación traído desde la API' },
      { name: 'imagen_api', label: 'Imagen desde API', type: 'image', required: false, icon: 'image', category: 'media', description: 'Imagen dinámica (URL/Base64/Archivo) traída desde la API' }
    ];
  }
}
