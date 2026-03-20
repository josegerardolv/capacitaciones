import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../../../cursos/services/groups.service';
import {
  LoadingSpinnerComponent
} from '../../../../shared/components';
// http://localhost:4200/public/verify/test-valid para probarlo
@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './document-verification.component.html'
})
export class DocumentVerificationComponent implements OnInit {
  uuid: string | null = null;
  loading = true;
  error = false;
  verificationData: any = null;
  currenDate = new Date();

  get formattedSpanishDate(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const day = this.currenDate.getDate();
    const month = months[this.currenDate.getMonth()];
    const year = this.currenDate.getFullYear();
    return `${day} ${month} ${year}`;
  }

  get formattedTime(): string {
    return this.currenDate.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService
  ) { }

  ngOnInit(): void {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    if (this.uuid) {
      this.verifyDocument(this.uuid);
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  verifyDocument(uuid: string): void {
    this.loading = true;
    this.error = false;

    this.groupsService.getEnrollmentByUuid(uuid).subscribe({
      next: (data: any) => {
        this.verificationData = this.mapData(data);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error verificando documento:', err);
        this.loading = false;
        this.error = true;

        // Simulación de datos para desarrollo si el endpoint falla (QUITAR EN PROD)
        if (uuid === 'test-valid') {
          this.verificationData = {
            personName: 'HIPOLITO MARTINEZ SANTIAGO',
            courseName: 'SEMOVI HEROICO 16 ABRIL 2025',
            groupName: 'Grupo A - Matutino',
            duration: '4 horas con 30 minutos',
            issueDate: '2025-09-01',
            expiryDate: '2026-09-01',
            folio: 'V2025-8651',
            status: 'VÁLIDO',
            statusVariant: 'success',
            statusIcon: 'check_circle',
            isExpired: false
          };
          this.error = false;
        }
      }
    });
  }

  private mapData(data: any): any {
    const person = data.person || {};
    const group = data.group || {};
    const course = group.course || {};
    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : false;

    return {
      personName: `${person.name || ''} ${person.paternal_lastName || ''} ${person.maternal_lastName || ''}`.trim() || 'No disponible',
      courseName: course.name || 'Curso no especificado',
      groupName: group.name || 'Sin grupo',
      duration: course.duration || '4 horas con 30 minutos',
      issueDate: data.dateAccepted || data.createdAt || new Date(),
      expiryDate: data.expiryDate || 'N/A',
      folio: data.folio || `E-${data.id || 'N/A'}`,
      status: data.isAcepted ? 'VÁLIDO' : 'REVOCADO/INVÁLIDO',
      statusVariant: data.isAcepted ? 'success' : 'danger',
      statusIcon: data.isAcepted ? 'check_circle' : 'cancel',
      isExpired: isExpired
    };
  }

  retry(): void {
    if (this.uuid) {
      this.verifyDocument(this.uuid);
    }
  }
}
