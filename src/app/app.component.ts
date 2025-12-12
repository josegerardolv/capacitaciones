import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// COMPONENTES GLOBALES
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';
import { LoadingModalComponent, LoadingConfig } from './shared/components/modals/loading-modal.component';

// SERVICIOS
import { AppConfigService } from './core/services/app-config.service';
import { ComponentLoadingService } from './shared/services/component-loading.service';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // Solo importamos lo que se usa en el HTML global
  imports: [
    CommonModule,
    RouterOutlet,
    NotificationContainerComponent,
    LoadingModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'OAuth SEMOVI';

  // Configuración del Loading Global
  loadingOpen = false;
  loadingConfig: LoadingConfig = { title: 'Procesando', message: 'Por favor espera...', preventClose: true };
  private loadingSub: Subscription | null = null;

  constructor(
    private notificationService: NotificationService,
    private appConfig: AppConfigService,
    private componentLoading: ComponentLoadingService
  ) {
    // Constructor limpio: Solo configuración inicial de títulos/logos
    this.initAppConfig();
  }

  ngOnInit(): void {
    // 1. Suscripción al Loading Global (MANTENER ESTO, ES IMPORTANTE)
    this.loadingSub = this.componentLoading.globalLoading$.subscribe(isLoading => {
      this.loadingOpen = !!isLoading;
      if (isLoading) {
        const states = this.componentLoading.getActiveLoadingStates();
        if (states && states.length > 0) {
          this.loadingConfig.message = states[0].message || this.loadingConfig.message;
          this.loadingConfig.title = states[0].component || this.loadingConfig.title;
        }
      }
    });

    // 2. Debugging Temporal (Opcional, puedes dejarlo o quitarlo)
    if (typeof window !== 'undefined') {
      (window as any).notificationService = this.notificationService;
    }
  }

  ngOnDestroy(): void {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }

  // Helper para configurar título y logo
  private initAppConfig() {
    try {
      const title = this.appConfig.get('title');
      if (title) document.title = title;

      const logo = this.appConfig.get('logo');
      if (logo) {
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (link) link.href = logo;
      }
    } catch (e) {
      // Ignorar errores
    }
  }
}
