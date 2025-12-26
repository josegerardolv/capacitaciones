import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Certificate, Tarjeton, EmbeddedTemplate } from '../../../core/models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  
  private getDefaultTemplate(): EmbeddedTemplate {
    return {
      pageConfig: {
        width: 279.4,
        height: 215.9,
        orientation: 'landscape',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        backgroundColor: '#ffffff'
      },
      elements: [],
      variables: [
        { name: 'nombre', label: 'Nombre completo', type: 'text', required: true, icon: 'person', category: 'participante' },
        { name: 'curso', label: 'Nombre del curso', type: 'text', required: true, icon: 'school', category: 'curso' },
        { name: 'fecha', label: 'Fecha de emisión', type: 'date', required: true, icon: 'event', category: 'otro' },
        { name: 'qr_validacion_api', label: 'Código de validación (QR)', type: 'qr', required: false, icon: 'qr_code_2', category: 'media', description: 'Código QR de validación traído desde la API' },
        { name: 'imagen_api', label: 'Imagen desde API', type: 'image', required: false, icon: 'image', category: 'media', description: 'Imagen dinámica (URL/Base64) traída desde la API' }
      ]
    };
  }

  private certificatesData: Certificate[] = [
    { 
      id: 1, 
      name: 'Certificado de Participación', 
      description: 'Certificado para cursos básicos',
      template: this.getDefaultTemplate(),
      created_at: new Date().toISOString() 
    },
    { 
      id: 2, 
      name: 'Certificado de Aprobación', 
      description: 'Certificado para cursos aprobados',
      template: this.getDefaultTemplate(),
      created_at: new Date().toISOString() 
    },
    { 
      id: 3, 
      name: 'Certificado con Distinción', 
      description: 'Certificado premium',
      template: this.getDefaultTemplate(),
      created_at: new Date().toISOString() 
    }
  ];

  private tarjetonesData: Tarjeton[] = [
    { 
      id: 1, 
      name: 'Tarjetón Estándar', 
      description: 'Formato estándar para cursos',
      template: this.getDefaultTemplate(),
      created_at: new Date().toISOString() 
    },
    { 
      id: 2, 
      name: 'Tarjetón Ejecutivo', 
      description: 'Formato ejecutivo premium',
      template: this.getDefaultTemplate(),
      created_at: new Date().toISOString() 
    }
  ];

  constructor() {}

  // ===== CERTIFICADOS =====
  getCertificates(): Observable<Certificate[]> {
    return of([...this.certificatesData]).pipe(delay(500));
  }

  getCertificate(id: number): Observable<Certificate | undefined> {
    return of(this.certificatesData.find(c => c.id === id)).pipe(delay(300));
  }

  createCertificate(certificate: Omit<Certificate, 'id'>): Observable<Certificate> {
    const newId = Math.max(...this.certificatesData.map(c => c.id), 0) + 1;
    const newCertificate: Certificate = {
      ...certificate,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.certificatesData.push(newCertificate);
    return of(newCertificate).pipe(delay(800));
  }

  updateCertificate(id: number, certificate: Partial<Certificate>): Observable<Certificate> {
    const index = this.certificatesData.findIndex(c => c.id === id);
    if (index !== -1) {
      this.certificatesData[index] = { ...this.certificatesData[index], ...certificate };
      return of(this.certificatesData[index]).pipe(delay(800));
    }
    throw new Error('Certificate not found');
  }

  deleteCertificate(id: number): Observable<void> {
    this.certificatesData = this.certificatesData.filter(c => c.id !== id);
    return of(void 0).pipe(delay(500));
  }

  // ===== TARJETONES =====
  getTarjetones(): Observable<Tarjeton[]> {
    return of([...this.tarjetonesData]).pipe(delay(500));
  }

  getTarjeton(id: number): Observable<Tarjeton | undefined> {
    return of(this.tarjetonesData.find(t => t.id === id)).pipe(delay(300));
  }

  createTarjeton(tarjeton: Omit<Tarjeton, 'id'>): Observable<Tarjeton> {
    const newId = Math.max(...this.tarjetonesData.map(t => t.id), 0) + 1;
    const newTarjeton: Tarjeton = {
      ...tarjeton,
      id: newId,
      created_at: new Date().toISOString()
    };
    this.tarjetonesData.push(newTarjeton);
    return of(newTarjeton).pipe(delay(800));
  }

  updateTarjeton(id: number, tarjeton: Partial<Tarjeton>): Observable<Tarjeton> {
    const index = this.tarjetonesData.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tarjetonesData[index] = { ...this.tarjetonesData[index], ...tarjeton };
      return of(this.tarjetonesData[index]).pipe(delay(800));
    }
    throw new Error('Tarjeton not found');
  }

  deleteTarjeton(id: number): Observable<void> {
    this.tarjetonesData = this.tarjetonesData.filter(t => t.id !== id);
    return of(void 0).pipe(delay(500));
  }
}
