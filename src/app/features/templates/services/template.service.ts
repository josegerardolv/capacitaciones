import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CertificateTemplate, GeneratedCertificate, CertificateData, TemplateVariable, PageConfig } from '../../../core/models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private templatesData: CertificateTemplate[] = [
    {
      id: 1,
      name: 'Constancia Básica',
      claveConcepto: 'CB-001',
      description: 'Template básico para constancias de participación',
      category: 'Participación',

      // NOTA: Este valor debe venir del backend calculado: COUNT(certificates) WHERE status = 'Entregado' AND templateId = X
      usageCount: 150,
      pageConfig: {
        width: 279.4,
        height: 215.9,
        orientation: 'landscape',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        backgroundColor: '#ffffff'
      },
      elements: [],
      variables: [
        { name: 'nombre', label: 'Nombre del participante', type: 'text', required: true },
        { name: 'curso', label: 'Nombre del curso', type: 'text', required: true },
        { name: 'fecha', label: 'Fecha de emisión', type: 'date', required: true }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Certificado de Aprobación',
      claveConcepto: 'CA-002',
      description: 'Certificado oficial de aprobación de curso',
      category: 'Certificación',
      usageCount: 85,
      pageConfig: this.getDefaultPageConfig(),
      elements: [],
      variables: [],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Diploma de Honor',
      claveConcepto: 'DH-003',
      description: 'Diploma para alumnos destacados',
      category: 'Reconocimiento',
      usageCount: 20,
      pageConfig: this.getDefaultPageConfig(),
      elements: [],
      variables: [],
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Tarjetón de Identidad',
      claveConcepto: 'TI-004',
      description: 'Documento de identificación para conductores',
      category: 'Identificación',
      usageCount: 120,
      pageConfig: this.getDefaultPageConfig(),
      elements: [],
      variables: [],
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Diploma de Participación',
      claveConcepto: 'DP-005',
      description: 'Diploma general de participación',
      category: 'Reconocimiento',
      usageCount: 45,
      pageConfig: this.getDefaultPageConfig(),
      elements: [],
      variables: [],
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Constancia de Curso de Manejo',
      claveConcepto: 'CM-006',
      description: 'Constancia específica para curso de manejo',
      category: 'Certificación',
      usageCount: 60,
      pageConfig: this.getDefaultPageConfig(),
      elements: [],
      variables: [],
      created_at: new Date().toISOString()
    }
  ];

  private generatedCertificates: GeneratedCertificate[] = [];
  private nextCertId = 1;

  constructor() { }

  // ===== TEMPLATES =====
  getTemplates(): Observable<CertificateTemplate[]> {
    // TODO: Pendiente conectar con el backend cuando esté listo.
    // Aquí es donde voy a cambiar la URL por la del API real.
    // return this.http.get<CertificateTemplate[]>('http://localhost:3000/api/templates');

    // Por ahora regreso los datos de prueba simulando un pequeño delay para ver el loading
    return of([...this.templatesData]).pipe(delay(500));
  }

  getTemplate(id: number): Observable<CertificateTemplate | undefined> {
    return of(this.templatesData.find(t => t.id === id)).pipe(delay(300));
  }

  createTemplate(template: Omit<CertificateTemplate, 'id'>): Observable<CertificateTemplate> {
    const newId = Math.max(...this.templatesData.map(t => t.id), 0) + 1;
    const newTemplate: CertificateTemplate = {
      ...template,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.templatesData.push(newTemplate);
    return of(newTemplate).pipe(delay(800));
  }

  updateTemplate(id: number, template: Partial<CertificateTemplate>): Observable<CertificateTemplate> {
    const index = this.templatesData.findIndex(t => t.id === id);
    if (index !== -1) {
      this.templatesData[index] = {
        ...this.templatesData[index],
        ...template,
        updated_at: new Date().toISOString()
      };
      return of(this.templatesData[index]).pipe(delay(800));
    }
    throw new Error('Template not found');
  }

  deleteTemplate(id: number): Observable<void> {
    this.templatesData = this.templatesData.filter(t => t.id !== id);
    return of(void 0).pipe(delay(500));
  }

  duplicateTemplate(id: number): Observable<CertificateTemplate> {
    const template = this.templatesData.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }

    const newId = Math.max(...this.templatesData.map(t => t.id), 0) + 1;
    const duplicated: CertificateTemplate = {
      ...JSON.parse(JSON.stringify(template)), // Deep clone
      id: newId,
      name: `${template.name} (Copia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.templatesData.push(duplicated);
    return of(duplicated).pipe(delay(800));
  }

  // ===== GENERACIÓN DE CERTIFICADOS =====
  generateCertificate(data: CertificateData): Observable<GeneratedCertificate> {
    const template = this.templatesData.find(t => t.id === data.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newCert: GeneratedCertificate = {
      id: this.nextCertId++,
      templateId: data.templateId,
      templateName: template.name,
      recipientName: data.variables['nombre'] || 'Sin nombre',
      data: data.variables,
      pdfUrl: `/api/certificates/${this.nextCertId - 1}.pdf`, // Mock URL
      status: 'Pendiente',
      generatedAt: new Date().toISOString()
    };

    this.generatedCertificates.push(newCert);
    return of(newCert).pipe(delay(1500));
  }

  getGeneratedCertificates(): Observable<GeneratedCertificate[]> {
    return of([...this.generatedCertificates]).pipe(delay(500));
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
