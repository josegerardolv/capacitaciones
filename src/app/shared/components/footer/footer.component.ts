import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { AppConfigService } from '../../../core/services/app-config.service';

/**
 * FooterComponent - Footer institucional para el sistema
 * 
 * Proporciona:
 * - Footer con fondo blanco estático
 * - Información institucional
 * - Logo y derechos de autor
 * - Diseño responsive
 * - Uso de colores institucionales
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, UniversalIconComponent],
  template: `
    <footer class="footer-institucional bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <!-- Contenido principal del footer -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Logo y nombre institucional -->
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-institucional-primario rounded-lg flex items-center justify-center shadow-sm">
              <app-universal-icon 
                [name]="'verified_user'" 
                [type]="'material'"
                [size]="24" 
                class="text-white">
              </app-universal-icon>
            </div>
            <div class="text-center md:text-left">
              <h3 class="font-bold text-institucional-primario text-lg">{{ headerTitle }}</h3>
              <p class="text-sm text-gray-600">{{ headerSubtitle }}</p>
            </div>
          </div>

          <!-- Información de derechos -->
          <div class="text-center md:text-right">
            <p class="text-sm text-gray-600">
              {{ copyright }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ footerTagline }} - <span class="font-semibold">Versión {{ version }}</span>
            </p>
          </div>
        </div>



      </div>
    </footer>
  `,
  styles: [`
    .footer-institucional {
      position: relative;
      z-index: 10;
      font-family: 'Montserrat', sans-serif;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    }

    .footer-institucional a {
      text-decoration: none;
    }

    .footer-institucional a:hover {
      text-decoration: underline;
    }

    /* Asegurar que el footer mantenga su posición estática */
    :host {
      display: block;
      flex-shrink: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .footer-institucional .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  headerTitle = '';
  headerSubtitle = '';
  footerTagline = '';
  version = '';
  footerCopyrightTemplate = '';
  copyright = '';

  constructor(private appConfig: AppConfigService) {
    this.headerTitle = this.appConfig.get('headerTitle') || this.appConfig.get('orgName') || 'SEMOVI Oaxaca';
    this.headerSubtitle = this.appConfig.get('headerSubtitle') || this.appConfig.get('subtitle') || 'Secretaría de Movilidad';
    this.footerTagline = this.appConfig.get('footerTagline') || 'Sistema de Gestión de Citas';
    this.version = this.appConfig.get('version') || '2.0.0';
    this.footerCopyrightTemplate = this.appConfig.get('footerCopyrightTemplate') || '© {{year}} {{org}}. Todos los derechos reservados.';
    const org = this.appConfig.get('orgName') || this.headerTitle;
    this.copyright = this.footerCopyrightTemplate.replace('{{year}}', String(this.currentYear)).replace('{{org}}', org);
  }
}