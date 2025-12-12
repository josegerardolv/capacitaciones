import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DrawerConfig {
  title?: string;
  subtitle?: string;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOverlay?: boolean;
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-drawer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 z-50 overflow-hidden"
         [class.bg-gradient-to-br]="config.showOverlay !== false"
         [class.from-institucional-primario/70]="config.showOverlay !== false"
         [class.to-institucional-vino/80]="config.showOverlay !== false"
         [class.backdrop-blur-lg]="config.showOverlay !== false"
         [class.animate-modal-backdrop]="config.showOverlay !== false"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del drawer -->
      <div class="absolute inset-y-0 flex"
           [class.left-0]="config.position !== 'right'"
           [class.right-0]="config.position === 'right'">
        
        <!-- Panel del drawer -->
        <div class="relative bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out"
             [ngClass]="{
               'w-80': config.size === 'sm',
               'w-96': config.size === 'md' || !config.size,
               'w-[32rem]': config.size === 'lg',
               'w-[40rem]': config.size === 'xl',
               'transform': true,
               'translate-x-0': isOpen && config.position !== 'right',
               '-translate-x-full': !isOpen && config.position !== 'right',
               'translate-x-full': !isOpen && config.position === 'right'
             }"
             [class.translate-x-0]="isOpen && config.position === 'right'"
             (click)="$event.stopPropagation()">
          
          <!-- Header del drawer -->
          <div *ngIf="config.title || config.showCloseButton !== false" 
               class="bg-gradient-institucional p-6 sticky top-0 z-10">
            <div class="flex items-center justify-between">
              <div class="flex-1 pr-4">
                <h3 *ngIf="config.title" class="text-xl font-bold text-white">{{ config.title }}</h3>
                <p *ngIf="config.subtitle" class="text-institucional-rosa-light opacity-90 mt-1">{{ config.subtitle }}</p>
              </div>
              
              <button *ngIf="config.showCloseButton !== false"
                      type="button" 
                      class="text-white hover:text-institucional-rosa-light transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                      (click)="close()">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <!-- Contenido del drawer -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer del drawer (si se incluye contenido) -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200">
            <ng-content select="[slot=footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DrawerModalComponent {
  @Input() isOpen = false;
  @Input() config: DrawerConfig = {
    position: 'right',
    size: 'md',
    showOverlay: true,
    closeOnOverlay: true,
    showCloseButton: true
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

  onOverlayClick(event: MouseEvent): void {
    if (this.config.closeOnOverlay !== false) {
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
