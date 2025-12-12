import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AppConfigService } from '../../../core/services/app-config.service';
import { SIDEBAR_MENU_CONFIG, MenuItem, expandMenuForRoute, getParentItemForRoute } from './sidebar-menu.config';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { TooltipComponent, TooltipItem, TooltipPosition } from '../tooltip/tooltip.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * SidebarComponent - Barra lateral de navegación
 * 
 * Proporciona navegación vertical con:
 * - Menús basados en roles de usuario
 * - Submenús expandibles
 * - Diseño responsive con overlay en móvil
 * - Tooltips personalizados cuando está colapsado
 * - Paleta institucional (guinda, rosa, vino)
 */
@Component({
    selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, UniversalIconComponent, TooltipComponent],
    template: `
  <!-- Tooltip reutilizable -->
  <app-tooltip
      [visible]="tooltipVisible"
      [item]="tooltipItem"
      [position]="tooltipPosition"
      (mouseEnter)="keepTooltipVisible()"
      (mouseLeave)="hideTooltip()"
      (itemClick)="onTooltipItemClick($event)">
  </app-tooltip>

    <aside 
      class="sidebar-component bg-white shadow-xl h-screen flex flex-col font-sans select-none"
      [ngClass]="{
        'fixed inset-y-0 left-0 z-50': isMobile,
        'lg:static lg:inset-0': !isMobile,
        'translate-x-0': (isMobile && isOpen) || (!isMobile && isOpen),
        '-translate-x-full': isMobile && !isOpen,
        'w-64': (!isCollapsed && isOpen) || (isMobile && isOpen),
        'w-16': !isMobile && isCollapsed && isOpen,
        'w-0': !isMobile && !isOpen,
        'overflow-hidden': (!isMobile && isCollapsed) || (!isMobile && !isOpen)
      }"
      [style.transition]="'width 0.3s ease-in-out, transform 0.3s ease-in-out'"
      [style.will-change]="'transform, width'">
      
      <!-- Header del sidebar -->
      <div class="flex items-center px-4 py-4 bg-gradient-institucional text-white min-h-[80px] flex-shrink-0"
           [class.px-2]="!isMobile && isCollapsed"
           [class.justify-center]="!isMobile && isCollapsed">
        <div class="flex items-center space-x-3 w-full" 
             [class.space-x-0]="!isMobile && isCollapsed" 
             [class.justify-center]="!isMobile && isCollapsed">
          <!-- Área clicable ampliada: imagen + texto dentro del mismo enlace -->
          <a [routerLink]="['/']" title="Ir al inicio" class="inline-flex items-center space-x-3 focus:outline-none flex-1"
             [class.space-x-0]="!isMobile && isCollapsed"
             [class.justify-center]="!isMobile && isCollapsed">
            <img [src]="logo" 
                [alt]="title + ' Logo'" 
                class="w-10 h-10 object-contain flex-shrink-0">
            <div *ngIf="isMobile || !isCollapsed" 
                 class="flex flex-col"
                 [style.transition]="'opacity 0.3s ease-in-out'"
                 [style.opacity]="(isMobile || !isCollapsed) ? '1' : '0'">
              <div class="font-bold text-sm leading-tight break-words max-w-full">{{ title }}</div>
              <div class="text-xs text-white opacity-80 mt-0.5 break-words max-w-full">{{ subtitle }}</div>
            </div>
          </a>
        </div>
        
        <!-- Botón cerrar en móvil -->
        <a 
          *ngIf="isMobile"
          (click)="onCloseSidebar()"
          class="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 ml-2 p-1 flex-shrink-0"
          aria-label="Cerrar menú de navegación">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </a>
      </div>

      <!-- Navegación -->
      <nav class="sidebar-nav flex-1 px-2 py-4 space-y-1 overflow-y-auto"
           [class.px-1]="!isMobile && isCollapsed">
        <ng-container *ngFor="let item of menuItems">
          <!-- Item sin hijos -->
          <div *ngIf="!item.children && hasPermission(item.roles)">
            <a
              [routerLink]="item.route"
              routerLinkActive="sidebar-selected-item"
              [routerLinkActiveOptions]="{exact: item.route === '/'}"
              class="sidebar-item group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-institucional-primario hover:bg-gradient-to-r hover:from-institucional-primario/8 hover:to-institucional-secundario/8 transition-all duration-200 cursor-pointer"
              [class.justify-center]="!isMobile && isCollapsed"
              [class.px-3]="!isMobile && isCollapsed"
              [title]="(!isMobile && isCollapsed) ? item.label : null"
              [attr.tabindex]="0"
              (click)="onItemClick(item)"
              (keydown.enter)="onItemClick(item)"
              (keydown.space)="onItemClick(item)"
              (mouseenter)="showTooltip($event, item)"
              (mouseleave)="hideTooltip()">
              
              <app-universal-icon 
                [name]="item.icon" 
                [type]="item.iconType || 'bootstrap'"
                [size]="20" 
                class="flex-shrink-0 transition-colors duration-200"
                [class.mr-3]="isMobile || !isCollapsed">
              </app-universal-icon>
              <span [style.transition]="'opacity 0.3s ease-in-out, width 0.3s ease-in-out'" 
                    [style.opacity]="(!isMobile && isCollapsed) ? '0' : '1'"
                    [style.width]="(!isMobile && isCollapsed) ? '0' : 'auto'"
                    [style.overflow]="(!isMobile && isCollapsed) ? 'hidden' : 'visible'">{{ item.label }}</span>
            </a>
          </div>

          <!-- Item con hijos -->
          <div *ngIf="item.children && hasPermissionForAnyChild(item)" class="space-y-1">
            <a
              (click)="toggleSubmenu(item)"
              class="sidebar-item group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer"
              [ngClass]="{
                'text-institucional-primario bg-gradient-to-r from-institucional-primario/15 to-institucional-secundario/15 shadow-sm border-l-4 border-institucional-primario': item.expanded,
                'text-institucional-vino bg-gradient-to-r from-institucional-vino/10 to-institucional-primario/10 border-l-3 border-institucional-vino/50': !item.expanded && isParentOfActiveRoute(item),
                'text-gray-700 hover:text-institucional-primario hover:bg-gradient-to-r hover:from-institucional-primario/8 hover:to-institucional-secundario/8': !item.expanded && !isParentOfActiveRoute(item)
              }"
              [class.justify-center]="!isMobile && isCollapsed"
              [class.px-3]="!isMobile && isCollapsed"
              [title]="(!isMobile && isCollapsed) ? item.label : null"
              [attr.tabindex]="0"
              [attr.aria-expanded]="item.expanded"
              [attr.aria-label]="'Toggle ' + item.label + ' submenu'"
              (mouseenter)="showTooltip($event, item)"
              (mouseleave)="hideTooltip()">
              
              <div class="flex items-center"
                   [class.justify-center]="!isMobile && isCollapsed">
                <app-universal-icon 
                  [name]="item.icon" 
                  [type]="item.iconType || 'bootstrap'"
                  [size]="20" 
                  class="flex-shrink-0 transition-colors duration-200"
                  [class.mr-3]="isMobile || !isCollapsed">
                </app-universal-icon>
                <span [style.transition]="'opacity 0.3s ease-in-out, width 0.3s ease-in-out'" 
                      [style.opacity]="(!isMobile && isCollapsed) ? '0' : '1'"
                      [style.width]="(!isMobile && isCollapsed) ? '0' : 'auto'"
                      [style.overflow]="(!isMobile && isCollapsed) ? 'hidden' : 'visible'">{{ item.label }}</span>
              </div>
              
              <svg 
                *ngIf="isMobile || !isCollapsed"
                class="h-4 w-4 transition-transform duration-200"
                [class.rotate-90]="item.expanded"
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
            </a>

            <!-- Submenú - solo visible cuando no está colapsado -->
            <div 
              *ngIf="isMobile || !isCollapsed"
              class="space-y-1 pl-6 transition-all duration-200 overflow-hidden"
              [class.max-h-0]="!item.expanded"
              [class.max-h-96]="item.expanded">
              
              <ng-container *ngFor="let child of item.children">
                <a
                  *ngIf="hasPermission(child.roles)"
                  [routerLink]="child.route"
                  routerLinkActive="sidebar-selected-subitem"
                  class="sidebar-item group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-institucional-secundario hover:bg-gradient-to-r hover:from-institucional-secundario/10 hover:to-institucional-primario/10 transition-all duration-200 cursor-pointer border-l-2 border-transparent hover:border-institucional-secundario/30"
                  [attr.tabindex]="0"
                  (click)="onItemClick(child)"
                  (keydown.enter)="onItemClick(child)"
                  (keydown.space)="onItemClick(child)">
                  
                  <app-universal-icon 
                    [name]="child.icon" 
                    [type]="child.iconType || 'bootstrap'"
                    [size]="18" 
                    class="mr-3 flex-shrink-0 transition-colors duration-200">
                  </app-universal-icon>                 
                  {{ child.label }}
                </a>
              </ng-container>
            </div>
          </div>
        </ng-container>
      </nav>
      
      <!-- Footer del sidebar (simplificado) -->
      <div class="px-4 py-3 border-t border-institucional-primario border-opacity-20 bg-white" [class.px-2]="isCollapsed">
        <div class="flex flex-col items-center gap-1">
          <a [routerLink]="['/']" title="Ir al inicio" class="inline-block">
            <img [src]="footerLogoComputed" [alt]="orgName" class="object-contain flex-shrink-0"
                   [class.h-10]="isFooterLogoVertical"
                   [class.h-5]="!isFooterLogoVertical"
                   aria-hidden="false"/>
          </a>
          <p></p>
          <div class="text-institucional-primario font-bold text-center leading-tight"
               [style.fontSize.px]="isFooterLogoVertical ? 8 : 12">
            © {{ currentYear }}
          </div>
        </div>
      </div>
      </aside>
  `,
    styles: [`
    /* Estilos institucionales para items seleccionados */
    .sidebar-selected-item {
      background: linear-gradient(135deg, var(--institucional-primario) 0%, var(--institucional-secundario) 100%) !important;
      color: white !important;
      box-shadow: 0 2px 4px rgba(98, 17, 50, 0.2);
      border-left: 4px solid var(--institucional-vino);
    }
    
    .sidebar-selected-item .universal-icon {
      color: white !important;
    }
    
    .sidebar-selected-subitem {
      background: linear-gradient(135deg, var(--institucional-secundario) 0%, var(--institucional-primario) 100%) !important;
      color: white !important;
      box-shadow: 0 1px 3px rgba(157, 36, 73, 0.2);
      border-left: 3px solid var(--institucional-vino) !important;
    }
    
    .sidebar-selected-subitem .universal-icon {
      color: white !important;
    }
    
    /* Efecto para items padre que contienen rutas activas */
    .parent-contains-active {
      background: linear-gradient(135deg, var(--institucional-vino)/10 0%, var(--institucional-primario)/10 100%);
      border-left: 3px solid var(--institucional-vino)/50;
      color: var(--institucional-vino);
      font-weight: 600;
    }
    
    /* Efecto hover mejorado para items padre expandidos */
    .sidebar-item.parent-expanded {
      background: linear-gradient(135deg, var(--institucional-primario)/15 0%, var(--institucional-secundario)/15 100%);
      border-left: 3px solid var(--institucional-primario);
    }
    
    /* Animación suave para cambios de estado */
    .sidebar-item {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = true;
  @Input() isCollapsed = false;
  @Input() isMobile = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = SIDEBAR_MENU_CONFIG;
  currentRoute = '';
  currentParentItem: MenuItem | null = null;
  private routerSubscription?: Subscription;

  // Año actual para el footer
  currentYear: number = new Date().getFullYear();

  // Propiedades para tooltips
  tooltipVisible = false;
  tooltipItem: TooltipItem | null = null;
  tooltipPosition: TooltipPosition = { x: 0, y: 0 };
  private tooltipTimeout: any;

  // App config (title, logos, etc.)
  title = '';
  subtitle = '';
  logo = '';
  footerLogo = '';
  orgName = '';

  /**
   * Devuelve el logo del footer; si el sidebar está colapsado y el logo es
   * `logo_movilidad.svg`, devuelve `logo_movilidad_vertical.svg` en la misma carpeta.
   */
  get footerLogoComputed(): string {
    if (this.isCollapsed && this.footerLogo) {
      try {
        const fileName = this.footerLogo.split('/').pop() || this.footerLogo;
        if (fileName === 'logo_movilidad.svg') {
          return this.footerLogo.replace('logo_movilidad.svg', 'logo_movilidad_vertical.svg');
        }
      } catch (e) {
        // en caso de path inesperado, devolver el original
        return this.footerLogo;
      }
    }
    return this.footerLogo;
  }

  /**
   * Indica si el logo actual del footer es la versión vertical.
   */
  get isFooterLogoVertical(): boolean {
    const path = this.footerLogoComputed || '';
    return path.split('/').pop() === 'logo_movilidad_vertical.svg';
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private permissionService: PermissionService,
    private appConfig: AppConfigService
  ) {
    const cfg = this.appConfig.getAll();
    this.title = cfg.title;
    this.subtitle = cfg.subtitle || '';
    this.logo = cfg.logo || '';
    this.footerLogo = cfg.footerLogo || '';
    this.orgName = cfg.orgName || '';
  }

  ngOnInit(): void {
    // Si el componente no recibe inputs del padre, cargar estado desde localStorage
    this.loadSidebarStateIfNeeded();
    
    // Configurar seguimiento de ruta actual
    this.currentRoute = this.router.url;
    this.updateMenuForCurrentRoute();
    
    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateMenuForCurrentRoute();
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Actualiza el estado del menú basado en la ruta actual
   */
  private updateMenuForCurrentRoute(): void {
    // Expandir automáticamente el menú padre basado en la ruta actual
    expandMenuForRoute(this.currentRoute);
    
    // Obtener el item padre para la ruta actual
    this.currentParentItem = getParentItemForRoute(this.currentRoute);
  }

  /**
   * Carga el estado del sidebar desde localStorage solo si no se está controlando desde el padre
   */
  private loadSidebarStateIfNeeded(): void {
    // Solo cargar estado si parece que no está siendo controlado por el componente padre
    // (esto es un fallback para casos donde el sidebar se use independientemente)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedState = localStorage.getItem('sidebarState');
        if (savedState) {
          const state = JSON.parse(savedState);
          
          // Solo aplicar si los valores actuales son los defaults
          if (this.isOpen === true && this.isCollapsed === false) {
            this.isOpen = state.sidebarOpen ?? true;
            this.isCollapsed = state.sidebarCollapsed ?? false;
          }
        }
      } catch (error) {
        // Error silencioso
      }
    }
    
    // Aplicar reglas por dispositivo si es necesario
    if (this.isMobile && this.isOpen) {
      this.isOpen = false;
    }
  }

  /**
   * Verifica si el usuario tiene permisos para ver un elemento del menú
   */
  hasPermission(roles?: string[]): boolean {
    return this.permissionService.checkAnyRole(roles || []);
  }

  /**
   * Verifica si el usuario tiene permisos para ver al menos un subitem
   * Solo muestra el menú padre si tiene acceso a alguno de sus hijos
   */
  hasPermissionForAnyChild(item: MenuItem): boolean {
    if (!item.children || item.children.length === 0) {
      return this.hasPermission(item.roles);
    }

    // Verificar si tiene permisos para al menos uno de los subitems
    return item.children.some(child => this.hasPermission(child.roles));
  }

  /**
   * Verifica si un item padre contiene la ruta activa
   */
  isParentOfActiveRoute(item: MenuItem): boolean {
    if (!item.children || item.children.length === 0) {
      return false;
    }
    
    const cleanRoute = this.currentRoute.split('?')[0].split('#')[0];
    return item.children.some(child => {
      if (child.route) {
        return cleanRoute === child.route || cleanRoute.startsWith(child.route + '/');
      }
      return false;
    });
  }

  /**
   * Toggle de submenú
   */
  toggleSubmenu(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  /**
   * Maneja el click en un item del menú
   */
  onItemClick(item: MenuItem): void {
    if (this.isMobile) {
      this.onCloseSidebar();
    }
  }

  /**
   * Emite evento para cerrar sidebar
   */
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  /**
   * Muestra el tooltip cuando el sidebar está colapsado
   */
  showTooltip(event: MouseEvent, item: MenuItem): void {
    if (!this.isCollapsed || this.isMobile) return;

    clearTimeout(this.tooltipTimeout);
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: rect.right + 8,
      y: rect.top + (rect.height / 2) - 20
    };
    
    // Convertir MenuItem a TooltipItem
    this.tooltipItem = this.convertMenuItemToTooltipItem(item);
    this.tooltipVisible = true;
  }

  /**
   * Convierte un MenuItem a TooltipItem
   */
  private convertMenuItemToTooltipItem(item: MenuItem): TooltipItem {
    return {
      label: item.label,
      icon: item.icon,
      iconType: item.iconType,
      route: item.route,
      children: item.children?.map(child => this.convertMenuItemToTooltipItem(child))
    };
  }

  /**
   * Maneja los clicks en items del tooltip
   */
  onTooltipItemClick(item: TooltipItem): void {
    this.hideTooltip();
    if (this.isMobile) {
      this.onCloseSidebar();
    }
  }

  /**
   * Oculta el tooltip
   */
  hideTooltip(): void {
    this.tooltipTimeout = setTimeout(() => {
      this.tooltipVisible = false;
      this.tooltipItem = null;
    }, 100);
  }

  /**
   * Mantiene el tooltip visible cuando el mouse está sobre él
   */
  keepTooltipVisible(): void {
    clearTimeout(this.tooltipTimeout);
  }
}
