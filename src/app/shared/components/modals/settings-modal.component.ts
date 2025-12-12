import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface SettingsSection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
}

export interface SettingsModalConfig {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  size?: 'md' | 'lg' | 'xl';
  saveText?: string;
  cancelText?: string;
  resetText?: string;
  showReset?: boolean;
}

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-gradient-to-br from-institucional-primario/70 to-institucional-vino/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-modal-backdrop"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del modal -->
      <div class="bg-gradient-to-br from-white to-gray-50/95 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-modal-content flex w-full transform hover:scale-[1.01] transition-all duration-300"
           style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3); backdrop-filter: blur(16px);"
           [class.max-w-4xl]="config.size === 'md' || !config.size"
           [class.max-w-6xl]="config.size === 'lg'"
           [class.max-w-7xl]="config.size === 'xl'"
           (click)="$event.stopPropagation()">
        
        <!-- Sidebar de navegación -->
        <div class="w-80 flex-shrink-0 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
          <!-- Header del sidebar -->
          <div class="bg-gradient-to-r from-institucional-primario via-institucional-secundario to-institucional-vino p-8 shadow-lg">
            <h3 *ngIf="config.title" class="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-institucional-neutro-claro bg-clip-text text-transparent">{{ config.title }}</h3>
            <p *ngIf="config.subtitle" class="text-institucional-neutro-claro opacity-90 text-lg font-medium">{{ config.subtitle }}</p>
          </div>
          
          <!-- Búsqueda de configuraciones -->
          <div *ngIf="config.showSearch !== false" class="p-6">
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">search</span>
              <input [formControl]="searchControl"
                     type="text"
                     placeholder="Buscar configuraciones..."
                     class="w-full pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-primary-300 focus:outline-none transition-all duration-300 bg-white hover:bg-gray-50 focus:bg-white font-medium shadow-sm"
                     style="border: 2px solid transparent;">
            </div>
          </div>
          
          <!-- Lista de secciones -->
          <div class="flex-1 overflow-y-auto px-4 pb-4">
            <nav class="space-y-2">
              <button *ngFor="let section of filteredSections; trackBy: trackBySectionId"
                      type="button"
                      class="w-full text-left p-4 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-institucional-primario/30 transform hover:scale-105 hover:-translate-y-1 shadow-sm hover:shadow-lg"
                      [class.bg-gradient-to-r]="activeSectionId === section.id"
                      [class.from-institucional-primario]="activeSectionId === section.id"
                      [class.to-institucional-secundario]="activeSectionId === section.id"
                      [class.text-white]="activeSectionId === section.id"
                      [class.shadow-lg]="activeSectionId === section.id"
                      [class.bg-white]="activeSectionId !== section.id"
                      [class.text-gray-700]="activeSectionId !== section.id"
                      [class.hover:bg-gray-50]="activeSectionId !== section.id"
                      (click)="selectSection(section.id)">
                
                <div class="flex items-start gap-4">
                  <!-- Icono de la sección -->
                  <div *ngIf="section.icon" 
                       class="w-10 h-10 rounded-xl flex items-center justify-center"
                       [class.bg-white/20]="activeSectionId === section.id"
                       [class.bg-primary-100]="activeSectionId !== section.id">
                    <span class="material-symbols-outlined text-lg"
                          [class.text-white]="activeSectionId === section.id"
                          [class.text-primary-600]="activeSectionId !== section.id">
                      {{ section.icon }}
                    </span>
                  </div>
                  
                  <!-- Contenido de la sección -->
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-base">{{ section.title }}</div>
                    <div *ngIf="section.description" 
                         class="text-sm mt-1 opacity-90 leading-relaxed">
                      {{ section.description }}
                    </div>
                  </div>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="flex-1 flex flex-col">
          <!-- Header del contenido -->
          <div class="p-8 bg-gradient-to-r from-white to-gray-50 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-3xl font-bold text-institucional-guinda mb-2">
                  {{ getActiveSection()?.title || 'Configuraciones' }}
                </h4>
                <p *ngIf="getActiveSection()?.description" 
                   class="text-gray-600 text-lg font-medium leading-relaxed">
                  {{ getActiveSection()?.description }}
                </p>
              </div>
              
              <!-- Botón cerrar -->
              <app-institutional-button
                [config]="{
                  variant: 'ghost',
                  icon: 'close',
                  iconPosition: 'only',
                  size: 'medium',
                  customClass: 'hover:scale-110 group'
                }"
                (buttonClick)="close()">
              </app-institutional-button>
            </div>
          </div>

          <!-- Área de contenido scrolleable -->
          <div class="flex-1 overflow-y-auto p-8 bg-white relative">
            <!-- Patrón de fondo sutil -->
            <div class="absolute inset-0 opacity-5 pointer-events-none"
                 style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
            
            <div class="relative z-10">
              <ng-content></ng-content>
            </div>
          </div>

          <!-- Footer con acciones -->
          <div class="bg-gradient-to-t from-white via-white to-gray-50/50 p-8 shadow-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Botón reset -->
                <app-institutional-button
                  *ngIf="config.showReset !== false"
                  [config]="{
                    variant: 'danger',
                    icon: 'restart_alt',
                    iconPosition: 'left',
                    disabled: isLoading,
                    customClass: 'transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl'
                  }"
                  (buttonClick)="onReset()">
                  {{ config.resetText || 'Restablecer' }}
                </app-institutional-button>
              </div>

              <div class="flex items-center gap-4">
                <!-- Botón cancelar -->
                <app-institutional-button
                  [config]="{
                    variant: 'ghost',
                    icon: 'close',
                    iconPosition: 'left',
                    disabled: isLoading,
                    customClass: 'transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl'
                  }"
                  (buttonClick)="onCancel()">
                  {{ config.cancelText || 'Cancelar' }}
                </app-institutional-button>

                <!-- Botón guardar -->
                <app-institutional-button
                  [config]="{
                    variant: 'primary',
                    icon: isLoading ? 'refresh' : 'save',
                    iconPosition: 'left',
                    loading: isLoading,
                    disabled: isLoading,
                    customClass: 'transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl'
                  }"
                  (buttonClick)="onSave()">
                  {{ config.saveText || 'Guardar cambios' }}
                </app-institutional-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsModalComponent {
  @Input() isOpen = false;
  @Input() config: SettingsModalConfig = {
    size: 'lg',
    showSearch: true,
    showReset: true
  };
  @Input() sections: SettingsSection[] = [];
  @Input() activeSectionId = '';
  @Input() isLoading = false;
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;

  @Output() sectionChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();

  searchControl = new FormControl('');
  filteredSections: SettingsSection[] = [];

  ngOnInit(): void {
    this.updateFilteredSections();
    this.searchControl.valueChanges.subscribe(() => {
      this.updateFilteredSections();
    });

    if (!this.activeSectionId && this.sections.length > 0) {
      this.activeSectionId = this.sections[0].id;
    }
  }

  ngOnChanges(): void {
    this.updateFilteredSections();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen && !this.isLoading) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    const currentIndex = this.filteredSections.findIndex(section => section.id === this.activeSectionId);

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          this.selectSection(this.filteredSections[currentIndex - 1].id);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < this.filteredSections.length - 1) {
          this.selectSection(this.filteredSections[currentIndex + 1].id);
        }
        break;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay && !this.isLoading) {
      this.close();
    }
  }

  selectSection(sectionId: string): void {
    this.activeSectionId = sectionId;
    this.sectionChange.emit(sectionId);
  }

  getActiveSection(): SettingsSection | undefined {
    return this.sections.find(section => section.id === this.activeSectionId);
  }

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  onReset(): void {
    this.reset.emit();
  }

  close(): void {
    if (this.isLoading) return;
    
    this.isOpen = false;
    this.modalClose.emit();
  }

  trackBySectionId(index: number, section: SettingsSection): string {
    return section.id;
  }

  private updateFilteredSections(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.filteredSections = [...this.sections];
    } else {
      this.filteredSections = this.sections.filter(section =>
        section.title.toLowerCase().includes(searchTerm) ||
        (section.description && section.description.toLowerCase().includes(searchTerm))
      );
    }
  }
}
