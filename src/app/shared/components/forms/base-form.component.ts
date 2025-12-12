import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
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
  selector: 'app-base-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      <!-- Header del formulario mejorado -->
      <div *ngIf="title || subtitle" class="bg-gradient-institucional p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 *ngIf="title" class="text-2xl font-bold text-white mb-2">{{ title }}</h3>
            <p *ngIf="subtitle" class="text-institucional-secundario-light opacity-90">{{ subtitle }}</p>
          </div>
          <div *ngIf="showProgress && totalSteps > 1" class="flex items-center gap-3 text-white">
            <span class="text-sm font-medium">{{ currentStep }} de {{ totalSteps }}</span>
            <div class="w-24 bg-white bg-opacity-20 rounded-full h-2.5">
              <div class="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                   [style.width.%]="(currentStep / totalSteps) * 100"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido del formulario -->
      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()" class="p-8">
        
        <!-- Área de contenido dinámico -->
        <div class="form-content mb-6">
          <ng-content></ng-content>
          
          <!-- Template personalizado si se proporciona -->
          <ng-container *ngIf="contentTemplate">
            <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
          </ng-container>
        </div>

        <!-- Mensajes de error globales mejorados -->
        <div *ngIf="globalError" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-500 text-xl">error</span>
            <div>
              <p class="font-semibold text-red-800">Error en el formulario</p>
              <p class="text-sm text-red-700 mt-1">{{ globalError }}</p>
            </div>
          </div>
        </div>

        <!-- Mensajes de éxito mejorados -->
        <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-green-500 text-xl">check_circle</span>
            <div>
              <p class="font-semibold text-green-800">¡Éxito!</p>
              <p class="text-sm text-green-700 mt-1">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Acciones del formulario mejoradas -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
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
                    (click)="action.type !== 'submit' && executeAction(action)">
              <span *ngIf="action.icon && !action.loading" class="material-symbols-outlined text-lg">{{ action.icon }}</span>
              <span *ngIf="action.loading || (action.type === 'submit' && isLoading)" 
                    class="material-symbols-outlined text-lg animate-spin">refresh</span>
              {{ action.label }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class BaseFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() primaryActions: FormAction[] = [];
  @Input() secondaryActions: FormAction[] = [];
  @Input() isLoading = false;
  @Input() globalError?: string;
  @Input() successMessage?: string;
  @Input() showProgress = false;
  @Input() currentStep = 1;
  @Input() totalSteps = 1;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<FormAction>();

  @ContentChild('content', { read: TemplateRef }) contentTemplate?: TemplateRef<any>;

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  executeAction(action: FormAction): void {
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
