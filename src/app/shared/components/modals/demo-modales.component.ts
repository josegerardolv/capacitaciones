import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

// Importar todos los componentes modales
import { ConfirmationModalComponent, ConfirmationConfig } from './confirmation-modal.component';
import { AlertModalComponent, AlertConfig, AlertAction } from './alert-modal.component';
import { LoadingModalComponent, LoadingConfig } from './loading-modal.component';
import { GalleryModalComponent, GalleryItem } from './gallery-modal.component';
import { SelectionModalComponent, SelectionOption, SelectionConfig } from './selection-modal.component';
import { DrawerModalComponent, DrawerConfig } from './drawer-modal.component';
import { ModalComponent, ModalConfig } from './modal.component';
import { TabModalComponent, TabModalTab, TabModalConfig } from './tab-modal.component';
import { SettingsModalComponent, SettingsSection, SettingsModalConfig } from './settings-modal.component';

// Importar el modal de formulario existente
import { ModalFormComponent } from '../forms/modal-form.component';

@Component({
  selector: 'app-demo-modales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InstitutionalButtonComponent,
    ConfirmationModalComponent,
    AlertModalComponent,
    LoadingModalComponent,
    GalleryModalComponent,
    SelectionModalComponent,
    DrawerModalComponent,
    ModalComponent,
    TabModalComponent,
    SettingsModalComponent,
    ModalFormComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Demostración de Componentes Modales
          </h1>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Colección completa de componentes modales reutilizables con estilos institucionales
            y funcionalidades avanzadas para todas las necesidades de tu aplicación.
          </p>
          
          <!-- Botón de navegación a formularios -->
          <div class="mb-8">
            <app-institutional-button
              [config]="{
                variant: 'secondary',
                icon: 'description'
              }"
              (clicked)="navigateToFormulariosDemo()">
              Ver Demo de Formularios
            </app-institutional-button>
          </div>
        </div>

        <!-- Sección de Combinaciones de Modales -->
        <div class="mt-16 mb-12">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-institucional-primario mb-4">
              Combinaciones de Modales
            </h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Los modales pueden combinarse para crear flujos más complejos y experiencias de usuario avanzadas.
              Aquí algunos ejemplos prácticos de cómo combinar diferentes tipos.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <!-- Flujo de Eliminación Completo -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Flujo de Eliminación
              </h3>
              <p class="text-gray-600 mb-4">
                Confirmación → Loading → Alerta de resultado
              </p>
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  icon: 'delete'
                }"
                class="w-full"
                (clicked)="startDeleteFlow()">
                Eliminar Elemento
              </app-institutional-button>
            </div>

            <!-- Flujo de Subida de Archivos -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Subida de Archivos
              </h3>
              <p class="text-gray-600 mb-4">
                Selección → Loading con progreso → Galería de resultados
              </p>
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  icon: 'upload'
                }"
                class="w-full"
                (clicked)="startUploadFlow()">
                Subir Imágenes
              </app-institutional-button>
            </div>

            <!-- Configuración Avanzada -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Configuración Avanzada
              </h3>
              <p class="text-gray-600 mb-4">
                Settings → Tabs → Confirmación → Alerta
              </p>
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  icon: 'settings'
                }"
                class="w-full"
                (clicked)="startAdvancedSettings()">
                Configuración Completa
              </app-institutional-button>
            </div>

            <!-- Editor con Vista Previa -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Editor con Vista Previa
              </h3>
              <p class="text-gray-600 mb-4">
                Fullscreen → Drawer → Confirmación
              </p>
              <button (click)="startEditorFlow()" 
                      class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Abrir Editor
              </button>
            </div>

            <!-- Selección Masiva -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Operaciones Masivas
              </h3>
              <p class="text-gray-600 mb-4">
                Selección múltiple → Confirmación → Loading → Alerta
              </p>
              <button (click)="startBulkOperation()" 
                      class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                Operación Masiva
              </button>
            </div>

            <!-- Tutorial Interactivo -->
            <div class="bg-white rounded-lg shadow-lg p-6">
              <h3 class="text-lg font-bold text-institucional-primario mb-3">
                Tutorial Interactivo
              </h3>
              <p class="text-gray-600 mb-4">
                Secuencia de alertas informativas y confirmaciones
              </p>
              <button (click)="startTutorial()" 
                      class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                Iniciar Tutorial
              </button>
            </div>

          </div>
        </div>

        <!-- Grid de ejemplos básicos -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Modal de Confirmación -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Confirmación
            </h3>
            <p class="text-gray-600 mb-4">
              Para confirmar acciones críticas o destructivas.
            </p>
            <div class="space-y-2">
              <button (click)="showConfirmationModal('info')" 
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Información
              </button>
              <button (click)="showConfirmationModal('warning')" 
                      class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                Advertencia
              </button>
              <button (click)="showConfirmationModal('danger')" 
                      class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Peligro
              </button>
            </div>
          </div>

          <!-- Modal de Alerta -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Alerta
            </h3>
            <p class="text-gray-600 mb-4">
              Para mostrar información importante al usuario.
            </p>
            <div class="space-y-2">
              <button (click)="showAlertModal('success')" 
                      class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Éxito
              </button>
              <button (click)="showAlertModal('info')" 
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Información
              </button>
              <button (click)="showAlertAutoClose()" 
                      class="w-full bg-institucional-primario hover:bg-institucional-primario-dark text-white px-4 py-2 rounded-lg transition-colors">
                Auto-cierre
              </button>
            </div>
          </div>

          <!-- Modal de Carga -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Carga
            </h3>
            <p class="text-gray-600 mb-4">
              Para mostrar progreso de operaciones largas.
            </p>
            <div class="space-y-2">
              <button (click)="showLoadingModal()" 
                      class="w-full bg-institucional-primario hover:bg-institucional-primario-dark text-white px-4 py-2 rounded-lg transition-colors">
                Carga Simple
              </button>
              <button (click)="showLoadingWithProgress()" 
                      class="w-full bg-institucional-secundario hover:bg-institucional-secundario-dark text-white px-4 py-2 rounded-lg transition-colors">
                Con Progreso
              </button>
            </div>
          </div>

          <!-- Modal de Galería -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Galería
            </h3>
            <p class="text-gray-600 mb-4">
              Para mostrar imágenes en pantalla completa.
            </p>
            <button (click)="showGalleryModal()" 
                    class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Abrir Galería
            </button>
          </div>

          <!-- Modal de Selección -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Selección
            </h3>
            <p class="text-gray-600 mb-4">
              Para seleccionar elementos de una lista.
            </p>
            <div class="space-y-2">
              <button (click)="showSelectionModal(false)" 
                      class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                Selección Simple
              </button>
              <button (click)="showSelectionModal(true)" 
                      class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                Selección Múltiple
              </button>
            </div>
          </div>

          <!-- Modal Drawer -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal Drawer
            </h3>
            <p class="text-gray-600 mb-4">
              Panel lateral deslizable para navegación o detalles.
            </p>
            <div class="space-y-2">
              <button (click)="showDrawerModal('left')" 
                      class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                Drawer Izquierdo
              </button>
              <button (click)="showDrawerModal('right')" 
                      class="w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors">
                Drawer Derecho
              </button>
            </div>
          </div>

          <!-- Modal Fullscreen -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal Fullscreen
            </h3>
            <p class="text-gray-600 mb-4">
              Para contenido que requiere toda la pantalla.
            </p>
            <button (click)="showFullscreenModal()" 
                    class="w-full bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition-colors">
              Pantalla Completa
            </button>
          </div>

          <!-- Modal con Tabs -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal con Pestañas
            </h3>
            <p class="text-gray-600 mb-4">
              Para organizar contenido en pestañas.
            </p>
            <div class="space-y-2">
              <button (click)="showTabModal('top')" 
                      class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                Tabs Superiores
              </button>
              <button (click)="showTabModal('left')" 
                      class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Tabs Laterales
              </button>
            </div>
          </div>

          <!-- Modal de Configuraciones -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Configuraciones
            </h3>
            <p class="text-gray-600 mb-4">
              Para panels de configuración complejos.
            </p>
            <button (click)="showSettingsModal()" 
                    class="w-full bg-institucional-secundario hover:bg-institucional-secundario-dark text-white px-4 py-2 rounded-lg transition-colors">
              Abrir Configuraciones
            </button>
          </div>

          <!-- Modal de Formulario -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-institucional-primario mb-3">
              Modal de Formulario
            </h3>
            <p class="text-gray-600 mb-4">
              Para captura de datos en modal.
            </p>
            <button (click)="showFormModal()" 
                    class="w-full bg-institucional-primario hover:bg-institucional-primario-dark text-white px-4 py-2 rounded-lg transition-colors">
              Abrir Formulario
            </button>
          </div>

        </div>

        <!-- Resultados de ejemplos -->
        <div *ngIf="lastResult" class="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold text-institucional-primario mb-3">
            Último Resultado
          </h3>
          <pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">{{ lastResult | json }}</pre>
        </div>

      </div>
    </div>

    <!-- Todos los modales -->
    
    <!-- Modal de Confirmación -->
    <app-confirmation-modal
      [isOpen]="confirmationModalOpen"
      [config]="confirmationConfig"
      (confirm)="onConfirmationConfirm()"
      (cancel)="onConfirmationCancel()"
      (modalClose)="confirmationModalOpen = false">
    </app-confirmation-modal>

    <!-- Modal de Alerta -->
    <app-alert-modal
      [isOpen]="alertModalOpen"
      [config]="alertConfig"
      (modalClose)="alertModalOpen = false">
    </app-alert-modal>

    <!-- Modal de Carga -->
    <app-loading-modal
      [isOpen]="loadingModalOpen"
      [config]="loadingConfig"
      (cancel)="onLoadingCancel()"
      (modalClose)="loadingModalOpen = false">
    </app-loading-modal>

    <!-- Modal de Galería -->
    <app-gallery-modal
      [isOpen]="galleryModalOpen"
      [items]="galleryItems"
      [currentIndex]="galleryCurrentIndex"
      (itemChange)="onGalleryItemChange($event)"
      (modalClose)="galleryModalOpen = false">
    </app-gallery-modal>

    <!-- Modal de Selección -->
    <app-selection-modal
      [isOpen]="selectionModalOpen"
      [config]="selectionConfig"
      [options]="selectionOptions"
      [selectedIds]="selectedIds"
      (selectionChange)="onSelectionChange($event)"
      (cancel)="onSelectionCancel()"
      (modalClose)="selectionModalOpen = false">
    </app-selection-modal>

    <!-- Modal Drawer -->
    <app-drawer-modal
      [isOpen]="drawerModalOpen"
      [config]="drawerConfig"
      (modalClose)="drawerModalOpen = false">
      
      <div class="space-y-6">
        <h4 class="text-lg font-bold text-institucional-primario">Contenido del Drawer</h4>
        <p class="text-gray-600">
          Este es un ejemplo de contenido dentro de un drawer modal. Puedes incluir cualquier
          tipo de contenido aquí: formularios, listas, navegación, etc.
        </p>
        
        <div class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="font-semibold text-gray-800 mb-2">Elemento 1</h5>
            <p class="text-gray-600 text-sm">Descripción del primer elemento.</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="font-semibold text-gray-800 mb-2">Elemento 2</h5>
            <p class="text-gray-600 text-sm">Descripción del segundo elemento.</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <h5 class="font-semibold text-gray-800 mb-2">Elemento 3</h5>
            <p class="text-gray-600 text-sm">Descripción del tercer elemento.</p>
          </div>
        </div>
      </div>

      <div slot="footer" class="p-4 bg-gray-50">
        <button class="w-full bg-institucional-primario hover:bg-institucional-primario-dark text-white px-4 py-2 rounded-lg transition-colors">
          Acción Principal
        </button>
      </div>
    </app-drawer-modal>

    <!-- Modal Fullscreen -->
    <app-modal
      [isOpen]="fullscreenModalOpen"
      [config]="fullscreenConfig"
      (modalClose)="fullscreenModalOpen = false">
      
      <div slot="header-actions">
        <button class="text-white hover:text-institucional-secundario-light transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20">
          <span class="material-symbols-outlined">settings</span>
        </button>
        <button class="text-white hover:text-institucional-secundario-light transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20">
          <span class="material-symbols-outlined">share</span>
        </button>
      </div>

      <div class="max-w-4xl mx-auto space-y-8">
        <h2 class="text-3xl font-bold text-institucional-primario">Contenido Fullscreen</h2>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-xl font-bold mb-4">Sección 1</h3>
            <p class="text-gray-600 mb-4">
              Este modal ocupa toda la pantalla, perfecto para editores, visualizadores
              de documentos, o cualquier contenido que necesite el máximo espacio disponible.
            </p>
            <div class="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
              <span class="text-gray-500">Contenido visual</span>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-xl font-bold mb-4">Sección 2</h3>
            <p class="text-gray-600 mb-4">
              Puedes incluir cualquier tipo de contenido: gráficos, tablas, formularios
              complejos, mapas interactivos, etc.
            </p>
            <div class="space-y-2">
              <div class="bg-institucional-primario h-4 rounded"></div>
              <div class="bg-institucional-secundario h-4 rounded w-3/4"></div>
              <div class="bg-institucional-secundario h-4 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="p-6 bg-white border-t border-gray-200">
        <div class="max-w-4xl mx-auto flex justify-end gap-4">
          <button class="px-6 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button class="px-6 py-2 bg-institucional-primario hover:bg-institucional-primario-dark text-white rounded-lg transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </app-modal>

    <!-- Modal con Tabs -->
    <app-tab-modal
      [isOpen]="tabModalOpen"
      [config]="tabConfig"
      [tabs]="tabModalTabs"
      [activeTabId]="activeTabId"
      (tabChange)="onTabChange($event)"
      (modalClose)="tabModalOpen = false">
      
      <div [ngSwitch]="activeTabId" class="min-h-[300px]">
        <div *ngSwitchCase="'general'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Configuración General</h4>
          <p class="text-gray-600">Configuraciones básicas del sistema.</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">Opción 1</label>
              <input type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <label class="block text-sm font-medium text-gray-700 mb-2">Opción 2</label>
              <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Valor 1</option>
                <option>Valor 2</option>
              </select>
            </div>
          </div>
        </div>
        
        <div *ngSwitchCase="'security'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Configuración de Seguridad</h4>
          <p class="text-gray-600">Configuraciones relacionadas con la seguridad.</p>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 class="font-medium">Autenticación de dos factores</h5>
                <p class="text-sm text-gray-600">Añade una capa extra de seguridad</p>
              </div>
              <input type="checkbox" class="w-4 h-4">
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 class="font-medium">Notificaciones de seguridad</h5>
                <p class="text-sm text-gray-600">Recibe alertas de actividad sospechosa</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4">
            </div>
          </div>
        </div>
        
        <div *ngSwitchCase="'notifications'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Configuración de Notificaciones</h4>
          <p class="text-gray-600">Gestiona cómo y cuándo recibir notificaciones.</p>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <input type="checkbox" checked class="w-4 h-4">
              <label>Notificaciones por email</label>
            </div>
            <div class="flex items-center gap-3">
              <input type="checkbox" class="w-4 h-4">
              <label>Notificaciones push</label>
            </div>
            <div class="flex items-center gap-3">
              <input type="checkbox" checked class="w-4 h-4">
              <label>Notificaciones SMS</label>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="p-6 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button class="px-4 py-2 bg-institucional-primario hover:bg-institucional-primario-dark text-white rounded-lg transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </app-tab-modal>

    <!-- Modal de Configuraciones -->
    <app-settings-modal
      [isOpen]="settingsModalOpen"
      [config]="settingsConfig"
      [sections]="settingsSections"
      [activeSectionId]="activeSettingsSection"
      (sectionChange)="onSettingsSectionChange($event)"
      (save)="onSettingsSave()"
      (cancel)="onSettingsCancel()"
      (reset)="onSettingsReset()"
      (modalClose)="settingsModalOpen = false">
      
      <div [ngSwitch]="activeSettingsSection" class="space-y-6">
        <div *ngSwitchCase="'profile'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Información Personal</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input type="text" value="Usuario Demo" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value="usuario@empresa.com" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            </div>
          </div>
        </div>
        
        <div *ngSwitchCase="'account'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Configuración de Cuenta</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cambiar contraseña</label>
              <button class="bg-institucional-secundario hover:bg-institucional-secundario-dark text-white px-4 py-2 rounded-lg transition-colors">
                Cambiar contraseña
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Zona horaria</label>
              <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>UTC-6 (Ciudad de México)</option>
                <option>UTC-5 (Nueva York)</option>
                <option>UTC+0 (Londres)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div *ngSwitchCase="'privacy'" class="space-y-4">
          <h4 class="text-lg font-bold text-institucional-primario">Configuración de Privacidad</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 class="font-medium">Perfil público</h5>
                <p class="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
              </div>
              <input type="checkbox" class="w-4 h-4">
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 class="font-medium">Datos de uso</h5>
                <p class="text-sm text-gray-600">Compartir datos para mejorar el servicio</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4">
            </div>
          </div>
        </div>
      </div>
    </app-settings-modal>

    <!-- Modal de Formulario -->
    <app-modal-form
      [isOpen]="formModalOpen"
      title="Ejemplo de Formulario"
      subtitle="Complete los datos requeridos"
      [formGroup]="demoForm"
      (modalClose)="formModalOpen = false"
      (formSubmit)="onFormSubmit($event)">
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input formControlName="nombre" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input formControlName="email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
          <textarea formControlName="mensaje" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
        </div>
      </div>
    </app-modal-form>
  `
})
export class DemoModalesComponent implements OnInit {
  
  // Estados de modales
  confirmationModalOpen = false;
  alertModalOpen = false;
  loadingModalOpen = false;
  galleryModalOpen = false;
  selectionModalOpen = false;
  drawerModalOpen = false;
  fullscreenModalOpen = false;
  tabModalOpen = false;
  settingsModalOpen = false;
  formModalOpen = false;

  // Configuraciones
  confirmationConfig: ConfirmationConfig = {
    title: 'Confirmar acción',
    message: '¿Estás seguro de que deseas continuar?'
  };

  alertConfig: AlertConfig = {
    title: 'Información',
    message: 'Esta es una alerta informativa.'
  };

  loadingConfig: LoadingConfig = {
    title: 'Cargando...',
    message: 'Por favor espera mientras procesamos tu solicitud.'
  };

  drawerConfig: DrawerConfig = {
    title: 'Panel Lateral',
    subtitle: 'Contenido adicional',
    position: 'right',
    size: 'md'
  };

  fullscreenConfig: ModalConfig = {
    title: 'Vista Completa',
    subtitle: 'Contenido en pantalla completa'
  };

  tabConfig: TabModalConfig = {
    title: 'Configuraciones',
    subtitle: 'Gestiona tus preferencias',
    size: 'lg',
    tabPosition: 'top'
  };

  settingsConfig: SettingsModalConfig = {
    title: 'Configuraciones',
    subtitle: 'Gestiona tu cuenta y preferencias'
  };

  selectionConfig: SelectionConfig = {
    title: 'Seleccionar elementos',
    subtitle: 'Elige uno o más elementos de la lista',
    searchable: true,
    multiple: true,
    showSelectAll: true,
    showSelectedCount: true
  };

  // Datos para componentes
  galleryItems: GalleryItem[] = [
    {
      id: '1',
      src: 'https://picsum.photos/800/600?random=1',
      title: 'Imagen 1',
      description: 'Descripción de la primera imagen'
    },
    {
      id: '2',
      src: 'https://picsum.photos/800/600?random=2',
      title: 'Imagen 2',
      description: 'Descripción de la segunda imagen'
    },
    {
      id: '3',
      src: 'https://picsum.photos/800/600?random=3',
      title: 'Imagen 3',
      description: 'Descripción de la tercera imagen'
    }
  ];

  galleryCurrentIndex = 0;

  selectionOptions: SelectionOption[] = [
    { id: '1', label: 'Opción 1', description: 'Primera opción disponible', icon: 'star' },
    { id: '2', label: 'Opción 2', description: 'Segunda opción disponible', icon: 'favorite' },
    { id: '3', label: 'Opción 3', description: 'Tercera opción disponible', icon: 'bookmark' },
    { id: '4', label: 'Opción 4', description: 'Cuarta opción disponible', icon: 'thumb_up' },
    { id: '5', label: 'Opción deshabilitada', description: 'Esta opción no está disponible', icon: 'block', disabled: true }
  ];

  selectedIds: string[] = [];

  tabModalTabs: TabModalTab[] = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'security', label: 'Seguridad', icon: 'security', badge: '!' },
    { id: 'notifications', label: 'Notificaciones', icon: 'notifications', badge: 3 }
  ];

  activeTabId = 'general';

  settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Perfil',
      icon: 'person',
      description: 'Información personal y datos básicos'
    },
    {
      id: 'account',
      title: 'Cuenta',
      icon: 'account_circle',
      description: 'Configuración de la cuenta y seguridad'
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      icon: 'privacy_tip',
      description: 'Controles de privacidad y datos'
    }
  ];

  activeSettingsSection = 'profile';

  // Formulario demo
  demoForm!: FormGroup;

  // Variable para mostrar resultados
  lastResult: any = null;

  // Progreso para loading modal
  currentProgress = 0;

  // Variables para flujos combinados
  currentFlow: string = '';
  flowStep: number = 0;
  flowData: any = {};

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.demoForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['']
    });
  }

  // Métodos para mostrar modales
  showConfirmationModal(type: 'info' | 'warning' | 'danger'): void {
    this.confirmationConfig = {
      title: type === 'info' ? 'Información' : type === 'warning' ? 'Advertencia' : 'Peligro',
      message: type === 'info' ? 
        '¿Deseas continuar con esta acción?' : 
        type === 'warning' ? 
        '¡Atención! Esta acción puede tener consecuencias.' :
        '¡Cuidado! Esta acción es irreversible y eliminará datos.',
      type: type,
      confirmText: type === 'danger' ? 'Eliminar' : 'Continuar',
      preventClose: type === 'danger'
    };
    this.confirmationModalOpen = true;
  }

  showAlertModal(type: 'success' | 'info'): void {
    this.alertConfig = {
      title: type === 'success' ? '¡Éxito!' : 'Información',
      message: type === 'success' ? 
        'La operación se completó correctamente.' :
        'Esta es información importante que debes conocer.',
      type: type
    };
    this.alertModalOpen = true;
  }

  showAlertAutoClose(): void {
    this.alertConfig = {
      title: 'Auto-cierre',
      message: 'Este modal se cerrará automáticamente en 5 segundos.',
      type: 'info',
      autoClose: true,
      autoCloseDelay: 5000
    };
    this.alertModalOpen = true;
  }

  showLoadingModal(): void {
    this.loadingConfig = {
      title: 'Procesando...',
      message: 'Por favor espera mientras completamos la operación.',
      showCancel: true
    };
    this.loadingModalOpen = true;

    // Simular cierre automático después de 3 segundos
    setTimeout(() => {
      this.loadingModalOpen = false;
    }, 3000);
  }

  showLoadingWithProgress(): void {
    this.currentProgress = 0;
    this.loadingConfig = {
      title: 'Subiendo archivos...',
      message: 'Transfiriendo datos al servidor.',
      showProgress: true,
      progress: 0,
      showCancel: true
    };
    this.loadingModalOpen = true;

    // Simular progreso
    const interval = setInterval(() => {
      this.currentProgress += 10;
      this.loadingConfig.progress = this.currentProgress;
      
      if (this.currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.loadingModalOpen = false;
        }, 1000);
      }
    }, 300);
  }

  showGalleryModal(): void {
    this.galleryCurrentIndex = 0;
    this.galleryModalOpen = true;
  }

  showSelectionModal(multiple: boolean): void {
    this.selectionConfig = {
      title: multiple ? 'Selección múltiple' : 'Selección simple',
      subtitle: multiple ? 'Elige varios elementos' : 'Elige un elemento',
      multiple: multiple,
      searchable: true,
      showSelectAll: multiple,
      showSelectedCount: multiple,
      maxSelections: multiple ? 3 : undefined
    };
    this.selectedIds = [];
    this.selectionModalOpen = true;
  }

  showDrawerModal(position: 'left' | 'right'): void {
    this.drawerConfig = {
      title: `Panel ${position === 'left' ? 'Izquierdo' : 'Derecho'}`,
      subtitle: 'Contenido del drawer',
      position: position,
      size: 'md'
    };
    this.drawerModalOpen = true;
  }

  showFullscreenModal(): void {
    this.fullscreenModalOpen = true;
  }

  showTabModal(tabPosition: 'top' | 'left'): void {
    this.tabConfig = {
      title: 'Modal con Pestañas',
      subtitle: 'Organiza contenido en pestañas',
      size: 'lg',
      tabPosition: tabPosition
    };
    this.activeTabId = 'general';
    this.tabModalOpen = true;
  }

  showSettingsModal(): void {
    this.activeSettingsSection = 'profile';
    this.settingsModalOpen = true;
  }

  showFormModal(): void {
    this.demoForm.reset();
    this.formModalOpen = true;
  }

  // Manejadores de eventos
  onConfirmationConfirm(): void {
    if (this.currentFlow === 'delete' && this.flowStep === 1) {
      // Paso 1 confirmado, mostrar loading
      this.confirmationModalOpen = false;
      this.flowStep = 2;
      this.showDeleteLoading();
    } else if (this.currentFlow === 'settings' && this.flowStep === 2) {
      // Confirmación de guardar configuraciones
      this.confirmationModalOpen = false;
      this.flowStep = 3;
      this.showSettingsSaved();
    } else if (this.currentFlow === 'bulk' && this.flowStep === 2) {
      // Confirmación de operación masiva
      this.confirmationModalOpen = false;
      this.flowStep = 3;
      this.showBulkLoading();
    } else if (this.currentFlow === 'editor' && this.flowStep === 2) {
      // Confirmación de salir del editor
      this.confirmationModalOpen = false;
      this.fullscreenModalOpen = false;
      this.currentFlow = '';
      this.lastResult = { action: 'editor_saved_and_closed' };
    } else {
      // Comportamiento normal
      this.lastResult = { action: 'confirmed', type: this.confirmationConfig.type };
      this.confirmationModalOpen = false;
    }
  }

  onConfirmationCancel(): void {
    this.lastResult = { action: 'cancelled' };
  }

  onLoadingCancel(): void {
    this.loadingModalOpen = false;
    this.lastResult = { action: 'loading_cancelled' };
  }

  onGalleryItemChange(event: { item: GalleryItem; index: number }): void {
    this.galleryCurrentIndex = event.index;
    this.lastResult = { action: 'gallery_item_changed', item: event.item.title, index: event.index };
  }

  onSelectionChange(selections: SelectionOption[]): void {
    if (this.currentFlow === 'upload' && this.flowStep === 1) {
      // Paso 1 completado, mostrar loading de subida
      this.selectionModalOpen = false;
      this.flowStep = 2;
      this.flowData.selectedFiles = selections;
      this.showUploadLoading();
    } else if (this.currentFlow === 'bulk' && this.flowStep === 1) {
      // Paso 1 completado, mostrar confirmación
      this.selectionModalOpen = false;
      this.flowStep = 2;
      this.flowData.selectedItems = selections;
      this.showBulkConfirmation();
    } else {
      // Comportamiento normal
      this.lastResult = { action: 'selection_changed', selections: selections.map(s => s.label) };
    }
  }

  onSelectionCancel(): void {
    this.lastResult = { action: 'selection_cancelled' };
  }

  onTabChange(tabId: string): void {
    this.activeTabId = tabId;
    this.lastResult = { action: 'tab_changed', tabId };
  }

  onSettingsSectionChange(sectionId: string): void {
    this.activeSettingsSection = sectionId;
  }

  onSettingsSave(): void {
    this.lastResult = { action: 'settings_saved', section: this.activeSettingsSection };
    this.settingsModalOpen = false;
  }

  onSettingsCancel(): void {
    this.lastResult = { action: 'settings_cancelled' };
  }

  onSettingsReset(): void {
    this.lastResult = { action: 'settings_reset', section: this.activeSettingsSection };
  }

  onFormSubmit(data: any): void {
    this.lastResult = { action: 'form_submitted', data };
    this.formModalOpen = false;
  }

  // Método para navegar al demo de formularios
  navigateToFormulariosDemo(): void {
    this.router.navigate(['/demo-formularios']);
  }

  // === FLUJOS COMBINADOS DE MODALES ===

  // 1. Flujo de eliminación: Confirmación → Loading → Alerta de resultado
  startDeleteFlow(): void {
    this.currentFlow = 'delete';
    this.flowStep = 1;
    
    this.confirmationConfig = {
      title: 'Eliminar Elemento',
      message: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Eliminar',
      preventClose: true
    };
    this.confirmationModalOpen = true;
  }

  // 2. Flujo de subida: Selección → Loading → Galería
  startUploadFlow(): void {
    this.currentFlow = 'upload';
    this.flowStep = 1;
    
    this.selectionConfig = {
      title: 'Seleccionar Imágenes',
      subtitle: 'Elige las imágenes que deseas subir',
      multiple: true,
      searchable: false,
      showSelectAll: true,
      maxSelections: 5
    };
    this.selectedIds = [];
    this.selectionModalOpen = true;
  }

  // 3. Configuración avanzada: Settings → Tabs → Confirmación
  startAdvancedSettings(): void {
    this.currentFlow = 'settings';
    this.flowStep = 1;
    
    this.settingsModalOpen = true;
  }

  // 4. Editor con vista previa: Fullscreen → Drawer
  startEditorFlow(): void {
    this.currentFlow = 'editor';
    this.flowStep = 1;
    
    this.fullscreenModalOpen = true;
  }

  // 5. Operaciones masivas: Selección → Confirmación → Loading
  startBulkOperation(): void {
    this.currentFlow = 'bulk';
    this.flowStep = 1;
    
    this.selectionConfig = {
      title: 'Selección Masiva',
      subtitle: 'Selecciona los elementos para la operación masiva',
      multiple: true,
      searchable: true,
      showSelectAll: true,
      showSelectedCount: true
    };
    this.selectedIds = [];
    this.selectionModalOpen = true;
  }

  // 6. Tutorial interactivo: Secuencia de alertas
  startTutorial(): void {
    this.currentFlow = 'tutorial';
    this.flowStep = 1;
    this.showTutorialStep(1);
  }

  // === MÉTODOS ESPECÍFICOS DE FLUJOS ===

  showDeleteLoading(): void {
    this.loadingConfig = {
      title: 'Eliminando...',
      message: 'Eliminando el elemento seleccionado.',
      showCancel: false
    };
    this.loadingModalOpen = true;

    // Simular eliminación
    setTimeout(() => {
      this.loadingModalOpen = false;
      this.flowStep = 3;
      this.showDeleteSuccess();
    }, 2000);
  }

  showDeleteSuccess(): void {
    this.alertConfig = {
      title: '¡Elemento eliminado!',
      message: 'El elemento se ha eliminado correctamente.',
      type: 'success'
    };
    this.alertModalOpen = true;
    this.currentFlow = '';
    this.lastResult = { action: 'delete_flow_completed' };
  }

  showUploadLoading(): void {
    this.currentProgress = 0;
    this.loadingConfig = {
      title: 'Subiendo imágenes...',
      message: 'Transfiriendo archivos al servidor.',
      showProgress: true,
      progress: 0,
      showCancel: true
    };
    this.loadingModalOpen = true;

    // Simular progreso de subida
    const interval = setInterval(() => {
      this.currentProgress += 15;
      this.loadingConfig.progress = this.currentProgress;
      
      if (this.currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.loadingModalOpen = false;
          this.flowStep = 3;
          this.showUploadGallery();
        }, 1000);
      }
    }, 400);
  }

  showUploadGallery(): void {
    // Mostrar galería con las imágenes "subidas"
    this.galleryCurrentIndex = 0;
    this.galleryModalOpen = true;
    this.currentFlow = '';
    this.lastResult = { action: 'upload_flow_completed', files: this.flowData.selectedFiles.length };
  }

  showBulkConfirmation(): void {
    const count = this.flowData.selectedItems.length;
    this.confirmationConfig = {
      title: 'Confirmar Operación Masiva',
      message: `¿Estás seguro de que deseas procesar ${count} elemento(s) seleccionado(s)?`,
      type: 'warning',
      confirmText: 'Procesar',
      preventClose: false
    };
    this.confirmationModalOpen = true;
  }

  showBulkLoading(): void {
    const count = this.flowData.selectedItems.length;
    this.loadingConfig = {
      title: 'Procesando elementos...',
      message: `Procesando ${count} elemento(s) seleccionado(s).`,
      showCancel: false
    };
    this.loadingModalOpen = true;

    setTimeout(() => {
      this.loadingModalOpen = false;
      this.showBulkSuccess();
    }, 3000);
  }

  showBulkSuccess(): void {
    const count = this.flowData.selectedItems.length;
    this.alertConfig = {
      title: '¡Operación completada!',
      message: `Se procesaron correctamente ${count} elemento(s).`,
      type: 'success'
    };
    this.alertModalOpen = true;
    this.currentFlow = '';
    this.lastResult = { action: 'bulk_flow_completed', processed: count };
  }

  showSettingsSaved(): void {
    this.loadingConfig = {
      title: 'Guardando configuraciones...',
      message: 'Aplicando los cambios realizados.',
      showCancel: false
    };
    this.loadingModalOpen = true;

    setTimeout(() => {
      this.loadingModalOpen = false;
      this.alertConfig = {
        title: '¡Configuración guardada!',
        message: 'Los cambios se han aplicado correctamente.',
        type: 'success'
      };
      this.alertModalOpen = true;
      this.currentFlow = '';
      this.lastResult = { action: 'settings_flow_completed' };
    }, 1500);
  }

  showTutorialStep(step: number): void {
    const steps = [
      {
        title: '¡Bienvenido al Tutorial!',
        message: 'Te guiaremos paso a paso por las funcionalidades principales.',
        type: 'info'
      },
      {
        title: 'Paso 1: Navegación',
        message: 'Usa los menús laterales para navegar entre secciones.',
        type: 'info'
      },
      {
        title: 'Paso 2: Modales',
        message: 'Los modales te permiten realizar acciones sin salir de la página actual.',
        type: 'info'
      },
      {
        title: '¡Tutorial completado!',
        message: 'Ya conoces lo básico. ¡Explora por tu cuenta!',
        type: 'success'
      }
    ];

    if (step <= steps.length) {
      const currentStep = steps[step - 1];
      this.alertConfig = {
        title: currentStep.title,
        message: currentStep.message,
        type: currentStep.type as any,
        actions: step < steps.length ? [
          { 
            label: 'Siguiente', 
            variant: 'primary', 
            action: () => {
              this.alertModalOpen = false;
              setTimeout(() => this.showTutorialStep(step + 1), 300);
            }
          }
        ] : undefined
      };
      this.alertModalOpen = true;
      
      if (step === steps.length) {
        this.currentFlow = '';
        this.lastResult = { action: 'tutorial_completed' };
      }
    }
  }

  // Override para el flujo del editor
  // Cuando se cierre el fullscreen, mostrar drawer con opciones
  onFullscreenClose(): void {
    if (this.currentFlow === 'editor' && this.flowStep === 1) {
      this.fullscreenModalOpen = false;
      this.flowStep = 2;
      
      // Mostrar confirmación de guardar
      this.confirmationConfig = {
        title: 'Guardar cambios',
        message: '¿Deseas guardar los cambios realizados en el editor?',
        type: 'info',
        confirmText: 'Guardar y cerrar',
        cancelText: 'Cerrar sin guardar'
      };
      this.confirmationModalOpen = true;
    } else {
      this.fullscreenModalOpen = false;
    }
  }
}
