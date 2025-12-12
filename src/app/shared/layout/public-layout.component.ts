import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { PublicHeaderComponent } from '../components/public-header/public-header.component';
import { FooterComponent } from '../components/footer/footer.component';

/**
 * PublicLayoutComponent - Layout para la parte pública del sistema
 * 
 * Proporciona la estructura base del layout público con:
 * - Header estático con color primario institucional
 * - Footer estático con fondo blanco
 * - Área de contenido dinámico con scroll independiente
 * - Diseño responsive para usuarios no autenticados
 * 
 * Diferente del LayoutWrapperComponent (parte privada) que incluye:
 * sidebar, notificaciones, y funcionalidades de administración
 */
@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        PublicHeaderComponent,
        FooterComponent
    ],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      
      <!-- Header público estático -->
      <app-public-header class="flex-shrink-0 sticky top-0 z-30"></app-public-header>

      <!-- Contenido principal (ocupa todo el ancho de la pantalla) -->
      <main class="flex-1 relative bg-white my-4 w-full rounded-none shadow-none overflow-hidden">
        <div class="w-full px-[10px] mx-auto">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer público estático -->
      <app-footer class="flex-shrink-0 sticky bottom-0 z-20"></app-footer>
      
    </div>
  `,
    styles: [`
      /* Asegurar que el layout ocupe toda la altura de la ventana */
      :host {
        display: block;
        min-height: 100vh;
        font-family: 'Montserrat', sans-serif;
      }
      /* Evitar overflow horizontal global en este layout */
      :host, :host * {
        box-sizing: border-box;
      }
      :host {
        overflow-x: hidden;
      }

      /* El contenedor principal usa flexbox para sticky header/footer */
      .min-h-screen {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      /* El main debe crecer para ocupar el espacio disponible */
      main {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-x: hidden; /* Prevenir scroll horizontal */
        width: 100%;
      }

      /* Contenedor de contenido responsivo */
      main .w-full {
        width: 100%;
        padding: 0 10px;
        margin: 0 auto;
        flex: 1;
        box-sizing: border-box;
      }

      /* Asegurar que router-outlet ocupe todo el espacio disponible */
      main ::ng-deep router-outlet + * {
        min-height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Sticky positioning para header y footer */
      app-public-header {
        position: sticky;
        top: 0;
        z-index: 30;
      }

      app-footer {
        position: sticky;
        bottom: 0;
        z-index: 20;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        main .max-w-7xl {
          padding: 0;
        }
      }

      /* Smooth scrolling para la página */
      html {
        scroll-behavior: smooth;
      }

      /* Asegurar que los elementos sticky funcionen correctamente */
      body {
        position: relative;
      }
    `]
})
export class PublicLayoutComponent {
  constructor() {
    // El layout público es más simple que el privado
    // No requiere gestión de sidebar, notificaciones, etc.
  }
}