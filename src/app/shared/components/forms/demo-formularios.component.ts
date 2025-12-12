import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Importar la interfaz desde el componente validado
import { FormValidationConfig as ValidatedFormConfig } from './validated-form.component';
import { SimpleFormComponent } from './simple-form.component';
import { StepperFormComponent, FormSchema, StepConfiguration } from './stepper-form.component';
import { ValidatedFormComponent } from './validated-form.component';
import { ModalFormComponent } from './modal-form.component';
import { SearchFormComponent, SearchField } from './search-form.component';

// Importar componentes de inputs
import { InputEnhancedComponent } from '../inputs/input-enhanced.component';
import { SelectComponent } from '../inputs/select.component';
import { FileInputComponent } from '../inputs/file-input.component';
import { PasswordConfirmComponent } from '../inputs/password-confirm.component';

// Importar interfaces base
import { FormAction } from './base-form.component';

@Component({
  selector: 'app-demo-formularios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Componentes de formularios
    SimpleFormComponent,
    StepperFormComponent,
    ValidatedFormComponent,
    ModalFormComponent,
    SearchFormComponent,
    // Componentes de inputs
    InputEnhancedComponent,
    SelectComponent,
    FileInputComponent,
    PasswordConfirmComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Demostración de Componentes de Formularios
          </h1>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Explora nuestra colección completa de componentes de formularios reutilizables,
            diseñados para crear experiencias de usuario consistentes y eficientes.
          </p>
        </div>

        <!-- Formulario Simple usando SimpleFormComponent -->
        <section class="mb-16">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-institucional-primario mb-6">
              1. Formulario Simple
            </h2>
            <p class="text-gray-600 mb-6">
              Un formulario básico para captura rápida de datos. Ideal para casos de uso sencillos.
            </p>
            
            <app-simple-form
              [formGroup]="simpleForm"
              title="Registro de Usuario"
              subtitle="Complete los datos básicos"
              [primaryActions]="simpleFormActions"
              [isLoading]="simpleFormLoading"
              (formSubmit)="onSimpleFormSubmit($event)">
              
              <div class="grid md:grid-cols-2 gap-6">
                <app-input-enhanced
                  [control]="getSimpleControl('nombre')"
                  controlName="nombre"
                  label="Nombre completo"
                  placeholder="Ingresa tu nombre"
                  type="text"
                  [floating]="true"
                  [required]="true"
                  [validationMap]="validationMap"
                  helperText="Ingresa tu nombre completo">
                </app-input-enhanced>
                
                <app-input-enhanced
                  [control]="getSimpleControl('email')"
                  controlName="email"
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@email.com"
                  [floating]="true"
                  [required]="true"
                  [validationMap]="validationMap"
                  helperText="Para notificaciones">
                </app-input-enhanced>
                
                <app-select
                  [control]="getSimpleDepartamentoControl()"
                  label="Departamento"
                  [options]="departamentos"
                  placeholder="Selecciona un departamento">
                </app-select>
                
                <app-input-enhanced
                  [control]="getSimpleControl('telefono')"
                  controlName="telefono"
                  label="Teléfono"
                  type="tel"
                  placeholder="(555) 123-4567"
                  [validationMap]="validationMap"
                  helperText="10 dígitos">
                </app-input-enhanced>
              </div>
            </app-simple-form>
          </div>
        </section>

        <!-- Formulario en Pasos usando StepperFormComponent -->
        <section class="mb-16">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-institucional-primario mb-6">
              2. Formulario en Pasos (Stepper)
            </h2>
            <p class="text-gray-600 mb-6">
              Divide formularios complejos en pasos manejables. Perfecto para procesos largos.
            </p>
            
            <app-stepper-form 
              [formSchema]="stepperFormSchema"
              [stepsConfig]="stepperStepsConfig"
              title="Demo Formulario en Pasos"
              subtitle="Ejemplo de formulario dividido en pasos"
              (stepChange)="onStepChange($event.index)"
              (formComplete)="onStepperSubmit($event)">
              
              <!-- Contenido dinámico basado en el paso actual -->
              <div [ngSwitch]="currentStep">
                <!-- Paso 1: Información Personal -->
                <div *ngSwitchCase="1" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <app-input-enhanced
                      [control]="getStepperControl('step1', 'nombre')"
                      controlName="step1_nombre"
                      label="Nombre completo"
                      placeholder="Tu nombre completo"
                      type="text"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap"
                      helperText="Nombre y apellidos">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step1', 'apellidos')"
                      controlName="step1_apellidos"
                      label="Apellidos"
                      placeholder="Tus apellidos"
                      type="text"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap"
                      helperText="Apellidos completos">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step1', 'fechaNacimiento')"
                      controlName="step1_fechaNacimiento"
                      label="Fecha de nacimiento"
                      type="date"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap">
                    </app-input-enhanced>
                    
                    <app-select
                      [control]="getStepperGeneroControl()"
                      label="Género"
                      [options]="generos"
                      placeholder="Selecciona género">
                    </app-select>
                  </div>
                </div>
                
                <!-- Paso 2: Información de Contacto -->
                <div *ngSwitchCase="2" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <app-input-enhanced
                      [control]="getStepperControl('step2', 'email')"
                      controlName="step2_email"
                      label="Correo electrónico"
                      type="email"
                      placeholder="tu@email.com"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap"
                      helperText="Email principal">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step2', 'telefono')"
                      controlName="step2_telefono"
                      label="Teléfono"
                      type="tel"
                      placeholder="(555) 123-4567"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap"
                      helperText="10 dígitos">
                    </app-input-enhanced>
                    
                    <div class="md:col-span-2">
                      <app-input-enhanced
                        [control]="getStepperControl('step2', 'direccion')"
                        controlName="step2_direccion"
                        label="Dirección"
                        placeholder="Calle, número, colonia"
                        type="text"
                        [floating]="true"
                        [required]="true"
                        [validationMap]="validationMap"
                        helperText="Dirección completa">
                      </app-input-enhanced>
                    </div>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step2', 'ciudad')"
                      controlName="step2_ciudad"
                      label="Ciudad"
                      placeholder="Tu ciudad"
                      type="text"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step2', 'codigoPostal')"
                      controlName="step2_codigoPostal"
                      label="Código postal"
                      placeholder="12345"
                      type="text"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap"
                      helperText="5 dígitos">
                    </app-input-enhanced>
                  </div>
                </div>
                
                <!-- Paso 3: Información Profesional -->
                <div *ngSwitchCase="3" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <app-select
                      [control]="getStepperDepartamentoControl()"
                      label="Departamento"
                      [options]="departamentos"
                      placeholder="Selecciona departamento">
                    </app-select>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step3', 'puesto')"
                      controlName="step3_puesto"
                      label="Puesto"
                      placeholder="Tu puesto de trabajo"
                      type="text"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step3', 'fechaIngreso')"
                      controlName="step3_fechaIngreso"
                      label="Fecha de ingreso"
                      type="date"
                      [floating]="true"
                      [required]="true"
                      [validationMap]="validationMap">
                    </app-input-enhanced>
                    
                    <app-input-enhanced
                      [control]="getStepperControl('step3', 'salario')"
                      controlName="step3_salario"
                      label="Salario"
                      type="number"
                      placeholder="50000"
                      [floating]="true"
                      [validationMap]="validationMap"
                      helperText="Monto mensual">
                    </app-input-enhanced>
                  </div>
                  
                  <app-file-input
                    controlName="cv"
                    label="Curriculum Vitae"
                    accept=".pdf,.doc,.docx">
                  </app-file-input>
                </div>
              </div>
            </app-stepper-form>
          </div>
        </section>

        <!-- Formulario con Validaciones usando ValidatedFormComponent -->
        <section class="mb-16">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-institucional-primario mb-6">
              3. Formulario con Validaciones Avanzadas
            </h2>
            <p class="text-gray-600 mb-6">
              Incluye validaciones en tiempo real, progreso y retroalimentación instantánea.
            </p>
            
            <app-validated-form 
              [config]="validationConfig"
              [formGroup]="validatedForm"
              (formSubmit)="onValidatedSubmit($event)">
              
              <div class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <app-input-enhanced
                    [control]="getValidatedControl('usuario')"
                    controlName="usuario"
                    label="Nombre de usuario"
                    placeholder="mínimo 3 caracteres"
                    type="text"
                    [floating]="true"
                    [required]="true"
                    [validationMap]="validationMap"
                    helperText="Mínimo 3 caracteres">
                  </app-input-enhanced>
                  
                  <app-input-enhanced
                    [control]="getValidatedControl('email')"
                    controlName="emailValidado"
                    label="Email"
                    type="email"
                    placeholder="usuario@dominio.com"
                    [floating]="true"
                    [required]="true"
                    [validationMap]="validationMap"
                    helperText="Email válido">
                  </app-input-enhanced>
                </div>
                
                <app-password-confirm
                  passwordName="password"
                  confirmName="confirmPassword"
                  labelPassword="Contraseña"
                  labelConfirm="Confirmar contraseña">
                </app-password-confirm>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <app-input-enhanced
                    [control]="getValidatedControl('telefono')"
                    controlName="telefonoValidado"
                    label="Teléfono"
                    type="tel"
                    placeholder="10 dígitos"
                    [floating]="true"
                    [required]="true"
                    [validationMap]="validationMap"
                    helperText="10 dígitos">
                  </app-input-enhanced>
                  
                  <app-input-enhanced
                    [control]="getValidatedControl('edad')"
                    controlName="edad"
                    label="Edad"
                    type="number"
                    placeholder="18-100"
                    [floating]="true"
                    [required]="true"
                    [validationMap]="validationMap"
                    helperText="18-100 años">
                  </app-input-enhanced>
                </div>
                
                <app-input-enhanced
                  [control]="getValidatedControl('sitioWeb')"
                  controlName="sitioWeb"
                  label="Sitio web"
                  type="url"
                  placeholder="https://ejemplo.com"
                  [floating]="true"
                  [validationMap]="validationMap"
                  helperText="URL completa">
                </app-input-enhanced>
              </div>
            </app-validated-form>
          </div>
        </section>

        <!-- Formulario Modal usando ModalFormComponent -->
        <section class="mb-16">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-institucional-primario mb-6">
              4. Formulario en Modal
            </h2>
            <p class="text-gray-600 mb-6">
              Perfecto para acciones rápidas sin navegar a otra página.
            </p>
            
            <button 
              (click)="showModal = true"
              class="bg-institucional-primario hover:bg-institucional-secundario text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Abrir Formulario Modal
            </button>
            
            <app-modal-form 
              [isOpen]="showModal"
              title="Crear nuevo elemento"
              [formGroup]="modalForm"
              (modalClose)="showModal = false"
              (formSubmit)="onModalSubmit($event)">
              
              <div class="space-y-4">
                <app-input-enhanced
                  [control]="getModalControl('titulo')"
                  controlName="titulo"
                  label="Título"
                  placeholder="Título del elemento"
                  type="text"
                  [floating]="true"
                  [required]="true"
                  [validationMap]="validationMap">
                </app-input-enhanced>
                
                <app-input-enhanced
                  [control]="getModalControl('descripcion')"
                  controlName="descripcion"
                  label="Descripción"
                  placeholder="Descripción detallada"
                  type="textarea"
                  [floating]="true"
                  [rows]="3"
                  [validationMap]="validationMap">
                </app-input-enhanced>
                
                <app-select
                  [control]="getModalCategoriaControl()"
                  label="Categoría"
                  [options]="categorias"
                  placeholder="Selecciona categoría">
                </app-select>
                
                <app-input-enhanced
                  [control]="getModalControl('prioridad')"
                  controlName="prioridad"
                  label="Prioridad"
                  type="number"
                  placeholder="1-10"
                  [floating]="true"
                  [required]="true"
                  [validationMap]="validationMap"
                  helperText="Del 1 al 10">
                </app-input-enhanced>
              </div>
            </app-modal-form>
          </div>
        </section>

        <!-- Formulario de Búsqueda usando SearchFormComponent -->
        <section class="mb-16">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold text-institucional-primario mb-6">
              5. Formulario de Búsqueda Avanzada
            </h2>
            <p class="text-gray-600 mb-6">
              Búsqueda con filtros múltiples y opciones rápidas predefinidas.
            </p>
            
            <app-search-form 
              [searchFields]="searchFields"
              (search)="onSearch($event)"
              (quickSearch)="onQuickSearch($event)">
            </app-search-form>
            
            <!-- Ejemplo adicional usando InputEnhancedComponent directamente -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 class="text-md font-semibold text-gray-700 mb-4">
                Ejemplo con InputEnhancedComponent:
              </h4>
              <div class="space-y-4">
                <app-input-enhanced
                  [control]="getSearchControl('termino')"
                  controlName="termino"
                  label="Buscar"
                  placeholder="Ingresa términos de búsqueda"
                  type="text"
                  [floating]="true"
                  [validationMap]="validationMap">
                </app-input-enhanced>
                
                <app-input-enhanced
                  [control]="getSearchControl('fechaDesde')"
                  controlName="fechaDesde"
                  label="Fecha desde"
                  type="date"
                  [floating]="true"
                  [validationMap]="validationMap">
                </app-input-enhanced>
              </div>
            </div>
            
            <!-- Resultados de búsqueda -->
            <div *ngIf="searchResults.length > 0" class="mt-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Resultados de búsqueda ({{ searchResults.length }})
              </h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div *ngFor="let result of searchResults" 
                     class="py-2 border-b border-gray-200 last:border-b-0">
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="font-medium">{{ result.nombre }}</span>
                      <span class="text-sm text-gray-500 ml-2">{{ result.departamento }}</span>
                    </div>
                    <span class="text-sm text-gray-400">{{ result.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Información Adicional -->
        <section class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">
            Características de los Componentes
          </h2>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-institucional-secundario bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-institucional-primario" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Validación Integrada</h3>
              <p class="text-gray-600">Validaciones síncronas y asíncronas con mensajes personalizados.</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-institucional-secundario bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-institucional-primario" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Diseño Responsivo</h3>
              <p class="text-gray-600">Adaptación automática a diferentes tamaños de pantalla.</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-institucional-secundario bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-institucional-primario" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Alto Rendimiento</h3>
              <p class="text-gray-600">Optimizados para aplicaciones empresariales exigentes.</p>
            </div>
          </div>
        </section>

        <!-- Sección de Modales -->
        <section class="mb-16">
          <div class="bg-gradient-institucional rounded-lg shadow-lg p-8 text-white text-center">
            <div class="max-w-3xl mx-auto">
              <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-3xl text-white">
                  open_in_new
                </span>
              </div>
              <h2 class="text-3xl font-bold mb-4">
                ¿Necesitas componentes modales?
              </h2>
              <p class="text-lg mb-8 text-white text-opacity-90">
                Explora nuestra colección completa de componentes modales: confirmación, alertas, 
                carga, galerías, selección múltiple y mucho más. Todos con estilos institucionales 
                y funcionalidades avanzadas.
              </p>
              <button 
                (click)="navigateToModalesDemo()"
                class="bg-white hover:bg-gray-100 text-institucional-primario font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                <span class="flex items-center gap-3">
                  <span class="material-symbols-outlined">
                    dashboard
                  </span>
                  Ver Demo de Modales
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class DemoFormulariosComponent implements OnInit {
  
  // Formularios reactivos
  simpleForm!: FormGroup;
  stepperForm!: FormGroup;
  validatedForm!: FormGroup;
  modalForm!: FormGroup;
  searchForm!: FormGroup;

  // Estados de los componentes
  showModal = false;
  currentStep = 1; // Empezar en el paso 1
  simpleFormLoading = false;
  searchResults: any[] = [];

  // Configuraciones para formularios avanzados
  validationConfig: ValidatedFormConfig = {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsImmediately: false,
    debounceTime: 300
  };

  // Acciones para SimpleFormComponent
  simpleFormActions: FormAction[] = [
    {
      label: 'Enviar',
      type: 'submit' as const,
      variant: 'primary' as const,
      icon: 'send'
    },
    {
      label: 'Limpiar',
      type: 'button' as const,
      variant: 'secondary' as const,
      icon: 'clear',
      action: () => this.simpleForm.reset()
    }
  ];

  // Configuración para StepperFormComponent usando la nueva API
  stepperFormSchema: FormSchema = {};
  stepperStepsConfig: StepConfiguration[] = [];

  // Opciones para selects
  departamentos = [
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'ti', label: 'Tecnologías de la Información' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'operaciones', label: 'Operaciones' }
  ];

  generos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
    { value: 'N', label: 'Prefiero no decir' }
  ];

  categorias = [
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'personal', label: 'Personal' },
    { value: 'proyecto', label: 'Proyecto' },
    { value: 'urgente', label: 'Urgente' }
  ];

  // Configuración para SearchFormComponent
  searchFields: SearchField[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre...'
    },
    {
      key: 'departamento',
      label: 'Departamento',
      type: 'select',
      placeholder: 'Seleccionar departamento',
      options: this.departamentos
    },
    {
      key: 'activo',
      label: 'Activo',
      type: 'boolean',
      placeholder: 'Mostrar solo activos'
    }
  ];

  // Configuración de validaciones centralizada
  validationMap = {
    // Formulario simple
    nombre: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, email: true },
    telefono: { mexicanPhone: true },
    
    // Formulario stepper - paso 1
    step1_nombre: { required: true, minLength: 2 },
    step1_apellidos: { required: true, minLength: 2 },
    step1_fechaNacimiento: { required: true },
    
    // Formulario stepper - paso 2
    step2_email: { required: true, email: true },
    step2_telefono: { required: true, phone: true },
    step2_direccion: { required: true },
    step2_ciudad: { required: true },
    step2_codigoPostal: { required: true, postalCode: true },
    
    // Formulario stepper - paso 3
    step3_puesto: { required: true },
    step3_fechaIngreso: { required: true },
    step3_salario: { min: 1000 },
    
    // Formulario validado
    usuario: { required: true, minLength: 3 },
    emailValidado: { required: true, email: true },
    telefonoValidado: { required: true, phone: true },
    edad: { required: true, min: 18, max: 100 },
    sitioWeb: { url: true },
    
    // Formulario modal
    titulo: { required: true },
    descripcion: {},
    prioridad: { required: true, min: 1, max: 10 }
  };

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Formulario simple
    this.simpleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      departamento: ['', Validators.required],
      telefono: ['', Validators.pattern(/^[0-9]{10}$/)]
    });

    // Formulario stepper
    this.stepperForm = this.fb.group({
      step1: this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellidos: ['', [Validators.required, Validators.minLength(2)]],
        fechaNacimiento: ['', Validators.required],
        genero: ['']
      }),
      step2: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        direccion: ['', Validators.required],
        ciudad: ['', Validators.required],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
      }),
      step3: this.fb.group({
        departamento: ['', Validators.required],
        puesto: ['', Validators.required],
        fechaIngreso: ['', Validators.required],
        salario: ['', [Validators.min(1000)]],
        cv: [null]
      })
    });

    // Formulario con validaciones
    this.validatedForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      sitioWeb: ['', Validators.pattern(/^https?:\/\/.+/)]
    });

    // Formulario modal
    this.modalForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      categoria: ['', Validators.required],
      prioridad: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
    });

    // Formulario de búsqueda
    this.searchForm = this.fb.group({
      termino: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      categoria: ['']
    });

    // Configuración del stepper usando la nueva API
    this.stepperFormSchema = {
      step1: {
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.pattern(/^[0-9]{10}$/)]
      },
      step2: {
        direccion: ['', Validators.required],
        ciudad: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        pais: ['Mexico']
      },
      step3: {
        empresa: ['', Validators.required],
        puesto: ['', Validators.required],
        departamento: ['', Validators.required],
        fechaIngreso: ['', Validators.required]
      }
    };

    this.stepperStepsConfig = [
      {
        id: 'step1',
        title: 'Información Personal',
        subtitle: 'Datos básicos del usuario'
      },
      {
        id: 'step2',
        title: 'Información de Contacto',
        subtitle: 'Datos de contacto y ubicación'
      },
      {
        id: 'step3',
        title: 'Información Profesional',
        subtitle: 'Datos laborales y documentos'
      }
    ];
  }

  // Manejadores de formularios
  onSimpleFormSubmit(data: any): void {
    console.log('Formulario simple enviado:', data);
    this.simpleFormLoading = true;
    
    // Simular procesamiento
    setTimeout(() => {
      this.simpleFormLoading = false;
      alert('Formulario enviado correctamente');
    }, 2000);
  }

  // Manejadores de stepper
  onStepChange(step: number): void {
    this.currentStep = step + 1; // step + 1 porque el índice empieza en 0 pero queremos mostrar pasos 1, 2, 3
    console.log('Cambio a paso:', this.currentStep);
  }

  onStepperSubmit(data: any): void {
    console.log('Formulario stepper enviado:', data);
    alert('Registro completado exitosamente');
  }

  // Manejadores de formulario validado
  onValidatedSubmit(data: any): void {
    console.log('Formulario validado enviado:', data);
    alert('Formulario con validaciones enviado correctamente');
  }

  onModalSubmit(data: any): void {
    console.log('Formulario modal enviado:', data);
    this.showModal = false;
    this.modalForm.reset();
    alert('Elemento creado correctamente');
  }

  onSearch(filters: any): void {
    console.log('Búsqueda realizada:', filters);
    // Simulamos resultados de búsqueda
    this.searchResults = [
      { nombre: 'Juan Pérez', departamento: 'TI', email: 'juan@empresa.com' },
      { nombre: 'María García', departamento: 'RH', email: 'maria@empresa.com' },
      { nombre: 'Carlos López', departamento: 'Finanzas', email: 'carlos@empresa.com' }
    ].filter(result => {
      if (filters.nombre && !result.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) {
        return false;
      }
      if (filters.departamento && result.departamento !== filters.departamento) {
        return false;
      }
      return true;
    });
  }

  onQuickSearch(option: any): void {
    console.log('Búsqueda rápida:', option);
    this.searchResults = [
      { nombre: `Resultado ${option.label}`, departamento: 'General', email: `${option.key}@empresa.com` }
    ];
  }

  // Helper functions para obtener controles tipados
  getSimpleControl(field: string): FormControl {
    return this.simpleForm.get(field) as FormControl;
  }

  getValidatedControl(field: string): FormControl {
    return this.validatedForm.get(field) as FormControl;
  }

  getModalControl(field: string): FormControl {
    return this.modalForm.get(field) as FormControl;
  }

  getSearchControl(field: string): FormControl {
    return this.searchForm.get(field) as FormControl;
  }

  // Helper methods para tipos específicos de select
  getSimpleDepartamentoControl(): FormControl {
    return this.simpleForm.get('departamento') as FormControl;
  }

  getStepperGeneroControl(): FormControl {
    return this.stepperForm.get('step1')?.get('genero') as FormControl;
  }

  getStepperDepartamentoControl(): FormControl {
    return this.stepperForm.get('step3')?.get('departamento') as FormControl;
  }

  getModalCategoriaControl(): FormControl {
    return this.modalForm.get('categoria') as FormControl;
  }

  getStepperControl(step: string, field: string): FormControl {
    return this.stepperForm.get(step)?.get(field) as FormControl;
  }

  // Método para navegar al demo de modales
  navigateToModalesDemo(): void {
    // Navegar a la página del demo de modales
    this.router.navigate(['/demo-modales']);
  }
}
