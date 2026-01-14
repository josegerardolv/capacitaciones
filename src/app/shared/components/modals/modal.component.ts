import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  backgroundColor?: string;
  padding?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fullscreen';
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay + modal container siguiendo patrón institucional -->
    <div *ngIf="isOpen" class="institutional-modal-overlay entering" role="dialog" aria-modal="true"
         [attr.aria-labelledby]="'fs-modal-title-' + modalId" [attr.aria-describedby]="'fs-modal-desc-' + modalId"
         (click)="config.showCloseButton !== false ? close() : null">

       <div class="institutional-modal-container entering overflow-hidden bg-white"
         [ngClass]="sizeClass"
         (click)="$event.stopPropagation()">

        <!-- Header -->
        <div *ngIf="config.showHeader !== false" class="bg-gradient-institucional p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 *ngIf="config.title" [id]="'fs-modal-title-' + modalId" class="text-2xl md:text-3xl font-bold text-white">{{ config.title }}</h3>
              <p *ngIf="config.subtitle" [id]="'fs-modal-desc-' + modalId" class="text-white opacity-90 mt-1">{{ config.subtitle }}</p>
            </div>

            <div class="flex items-center gap-4">
              <ng-content select="[slot=header-actions]"></ng-content>
              <button *ngIf="config.showCloseButton !== false" type="button" class="text-white p-2 rounded-full hover:bg-white/10"
                      (click)="close()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-auto" [class.p-8]="config.padding !== false">
          <div class="relative">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 border-t border-gray-100 p-4">
          <ng-content select="[slot=footer]"></ng-content>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    /* Estilo explícito para 2xl si no está en globales */
    .size-2xl {
      width: 100%;
      max-width: 1536px; /* Equivalente a max-w-7xl */
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() modalId: string = Math.random().toString(36).slice(2);
  @Input() config: ModalConfig = {
    showHeader: true,
    showCloseButton: true,
    padding: true,
    size: 'md'
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

  get sizeClass(): string {
    const s = this.config?.size || 'fullscreen';
    switch (s) {
      case 'sm':
        return 'size-sm';
      case 'md':
        return 'size-md';
      case 'xl':
        return 'size-xl';
      case '2xl':
        return 'size-2xl'; // New size
      case 'lg':
        return 'size-lg';
      case 'fullscreen':
      default:
        return 'size-full';
    }
  }
}
