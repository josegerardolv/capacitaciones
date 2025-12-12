import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface local para el componente
interface TicketAttachment {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  url?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="file-upload-component">
      <div class="file-upload-header">
        <span class="material-symbols-outlined">cloud_upload</span>
        <h3>Componente de Carga de Archivos</h3>
      </div>
      <div class="file-upload-content">
        <p>Este componente está en desarrollo y será implementado cuando los modelos y servicios de tickets estén disponibles.</p>
        <div class="file-upload-info">
          <div class="info-item">
            <strong>Ticket ID:</strong> {{ ticketId }}
          </div>
          <div class="info-item">
            <strong>Archivos múltiples:</strong> {{ multiple ? 'Sí' : 'No' }}
          </div>
          <div class="info-item">
            <strong>Tamaño máximo:</strong> {{ (maxFileSize / 1024 / 1024).toFixed(1) }}MB
          </div>
          <div class="info-item">
            <strong>Tipos permitidos:</strong> {{ allowedTypes.length > 0 ? allowedTypes.join(', ') : 'Todos' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-component {
      padding: 2rem;
      text-align: center;
      border: 2px dashed var(--gray-300);
      border-radius: var(--border-radius-lg);
      background: var(--gray-50);
      color: var(--gray-600);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .file-upload-header {
      margin-bottom: 1.5rem;
    }
    
    .file-upload-header .material-symbols-outlined {
      font-size: 3rem;
      color: var(--institucional-secundario);
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .file-upload-header h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--institucional-primario);
      margin: 0;
    }
    
    .file-upload-content p {
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    
    .file-upload-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      text-align: left;
      background: white;
      padding: 1.5rem;
      border-radius: var(--border-radius);
      border: 1px solid var(--gray-200);
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .info-item strong {
      font-weight: 600;
      color: var(--gray-800);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .file-upload-component {
        padding: 1.5rem;
      }
      
      .file-upload-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FileUploadComponent implements OnInit {
  @Input() ticketId: number = 0;
  @Input() allowedTypes: string[] = [];
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB
  @Input() multiple: boolean = false;
  @Input() attachments: TicketAttachment[] = [];
  @Input() disabled: boolean = false;
  @Input() showPreview: boolean = true;
  @Input() currentUserId: number | null = null;
  @Input() userRole: string = 'user';

  @Output() attachmentsChange = new EventEmitter<TicketAttachment[]>();
  @Output() uploadStart = new EventEmitter<void>();
  @Output() uploadComplete = new EventEmitter<TicketAttachment>();
  @Output() uploadError = new EventEmitter<string>();

  ngOnInit() {
    console.log('FileUploadComponent inicializado - modo de desarrollo');
  }
}
