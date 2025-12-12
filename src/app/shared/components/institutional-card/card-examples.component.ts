import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalCardComponent } from './institutional-card.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-card-examples',
  standalone: true,
  imports: [
    CommonModule,
    InstitutionalCardComponent,
    InstitutionalButtonComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-institucional-primario mb-4">
          Ejemplos del Componente Institutional Card
        </h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Diferentes variaciones y casos de uso del componente de cartas reutilizable.
        </p>
      </div>

      <!-- Sección: Variantes Básicas -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-institucional-primario">
          Variantes Básicas
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Carta Estándar -->
          <app-institutional-card
            [config]="{
              variant: 'standard',
              size: 'auto'
            }">
            <div slot="header">
              <h3 class="text-lg font-semibold text-institucional-primario">
                Carta Estándar
              </h3>
              <p class="text-sm text-gray-600">Variante por defecto</p>
            </div>
            
            <div>
              <p class="text-gray-700 mb-4">
                Esta es una carta estándar con header, body y footer visibles.
                Perfecta para contenido general.
              </p>
              <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-600">
                  Contenido adicional en contenedor
                </p>
              </div>
            </div>
            
            <div slot="footer">
              <app-institutional-button
                [config]="{
                  variant: 'secondary',
                  size: 'small'
                }">
                Cancelar
              </app-institutional-button>
              
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  size: 'small'
                }">
                Aceptar
              </app-institutional-button>
            </div>
          </app-institutional-card>

          <!-- Carta Compacta -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              size: 'auto'
            }">
            <div slot="header">
              <h3 class="text-lg font-semibold text-institucional-primario">
                Carta Compacta
              </h3>
            </div>
            
            <div>
              <p class="text-gray-700">
                Versión más compacta, ideal para dashboards o widgets.
              </p>
            </div>
            
            <div slot="footer">
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  size: 'small',
                  fullWidth: true
                }">
                Ver Más
              </app-institutional-button>
            </div>
          </app-institutional-card>

          <!-- Carta Destacada -->
          <app-institutional-card
            [config]="{
              variant: 'highlighted',
              size: 'auto'
            }">
            <div slot="header">
              <div class="flex items-center">
                <span class="material-symbols-outlined text-institucional-primario mr-2">
                  star
                </span>
                <h3 class="text-lg font-semibold text-institucional-primario">
                  Carta Destacada
                </h3>
              </div>
            </div>
            
            <div>
              <p class="text-gray-700 mb-3">
                Carta con estilo destacado, ideal para contenido importante o promocional.
              </p>
              <div class="bg-institucional-primario bg-opacity-10 p-3 rounded">
                <p class="text-institucional-primario text-sm font-medium">
                  ¡Contenido importante!
                </p>
              </div>
            </div>
            
            <div slot="footer">
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  size: 'small',
                  icon: 'arrow_forward',
                  iconPosition: 'right'
                }">
                Continuar
              </app-institutional-button>
            </div>
          </app-institutional-card>
        </div>
      </section>

      <!-- Sección: Estados -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-institucional-primario">
          Estados de Carta
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Estado Default -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              state: 'default',
              showFooter: false
            }">
            <div slot="header">
              <h4 class="font-semibold">Estado Default</h4>
            </div>
            <div>
              <p class="text-sm text-gray-600">Estado normal de la carta</p>
            </div>
          </app-institutional-card>

          <!-- Estado Active -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              state: 'active',
              showFooter: false
            }">
            <div slot="header">
              <h4 class="font-semibold">Estado Active</h4>
            </div>
            <div>
              <p class="text-sm text-gray-600">Carta con efecto hover activo</p>
            </div>
          </app-institutional-card>

          <!-- Estado Selected -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              state: 'selected',
              showFooter: false
            }">
            <div slot="header">
              <h4 class="font-semibold">Estado Selected</h4>
            </div>
            <div>
              <p class="text-sm text-gray-600">Carta seleccionada</p>
            </div>
          </app-institutional-card>

          <!-- Estado Disabled -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              state: 'disabled',
              showFooter: false
            }">
            <div slot="header">
              <h4 class="font-semibold">Estado Disabled</h4>
            </div>
            <div>
              <p class="text-sm text-gray-600">Carta deshabilitada</p>
            </div>
          </app-institutional-card>
        </div>
      </section>

      <!-- Sección: Casos de Uso Avanzados -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-institucional-primario">
          Casos de Uso Avanzados
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Carta con Formulario -->
          <app-institutional-card
            [config]="{
              variant: 'standard',
              showBorder: true
            }">
            <div slot="header">
              <h3 class="text-lg font-semibold text-institucional-primario">
                Formulario de Contacto
              </h3>
              <p class="text-sm text-gray-600">Completa la información requerida</p>
            </div>
            
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none"
                  placeholder="Ingresa tu nombre">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none"
                  placeholder="tu@email.com">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Mensaje</label>
                <textarea 
                  rows="3"
                  class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none"
                  placeholder="Escribe tu mensaje aquí..."></textarea>
              </div>
            </form>
            
            <div slot="footer">
              <app-institutional-button
                [config]="{
                  variant: 'ghost',
                  size: 'medium'
                }">
                Cancelar
              </app-institutional-button>
              
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  size: 'medium',
                  icon: 'send',
                  iconPosition: 'right'
                }">
                Enviar Mensaje
              </app-institutional-button>
            </div>
          </app-institutional-card>

          <!-- Carta con Tabla -->
          <app-institutional-card
            [config]="{
              variant: 'standard',
              state: 'active'
            }">
            <div slot="header">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-institucional-primario">
                  Usuarios Recientes
                </h3>
                <span class="bg-stats4 text-white px-2 py-1 rounded text-xs font-medium">
                  5 nuevos
                </span>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left p-2 font-medium">Nombre</th>
                    <th class="text-left p-2 font-medium">Email</th>
                    <th class="text-left p-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-100">
                    <td class="p-2">Ana García</td>
                    <td class="p-2 text-gray-600">ana@example.com</td>
                    <td class="p-2">
                      <span class="bg-stats4 text-white px-2 py-1 rounded-full text-xs">
                        Activo
                      </span>
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100">
                    <td class="p-2">Carlos López</td>
                    <td class="p-2 text-gray-600">carlos@example.com</td>
                    <td class="p-2">
                      <span class="bg-stats2 text-white px-2 py-1 rounded-full text-xs">
                        Pendiente
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="p-2">María Rodríguez</td>
                    <td class="p-2 text-gray-600">maria@example.com</td>
                    <td class="p-2">
                      <span class="bg-stats4 text-white px-2 py-1 rounded-full text-xs">
                        Activo
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div slot="footer">
              <app-institutional-button
                [config]="{
                  variant: 'ghost',
                  size: 'small',
                  icon: 'download',
                  iconPosition: 'left'
                }">
                Exportar
              </app-institutional-button>
              
              <app-institutional-button
                [config]="{
                  variant: 'primary',
                  size: 'small',
                  icon: 'add',
                  iconPosition: 'left'
                }">
                Agregar Usuario
              </app-institutional-button>
            </div>
          </app-institutional-card>
        </div>
      </section>

      <!-- Sección: Dashboard Widgets -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-institucional-primario">
          Widgets de Dashboard
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Widget de Estadística -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false,
              state: 'active'
            }">
            <div class="text-center">
              <div class="text-4xl font-bold text-stats1 mb-2">1,234</div>
              <div class="text-sm text-gray-600 mb-3">Usuarios Totales</div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-stats1 h-2 rounded-full" style="width: 75%"></div>
              </div>
              <div class="text-xs text-gray-500 mt-1">75% del objetivo</div>
            </div>
          </app-institutional-card>

          <!-- Widget de Progreso -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false,
              state: 'active'
            }">
            <div class="text-center">
              <div class="text-4xl font-bold text-stats4 mb-2">89%</div>
              <div class="text-sm text-gray-600 mb-3">Tasa de Éxito</div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-stats4 h-2 rounded-full" style="width: 89%"></div>
              </div>
              <div class="text-xs text-stats4 mt-1">↑ +5% esta semana</div>
            </div>
          </app-institutional-card>

          <!-- Widget de Alertas -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false,
              state: 'selected'
            }">
            <div class="text-center">
              <div class="w-12 h-12 bg-stats5 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span class="material-symbols-outlined text-white">warning</span>
              </div>
              <div class="text-lg font-semibold text-stats5 mb-1">3</div>
              <div class="text-sm text-gray-600">Alertas Pendientes</div>
            </div>
          </app-institutional-card>

          <!-- Widget de Acciones Rápidas -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showFooter: false
            }">
            <div slot="header">
              <h4 class="font-semibold text-center">Acciones Rápidas</h4>
            </div>
            
            <div class="space-y-2">
              <button class="w-full text-left p-2 hover:bg-institucional-primario hover:text-white rounded transition-colors text-sm">
                <span class="material-symbols-outlined text-sm mr-2">add</span>
                Nuevo Usuario
              </button>
              <button class="w-full text-left p-2 hover:bg-institucional-primario hover:text-white rounded transition-colors text-sm">
                <span class="material-symbols-outlined text-sm mr-2">assessment</span>
                Ver Reportes
              </button>
              <button class="w-full text-left p-2 hover:bg-institucional-primario hover:text-white rounded transition-colors text-sm">
                <span class="material-symbols-outlined text-sm mr-2">settings</span>
                Configuración
              </button>
            </div>
          </app-institutional-card>
        </div>
      </section>

      <!-- Sección: Solo Body -->
      <section>
        <h2 class="text-2xl font-semibold mb-6 text-institucional-primario">
          Cartas Solo con Body
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Notificación -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false,
              customClass: 'border-l-4 border-stats2'
            }">
            <div class="flex items-start">
              <div class="w-10 h-10 bg-stats2 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span class="material-symbols-outlined text-white text-sm">info</span>
              </div>
              <div>
                <h4 class="font-semibold mb-1">Nueva Actualización</h4>
                <p class="text-sm text-gray-600">
                  Sistema actualizado a la versión 2.1.0
                </p>
                <p class="text-xs text-gray-500 mt-2">Hace 5 minutos</p>
              </div>
            </div>
          </app-institutional-card>

          <!-- Métrica Simple -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false,
              state: 'active'
            }">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-2xl font-bold text-institucional-primario">567</div>
                <div class="text-sm text-gray-600">Tareas Completadas</div>
              </div>
              <div class="w-12 h-12 bg-institucional-primario bg-opacity-10 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-institucional-primario">task_alt</span>
              </div>
            </div>
          </app-institutional-card>

          <!-- Status -->
          <app-institutional-card
            [config]="{
              variant: 'compact',
              showHeader: false,
              showFooter: false
            }">
            <div class="text-center">
              <div class="w-16 h-16 bg-stats4 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-2xl">check_circle</span>
              </div>
              <h4 class="font-semibold mb-1">Sistema Operativo</h4>
              <p class="text-sm text-stats4 font-medium">Todos los servicios funcionando correctamente</p>
            </div>
          </app-institutional-card>
        </div>
      </section>
    </div>
  `
})
export class CardExamplesComponent {
}