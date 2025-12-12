import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, ValidatorFn, Validators, FormGroupDirective, ControlContainer } from '@angular/forms';

import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

// Schema para configuración automática del formulario
export type FormFieldSchema = [any, ValidatorFn | ValidatorFn[] | null] | [any] | any;

export interface FormSchema {
  [stepId: string]: {
    [fieldName: string]: FormFieldSchema;
  };
}

export interface StepConfiguration {
  id: string;
  title: string;
  subtitle?: string;
  showHeader?: boolean;
}

@Component({
  selector: 'app-stepper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (component: StepperFormComponent) => {
        const directive = new FormGroupDirective([], []);
        directive.form = component.masterFormGroup;
        return directive;
      },
      deps: [StepperFormComponent]
    }
  ],
  template: `
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <!-- Header optimizado -->
      <div class="bg-gradient-institucional p-6">
        <h3 *ngIf="title" class="text-xl font-bold text-white mb-2">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-white opacity-90 mb-4">{{ subtitle }}</p>
        
        <!-- Indicador de pasos simplificado -->
        <div class="space-y-4">
          @if(showStepIndicators){
          <!-- Círculos de pasos -->
          <div class="flex items-center justify-between relative mb-4">
            <div class="absolute top-4 left-0 w-full h-0.5 bg-white bg-opacity-30 -z-10"></div>
            <div class="absolute top-4 left-0 h-0.5 bg-white transition-all duration-500 -z-10"
                 [style.width.%]="progressPercentage"></div>
            
            <div *ngFor="let step of steps; let i = index" class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300"
                   [ngClass]="{
                     'border-white bg-white text-institucional-primario': isStepCompleted(i),
                     'border-white border-opacity-50 bg-transparent text-white': !isStepCompleted(i),
                     'scale-110': i === currentStepIndex
                   }">
                <span *ngIf="isStepCompleted(i)">✓</span>
                <span *ngIf="!isStepCompleted(i)">{{ i + 1 }}</span>
              </div>
              <span class="text-xs mt-2 text-center max-w-20 leading-tight"
                    [ngClass]="{
                      'text-white': isStepCompleted(i),
                      'text-opacity-90 border-b-2 border-institucional-secundario pb-0.5': i === currentStepIndex,
                      'text-gray-300': !isStepCompleted(i)
                    }">
                {{ step.title }}
              </span>
            </div>
          </div>
          }
          @if(showProgressBar){
          <!-- Barra de progreso -->
          <div class="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div class="h-2 bg-white rounded-full transition-all duration-500"
                 [style.width.%]="progressPercentage"></div>
          </div>
          
          <!-- Info del progreso -->
          <div class="flex justify-between text-white text-sm">
            <span>Paso {{ currentStepIndex + 1 }} de {{ steps.length }}</span>
            <span>{{ progressPercentage }}% completado</span>
          </div>
          }
        </div>
      </div>

    <form [formGroup]="masterFormGroup" class="p-8">
      <!-- Contenido del paso actual -->
      <div class="min-h-[400px]">
        <!-- Título del paso actual -->
        <div *ngIf="(stepsConfig?.[currentStepIndex]?.showHeader ?? true) && (currentStepConfig?.title || currentStepConfig?.subtitle)" class="mb-8 pb-4 border-b border-gray-100">
          <h4 class="text-2xl font-bold text-institucional-primario mb-2">{{ currentStepConfig?.title }}</h4>
          <p *ngIf="currentStepConfig?.subtitle" class="text-gray-600 text-lg">{{ currentStepConfig?.subtitle }}</p>
        </div>

        <!-- Contenido dinámico por paso -->
        <div class="step-content">
          <!-- Fallback para step content genérico -->
          <div *ngIf="currentStepIndex === 0">
            <ng-content select="[step-content='step1']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 1">
            <ng-content select="[step-content='step2']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 2">
            <ng-content select="[step-content='step3']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 3">
            <ng-content select="[step-content='step4']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 4">
            <ng-content select="[step-content='step5']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 5">
            <ng-content select="[step-content='step6']"></ng-content>
          </div>
          <div *ngIf="currentStepIndex === 6">
            <ng-content select="[step-content='step6']"></ng-content>
          </div>
          
          <!-- Fallback para configuraciones dinámicas -->
          <div *ngIf="currentStepIndex > 6">
            <ng-content></ng-content>
          </div>
        </div>
      </div>

        <!-- Mensaje de error -->
        <div *ngIf="globalError" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
          <div class="flex items-start gap-3">
            <span class="text-red-500 text-xl">⚠️</span>
            <div>
              <p class="font-semibold text-red-800">Error en el paso actual</p>
              <p class="text-sm text-red-700 mt-1">{{ globalError }}</p>
            </div>
          </div>
        </div>

        <!-- Controles de navegación -->
        <div class="pt-6 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row sm:justify-between gap-3">
            <!-- Botón anterior -->
            <app-institutional-button
              [config]="{
                variant: 'secondary',
                disabled: !canGoPrevious || isLoading,
                customClass: 'w-full sm:w-auto justify-center',
                type: 'button'
              }"
              (buttonClick)="previousStep()">
              ← Anterior
            </app-institutional-button>

            <!-- Botones de la derecha -->
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <app-institutional-button
                [config]="{
                  variant: 'ghost',
                  disabled: isLoading,
                  customClass: 'w-full sm:w-auto justify-center',
                  type: 'button'
                }"
                (buttonClick)="onCancel()">
                ✕ Cancelar
              </app-institutional-button>

              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  disabled: !canGoNext || isLoading,
                  loading: isLoading,
                  customClass: 'w-full sm:w-auto justify-center shadow-lg hover:shadow-xl',
                  type: 'button'
                }"
                (buttonClick)="nextStep()">
                <span *ngIf="!isLastStep && !isLoading">→</span>
                <span *ngIf="isLastStep && !isLoading">✓</span>
                {{ isLastStep ? 'Finalizar' : 'Siguiente' }}
              </app-institutional-button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class StepperFormComponent implements OnInit, OnChanges, AfterViewInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // ===== INPUTS PARA CONFIGURACIÓN POR SCHEMA =====
  @Input() formSchema: FormSchema = {};
  @Input() stepsConfig: StepConfiguration[] = [];
  @Input() title?: string;
  @Input() subtitle?: string
  @Input() showProgressBar = true;
  @Input() showStepIndicators = true;
  @Input() isLoading = false;
  @Input() globalError?: string;
  @Input() allowStepNavigation = false;

  // ===== OUTPUTS =====
  @Output() stepChange = new EventEmitter<{ stepConfig: StepConfiguration; index: number }>();
  @Output() formComplete = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // ===== ESTADO INTERNO =====
  currentStepIndex = 0;
  masterFormGroup!: FormGroup;
  private _stepConfigurations: StepConfiguration[] = [];
  private _stepIds: string[] = [];

  // ===== MÉTODO PARA PROVIDER =====
  // Este método ya no es necesario ya que usamos viewProviders
  
  ngAfterViewInit(): void {
    // Los componentes hijos que usan ControlValueAccessor funcionarán automáticamente
    // Forzar una verificación después de que se hayan inicializado todos los componentes
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 100);
  }
  
  ngOnInit(): void {
    this.initializeFormFromSchema();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formSchema'] || changes['stepsConfig']) {
      this.initializeFormFromSchema();
    }
  }

  // ===== INICIALIZACIÓN DESDE SCHEMA =====
  private initializeFormFromSchema(): void {
    if (!this.formSchema || Object.keys(this.formSchema).length === 0) {
      return;
    }

    // Extraer stepIds del schema
    this._stepIds = Object.keys(this.formSchema);
    
    // Usar stepsConfig si se proporciona, sino crear configuración básica
    if (this.stepsConfig && this.stepsConfig.length > 0) {
      this._stepConfigurations = this.stepsConfig;
    } else {
      this._stepConfigurations = this._stepIds.map((stepId, index) => ({
        id: stepId,
        title: `Paso ${index + 1}`,
        subtitle: undefined
      }));
    }

    // Crear el FormGroup maestro con todos los campos
    const allControls: { [key: string]: FormControl } = {};
    
    Object.entries(this.formSchema).forEach(([stepId, stepFields]) => {
      Object.entries(stepFields).forEach(([fieldName, fieldSchema]) => {
        allControls[fieldName] = this.createFormControlFromSchema(fieldSchema);
      });
    });

    this.masterFormGroup = this.fb.group(allControls);
    
    // Suscribirse a cambios de valor para actualizar validación en tiempo real
    this.masterFormGroup.valueChanges.subscribe(() => {
      // Forzar detección de cambios para que se actualice canGoNext
      this.cdr.markForCheck();
    });
  }

  private createFormControlFromSchema(fieldSchema: FormFieldSchema): FormControl {
    if (Array.isArray(fieldSchema)) {
      const [value, validators] = fieldSchema;
      return new FormControl(value || '', validators || []);
    } else {
      return new FormControl(fieldSchema || '', []);
    }
  }

  // ===== GETTERS PARA EL TEMPLATE =====
  get currentStepConfig(): StepConfiguration | undefined {
    return this._stepConfigurations[this.currentStepIndex];
  }

  get canGoPrevious(): boolean {
    return this.currentStepIndex > 0;
  }

  get canGoNext(): boolean {
    return this.isCurrentStepValid();
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this._stepIds.length - 1;
  }

  get progressPercentage(): number {
    if (!this.masterFormGroup || this._stepIds.length === 0) return 0;
    
    // Obtener todos los campos requeridos del formulario
    const requiredFields: string[] = [];
    Object.entries(this.formSchema).forEach(([stepId, stepFields]) => {
      Object.entries(stepFields).forEach(([fieldName, fieldSchema]) => {
        const control = this.masterFormGroup.get(fieldName);
        if (control && this.isFieldRequired(fieldSchema)) {
          requiredFields.push(fieldName);
        }
      });
    });
    
    if (requiredFields.length === 0) return 100; // Si no hay campos requeridos, 100%
    
    // Contar cuántos campos requeridos están completados (válidos y con valor)
    const completedRequiredFields = requiredFields.filter(fieldName => {
      const control = this.masterFormGroup.get(fieldName);
      if (!control) return false;
      
      const val = control.value;
      const hasValue = val !== null && val !== undefined && !(typeof val === 'string' && val.trim() === '');
      return control.valid && hasValue;
    });
    
    return Math.round((completedRequiredFields.length / requiredFields.length) * 100);
  }

  get steps(): StepConfiguration[] {
    return this._stepConfigurations;
  }

  // ===== VALIDACIÓN =====
  private isCurrentStepValid(): boolean {
    if (!this.masterFormGroup) {
      return false;
    }
    
    const currentStepId = this._stepIds[this.currentStepIndex];
    const currentStepFields = this.formSchema[currentStepId];
    
    if (!currentStepFields) {
      return true;
    }

    // Verificar que todos los campos del paso actual sean válidos
    return Object.keys(currentStepFields).every(fieldName => {
      const control = this.masterFormGroup.get(fieldName);
      return control ? control.valid : true;
    });
  }

  // ===== NAVEGACIÓN =====
  nextStep(): void {
    if (!this.canGoNext) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.isLastStep) {
      this.completeForm();
    } else {
      this.currentStepIndex++;
      this.emitStepChange();
    }
  }

  previousStep(): void {
    if (!this.canGoPrevious) return;
    this.currentStepIndex--;
    this.emitStepChange();
  }

  goToStep(index: number): void {
    if (!this.allowStepNavigation || index < 0 || index >= this._stepIds.length) return;
    this.currentStepIndex = index;
    this.emitStepChange();
  }

  private markCurrentStepAsTouched(): void {
    const currentStepId = this._stepIds[this.currentStepIndex];
    const currentStepFields = this.formSchema[currentStepId];
    
    if (currentStepFields) {
      Object.keys(currentStepFields).forEach(fieldName => {
        const control = this.masterFormGroup.get(fieldName);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
    }
  }

  // ===== ACCIONES =====
  completeForm(): void {
    if (this.masterFormGroup.valid) {
      this.formComplete.emit(this.masterFormGroup.value);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  onCancel(): void {
    this.masterFormGroup.reset();
    this.currentStepIndex = 0;
    this.cancel.emit();
    this.emitStepChange();
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.masterFormGroup.controls).forEach(fieldName => {
      const control = this.masterFormGroup.get(fieldName);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }

  private emitStepChange(): void {
    const stepConfig = this.currentStepConfig;
    if (stepConfig) {
      this.stepChange.emit({ stepConfig, index: this.currentStepIndex });
    }
  }

  private getStepFormGroup(stepId: string): FormGroup {
    const stepFields = this.formSchema[stepId];
    if (!stepFields) {
      return this.fb.group({});
    }

    const stepControls: { [key: string]: FormControl } = {};
    Object.keys(stepFields).forEach(fieldName => {
      const control = this.masterFormGroup.get(fieldName) as FormControl;
      if (control) {
        stepControls[fieldName] = control;
      }
    });

    return this.fb.group(stepControls);
  }

  // Determina si un campo es requerido basándose en su schema
  private isFieldRequired(fieldSchema: FormFieldSchema): boolean {
    if (Array.isArray(fieldSchema)) {
      const [, validators] = fieldSchema;
      if (!validators) return false;
      
      if (Array.isArray(validators)) {
        return validators.includes(Validators.required);
      } else {
        return validators === Validators.required;
      }
    }
    return false;
  }

  // Devuelve los nombres de campos para un step por índice
  private getStepFieldNamesByIndex(index: number): string[] {
    const stepId = this._stepIds[index];
    if (!stepId) return [];
    const fields = this.formSchema[stepId];
    return fields ? Object.keys(fields) : [];
  }

  // Determina si un paso está completado: todos sus campos válidos y no vacíos
  isStepCompleted(index: number): boolean {
    if (!this.masterFormGroup) return false;
    const fieldNames = this.getStepFieldNamesByIndex(index);
    if (fieldNames.length === 0) return false;

    // Considerar completado cuando todos los controles del paso existen y son válidos.
    // No forzamos que tengan valor, para respetar validadores personalizados.
    return fieldNames.every(name => {
      const control = this.masterFormGroup.get(name);
      if (!control) return false;
      return control.valid;
    });
  }

  // ===== MÉTODOS PÚBLICOS PARA ACCESO A CONTROLES =====
  getFormControl(fieldName: string): FormControl | null {
    return this.masterFormGroup?.get(fieldName) as FormControl || null;
  }

  updateFormControl(fieldName: string, value: any): void {
    const control = this.getFormControl(fieldName);
    if (control) {
      control.setValue(value);
      // Solo marcar como dirty, pero no como touched para evitar validaciones prematuras
      control.markAsDirty();
      // No marcar como touched automáticamente - esto debe ser por interacción del usuario
    }
  }

  // Nuevo método para forzar validación específica (usado cuando el usuario intenta avanzar)
  forceValidationOnCurrentStep(): void {
    this.markCurrentStepAsTouched();
  }

  // ===== VALIDADORES ESTÁTICOS =====
  static passwordMatchValidator = (control: FormGroup): { [key: string]: any } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirm');

    if (!password || !confirmPassword || password.value === confirmPassword.value) {
      return null;
    }

    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  };
}
