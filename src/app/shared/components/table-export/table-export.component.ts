import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface ExportFormat {
  key: string;
  label: string;
  icon: string;
  extension: string;
  mimeType: string;
}

export interface ExportConfig {
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
  formats?: ExportFormat[];
}

export interface ExportEvent {
  format: string;
  config: ExportConfig;
  data: any[];
}

@Component({
  selector: 'app-table-export',
  standalone: true,
  imports: [CommonModule, FormsModule, InstitutionalButtonComponent],
  template: `
    <div class="institucional-table-export">
      <!-- Botón principal de exportación -->
      <app-institutional-button
        [config]="{
          variant: 'secondary',
          icon: 'download'
        }"
        class="institucional-table-export-btn"
        [class.institucional-table-export-btn-open]="showOptions"
        title="Exportar datos"
        (buttonClick)="toggleOptions()">
        Exportar
      </app-institutional-button>

      <!-- Opciones de exportación -->
      <div 
        *ngIf="showOptions" 
        class="institucional-table-export-options">
        
        <!-- Formatos disponibles -->
        <div class="institucional-table-export-formats">
          <app-institutional-button
            *ngFor="let format of availableFormats"
            [config]="{
              variant: 'secondary',
              icon: format.icon
            }"
            class="institucional-table-export-format-btn"
            [title]="'Exportar como ' + format.label"
            (buttonClick)="selectFormat(format)">
            {{ format.label }}
          </app-institutional-button>
        </div>

        <!-- Configuración de exportación -->
        <div class="institucional-table-export-config">
          <div class="institucional-form-group">
            <label class="institucional-table-export-checkbox-label">
              <input 
                type="checkbox" 
                class="institucional-table-checkbox"
                [(ngModel)]="config.includeHeaders"
                (ngModelChange)="updateConfig()">
              <span>Incluir encabezados</span>
            </label>
          </div>

          <div class="institucional-form-group" *ngIf="hasSelectedItems">
            <label class="institucional-table-export-checkbox-label">
              <input 
                type="checkbox" 
                class="institucional-table-checkbox"
                [(ngModel)]="config.selectedOnly"
                (ngModelChange)="updateConfig()">
              <span>Solo elementos seleccionados ({{ selectedCount }})</span>
            </label>
          </div>

          <div class="institucional-form-group">
            <label class="institucional-form-label">
              Nombre del archivo
            </label>
            <input 
              type="text"
              class="institucional-table-search"
              [(ngModel)]="config.filename"
              (ngModelChange)="updateConfig()"
              placeholder="datos-tabla">
          </div>
        </div>

        <!-- Información del estado -->
        <div class="institucional-table-export-info">
          <span class="text-sm text-gray-600">
            Se exportarán {{ getExportCount() }} registro(s)
          </span>
        </div>
      </div>

      <!-- Overlay para cerrar -->
      <div 
        *ngIf="showOptions"
        class="institucional-table-export-overlay"
        (click)="closeOptions()">
      </div>
    </div>

    <!-- Indicador de exportación en progreso -->
    <div 
      *ngIf="isExporting" 
      class="institucional-table-export-progress">
      <div class="institucional-table-export-progress-content">
        <div class="institucional-table-loading-spinner"></div>
        <span>Exportando datos...</span>
      </div>
    </div>
  `,
  styles: [`
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    .ml-1 {
      margin-left: 0.25rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
    
    .text-gray-600 {
      color: var(--gray-600);
    }
    
    .institucional-table-export {
      position: relative;
      display: inline-block;
    }
    
    .institucional-table-export-btn-open {
      background: var(--institucional-primario) !important;
      color: white !important;
      border-color: var(--institucional-primario) !important;
    }
    
    .institucional-table-export-options {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 50;
      min-width: 20rem;
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      margin-top: 0.5rem;
      animation: dropdownSlide 0.2s ease-out;
    }
    
    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .institucional-table-export-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 40;
    }
    
    .institucional-table-export-formats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .institucional-table-export-format-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem;
      border: 1px solid var(--gray-200);
      border-radius: 0.375rem;
      background: white;
      color: var(--gray-700);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.75rem;
      text-align: center;
    }
    
    .institucional-table-export-format-btn:hover {
      background: var(--institucional-secundario);
      color: white;
      border-color: var(--institucional-secundario);
      transform: translateY(-1px);
    }
    
    .institucional-table-export-format-btn .material-symbols-outlined {
      font-size: 1.5rem;
    }
    
    .institucional-table-export-config {
      border-top: 1px solid var(--gray-200);
      padding-top: 1rem;
      margin-bottom: 1rem;
    }
    
    .institucional-table-export-checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--gray-700);
      cursor: pointer;
    }
    
    .institucional-table-export-info {
      border-top: 1px solid var(--gray-200);
      padding-top: 1rem;
      text-align: center;
    }
    
    .institucional-table-export-progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .institucional-table-export-progress-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      color: var(--gray-700);
      font-weight: 500;
    }
  `]
})
export class TableExportComponent {
  @Input() data: any[] = [];
  @Input() selectedItems: any[] = [];
  @Input() columns: any[] = [];
  @Input() defaultConfig: Partial<ExportConfig> = {};

  @Output() export = new EventEmitter<ExportEvent>();

  showOptions = false;
  isExporting = false;
  
  config: ExportConfig = {
    filename: 'datos-tabla',
    includeHeaders: true,
    selectedOnly: false,
    formats: []
  };

  defaultFormats: ExportFormat[] = [
    {
      key: 'csv',
      label: 'CSV',
      icon: 'description',
      extension: 'csv',
      mimeType: 'text/csv'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: 'table_chart',
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
      key: 'json',
      label: 'JSON',
      icon: 'code',
      extension: 'json',
      mimeType: 'application/json'
    },
    {
      key: 'pdf',
      label: 'PDF',
      icon: 'picture_as_pdf',
      extension: 'pdf',
      mimeType: 'application/pdf'
    }
  ];

  ngOnInit() {
    this.config = {
      ...this.config,
      ...this.defaultConfig,
      formats: this.defaultConfig.formats || this.defaultFormats
    };
  }

  get availableFormats(): ExportFormat[] {
    return this.config.formats || this.defaultFormats;
  }

  get hasSelectedItems(): boolean {
    return this.selectedItems.length > 0;
  }

  get selectedCount(): number {
    return this.selectedItems.length;
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
  }

  closeOptions() {
    this.showOptions = false;
  }

  selectFormat(format: ExportFormat) {
    this.isExporting = true;
    
    const exportData = this.config.selectedOnly 
      ? this.selectedItems 
      : this.data;

    this.export.emit({
      format: format.key,
      config: this.config,
      data: exportData
    });

    // Simular tiempo de exportación
    setTimeout(() => {
      this.isExporting = false;
      this.closeOptions();
    }, 1500);
  }

  updateConfig() {
    // Trigger change detection cuando se actualiza la configuración
  }

  getExportCount(): number {
    return this.config.selectedOnly ? this.selectedItems.length : this.data.length;
  }
}
