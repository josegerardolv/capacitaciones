import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { BaseFormComponent, FormAction } from './base-form.component';

export interface ValidationRule {
  field: string;
  rules: string[];
  messages?: { [key: string]: string };
  asyncValidator?: (value: any) => Promise<string | null>;
}

export interface FormValidationConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrorsImmediately?: boolean;
  debounceTime?: number;
  customValidations?: ValidationRule[];
}

@Component({
  selector: 'app-validated-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseFormComponent],
  template: `
    <app-base-form
      [formGroup]="formGroup"
      [title]="title"
      [subtitle]="subtitle"
      [primaryActions]="primaryActions"
      [secondaryActions]="secondaryActions"
      [isLoading]="isLoading || isValidating"
      [globalError]="globalError"
      [successMessage]="successMessage"
      (formSubmit)="onFormSubmit($event)"
      (actionClick)="onActionClick($event)">
      
      <!-- Indicador de validación en tiempo real -->
      <div *ngIf="config?.validateOnChange && isValidating" 
           class="mb-4 p-4 bg-stats-azul/10 border-l-4 border-stats-azul rounded-r-lg animate-form-fade-in">
        <div class="flex items-center gap-3 text-stats3">
          <span class="material-icons text-lg animate-spin">sync</span>
          <span class="text-sm font-medium">Validando formulario en tiempo real...</span>
        </div>
      </div>

      <!-- Resumen de errores -->
      <div *ngIf="showErrorSummary && formErrors.length > 0" 
           class="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-form-error">
        <div class="flex items-start gap-3">
          <span class="material-icons text-red-500 text-xl">error_outline</span>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-3">
              Se encontraron {{ formErrors.length }} errores:
            </h4>
            <ul class="text-sm text-red-700 space-y-2">
              <li *ngFor="let error of formErrors" class="flex items-start gap-2">
                <span class="material-icons text-xs mt-1">arrow_right</span>
                <span><strong>{{ error.field }}:</strong> {{ error.message }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Indicador de progreso de validación -->
      <div *ngIf="showValidationProgress" class="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
          <span>Progreso de validación</span>
          <span [class]="getValidationProgressClass()">{{ validationProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3 shadow-inner">
          <div class="bg-stats-azul h-3 rounded-full transition-all duration-500 animate-progress-fill shadow-sm"
               [style.width.%]="validationProgress"></div>
        </div>
        <div class="flex items-center justify-between gap-4 text-xs">
          <div class="flex items-center gap-2 text-green-600">
            <span class="w-3 h-3 rounded-full bg-green-500 shadow-sm"
                  [class.animate-pulse]="validFields > 0"></span>
            <span class="font-medium">{{ validFields }} campos válidos</span>
          </div>
          <div class="flex items-center gap-2 text-red-600">
            <span class="w-3 h-3 rounded-full bg-red-500 shadow-sm"
                  [class.animate-pulse]="invalidFields > 0"></span>
            <span class="font-medium">{{ invalidFields }} campos con errores</span>
          </div>
        </div>
      </div>

      <!-- Contenido dinámico del formulario -->
      <div class="form-content">
        <ng-content></ng-content>
      </div>

      <!-- Validaciones personalizadas en tiempo real -->
      <div *ngIf="customValidationMessages.length > 0" class="mt-6 space-y-3">
        <div *ngFor="let message of customValidationMessages" 
             class="p-4 rounded-lg text-sm border-l-4 transition-all duration-300 animate-form-step-in"
             [class.bg-yellow-50]="message.type === 'warning'"
             [class.border-yellow-400]="message.type === 'warning'"
             [class.text-yellow-800]="message.type === 'warning'"
             [class.bg-blue-50]="message.type === 'info'"
             [class.border-blue-400]="message.type === 'info'"
             [class.text-blue-800]="message.type === 'info'">
          <div class="flex items-start gap-3">
            <span class="material-icons text-lg flex-shrink-0 mt-0.5"
                  [class.text-yellow-600]="message.type === 'warning'"
                  [class.text-blue-600]="message.type === 'info'">
              {{ message.type === 'warning' ? 'warning' : 'info' }}
            </span>
            <div class="flex-1">
              <p class="font-medium mb-1">{{ message.type === 'warning' ? 'Advertencia' : 'Información' }}</p>
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </app-base-form>
  `
})
export class ValidatedFormComponent implements OnInit, OnDestroy {
  @Input() formGroup!: FormGroup;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() config?: FormValidationConfig;
  @Input() showErrorSummary = true;
  @Input() showValidationProgress = false;
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
  @Output() validationChange = new EventEmitter<{ isValid: boolean; errors: any[] }>();
  @Output() cancel = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  isValidating = false;
  formErrors: { field: string; message: string }[] = [];
  customValidationMessages: { type: 'warning' | 'info'; text: string }[] = [];
  validationProgress = 0;
  validFields = 0;
  invalidFields = 0;

  ngOnInit(): void {
    this.setupValidation();
    this.updateValidationStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupValidation(): void {
    if (!this.config) {
      this.config = {
        validateOnChange: true,
        validateOnBlur: true,
        showErrorsImmediately: false,
        debounceTime: 500
      };
    }

    // Configurar validación en tiempo real
    if (this.config.validateOnChange) {
      this.formGroup.valueChanges
        .pipe(
          debounceTime(this.config.debounceTime || 500),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.validateForm();
        });
    }

    // Configurar validación en blur
    if (this.config.validateOnBlur) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        if (control) {
          control.statusChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.updateValidationStatus();
            });
        }
      });
    }
  }

  private async validateForm(): Promise<void> {
    this.isValidating = true;
    this.formErrors = [];
    this.customValidationMessages = [];

    try {
      // Validaciones síncronas
      this.validateSyncRules();

      // Validaciones asíncronas personalizadas
      if (this.config?.customValidations) {
        await this.validateAsyncRules();
      }

      // Emitir cambio de validación
      this.validationChange.emit({
        isValid: this.formGroup.valid && this.formErrors.length === 0,
        errors: this.formErrors
      });

    } finally {
      this.isValidating = false;
    }
  }

  private validateSyncRules(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          this.formErrors.push({
            field: this.getFieldDisplayName(key),
            message: this.getErrorMessage(key, errorKey, control.errors![errorKey])
          });
        });
      }
    });
  }

  private async validateAsyncRules(): Promise<void> {
    if (!this.config?.customValidations) return;

    const asyncValidations = this.config.customValidations
      .filter(rule => rule.asyncValidator)
      .map(async rule => {
        const control = this.formGroup.get(rule.field);
        if (control && rule.asyncValidator) {
          try {
            const error = await rule.asyncValidator(control.value);
            if (error) {
              this.formErrors.push({
                field: this.getFieldDisplayName(rule.field),
                message: error
              });
            }
          } catch (err) {
            console.error(`Error en validación asíncrona para ${rule.field}:`, err);
          }
        }
      });

    await Promise.all(asyncValidations);
  }

  private updateValidationStatus(): void {
    const totalFields = Object.keys(this.formGroup.controls).length;
    let validCount = 0;
    let invalidCount = 0;

    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.get(key);
      if (control) {
        if (control.valid) {
          validCount++;
        } else if (control.invalid) {
          invalidCount++;
        }
      }
    });

    this.validFields = validCount;
    this.invalidFields = invalidCount;
    this.validationProgress = totalFields > 0 ? Math.round((validCount / totalFields) * 100) : 0;

    // Generar mensajes informativos
    this.generateValidationMessages();
  }

  private generateValidationMessages(): void {
    this.customValidationMessages = [];

    // Mensaje de progreso
    if (this.validationProgress > 0 && this.validationProgress < 100) {
      this.customValidationMessages.push({
        type: 'info',
        text: `Has completado ${this.validationProgress}% del formulario correctamente.`
      });
    }

    // Advertencias especiales
    if (this.invalidFields > 0) {
      this.customValidationMessages.push({
        type: 'warning',
        text: `Hay ${this.invalidFields} campo(s) que requieren atención antes de continuar.`
      });
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    // Mapeo de nombres de campo a nombres amigables
    const fieldNames: { [key: string]: string } = {
      'nombre': 'Nombre',
      'email': 'Correo electrónico',
      'password': 'Contraseña',
      'telefono': 'Teléfono',
      'direccion': 'Dirección',
      // Agregar más según sea necesario
    };

    return fieldNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  private getErrorMessage(fieldName: string, errorKey: string, errorValue: any): string {
    // Mensajes de error personalizados
    const messages: { [key: string]: string } = {
      'required': 'Este campo es obligatorio',
      'minlength': `Debe tener al menos ${errorValue.requiredLength} caracteres`,
      'maxlength': `No puede tener más de ${errorValue.requiredLength} caracteres`,
      'email': 'Debe ser un correo electrónico válido',
      'pattern': 'El formato no es válido',
      'min': `El valor mínimo es ${errorValue.min}`,
      'max': `El valor máximo es ${errorValue.max}`,
      'custom': errorValue
    };

    return messages[errorKey] || 'Valor no válido';
  }

  onFormSubmit(formValue: any): void {
    // Validar una vez más antes de enviar
    this.validateForm().then(() => {
      if (this.formGroup.valid && this.formErrors.length === 0) {
        this.formSubmit.emit(formValue);
      }
    });
  }

  onActionClick(action: FormAction): void {
    if (action.label === 'Cancelar') {
      this.cancel.emit();
    }
    this.actionClick.emit(action);
  }

  // Método público para forzar validación
  public forceValidation(): Promise<boolean> {
    return this.validateForm().then(() => {
      return this.formGroup.valid && this.formErrors.length === 0;
    });
  }

  // Método público para limpiar errores
  public clearErrors(): void {
    this.formErrors = [];
    this.customValidationMessages = [];
  }

  // Método para obtener la clase de color del progreso
  getValidationProgressClass(): string {
    if (this.validationProgress >= 100) {
      return 'text-green-600 font-semibold';
    } else if (this.validationProgress >= 75) {
      return 'text-blue-600 font-medium';
    } else if (this.validationProgress >= 50) {
      return 'text-yellow-600 font-medium';
    } else {
      return 'text-red-600 font-medium';
    }
  }
}
