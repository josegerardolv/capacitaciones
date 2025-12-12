import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionalButtonComponent, ButtonConfig, ButtonVariant, ButtonSize, IconPosition } from './institutional-button.component';
import { ButtonGroupComponent, ButtonGroupButton, ButtonGroupConfig, ButtonGroupFactory } from './button-group.component';

interface ButtonExample {
  config: ButtonConfig;
  label: string;
  description: string;
}

@Component({
  selector: 'app-buttons-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InstitutionalButtonComponent,
    ButtonGroupComponent
  ],
  template: `
    <div class="buttons-demo-container max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-institucional-primario mb-4">
          <span class="material-symbols-outlined text-4xl mr-3 align-middle">smart_button</span>
          Sistema de Botones Institucionales
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Colección completa de botones reutilizables siguiendo la identidad visual institucional de Morena.
          Todos los componentes están optimizados para accesibilidad, responsividad y facilidad de uso.
        </p>
        
        <!-- Controls -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 class="text-lg font-semibold text-institucional-primario mb-4">Controles de Demostración</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Size Control -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
              <select [(ngModel)]="selectedSize" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="small">Pequeño</option>
                <option value="medium">Mediano</option>
                <option value="large">Grande</option>
                <option value="extra-large">Extra Grande</option>
              </select>
            </div>
            
            <!-- Loading Toggle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estados</label>
              <div class="flex gap-3">
                <label class="flex items-center">
                  <input type="checkbox" [(ngModel)]="showLoading" class="mr-2">
                  <span class="text-sm">Cargando</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" [(ngModel)]="showDisabled" class="mr-2">
                  <span class="text-sm">Deshabilitado</span>
                </label>
              </div>
            </div>
            
            <!-- Width Toggle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ancho</label>
              <label class="flex items-center">
                <input type="checkbox" [(ngModel)]="fullWidth" class="mr-2">
                <span class="text-sm">Ancho completo</span>
              </label>
            </div>
            
            <!-- Icon Control -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Íconos</label>
              <select [(ngModel)]="iconPosition" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">Sin ícono</option>
                <option value="left">Ícono izquierda</option>
                <option value="right">Ícono derecha</option>
                <option value="only">Solo ícono</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Button Variants -->
      <div class="space-y-12">
        <!-- Primary Variants -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Variantes Principales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Primario</h3>
              <p class="text-gray-600 mb-4">Para acciones principales e importantes.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'primary',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'star' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('primary')">
                {{ iconPosition === 'only' ? '' : 'Botón Primario' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Secundario</h3>
              <p class="text-gray-600 mb-4">Para acciones complementarias.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'secondary',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'favorite' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('secondary')">
                {{ iconPosition === 'only' ? '' : 'Botón Secundario' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Fantasma</h3>
              <p class="text-gray-600 mb-4">Sin fondo, solo borde y texto.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'ghost',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'visibility' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('ghost')">
                {{ iconPosition === 'only' ? '' : 'Botón Fantasma' }}
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Status Variants -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Variantes de Estado</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-green-600 mb-3">Éxito</h3>
              <p class="text-gray-600 mb-4">Para confirmaciones.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'success',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'check_circle' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('success')">
                {{ iconPosition === 'only' ? '' : 'Éxito' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-yellow-600 mb-3">Advertencia</h3>
              <p class="text-gray-600 mb-4">Para alertas preventivas.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'warning',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'warning' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('warning')">
                {{ iconPosition === 'only' ? '' : 'Advertencia' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-red-600 mb-3">Peligro</h3>
              <p class="text-gray-600 mb-4">Para acciones destructivas.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'danger',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'error' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('danger')">
                {{ iconPosition === 'only' ? '' : 'Peligro' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-cyan-600 mb-3">Información</h3>
              <p class="text-gray-600 mb-4">Para mostrar detalles.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'info',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'info' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('info')">
                {{ iconPosition === 'only' ? '' : 'Información' }}
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Style Variants -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Variantes de Estilo</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gray-800 rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-white mb-3">Ligero</h3>
              <p class="text-gray-300 mb-4">Fondo neutro con texto institucional.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'light',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'light_mode' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('light')">
                {{ iconPosition === 'only' ? '' : 'Ligero' }}
              </app-institutional-button>
            </div>

            <div class="bg-gray-100 rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Oscuro</h3>
              <p class="text-gray-600 mb-4">Fondo oscuro con texto claro.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'dark',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'dark_mode' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('dark')">
                {{ iconPosition === 'only' ? '' : 'Oscuro' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Enlace</h3>
              <p class="text-gray-600 mb-4">Estilo de texto con subrayado.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'link',
                  size: selectedSize,
                  loading: showLoading,
                  disabled: showDisabled,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'link' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('link')">
                {{ iconPosition === 'only' ? '' : 'Enlace' }}
              </app-institutional-button>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-400 mb-3">Deshabilitado</h3>
              <p class="text-gray-600 mb-4">Sin interacción.</p>
              <app-institutional-button 
                [config]="{
                  variant: 'primary',
                  size: selectedSize,
                  disabled: true,
                  fullWidth: fullWidth,
                  icon: iconPosition ? 'block' : undefined,
                  iconPosition: iconPosition || 'left'
                }"
                (buttonClick)="onButtonClick('disabled')">
                {{ iconPosition === 'only' ? '' : 'Deshabilitado' }}
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Size Examples -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Tamaños Disponibles</h2>
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex flex-wrap items-center gap-4">
              <app-institutional-button 
                [config]="{ variant: 'primary', size: 'small' }"
                (buttonClick)="onButtonClick('small')">
                Pequeño
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'primary', size: 'medium' }"
                (buttonClick)="onButtonClick('medium')">
                Mediano
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'primary', size: 'large' }"
                (buttonClick)="onButtonClick('large')">
                Grande
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'primary', size: 'extra-large' }"
                (buttonClick)="onButtonClick('extra-large')">
                Extra Grande
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Icon Examples -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Ejemplos con Íconos</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Ícono Izquierda</h3>
              <div class="space-y-3">
                <app-institutional-button 
                  [config]="{ variant: 'primary', icon: 'save', iconPosition: 'left' }"
                  (buttonClick)="onButtonClick('save')">
                  Guardar
                </app-institutional-button>
                
                <app-institutional-button 
                  [config]="{ variant: 'success', icon: 'download', iconPosition: 'left' }"
                  (buttonClick)="onButtonClick('download')">
                  Descargar
                </app-institutional-button>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Ícono Derecha</h3>
              <div class="space-y-3">
                <app-institutional-button 
                  [config]="{ variant: 'secondary', icon: 'arrow_forward', iconPosition: 'right' }"
                  (buttonClick)="onButtonClick('next')">
                  Siguiente
                </app-institutional-button>
                
                <app-institutional-button 
                  [config]="{ variant: 'info', icon: 'open_in_new', iconPosition: 'right' }"
                  (buttonClick)="onButtonClick('external')">
                  Abrir enlace
                </app-institutional-button>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-3">Solo Ícono</h3>
              <div class="flex gap-3">
                <app-institutional-button 
                  [config]="{ variant: 'primary', icon: 'edit', iconPosition: 'only', ariaLabel: 'Editar' }"
                  (buttonClick)="onButtonClick('edit')">
                </app-institutional-button>
                
                <app-institutional-button 
                  [config]="{ variant: 'danger', icon: 'delete', iconPosition: 'only', ariaLabel: 'Eliminar' }"
                  (buttonClick)="onButtonClick('delete')">
                </app-institutional-button>
                
                <app-institutional-button 
                  [config]="{ variant: 'info', icon: 'visibility', iconPosition: 'only', ariaLabel: 'Ver' }"
                  (buttonClick)="onButtonClick('view')">
                </app-institutional-button>
              </div>
            </div>
          </div>
        </section>

        <!-- Custom Properties -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Propiedades Personalizadas</h2>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-institucional-primario mb-4">Sobrescritura de Estilos</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <app-institutional-button 
                [config]="{ 
                  variant: 'primary', 
                  customWidth: '200px',
                  customHeight: '60px',
                  customFontSize: '18px'
                }"
                (buttonClick)="onButtonClick('custom1')">
                Tamaño Custom
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ 
                  variant: 'secondary', 
                  customClass: 'shadow-2xl transform rotate-1'
                }"
                (buttonClick)="onButtonClick('custom2')">
                Clase Custom
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ 
                  variant: 'success', 
                  fullWidth: true
                }"
                (buttonClick)="onButtonClick('custom3')">
                Ancho Completo
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Loading States -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Estados de Carga</h2>
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <app-institutional-button 
                [config]="{ variant: 'primary', loading: true }"
                (buttonClick)="onButtonClick('loading1')">
                Cargando...
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'success', loading: true, icon: 'save' }"
                (buttonClick)="onButtonClick('loading2')">
                Guardando...
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'info', loading: true, size: 'large' }"
                (buttonClick)="onButtonClick('loading3')">
                Procesando...
              </app-institutional-button>
              
              <app-institutional-button 
                [config]="{ variant: 'warning', loading: true, iconPosition: 'only', icon: 'refresh' }"
                (buttonClick)="onButtonClick('loading4')">
              </app-institutional-button>
            </div>
          </div>
        </section>

        <!-- Button Groups -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Grupos de Botones</h2>
          
          <!-- Grupos Horizontales -->
          <div class="space-y-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-4">Grupos Horizontales</h3>
              <div class="space-y-6">
                <!-- Grupo básico -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Básico (unido)</h4>
                  <app-button-group
                    [buttons]="basicHorizontalButtons"
                    [config]="{ orientation: 'horizontal', separated: false }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
                
                <!-- Grupo separado -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Separado</h4>
                  <app-button-group
                    [buttons]="basicHorizontalButtons"
                    [config]="{ orientation: 'horizontal', separated: true }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
                
                <!-- Grupo outline -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Con borde contenedor</h4>
                  <app-button-group
                    [buttons]="basicHorizontalButtons"
                    [config]="{ orientation: 'horizontal', separated: true, outlined: true }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
              </div>
            </div>

            <!-- Grupos Verticales -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-4">Grupos Verticales</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Básico</h4>
                  <app-button-group
                    [buttons]="verticalButtons"
                    [config]="{ orientation: 'vertical' }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
                
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Separado</h4>
                  <app-button-group
                    [buttons]="verticalButtons"
                    [config]="{ orientation: 'vertical', separated: true }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
                
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Ancho extendido</h4>
                  <app-button-group
                    [buttons]="verticalButtons"
                    [config]="{ orientation: 'vertical', alignment: 'stretch' }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
              </div>
            </div>

            <!-- Casos de Uso Prácticos -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-4">Casos de Uso Prácticos</h3>
              <div class="space-y-6">
                <!-- Acciones CRUD -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Acciones CRUD (Tabla)</h4>
                  <div class="flex items-center gap-4">
                    <span class="text-gray-600">Usuario: Juan Pérez</span>
                    <app-button-group
                      [buttons]="crudButtons"
                      [config]="{ orientation: 'horizontal', separated: false }"
                      (buttonClick)="onGroupButtonClick($event)">
                    </app-button-group>
                  </div>
                </div>
                
                <!-- Formulario -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Acciones de Formulario</h4>
                  <div class="flex justify-end">
                    <app-button-group
                      [buttons]="formButtons"
                      [config]="{ orientation: 'horizontal', separated: true, alignment: 'end' }"
                      (buttonClick)="onGroupButtonClick($event)">
                    </app-button-group>
                  </div>
                </div>
                
                <!-- Filtros/Tabs -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Filtros/Pestañas</h4>
                  <app-button-group
                    [buttons]="filterButtons"
                    [config]="{ orientation: 'horizontal', separated: false }"
                    (buttonClick)="onGroupButtonClick($event)">
                  </app-button-group>
                </div>
                
                <!-- Paginación -->
                <div>
                  <h4 class="text-md font-medium text-gray-700 mb-3">Paginación</h4>
                  <div class="flex justify-center">
                    <app-button-group
                      [buttons]="paginationButtons"
                      [config]="{ orientation: 'horizontal', separated: false }"
                      (buttonClick)="onGroupButtonClick($event)">
                    </app-button-group>
                  </div>
                </div>
              </div>
            </div>

            <!-- Responsivo -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-institucional-primario mb-4">Comportamiento Responsivo</h3>
              <p class="text-gray-600 mb-4">Este grupo se convierte en vertical en pantallas pequeñas</p>
              <app-button-group
                [buttons]="responsiveButtons"
                [config]="{ orientation: 'horizontal', separated: false, responsive: true }"
                (buttonClick)="onGroupButtonClick($event)">
              </app-button-group>
            </div>
          </div>
        </section>

        <!-- Código de Grupos de Botones -->
        <section>
          <h2 class="text-2xl font-bold text-institucional-primario mb-6">Código de Ejemplo - Grupos</h2>
          <div class="bg-gray-900 rounded-lg p-6 text-white">
            <h3 class="text-lg font-semibold mb-4">
              <span class="material-symbols-outlined mr-2">code</span>
              Uso de Grupos de Botones
            </h3>
            <pre class="text-sm overflow-x-auto"><code>{{ getGroupCodeExample() }}</code></pre>
          </div>
        </section>
      </div>

      <!-- Results -->
      <div *ngIf="lastAction" class="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-institucional-primario mb-2">Última Acción</h3>
        <p class="text-gray-600">Se hizo clic en el botón: <strong>{{ lastAction }}</strong></p>
        <small class="text-gray-400">{{ lastActionTime | date:'medium' }}</small>
      </div>

      <!-- Code Examples -->
      <div class="mt-12 bg-gray-900 rounded-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">
          <span class="material-symbols-outlined mr-2">code</span>
          Ejemplo de Uso
        </h3>
        <pre class="text-sm overflow-x-auto"><code>{{ getCodeExample() }}</code></pre>
      </div>
    </div>
  `
})
export class ButtonsDemoComponent {
  selectedSize: ButtonSize = 'medium';
  showLoading = false;
  showDisabled = false;
  fullWidth = false;
  iconPosition: IconPosition | '' = '';
  lastAction = '';
  lastActionTime = new Date();

  // Button groups data
  basicHorizontalButtons: ButtonGroupButton[] = [
    {
      id: 'first',
      label: 'Primero',
      config: { variant: 'primary' }
    },
    {
      id: 'second',
      label: 'Segundo',
      config: { variant: 'secondary' }
    },
    {
      id: 'third',
      label: 'Tercero',
      config: { variant: 'ghost' }
    }
  ];

  verticalButtons: ButtonGroupButton[] = [
    {
      id: 'option1',
      label: 'Opción 1',
      config: { variant: 'primary', icon: 'home', iconPosition: 'left' }
    },
    {
      id: 'option2',
      label: 'Opción 2',
      config: { variant: 'secondary', icon: 'settings', iconPosition: 'left' }
    },
    {
      id: 'option3',
      label: 'Opción 3',
      config: { variant: 'info', icon: 'help', iconPosition: 'left' }
    }
  ];

  crudButtons: ButtonGroupButton[] = ButtonGroupFactory.createCrudActions({
    size: 'small',
    separated: false
  });

  formButtons: ButtonGroupButton[] = ButtonGroupFactory.createFormActions({
    showCancel: true,
    showSave: true,
    showReset: true,
    isLoading: false,
    isValid: true
  });

  filterButtons: ButtonGroupButton[] = ButtonGroupFactory.createFilterTabs([
    { id: 'all', label: 'Todos', active: true, count: 125 },
    { id: 'active', label: 'Activos', active: false, count: 89 },
    { id: 'inactive', label: 'Inactivos', active: false, count: 36 }
  ]);

  paginationButtons: ButtonGroupButton[] = ButtonGroupFactory.createPagination({
    currentPage: 3,
    totalPages: 10,
    showFirstLast: true
  });

  responsiveButtons: ButtonGroupButton[] = [
    {
      id: 'mobile1',
      label: 'Inicio',
      config: { variant: 'primary', icon: 'home', iconPosition: 'left' }
    },
    {
      id: 'mobile2',
      label: 'Perfil',
      config: { variant: 'secondary', icon: 'person', iconPosition: 'left' }
    },
    {
      id: 'mobile3',
      label: 'Configuración',
      config: { variant: 'ghost', icon: 'settings', iconPosition: 'left' }
    }
  ];

  onButtonClick(action: string) {
    this.lastAction = action;
    this.lastActionTime = new Date();
    console.log('Button clicked:', action);
  }

  onGroupButtonClick(event: { buttonId: string; event: Event }) {
    this.lastAction = `Grupo: ${event.buttonId}`;
    this.lastActionTime = new Date();
    console.log('Group button clicked:', event.buttonId);
    
    // Handle specific actions
    if (event.buttonId.startsWith('page-')) {
      // Update pagination
      const newPage = parseInt(event.buttonId.split('-')[1]);
      this.paginationButtons = ButtonGroupFactory.createPagination({
        currentPage: newPage,
        totalPages: 10,
        showFirstLast: true
      });
    } else if (['all', 'active', 'inactive'].includes(event.buttonId)) {
      // Update filter tabs
      this.filterButtons = ButtonGroupFactory.createFilterTabs([
        { id: 'all', label: 'Todos', active: event.buttonId === 'all', count: 125 },
        { id: 'active', label: 'Activos', active: event.buttonId === 'active', count: 89 },
        { id: 'inactive', label: 'Inactivos', active: event.buttonId === 'inactive', count: 36 }
      ]);
    }
  }

  getCodeExample(): string {
    return `<!-- Uso básico -->
<app-institutional-button 
  [config]="{ variant: 'primary', size: 'medium' }"
  (buttonClick)="handleClick()">
  Mi Botón
</app-institutional-button>

<!-- Con ícono y estados -->
<app-institutional-button 
  [config]="{
    variant: 'success',
    size: 'large',
    icon: 'check_circle',
    iconPosition: 'left',
    loading: isLoading,
    disabled: isDisabled,
    fullWidth: true
  }"
  (buttonClick)="handleClick()">
  Guardar Cambios
</app-institutional-button>

<!-- Botón solo ícono -->
<app-institutional-button 
  [config]="{
    variant: 'danger',
    icon: 'delete',
    iconPosition: 'only',
    ariaLabel: 'Eliminar elemento'
  }"
  (buttonClick)="handleDelete()">
</app-institutional-button>`;
  }

  getGroupCodeExample(): string {
    return `// Importar componentes
import { ButtonGroupComponent, ButtonGroupFactory } from './buttons';

// Grupo básico
<app-button-group
  [buttons]="myButtons"
  [config]="{ orientation: 'horizontal', separated: true }"
  (buttonClick)="onGroupButtonClick($event)">
</app-button-group>

// Crear botones CRUD con factory
crudButtons = ButtonGroupFactory.createCrudActions({
  size: 'small',
  separated: false
});

// Crear botones de formulario
formButtons = ButtonGroupFactory.createFormActions({
  showCancel: true,
  showSave: true,
  isLoading: this.isSubmitting,
  isValid: this.form.valid
});

// Crear filtros/tabs
filterButtons = ButtonGroupFactory.createFilterTabs([
  { id: 'all', label: 'Todos', active: true, count: 125 },
  { id: 'active', label: 'Activos', count: 89 },
  { id: 'inactive', label: 'Inactivos', count: 36 }
]);

// Manejar clicks de grupo
onGroupButtonClick(event: { buttonId: string; event: Event }) {
  console.log('Clicked button:', event.buttonId);
  // Lógica específica por botón
}`;
  }
}