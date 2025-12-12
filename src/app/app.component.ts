import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, NavigationStart, Event } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LayoutWrapperComponent } from './shared/layout/layout-wrapper.component';
import { PublicLayoutComponent } from './shared/layout/public-layout.component';
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';
import { NotificationService } from './shared/services/notification.service';
import { AppConfigService } from './core/services/app-config.service';
import { LoadingModalComponent, LoadingConfig } from './shared/components/modals/loading-modal.component';
import { ComponentLoadingService } from './shared/services/component-loading.service';
import { Subscription } from 'rxjs';

type LayoutType = 'admin' | 'public' | 'none';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutWrapperComponent, PublicLayoutComponent, CommonModule, NotificationContainerComponent, LoadingModalComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'OAuth SEMOVI';
  
  // Rutas que no usan ningún layout (solo router-outlet directo)
  private readonly routesWithoutLayout = ['/login', '/404', '/unauthorized', '/auth/callback', '/callback', '/demo-formularios', '/demo-botones'];
  
  // Rutas que usan layout administrativo (con sidebar, header admin, notificaciones)
  private readonly adminRoutes = ['/admin'];
  
  // El resto de rutas usan layout público (header público + footer)
  
  // Estado actual del layout
  currentLayout: LayoutType = this.getLayoutTypeStatic();

  constructor(private router: Router, private notificationService: NotificationService, private appConfig: AppConfigService, private componentLoading: ComponentLoadingService) {
    // Validación inicial
    this.currentLayout = this.getLayoutType(this.router.url);
    
    // Escuchar TODOS los eventos de navegación para capturar redirecciones
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd | NavigationStart => 
          event instanceof NavigationEnd || event instanceof NavigationStart
        )
      )
      .subscribe((event: NavigationEnd | NavigationStart) => {
        // Actualizar en NavigationStart para redirecciones inmediatas
        if (event instanceof NavigationStart) {
          this.currentLayout = this.getLayoutType(event.url);
        }
        // Confirmar en NavigationEnd para navegación normal
        if (event instanceof NavigationEnd) {
          this.currentLayout = this.getLayoutType(event.url);
          
          // Verificación específica para redirecciones a 404
          if (event.url === '/404' || event.urlAfterRedirects === '/404') {
            this.currentLayout = 'none';
          }
        }
      });

    // Aplicar título y favicon desde la configuración de la aplicación
    try {
      const title = this.appConfig.get('title');
      if (title) {
        document.title = title;
      }

      const logo = this.appConfig.get('logo');
      if (logo) {
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = logo;
        }
      }
    } catch (e) {
      // En entornos de servidor o tests document puede no existir; ignorar errores
      // no hacemos nada aquí
    }
  }

  // Estado del modal de carga global
  loadingOpen = false;
  loadingConfig: LoadingConfig = { title: 'Procesando', message: 'Por favor espera...', preventClose: true };
  private loadingSub: Subscription | null = null;

  // Método estático para validación ultra-temprana del layout
  private getLayoutTypeStatic(): LayoutType {
    // Verificar la URL actual del navegador antes de cualquier inicialización
    const currentPath = window.location.pathname;
    return this.getLayoutTypeFromPath(currentPath);
  }

  // Determinar el tipo de layout según la ruta
  private getLayoutTypeFromPath(path: string): LayoutType {
    // Limpiar la ruta
    const cleanPath = path.split('?')[0].split('#')[0];
    
    // Verificar rutas sin layout
    const isRouteWithoutLayout = this.routesWithoutLayout.some(route => {
      if (cleanPath === route) return true;
      if (route === '/404' && cleanPath.includes('404')) return true;
      if (route === '/unauthorized' && cleanPath.includes('unauthorized')) return true;
      if (route === '/login' && cleanPath.includes('login')) return true;
      if (route === '/auth/callback' && cleanPath.includes('auth/callback')) return true;
      if (route === '/callback' && cleanPath.includes('callback')) return true;
      return false;
    });

    if (isRouteWithoutLayout) {
      return 'none';
    }

    // Verificar rutas admin
    const isAdminRoute = this.adminRoutes.some(route => cleanPath.startsWith(route));
    if (isAdminRoute) {
      return 'admin';
    }

    // Por defecto, usar layout público para el resto de rutas
    return 'public';
  }

  // Método público para obtener el tipo de layout actual
  getLayoutType(url: string): LayoutType {
    return this.getLayoutTypeFromPath(url);
  }

  ngOnInit(): void {
    // Verificación adicional al inicializar el componente
    this.currentLayout = this.getLayoutType(this.router.url);
    
    // Verificación extra para redirecciones lentas
    setTimeout(() => {
      this.currentLayout = this.getLayoutType(this.router.url);
    }, 100);

    // TEMPORAL: Exponer servicio de notificaciones para debugging
    if (typeof window !== 'undefined') {
      (window as any).notificationService = this.notificationService;
      console.log('[DEBUG] NotificationService expuesto en window.notificationService');
      console.log('[DEBUG] Métodos disponibles: debugNotifications(), forceCleanup()');
    }

    // Suscribirse al estado de carga global
    this.loadingSub = this.componentLoading.globalLoading$.subscribe(isLoading => {
      this.loadingOpen = !!isLoading;
      if (isLoading) {
        const states = this.componentLoading.getActiveLoadingStates();
        if (states && states.length > 0) {
          // tomar el mensaje del primer estado activo
          this.loadingConfig.message = states[0].message || this.loadingConfig.message;
          this.loadingConfig.title = states[0].component || this.loadingConfig.title;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
      this.loadingSub = null;
    }
  }

  // Métodos de conveniencia para el template
  get isAdminLayout(): boolean {
    return this.currentLayout === 'admin';
  }

  get isPublicLayout(): boolean {
    return this.currentLayout === 'public';
  }

  get isNoLayout(): boolean {
    return this.currentLayout === 'none';
  }
}
