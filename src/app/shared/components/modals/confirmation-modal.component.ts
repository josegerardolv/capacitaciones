import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface ConfirmationConfig {
  title: string;
  subtitle?: string;
  message: string;
  confirmIcon?: string;
  confirmIconPosition?: 'left' | 'right' | 'only';
  cancelIcon?: string;
  cancelIconPosition?: 'left' | 'right' | 'only';
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  showIcon?: boolean;
  preventClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="institutional-modal-overlay entering"
         role="dialog"
         aria-modal="true"
         [attr.aria-labelledby]="'modal-title-' + modalId"
         [attr.aria-describedby]="'modal-desc-' + modalId"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del modal -->
      <div class="institutional-modal-container entering"
           [class.size-sm]="config.size === 'sm'"
           [class.size-md]="!config.size || config.size === 'md'"
           [class.size-lg]="config.size === 'lg'"
           [class.size-xl]="config.size === 'xl'"
           (click)="$event.stopPropagation()">
        
        <!-- Header del modal -->
        <div class="institutional-modal-header">
          <div>
            <h3 class="institutional-modal-title" [id]="'modal-title-' + modalId">
              {{ config.title }}
            </h3>
            <div *ngIf="config.subtitle" class="institutional-modal-subtitle">{{ config.subtitle }}</div>
          </div>
          
          <!-- Botón cerrar -->
          <app-institutional-button
            *ngIf="!config.preventClose"
            [config]="{
              variant: 'modal-close',
              icon: 'close',
              iconPosition: 'only',
              size: 'medium',
              disabled: isLoading,
              ariaLabel: 'Cerrar modal'
            }"
            class="institutional-modal-close"
            (buttonClick)="close()">
          </app-institutional-button>
        </div>

        <!-- Body del modal -->
        <div class="institutional-modal-body">
          <!-- Icono del tipo de confirmación -->
          <div *ngIf="config.showIcon !== false" 
               class="text-center mb-6">
            <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                 [class.bg-blue-100]="config.type === 'info'"
                 [class.bg-yellow-100]="config.type === 'warning'"
                 [class.bg-red-100]="config.type === 'danger'"
                 [class.bg-green-100]="config.type === 'success'"
                 [class.bg-gray-100]="!config.type">
              <span class="material-symbols-outlined text-2xl"
                    [class.text-blue-600]="config.type === 'info'"
                    [class.text-yellow-600]="config.type === 'warning'"
                    [class.text-red-600]="config.type === 'danger'"
                    [class.text-green-600]="config.type === 'success'"
                    [class.text-gray-600]="!config.type">
                {{ getIcon() }}
              </span>
            </div>
          </div>
          
          <!-- Mensaje -->
          <div class="text-center mb-6">
            <p class="institutional-modal-message" [id]="'modal-desc-' + modalId">
              {{ config.message }}
            </p>
          </div>
          
          <!-- Contenido adicional -->
          <div *ngIf="hasContent" class="mb-6">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="institutional-modal-footer">
          <!-- Botón cancelar -->
          <app-institutional-button
            *ngIf="!config.preventClose"
            [config]="{
              variant: 'ghost',
              disabled: isLoading,
              ariaLabel: 'Cancelar acción',
              icon: config.cancelIcon || 'close',
              iconPosition: config.cancelIconPosition || 'left'
            }"
            (buttonClick)="onCancel()">
            {{ config.cancelText || 'Cancelar' }}
          </app-institutional-button>

          <!-- Botón confirmar -->
          <app-institutional-button
            [config]="{
              variant: 'primary',
              loading: isLoading,
              disabled: isLoading,
              ariaLabel: 'Confirmar acción',
              icon: config.confirmIcon || getConfirmIcon(),
              iconPosition: config.confirmIconPosition || 'left'
            }"
            (buttonClick)="onConfirm()">
            {{ config.confirmText || 'Confirmar' }}
          </app-institutional-button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() config: ConfirmationConfig = {
    title: 'Confirmar acción',
    message: '¿Estás seguro de que deseas continuar?'
  };
  @Input() isLoading = false;
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;
  @Input() hasContent = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();

  // ID único para accesibilidad
  modalId = Math.random().toString(36).substr(2, 9);

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen && !this.isLoading && !this.config.preventClose) {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay && !this.isLoading && !this.config.preventClose) {
      this.close();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  close(): void {
    if (this.isLoading || this.config.preventClose) return;
    
    this.isOpen = false;
    this.modalClose.emit();
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'success':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  getConfirmIcon(): string {
    switch (this.config.type) {
      case 'danger':
        return 'delete';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check';
      default:
        return 'check';
    }
  }
}
