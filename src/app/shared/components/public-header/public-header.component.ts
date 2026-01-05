import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../../../core/services/app-config.service';

/**
 * PublicHeaderComponent - Header simplificado para la parte pública
 * 
 * Proporciona:
 * - Header con fondo de color primario institucional
 * - Logo e información institucional
 * - Navegación básica para usuarios no autenticados
 * - Diseño responsive
 * - Posición estática (no afectada por scroll)
 */
@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UniversalIconComponent],
  template: `
    <header class="public-header bg-institucional-primario text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center min-h-[80px]">
          
          <!-- Logo e información institucional -->
          <div class="flex items-center gap-4">
            <a [routerLink]="['/']" class="flex items-center gap-4 hover:opacity-90 transition-opacity duration-200">
              
              <!-- Logo institucional -->
              <div class="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <app-universal-icon 
                  [name]="'account_balance'" 
                  [type]="'material'"
                  [size]="24" 
                  class="text-institucional-primario">
                </app-universal-icon>
              </div>

              <!-- Información institucional -->
              <div>
                <h1 class="font-bold text-xl">{{ headerTitle }}</h1>
                <p class="text-white/90 text-sm">{{ headerSubtitle }}</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Menú móvil desplegable -->
        <div *ngIf="mobileMenuOpen" 
             class="md:hidden border-t border-white/20 py-4 animate-fade-in">
          <nav class="flex flex-col gap-3">
            <a *ngIf="!isActive('/')" [routerLink]="['/']" 
               (click)="closeMobileMenu()"
               class="nav-link-mobile text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-md transition-all duration-200">
              {{ navScheduleLabel }}
            </a>
            <!--<a *ngIf="!isActive('/agendar-cita')" [routerLink]="['/agendar-cita']" 
               (click)="closeMobileMenu()"
               class="nav-link-mobile text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-md transition-all duration-200">
              Agendar
            </a>-->
            <a *ngIf="!isActive('/validar-cita')" [routerLink]="['/validar-cita']" 
               (click)="closeMobileMenu()"
               class="nav-link-mobile text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-md transition-all duration-200">
              {{ navValidateLabel }}
            </a>
          </nav>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .public-header {
      position: relative;
      z-index: 20;
      font-family: 'Montserrat', sans-serif;
    }

    .nav-link {
      position: relative;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -4px;
      left: 50%;
      background-color: currentColor;
      transition: all 0.3s ease;
      transform: translateX(-50%);
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .btn-access {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 2px solid transparent;
    }

    .btn-access:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Animación para el menú móvil */
    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Asegurar que el header mantenga su posición estática */
    :host {
      display: block;
      flex-shrink: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .public-header .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `]
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  currentUrl = '/';
  private routerSub: Subscription | null = null;

  headerTitle = '';
  headerSubtitle = '';
  navScheduleLabel = '';
  navValidateLabel = '';

  constructor(private router: Router, private appConfig: AppConfigService) {}

  ngOnInit(): void {
    this.currentUrl = this.cleanPath(this.router.url);
    this.headerTitle = this.appConfig.get('headerTitle') || this.appConfig.get('orgName') || 'SEMOVI Oaxaca';
    this.headerSubtitle = this.appConfig.get('headerSubtitle') || this.appConfig.get('subtitle') || '';
    this.navScheduleLabel = this.appConfig.get('navScheduleLabel') || 'Agendar';
    this.navValidateLabel = this.appConfig.get('navValidateLabel') || 'Validar';
    this.routerSub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.currentUrl = this.cleanPath(evt.urlAfterRedirects || evt.url);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
      this.routerSub = null;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  private cleanPath(url: string): string {
    return (url || '/').split('?')[0].split('#')[0] || '/';
  }

  isActive(path: string): boolean {
    const current = this.currentUrl || '/';
    if (path === '/') {
      return current === '/' || current === '';
    }
    // Considerar subrutas como activas: /agendar-cita, /agendar-cita/step
    return current === path || current.startsWith(path + '/') || current.startsWith(path);
  }
}