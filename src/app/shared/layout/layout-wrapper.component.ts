import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeaderComponent } from '../components/header/header.component';
import { NotificationPanelComponent } from '../components/notification-panel/notification-panel.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

/**
 * LayoutWrapperComponent - Componente contenedor principal del sistema
 * 
 * Proporciona la estructura base del layout con:
 * - Sidebar de navegación lateral
 * - Header superior con controles
 * - Área de contenido dinámico
 * - Panel de notificaciones funcional
 * 
 * Utiliza la paleta institucional institucional sin amarillos
 */
@Component({
    selector: 'app-layout-wrapper',
    imports: [
        CommonModule,
        RouterOutlet,
        SidebarComponent,
        HeaderComponent,
        NotificationPanelComponent
    ],
    template: `
    <div class="min-h-screen bg-white flex overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar 
        [isOpen]="sidebarOpen"
        [isCollapsed]="sidebarCollapsed"
        [isMobile]="isMobile"
        (toggleSidebar)="toggleSidebar()"
        (closeSidebar)="closeSidebar()"
        class="z-30 h-screen">
      </app-sidebar>

      <!-- Mobile sidebar overlay -->
      <div 
        *ngIf="sidebarOpen && isMobile"
        class="sidebar-overlay fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden"
        (click)="closeSidebar()"
        aria-hidden="true">
      </div>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden h-screen">
        <!-- Header -->
        <app-header
          [sidebarOpen]="sidebarOpen"
          [sidebarCollapsed]="sidebarCollapsed"
          [isMobile]="isMobile"
          [notificationCount]="notificationCount"
          [currentUser]="currentUser"
          (toggleSidebar)="toggleSidebar()"
          (collapseSidebar)="collapseSidebar()"
          (toggleNotifications)="toggleNotifications()"
          class="z-10 flex-shrink-0">
        </app-header>

        <!-- Main content -->
        <main class="flex-1 relative overflow-auto bg-white focus:outline-none">
          <div class="py-6">
            <div class="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>

      <!-- Notification Panel -->
      <app-notification-panel
        [isOpen]="notificationPanelOpen"
        [notifications]="notifications"
        (closePanel)="closeNotificationPanel()"
        (markAllAsRead)="markAllNotificationsAsRead()"
        (markAsRead)="markNotificationAsRead($event)"
        class="z-40">
      </app-notification-panel>
    </div>
  `,
    styles: []
})
export class LayoutWrapperComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado del componente
  sidebarOpen = true; // Abierto por defecto
  sidebarCollapsed = false; // Nueva propiedad para colapsar
  notificationPanelOpen = false;
  isMobile = false;
  
  // Datos del usuario y notificaciones
  currentUser: any = null;
  notifications: any[] = [];
  notificationCount = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.detectMobile();
    window.addEventListener('resize', () => this.detectMobile());
  }

  ngOnInit(): void {
    // PRIMERO: detectar tipo de dispositivo
    this.detectMobile();
    
    // SEGUNDO: cargar estado desde localStorage
    this.loadSidebarState();
    
    // Solo cargar datos si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.loadUserData();
      this.loadNotifications();
      this.setupNotificationSubscription();
      this.setupUserSubscription();
    } else {
      // Si no está autenticado, solo configurar suscripción para cuando se autentique
      this.setupUserSubscription();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.detectMobile());
  }

  /**
   * Configura la suscripción a cambios del usuario
   */
  private setupUserSubscription(): void {
    const currentUser$ = this.authService && (this.authService as any).currentUser$;
    if (!currentUser$ || typeof currentUser$.pipe !== 'function') {
      // No hay observable disponible; evitar errores y salir
      return;
    }

    currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: any) => {
          this.currentUser = user;
          // Si el usuario se autentica por primera vez, cargar notificaciones
          if (user && !this.notifications.length) {
            this.loadNotifications();
            this.setupNotificationSubscription();
          }
        },
        error: (error: any) => {
          // Error silencioso
        }
      });
  }

  /**
   * Detecta si la pantalla es móvil
   */
  private detectMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;
    
    // Si cambió de mobile a desktop o viceversa, recargar estado apropiado
    if (wasMobile !== this.isMobile) {
      this.loadSidebarState();
    }
  }

  /**
   * Inicializa el estado del sidebar basado en el dispositivo
   */
  private initializeSidebarState(): void {
    if (this.isMobile) {
      // En móvil: cerrado por defecto
      this.sidebarOpen = false;
      this.sidebarCollapsed = false;
    } else {
      // En desktop: abierto y expandido por defecto, 
      // pero mantener el estado previo si ya se había configurado
      if (!this.sidebarOpen && !this.sidebarCollapsed) {
        this.sidebarOpen = true;
        this.sidebarCollapsed = false;
      }
    }
  }

  /**
   * Carga el estado del sidebar desde localStorage
   */
  private loadSidebarState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedState = localStorage.getItem('sidebarState');
        if (savedState) {
          const state = JSON.parse(savedState);
          
          if (this.isMobile) {
            // En móvil: empezar cerrado por UX, pero respetamos estado de collapsed para cuando cambie a desktop
            this.sidebarOpen = false;
            this.sidebarCollapsed = state.sidebarCollapsed ?? false;
          } else {
            // En desktop: aplicar el estado guardado completamente
            this.sidebarOpen = state.sidebarOpen ?? true;
            this.sidebarCollapsed = state.sidebarCollapsed ?? false;
          }
        } else {
          // No hay estado guardado: usar valores por defecto según dispositivo
          this.sidebarOpen = this.isMobile ? false : true;
          this.sidebarCollapsed = false;
          // Guardar el estado por defecto para futuras cargas
          this.saveSidebarState();
        }
      } catch (error) {
        // En caso de error, usar valores por defecto según dispositivo
        this.sidebarOpen = this.isMobile ? false : true;
        this.sidebarCollapsed = false;
      }
    }
  }

  /**
   * Guarda el estado del sidebar en localStorage
   */
  private saveSidebarState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const state = {
          sidebarOpen: this.sidebarOpen,
          sidebarCollapsed: this.sidebarCollapsed
        };
        localStorage.setItem('sidebarState', JSON.stringify(state));
      } catch (error) {
        // Error silencioso
      }
    }
  }

  /**
   * Carga los datos del usuario actual
   */
  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  /**
   * Carga las notificaciones del usuario
   */
  private loadNotifications(): void {
    // Solo cargar notificaciones si hay usuario autenticado
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications: any[]) => {
          this.notifications = notifications;
          this.updateNotificationCount();
        },
        error: (error: any) => {
          // Si hay error de autenticación, limpiar sesión
          if (error.status === 401) {
            this.authService.clearSession();
          }
        }
      });
  }

  /**
   * Configura la suscripción a notificaciones en tiempo real
   */
  private setupNotificationSubscription(): void {
    // Comentado temporalmente hasta implementar WebSockets
    /*
    this.notificationService.getNotificationUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notification: any) => {
          this.notifications.unshift(notification);
          this.updateNotificationCount();
        }
      });
    */
  }

  /**
   * Actualiza el contador de notificaciones no leídas
   */
  private updateNotificationCount(): void {
    // Como no tenemos propiedad 'read', contar todas las notificaciones
    this.notificationCount = this.notifications.length;
  }

  /**
   * Toggle del sidebar - comportamiento diferente según dispositivo
   */
  toggleSidebar(): void {
    if (this.isMobile) {
      // En móvil: toggle simple open/close
      this.sidebarOpen = !this.sidebarOpen;
      // En móvil siempre está expandido cuando está abierto
      if (this.sidebarOpen) {
        this.sidebarCollapsed = false;
      }
    } else {
      // En desktop: el botón principal abre/cierra (show/hide)
      this.sidebarOpen = !this.sidebarOpen;
      // Si abrimos, asegurarnos que no quede colapsado
      if (this.sidebarOpen) {
        this.sidebarCollapsed = false;
      }
    }
    // Guardar estado SIEMPRE después de cambios
    this.saveSidebarState();
  }

  /**
   * Colapsa/expande el sidebar (solo desktop)
   */
  collapseSidebar(): void {
    if (!this.isMobile && this.sidebarOpen) {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      // Guardar estado SIEMPRE después de cambios
      this.saveSidebarState();
    }
  }

  /**
   * Cierra el sidebar completamente
   */
  closeSidebar(): void {
    if (this.isMobile) {
      // En móvil solo cerrar
      this.sidebarOpen = false;
    } else {
      // En desktop cerrar completamente
      this.sidebarOpen = false;
      this.sidebarCollapsed = false;
    }
    // Guardar estado SIEMPRE después de cambios
    this.saveSidebarState();
  }

  /**
   * Toggle del panel de notificaciones
   */
  toggleNotifications(): void {
    this.notificationPanelOpen = !this.notificationPanelOpen;
  }

  /**
   * Cierra el panel de notificaciones
   */
  closeNotificationPanel(): void {
    this.notificationPanelOpen = false;
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllNotificationsAsRead(): void {
    // Este método no está disponible en el NotificationService actual
    // Por ahora solo dismiss todas las notificaciones
    this.notificationService.dismissAll();
    this.notifications = [];
    this.updateNotificationCount();
  }

  /**
   * Marca una notificación específica como leída
   */
  markNotificationAsRead(notificationId: string): void {
    // Este método no está disponible en el NotificationService actual
    // Por ahora solo dismiss la notificación específica
    this.notificationService.dismiss(notificationId);
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateNotificationCount();
  }
}
