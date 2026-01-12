import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface AlertConfig {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  autoClose?: boolean;
  autoCloseDelay?: number;
  showIcon?: boolean;
  actions?: AlertAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface AlertAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  action?: () => void;
}

@Component({
  selector: 'app-alert-modal',
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
          <h3 class="institutional-modal-title" [id]="'modal-title-' + modalId">
            {{ config.title }}
          </h3>
          
          <!-- Botón cerrar -->
          <app-institutional-button
            [config]="{
              variant: 'modal-close',
              icon: 'close',
              iconPosition: 'only',
              size: 'medium',
              ariaLabel: 'Cerrar modal'
            }"
            class="institutional-modal-close"
            (buttonClick)="close()">
          </app-institutional-button>
        </div>

        <!-- Body del modal -->
        <div class="institutional-modal-body">
          <!-- Icono del tipo de alerta -->
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
          <div class="text-center mb-6" [id]="'modal-desc-' + modalId" [innerHTML]="config.message"></div>
          
          <!-- Contenido adicional -->
          <div *ngIf="hasContent" class="mb-6">
            <ng-content></ng-content>
          </div>

          <!-- Progreso del auto-close -->
          <div *ngIf="config.autoClose && timeLeft > 0" class="mb-6">
            <div class="flex items-center justify-center gap-3 text-sm institutional-modal-secondary-text mb-3">
              <span class="material-symbols-outlined text-lg">schedule</span>
              <span>Cerrando automáticamente en {{ timeLeft }}s</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-1000"
                   [class.bg-blue-500]="config.type === 'info'"
                   [class.bg-yellow-500]="config.type === 'warning'"
                   [class.bg-red-500]="config.type === 'danger'"
                   [class.bg-green-500]="config.type === 'success'"
                   [class.bg-gray-500]="!config.type"
                   [style.width.%]="progressPercentage">
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del modal -->
        <div class="institutional-modal-footer">
          <!-- Acciones personalizadas -->
          <ng-container *ngIf="config.actions && config.actions.length > 0">
            <app-institutional-button
              *ngFor="let action of config.actions"
              [config]="{
                variant: action.variant === 'outline' ? 'ghost' : (action.variant || 'primary'),
                ariaLabel: 'Ejecutar acción: ' + action.label
              }"
              (buttonClick)="executeAction(action)">
              {{ action.label }}
            </app-institutional-button>
          </ng-container>

          <!-- Botón por defecto si no hay acciones personalizadas -->
          <app-institutional-button
            *ngIf="!config.actions || config.actions.length === 0"
            [config]="{
              variant: 'primary',
              ariaLabel: 'Cerrar alerta'
            }"
            (buttonClick)="close()">
            Entendido
          </app-institutional-button>
        </div>
      </div>
    </div>
  `
})
export class AlertModalComponent {
  @Input() isOpen = false;
  @Input() config: AlertConfig = {
    title: 'Información',
    message: 'Esta es una alerta informativa.'
  };
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;
  @Input() hasContent = false;

  @Output() modalClose = new EventEmitter<void>();
  @Output() actionClick = new EventEmitter<AlertAction>();

  // ID único para accesibilidad
  modalId = Math.random().toString(36).substr(2, 9);

  timeLeft = 0;
  progressPercentage = 100;
  private autoCloseTimer?: any;
  private countdownTimer?: any;

  ngOnInit(): void {
    if (this.config.autoClose && this.isOpen) {
      this.startAutoClose();
    }
  }

  ngOnChanges(): void {
    if (this.isOpen && this.config.autoClose) {
      this.startAutoClose();
    } else if (!this.isOpen) {
      this.stopAutoClose();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoClose();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay) {
      this.close();
    }
  }

  close(): void {
    this.stopAutoClose();
    this.isOpen = false;
    this.modalClose.emit();
  }

  executeAction(action: AlertAction): void {
    if (action.action) {
      action.action();
    }
    this.actionClick.emit(action);
    this.close();
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
        return 'notifications';
    }
  }

  getActionClass(variant?: string): string {
    const baseClasses = 'inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-4';

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-institucional-primario hover:bg-institucional-primario-dark text-white focus:ring-institucional-secundario`;
      case 'secondary':
        return `${baseClasses} bg-institucional-secundario hover:bg-institucional-secundario-dark text-white focus:ring-institucional-primario`;
      case 'outline':
        return `${baseClasses} border-2 border-gray-300 hover:border-institucional-primario text-gray-700 hover:text-institucional-primario bg-white hover:bg-gray-50 focus:ring-gray-200`;
      default:
        return `${baseClasses} bg-institucional-primario hover:bg-institucional-primario-dark text-white focus:ring-institucional-secundario`;
    }
  }

  private startAutoClose(): void {
    this.stopAutoClose();

    const delay = this.config.autoCloseDelay || 5000;
    this.timeLeft = Math.ceil(delay / 1000);
    this.progressPercentage = 100;

    // Contador de segundos
    this.countdownTimer = setInterval(() => {
      this.timeLeft--;
      this.progressPercentage = (this.timeLeft / Math.ceil(delay / 1000)) * 100;

      if (this.timeLeft <= 0) {
        clearInterval(this.countdownTimer);
      }
    }, 1000);

    // Timer para cerrar
    this.autoCloseTimer = setTimeout(() => {
      this.close();
    }, delay);
  }

  private stopAutoClose(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.timeLeft = 0;
    this.progressPercentage = 0;
  }
}
