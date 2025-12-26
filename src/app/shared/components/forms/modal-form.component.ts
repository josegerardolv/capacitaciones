import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

export interface FormAction {
  label: string;
  type: 'submit' | 'button' | 'reset';
  variant: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-modal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Overlay del modal mejorado -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del modal -->
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-modal-in"
           [class.max-w-sm]="size === 'sm'"
           [class.max-w-lg]="size === 'md'"
           [class.max-w-2xl]="size === 'lg'"
           [class.max-w-4xl]="size === 'xl'"
           [class.max-w-6xl]="size === 'full'"
           (click)="$event.stopPropagation()">
        
        <!-- Header del modal mejorado -->
        <div class="bg-gradient-institucional p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 *ngIf="title" class="text-xl font-bold text-white">{{ title }}</h3>
              <p *ngIf="subtitle" class="text-institucional-secundario-light opacity-90 mt-1">{{ subtitle }}</p>
            </div>
            
            <button type="button" 
                    class="text-white hover:text-institucional-secundario-light transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                    [disabled]="isLoading"
                    (click)="close()">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <!-- Contenido scrolleable -->
        <div class="max-h-[60vh] overflow-y-auto p-6">
          <div class="p-6">
            <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
              
              <!-- Contenido dinámico del formulario -->
              <div class="space-y-4">
                <ng-content></ng-content>
              </div>

              <!-- Mensajes de error globales -->
              <div *ngIf="globalError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-start gap-2 text-red-700">
                  <span class="material-symbols-outlined text-red-500 text-sm">error</span>
                  <span class="text-sm">{{ globalError }}</span>
                </div>
              </div>

              <!-- Mensajes de éxito -->
              <div *ngIf="successMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-start gap-2 text-green-700">
                  <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  <span class="text-sm">{{ successMessage }}</span>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Footer con acciones mejorado -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <!-- Botones secundarios -->
            <button *ngFor="let action of secondaryActions" 
                    type="button"
                    [class]="getButtonClass(action.variant)"
                    [disabled]="action.disabled || isLoading"
                    (click)="executeAction(action)">
              <span *ngIf="action.icon && !action.loading" class="material-symbols-outlined text-lg">{{ action.icon }}</span>
              <span *ngIf="action.loading" class="material-symbols-outlined text-lg animate-spin">refresh</span>
              {{ action.label }}
            </button>
          </div>

          <div class="flex items-center gap-3">
            <!-- Botones principales -->
            <button *ngFor="let action of primaryActions" 
                    [type]="action.type"
                    [class]="getButtonClass(action.variant)"
                    [disabled]="action.disabled || isLoading || (action.type === 'submit' && formGroup.invalid)"
                    (click)="action.type === 'submit' ? onSubmit() : executeAction(action)">
              <span *ngIf="action.icon && !action.loading" class="material-symbols-outlined text-lg">{{ action.icon }}</span>
              <span *ngIf="action.loading || (action.type === 'submit' && isLoading)" 
                    class="material-symbols-outlined text-lg animate-spin">refresh</span>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;
  @Input() isLoading = false;
  @Input() globalError?: string;
  @Input() successMessage?: string;

  @Input() primaryActions: FormAction[] = [
    {
      label: 'Guardar',
      type: 'submit',
      variant: 'primary',
      icon: 'save'
    }
  ];

  @Input() secondaryActions: FormAction[] = [
    {
      label: 'Cancelar',
      type: 'button',
      variant: 'outline',
      icon: 'close'
    }
  ];

  @Output() formSubmit = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<FormAction>();
  @Output() modalClose = new EventEmitter<void>();
  @Output() modalOpen = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen && !this.isLoading) {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay && !this.isLoading) {
      this.close();
    }
  }

  open(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    this.modalOpen.emit();
  }

  close(): void {
    if (this.isLoading) return;
    
    this.isOpen = false;
    document.body.style.overflow = ''; // Restaurar scroll del body
    this.modalClose.emit();
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  executeAction(action: FormAction): void {
    if (action.label === 'Cancelar') {
      this.close();
    }
    
    if (action.action) {
      action.action();
    }
    
    this.actionClick.emit(action);
  }

  getButtonClass(variant: string): string {
    const baseClasses = 'inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-institucional-primario hover:bg-institucional-primario-dark text-white shadow-lg hover:shadow-xl focus:ring-institucional-secundario focus:ring-opacity-50`;
      case 'secondary':
        return `${baseClasses} bg-institucional-secundario hover:bg-institucional-secundario-dark text-white shadow-lg hover:shadow-xl focus:ring-institucional-primario focus:ring-opacity-50`;
      case 'outline':
        return `${baseClasses} border-2 border-gray-300 hover:border-institucional-primario text-gray-700 hover:text-institucional-primario bg-white hover:bg-gray-50 focus:ring-gray-200`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl focus:ring-red-300 focus:ring-opacity-50`;
      default:
        return `${baseClasses} border-2 border-gray-300 hover:border-institucional-primario text-gray-700 hover:text-institucional-primario bg-white hover:bg-gray-50 focus:ring-gray-200`;
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
