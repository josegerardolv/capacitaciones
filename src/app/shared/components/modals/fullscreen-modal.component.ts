import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FullscreenConfig {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  backgroundColor?: string;
  padding?: boolean;
}

@Component({
  selector: 'app-fullscreen-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal fullscreen -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-50 flex flex-col animate-modal-backdrop bg-gradient-to-br from-white via-gray-50/95 to-white"
         style="backdrop-filter: blur(16px);">
      
      <!-- Header opcional -->
      <div *ngIf="config.showHeader !== false" 
           class="bg-gradient-institucional-triple shadow-2xl relative z-10"
           style="box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.2);">
        <div class="flex items-center justify-between p-8">
          <div class="flex-1">
            <h1 *ngIf="config.title" class="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-institucional-neutro-claro bg-clip-text text-transparent">{{ config.title }}</h1>
            <p *ngIf="config.subtitle" class="text-institucional-neutro-claro opacity-90 text-lg font-medium">{{ config.subtitle }}</p>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Botones de control -->
            <ng-content select="[slot=header-actions]"></ng-content>
            
            <!-- Botón cerrar -->
            <button *ngIf="config.showCloseButton !== false"
                    type="button" 
                    class="text-white hover:text-primary-100 transition-all duration-300 p-4 rounded-2xl hover:bg-white/20 hover:scale-110 group shadow-lg"
                    (click)="close()">
              <span class="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">close</span>
            </button>
          </div>
        </div>
        
        <!-- Barra de progreso opcional -->
        <ng-content select="[slot=progress]"></ng-content>
      </div>

      <!-- Contenido principal -->
      <div class="flex-1 overflow-auto relative"
           [class.p-8]="config.padding !== false">
        <!-- Patrón de fondo sutil -->
        <div class="absolute inset-0 opacity-5 pointer-events-none"
             style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
        
        <div class="relative z-10">
          <ng-content></ng-content>
        </div>
      </div>

      <!-- Footer opcional -->
      <div class="bg-gradient-to-t from-white via-white to-white/95 shadow-2xl relative z-10"
           style="box-shadow: 0 -10px 30px -5px rgba(0, 0, 0, 0.1);">
        <ng-content select="[slot=footer]"></ng-content>
      </div>

      <!-- Botón flotante de cierre (alternativo) -->
      <button *ngIf="config.showHeader === false && config.showCloseButton !== false"
              type="button" 
              class="fixed top-8 right-8 z-20 bg-institucional-guinda hover:bg-institucional-guinda-dark text-white transition-all duration-300 p-4 rounded-2xl shadow-2xl backdrop-blur-lg hover:scale-110 group"
              style="box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);"
              (click)="close()">
        <span class="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform duration-300">close</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FullscreenModalComponent {
  @Input() isOpen = false;
  @Input() config: FullscreenConfig = {
    showHeader: true,
    showCloseButton: true,
    padding: true
  };
  @Input() closeOnEscape = true;

  @Output() modalClose = new EventEmitter<void>();
  @Output() modalOpen = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    this.modalOpen.emit();
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = ''; // Restaurar scroll del body
    this.modalClose.emit();
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
