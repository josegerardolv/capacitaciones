import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GalleryItem {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-gallery-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen && currentItem" 
         class="fixed inset-0 bg-gradient-to-br from-institucional-primario/90 via-institucional-vino/95 to-institucional-primario/90 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-backdrop"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor principal -->
      <div class="relative w-full h-full flex items-center justify-center p-4">
        
        <!-- Botón cerrar (diseño mejorado) -->
        <button type="button"
          aria-label="Cerrar galería"
          class="absolute top-6 right-6 z-10 text-white hover:text-gray-200 bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 hover:from-institucional-primario/80 hover:to-institucional-vino/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 ring-offset-0 flex items-center justify-center w-14 h-14 p-0 transition-all duration-300 hover:scale-110 group shadow-2xl backdrop-blur-lg"
          style="box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);"
          (click)="$event.stopPropagation(); close()">
          <span class="material-symbols-outlined text-2xl leading-none block pointer-events-none group-hover:rotate-90 transition-transform duration-300">close</span>
        </button>
        
        <!-- Información de navegación -->
        <div *ngIf="items && items.length > 1" 
             class="absolute top-6 left-6 z-10 bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 text-white px-6 py-3 rounded-2xl backdrop-blur-lg shadow-2xl">
          <span class="text-sm font-semibold">{{ currentIndex + 1 }} de {{ items.length }}</span>
        </div>
        
        <!-- Botón anterior (diseño mejorado) -->
        <button *ngIf="items && items.length > 1 && currentIndex > 0"
          type="button"
          aria-label="Anterior"
          class="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 hover:from-institucional-primario/80 hover:to-institucional-vino/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 ring-offset-0 flex items-center justify-center w-16 h-16 p-0 transition-all duration-300 hover:scale-110 group shadow-2xl backdrop-blur-lg"
          style="box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);"
          (click)="$event.stopPropagation(); previousItem()">
          <span class="material-symbols-outlined text-3xl leading-none block pointer-events-none group-hover:-translate-x-1 transition-transform duration-300">chevron_left</span>
        </button>
        
        <!-- Botón siguiente (diseño mejorado) -->
        <button *ngIf="items && items.length > 1 && currentIndex < items.length - 1"
          type="button"
          aria-label="Siguiente"
          class="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 hover:from-institucional-primario/80 hover:to-institucional-vino/90 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 ring-offset-0 flex items-center justify-center w-16 h-16 p-0 transition-all duration-300 hover:scale-110 group shadow-2xl backdrop-blur-lg"
          style="box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);"
          (click)="$event.stopPropagation(); nextItem()">
          <span class="material-symbols-outlined text-3xl leading-none block pointer-events-none group-hover:translate-x-1 transition-transform duration-300">chevron_right</span>
        </button>
        
        <!-- Contenedor de la imagen -->
        <div class="max-w-full max-h-full flex flex-col items-center justify-center animate-modal-content"
             (click)="$event.stopPropagation()">
          
          <!-- Imagen principal -->
          <div class="relative max-w-full max-h-[80vh] flex items-center justify-center">
            <img [src]="currentItem.src" 
                 [alt]="currentItem.alt || currentItem.title || 'Imagen'"
                 class="max-w-full max-h-full object-contain rounded-3xl shadow-2xl transform transition-all duration-500 hover:scale-105"
                 style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);"
                 (load)="onImageLoad()"
                 (error)="onImageError()">
            
            <!-- Loader de imagen mejorado -->
            <div *ngIf="imageLoading" 
                 class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-institucional-primario/50 to-institucional-vino/50 rounded-3xl backdrop-blur-sm">
              <div class="w-16 h-16">
                <div class="relative w-16 h-16">
                  <div class="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
                  <div class="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Información de la imagen -->
          <div *ngIf="currentItem.title || currentItem.description" 
               class="mt-6 text-center max-w-2xl bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
            <h3 *ngIf="currentItem.title" 
                class="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-institucional-neutro-claro bg-clip-text text-transparent">
              {{ currentItem.title }}
            </h3>
            <p *ngIf="currentItem.description" 
               class="text-gray-200 text-base font-medium leading-relaxed">
              {{ currentItem.description }}
            </p>
          </div>
        </div>
        
        <!-- Thumbnails (si hay múltiples imágenes) -->
        <div *ngIf="items && items.length > 1 && showThumbnails" 
             class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div class="flex gap-3 bg-gradient-to-r from-institucional-primario/70 to-institucional-vino/80 p-4 rounded-2xl max-w-xs overflow-x-auto backdrop-blur-lg shadow-2xl">
            <button *ngFor="let item of items; let i = index"
                    type="button"
                    aria-label="Ir a imagen {{ i + 1 }}"
                    tabindex="0"
                    class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-white/30 hover:scale-110 transform"
                    [class]="i === currentIndex ? 'ring-4 ring-white opacity-100 shadow-lg' : 'ring-2 ring-white/30 opacity-60 hover:opacity-80'"
                    (click)="$event.stopPropagation(); selectItem(i)">
              <img [src]="item.thumbnail || item.src" 
                   [alt]="item.alt || item.title || 'Thumbnail'"
                   class="w-full h-full object-cover transition-transform duration-300 hover:scale-105">
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GalleryModalComponent {
  @Input() isOpen = false;
  @Input() items: GalleryItem[] = [];
  @Input() currentIndex = 0;
  @Input() showThumbnails = true;
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;

  @Output() itemChange = new EventEmitter<{ item: GalleryItem; index: number }>();
  @Output() modalClose = new EventEmitter<void>();

  imageLoading = false;

  get currentItem(): GalleryItem | null {
    return this.items && this.items.length > 0 ? this.items[this.currentIndex] : null;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (this.closeOnEscape) {
          this.close();
        }
        break;
      case 'ArrowLeft':
        this.previousItem();
        break;
      case 'ArrowRight':
        this.nextItem();
        break;
      case 'Home':
        this.selectItem(0);
        break;
      case 'End':
        this.selectItem(this.items.length - 1);
        break;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay) {
      this.close();
    }
  }

  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(): void {
    this.imageLoading = false;
  }

  previousItem(): void {
    if (this.currentIndex > 0) {
      this.selectItem(this.currentIndex - 1);
    }
  }

  nextItem(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.selectItem(this.currentIndex + 1);
    }
  }

  selectItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.imageLoading = true;
      this.currentIndex = index;
      this.itemChange.emit({
        item: this.currentItem!,
        index: this.currentIndex
      });
    }
  }

  close(): void {
    this.isOpen = false;
    this.modalClose.emit();
  }
}
