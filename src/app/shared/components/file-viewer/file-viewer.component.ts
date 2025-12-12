import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BootstrapIconComponent } from '../material-icon/material-icon.component';

export interface FileViewerItem {
  id?: number | string;
  filename: string;
  original_filename?: string;
  mime_type: string;
  file_size: number;
  file_size_human?: string;
  description?: string;
  category?: string;
  is_memorandum?: boolean;
  is_image?: boolean;
  uploaded_at?: string;
  uploaded_by?: {
    id: number;
    full_name: string;
  };
  download_url?: string;
  preview_url?: string;
  ticket_id?: number;
}

export interface FileAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [CommonModule, BootstrapIconComponent],
  template: `
    <div class="file-viewer" [ngClass]="containerClass">
      
      <!-- Vista Lista -->
      <div *ngIf="viewMode === 'list'" class="space-y-3">
        <div *ngFor="let file of files; let i = index; trackBy: trackByFile" 
             class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
             [ngClass]="{'border-blue-300 bg-blue-50': selectedFiles.includes(file.id || i)}">
          
          <div class="flex items-start justify-between">
            <!-- Checkbox de selección (si está habilitado) -->
            <div *ngIf="allowSelection" class="flex-shrink-0 mr-3 pt-1">
              <input 
                type="checkbox" 
                [checked]="selectedFiles.includes(file.id || i)"
                (change)="toggleSelection(file, i)"
                class="w-4 h-4 text-morena-guinda border-gray-300 rounded focus:ring-morena-guinda focus:ring-2">
            </div>

            <div class="flex items-start space-x-3 flex-1">
              <!-- Icono del archivo -->
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                     [ngClass]="getFileIconBackground(file)">
                  <app-bootstrap-icon 
                    [name]="getFileIcon(file)" 
                    [size]="24" 
                    [customClass]="getFileIconColor(file)">
                  </app-bootstrap-icon>
                </div>
              </div>
              
              <!-- Información del archivo -->
              <div class="flex-1 min-w-0">
                <h5 class="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-morena-guinda"
                    (click)="onFileClick(file)"
                    [title]="file.filename || file.original_filename">
                  {{ truncateFileName(file.filename || file.original_filename || '', 35) }}
                </h5>
                
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-xs text-gray-500">
                    {{ file.file_size_human || formatFileSize(file.file_size) }}
                  </span>
                  
                  <span *ngIf="file.category" 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        [ngClass]="getCategoryClass(file)">
                    {{ getCategoryLabel(file) }}
                  </span>
                  
                  <span *ngIf="file.uploaded_at" class="text-xs text-gray-400">
                    {{ formatDate(file.uploaded_at) }}
                  </span>
                </div>
                
                <!-- Descripción del archivo -->
                <p *ngIf="file.description && showDescription" 
                   class="text-xs text-gray-600 mt-1 line-clamp-2">
                  {{ file.description }}
                </p>
                
                <!-- Usuario que subió el archivo -->
                <p *ngIf="file.uploaded_by && showUploader" 
                   class="text-xs text-gray-500 mt-1 flex items-center">
                  <app-bootstrap-icon name="person" [size]="12" customClass="mr-1"></app-bootstrap-icon>
                  {{ file.uploaded_by.full_name }}
                </p>
              </div>
            </div>
            
            <!-- Acciones del archivo -->
            <div class="flex items-center space-x-1 ml-4">
              <!-- Botón de vista previa (solo para imágenes y PDFs) -->
              <button *ngIf="canPreview(file)"
                      type="button"
                      (click)="onPreview(file)"
                      class="p-2 text-gray-500 hover:text-morena-guinda hover:bg-morena-guinda/10 rounded-lg transition-colors"
                      title="Vista previa">
                <app-bootstrap-icon name="eye" [size]="16"></app-bootstrap-icon>
              </button>
              
              <!-- Acciones personalizadas -->
              <button *ngFor="let action of actions"
                      type="button"
                      (click)="onAction(action, file)"
                      [disabled]="action.disabled"
                      class="p-2 rounded-lg transition-colors"
                      [ngClass]="getActionClass(action)"
                      [title]="action.label">
                <app-bootstrap-icon [name]="action.icon" [size]="16"></app-bootstrap-icon>
              </button>
              
              <!-- Menú de más opciones -->
              <div *ngIf="showMoreMenu" class="relative">
                <button type="button"
                        (click)="toggleMenu(i)"
                        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Más opciones">
                  <app-bootstrap-icon name="three-dots-vertical" [size]="16"></app-bootstrap-icon>
                </button>
                
                <!-- Dropdown menu -->
                <div *ngIf="openMenuIndex === i" 
                     class="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div class="py-1">
                    <button *ngFor="let option of menuOptions"
                            type="button"
                            (click)="onMenuOption(option, file); closeMenu()"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <app-bootstrap-icon [name]="option.icon" [size]="14" customClass="mr-2"></app-bootstrap-icon>
                      {{ option.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vista Cuadrícula -->
      <div *ngIf="viewMode === 'grid'" class="grid gap-4" [ngClass]="getGridClass()">
        <div *ngFor="let file of files; let i = index; trackBy: trackByFile" 
             class="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
             [ngClass]="{'border-blue-300 bg-blue-50': selectedFiles.includes(file.id || i)}"
             (click)="onFileClick(file)">
          
          <!-- Checkbox de selección -->
          <div *ngIf="allowSelection" class="flex justify-end mb-2">
            <input 
              type="checkbox" 
              [checked]="selectedFiles.includes(file.id || i)"
              (change)="toggleSelection(file, i); $event.stopPropagation()"
              class="w-4 h-4 text-morena-guinda border-gray-300 rounded focus:ring-morena-guinda focus:ring-2">
          </div>
          
          <!-- Vista previa o icono -->
          <div class="flex justify-center mb-3">
            <div *ngIf="file.is_image && file.preview_url; else iconView" 
                 class="w-16 h-16 rounded-lg overflow-hidden">
              <img [src]="file.preview_url" 
                   [alt]="file.filename" 
                   class="w-full h-full object-cover">
            </div>
            <ng-template #iconView>
              <div class="w-16 h-16 rounded-lg flex items-center justify-center"
                   [ngClass]="getFileIconBackground(file)">
                <app-bootstrap-icon 
                  [name]="getFileIcon(file)" 
                  [size]="32" 
                  [customClass]="getFileIconColor(file)">
                </app-bootstrap-icon>
              </div>
            </ng-template>
          </div>
          
          <!-- Información del archivo -->
          <div class="text-center">
            <h5 class="text-sm font-medium text-gray-900 truncate mb-1"
                [title]="file.filename || file.original_filename">
              {{ truncateFileName(file.filename || file.original_filename || '', 20) }}
            </h5>
            
            <p class="text-xs text-gray-500 mb-2">
              {{ file.file_size_human || formatFileSize(file.file_size) }}
            </p>
            
            <div *ngIf="file.category" class="flex justify-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    [ngClass]="getCategoryClass(file)">
                {{ getCategoryLabel(file) }}
              </span>
            </div>
          </div>
          
          <!-- Acciones rápidas -->
          <div class="flex justify-center space-x-1 mt-3 pt-3 border-t border-gray-100">
            <!-- Botón de vista previa específico -->
            <button *ngIf="canPreview(file)"
                    type="button"
                    (click)="onPreview(file); $event.stopPropagation()"
                    class="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="Vista previa">
              <app-bootstrap-icon name="eye" [size]="14"></app-bootstrap-icon>
            </button>
            
            <!-- Acciones personalizadas (máximo 2 para no saturar) -->
            <button *ngFor="let action of actions.slice(0, 2)"
                    type="button"
                    (click)="onAction(action, file); $event.stopPropagation()"
                    [disabled]="action.disabled"
                    class="p-1 rounded transition-colors"
                    [ngClass]="getActionClass(action)"
                    [title]="action.label">
              <app-bootstrap-icon [name]="action.icon" [size]="14"></app-bootstrap-icon>
            </button>
            
            <!-- Botón de más opciones si hay más de 2 acciones -->
            <button *ngIf="actions.length > 2"
                    type="button"
                    (click)="toggleMenu(i); $event.stopPropagation()"
                    class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Más opciones">
              <app-bootstrap-icon name="three-dots" [size]="14"></app-bootstrap-icon>
            </button>
          </div>
          
          <!-- Menú dropdown para acciones adicionales -->
          <div *ngIf="openMenuIndex === i && actions.length > 2" 
               class="absolute top-full right-2 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div class="py-1">
              <button *ngFor="let action of actions.slice(2)"
                      type="button"
                      (click)="onAction(action, file); closeMenu(); $event.stopPropagation()"
                      [disabled]="action.disabled"
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      [ngClass]="{'opacity-50 cursor-not-allowed': action.disabled}">
                <app-bootstrap-icon [name]="action.icon" [size]="12" customClass="mr-2"></app-bootstrap-icon>
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estado vacío -->
      <div *ngIf="files.length === 0" class="text-center py-12">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <app-bootstrap-icon name="file-earmark" [size]="32" customClass="text-gray-400"></app-bootstrap-icon>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ emptyTitle }}</h3>
        <p class="text-gray-500">{{ emptyMessage }}</p>
      </div>
      
      <!-- Acciones de selección múltiple -->
      <div *ngIf="allowSelection && selectedFiles.length > 0" 
           class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-2">
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-700">
            {{ selectedFiles.length }} archivo(s) seleccionado(s)
          </span>
          
          <button *ngFor="let action of bulkActions"
                  type="button"
                  (click)="onBulkAction(action)"
                  class="btn-morena-secondary text-sm">
            <app-bootstrap-icon [name]="action.icon" [size]="14" customClass="mr-1"></app-bootstrap-icon>
            {{ action.label }}
          </button>
          
          <button type="button"
                  (click)="clearSelection()"
                  class="text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .file-viewer {
      position: relative;
    }
    
    /* Animaciones */
    .transition-shadow {
      transition: box-shadow 0.2s ease-in-out;
    }
    
    .transition-colors {
      transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
    }
  `]
})
export class FileViewerComponent implements OnInit {
  @Input() files: FileViewerItem[] = [];
  @Input() viewMode: 'list' | 'grid' = 'list';
  @Input() gridColumns: number = 4;
  @Input() allowSelection: boolean = false;
  @Input() showDescription: boolean = true;
  @Input() showUploader: boolean = true;
  @Input() showMoreMenu: boolean = false;
  @Input() containerClass: string = '';
  @Input() emptyTitle: string = 'No hay archivos';
  @Input() emptyMessage: string = 'No se encontraron archivos para mostrar.';
  
  // Acciones personalizables
  @Input() actions: FileAction[] = [
    { id: 'download', label: 'Descargar', icon: 'download', color: 'blue' },
    { id: 'delete', label: 'Eliminar', icon: 'trash', color: 'red' }
  ];
  
  @Input() menuOptions: FileAction[] = [
    { id: 'info', label: 'Información', icon: 'info-circle', color: 'gray' },
    { id: 'rename', label: 'Renombrar', icon: 'pencil', color: 'gray' },
    { id: 'move', label: 'Mover', icon: 'folder2-open', color: 'gray' }
  ];
  
  @Input() bulkActions: FileAction[] = [
    { id: 'download-bulk', label: 'Descargar', icon: 'download', color: 'blue' },
    { id: 'delete-bulk', label: 'Eliminar', icon: 'trash', color: 'red' }
  ];
  
  // Eventos
  @Output() fileClick = new EventEmitter<FileViewerItem>();
  @Output() filePreview = new EventEmitter<FileViewerItem>();
  @Output() actionClick = new EventEmitter<{action: FileAction, file: FileViewerItem}>();
  @Output() menuOptionClick = new EventEmitter<{option: FileAction, file: FileViewerItem}>();
  @Output() bulkActionClick = new EventEmitter<{action: FileAction, files: FileViewerItem[]}>();
  @Output() selectionChange = new EventEmitter<FileViewerItem[]>();
  
  selectedFiles: (number | string)[] = [];
  openMenuIndex: number | null = null;
  
  ngOnInit(): void {
    // Configurar acciones por defecto si no se proporcionan
    if (this.actions.length === 0) {
      this.actions = [
        { id: 'download', label: 'Descargar', icon: 'download', color: 'blue' },
        { id: 'delete', label: 'Eliminar', icon: 'trash', color: 'red' }
      ];
    }
  }
  
  trackByFile(index: number, file: FileViewerItem): any {
    return file.id || index;
  }
  
  getFileIcon(file: FileViewerItem): string {
    if (file.mime_type?.includes('pdf')) return 'file-earmark-pdf';
    if (file.mime_type?.includes('word') || file.mime_type?.includes('document')) return 'file-earmark-word';
    if (file.mime_type?.includes('sheet') || file.mime_type?.includes('excel')) return 'file-earmark-excel';
    if (file.mime_type?.includes('powerpoint') || file.mime_type?.includes('presentation')) return 'file-earmark-ppt';
    if (file.is_image) return 'file-earmark-image';
    if (file.mime_type?.includes('zip') || file.mime_type?.includes('rar')) return 'file-earmark-zip';
    if (file.mime_type?.includes('text')) return 'file-earmark-text';
    return 'file-earmark';
  }
  
  getFileIconColor(file: FileViewerItem): string {
    if (file.mime_type?.includes('pdf')) return 'text-red-600';
    if (file.mime_type?.includes('word') || file.mime_type?.includes('document')) return 'text-blue-600';
    if (file.mime_type?.includes('sheet') || file.mime_type?.includes('excel')) return 'text-green-600';
    if (file.mime_type?.includes('powerpoint') || file.mime_type?.includes('presentation')) return 'text-orange-600';
    if (file.is_image) return 'text-purple-600';
    if (file.mime_type?.includes('zip') || file.mime_type?.includes('rar')) return 'text-yellow-600';
    return 'text-gray-600';
  }
  
  getFileIconBackground(file: FileViewerItem): string {
    if (file.mime_type?.includes('pdf')) return 'bg-red-100';
    if (file.mime_type?.includes('word') || file.mime_type?.includes('document')) return 'bg-blue-100';
    if (file.mime_type?.includes('sheet') || file.mime_type?.includes('excel')) return 'bg-green-100';
    if (file.mime_type?.includes('powerpoint') || file.mime_type?.includes('presentation')) return 'bg-orange-100';
    if (file.is_image) return 'bg-purple-100';
    if (file.mime_type?.includes('zip') || file.mime_type?.includes('rar')) return 'bg-yellow-100';
    return 'bg-gray-100';
  }
  
  getCategoryClass(file: FileViewerItem): string {
    if (file.is_memorandum) return 'bg-purple-100 text-purple-800';
    if (file.category === 'evidence') return 'bg-yellow-100 text-yellow-800';
    if (file.category === 'document') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  }
  
  getCategoryLabel(file: FileViewerItem): string {
    if (file.is_memorandum) return 'Memorándum';
    if (file.category === 'evidence') return 'Evidencia';
    if (file.category === 'document') return 'Documento';
    return 'General';
  }
  
  getActionClass(action: FileAction): string {
    const baseClass = 'hover:bg-opacity-10';
    const colorClasses = {
      'blue': 'text-blue-600 hover:bg-blue-600',
      'red': 'text-red-600 hover:bg-red-600',
      'green': 'text-green-600 hover:bg-green-600',
      'yellow': 'text-yellow-600 hover:bg-yellow-600',
      'purple': 'text-purple-600 hover:bg-purple-600',
      'gray': 'text-gray-600 hover:bg-gray-600'
    };
    
    const colorClass = colorClasses[action.color as keyof typeof colorClasses] || colorClasses.gray;
    const disabledClass = action.disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClass} ${colorClass} ${disabledClass}`;
  }
  
  getGridClass(): string {
    const columns = {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    };
    
    return columns[this.gridColumns as keyof typeof columns] || 'grid-cols-4';
  }
  
  canPreview(file: FileViewerItem): boolean {
    return file.is_image || file.mime_type?.includes('pdf') || false;
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Métodos de interacción
  onFileClick(file: FileViewerItem): void {
    this.fileClick.emit(file);
  }
  
  onPreview(file: FileViewerItem): void {
    this.filePreview.emit(file);
  }
  
  onAction(action: FileAction, file: FileViewerItem): void {
    if (!action.disabled) {
      this.actionClick.emit({ action, file });
    }
  }
  
  onMenuOption(option: FileAction, file: FileViewerItem): void {
    this.menuOptionClick.emit({ option, file });
  }
  
  onBulkAction(action: FileAction): void {
    const selectedFileObjects = this.files.filter((file, index) => 
      this.selectedFiles.includes(file.id || index)
    );
    this.bulkActionClick.emit({ action, files: selectedFileObjects });
  }
  
  // Métodos de selección
  toggleSelection(file: FileViewerItem, index: number): void {
    const id = file.id || index;
    const selectedIndex = this.selectedFiles.indexOf(id);
    
    if (selectedIndex > -1) {
      this.selectedFiles.splice(selectedIndex, 1);
    } else {
      this.selectedFiles.push(id);
    }
    
    this.emitSelectionChange();
  }
  
  clearSelection(): void {
    this.selectedFiles = [];
    this.emitSelectionChange();
  }
  
  selectAll(): void {
    this.selectedFiles = this.files.map((file, index) => file.id || index);
    this.emitSelectionChange();
  }
  
  private emitSelectionChange(): void {
    const selectedFileObjects = this.files.filter((file, index) => 
      this.selectedFiles.includes(file.id || index)
    );
    this.selectionChange.emit(selectedFileObjects);
  }
  
  // Métodos de menú
  toggleMenu(index: number): void {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }
  
  closeMenu(): void {
    this.openMenuIndex = null;
  }

  /**
   * Recorta el nombre del archivo si es muy largo
   */
  truncateFileName(filename: string, maxLength: number = 25): string {
    if (!filename || filename.length <= maxLength) {
      return filename;
    }
    
    // Separar nombre y extensión
    const lastDotIndex = filename.lastIndexOf('.');
    
    if (lastDotIndex === -1) {
      // Sin extensión
      return filename.substring(0, maxLength - 3) + '...';
    }
    
    const name = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex);
    
    // Calcular cuánto espacio tenemos para el nombre
    const availableLength = maxLength - extension.length - 3; // 3 para '...'
    
    if (availableLength <= 0) {
      // La extensión es muy larga, recortar todo
      return filename.substring(0, maxLength - 3) + '...';
    }
    
    return name.substring(0, availableLength) + '...' + extension;
  }
}
