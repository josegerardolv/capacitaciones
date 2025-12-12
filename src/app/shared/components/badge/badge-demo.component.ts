import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalBadgeComponent, BadgeGroupComponent, BadgeItem, BadgeConfig } from '../badge';

@Component({
  selector: 'app-badge-demo',
  standalone: true,
  imports: [CommonModule, InstitutionalBadgeComponent, BadgeGroupComponent],
  template: `
    <div class="badge-demo-container">
      <div class="demo-section">
        <h2 class="demo-title">Componente Badge Institucional</h2>
        <p class="demo-description">
          Componente reutilizable de badges que mantiene coherencia con el diseño institucional.
        </p>
      </div>

      <!-- Ejemplos de Variantes -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Variantes de Color</h3>
        <div class="demo-grid">
          <app-institutional-badge [config]="{ variant: 'primary' }">Primary</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'secondary' }">Secondary</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'success' }">Success</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'warning' }">Warning</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'danger' }">Danger</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'info' }">Info</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'light' }">Light</app-institutional-badge>
          <app-institutional-badge [config]="{ variant: 'dark' }">Dark</app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos de Tamaños -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Tamaños</h3>
        <div class="demo-grid">
          <app-institutional-badge [config]="{ size: 'small' }">Small</app-institutional-badge>
          <app-institutional-badge [config]="{ size: 'medium' }">Medium</app-institutional-badge>
          <app-institutional-badge [config]="{ size: 'large' }">Large</app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos de Variantes Outline -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Variantes Outline</h3>
        <div class="demo-grid">
          <app-institutional-badge [config]="outlinePrimary">Primary Outline</app-institutional-badge>
          <app-institutional-badge [config]="outlineSecondary">Secondary Outline</app-institutional-badge>
          <app-institutional-badge [config]="outlineSuccess">Success Outline</app-institutional-badge>
          <app-institutional-badge [config]="outlineWarning">Warning Outline</app-institutional-badge>
          <app-institutional-badge [config]="outlineDanger">Danger Outline</app-institutional-badge>
          <app-institutional-badge [config]="outlineInfo">Info Outline</app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos con Iconos -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Badges con Iconos</h3>
        <div class="demo-grid">
          <app-institutional-badge [config]="{ icon: 'star', iconPosition: 'left' }">Favorito</app-institutional-badge>
          <app-institutional-badge [config]="{ icon: 'verified', iconPosition: 'left', variant: 'success' }">Verificado</app-institutional-badge>
          <app-institutional-badge [config]="{ icon: 'warning', iconPosition: 'left', variant: 'warning' }">Advertencia</app-institutional-badge>
          <app-institutional-badge [config]="{ icon: 'error', iconPosition: 'left', variant: 'danger' }">Error</app-institutional-badge>
          <app-institutional-badge [config]="{ icon: 'arrow_forward', iconPosition: 'right', variant: 'info' }">Siguiente</app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos Interactivos -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Badges Interactivos</h3>
        <div class="demo-grid">
          <app-institutional-badge 
            [config]="{ clickable: true, variant: 'primary' }"
            (badgeClick)="onBadgeClick('Clickable badge clicked!')">
            Clickable
          </app-institutional-badge>
          <app-institutional-badge 
            [config]="{ closable: true, variant: 'secondary' }"
            (badgeClose)="onBadgeClose('Badge closed!')">
            Closable
          </app-institutional-badge>
          <app-institutional-badge 
            [config]="{ clickable: true, closable: true, variant: 'info' }"
            (badgeClick)="onBadgeClick('Interactive badge clicked!')"
            (badgeClose)="onBadgeClose('Interactive badge closed!')">
            Interactive
          </app-institutional-badge>
          <app-institutional-badge 
            [config]="{ disabled: true, variant: 'warning' }">
            Disabled
          </app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos con Tooltips -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Badges con Tooltips</h3>
        <div class="demo-grid">
          <app-institutional-badge 
            [config]="{ tooltip: 'Este badge tiene información adicional', variant: 'primary' }">
            Hover me
          </app-institutional-badge>
          <app-institutional-badge 
            [config]="{ tooltip: 'Badge de estado activo', variant: 'success', icon: 'check_circle', iconPosition: 'left' }">
            Activo
          </app-institutional-badge>
        </div>
      </div>

      <!-- Ejemplos de Agrupación -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Agrupación de Badges</h3>
        
        <h4 class="demo-subsubtitle">Horizontal (por defecto)</h4>
        <app-badge-group 
          [badges]="horizontalBadges"
          [config]="{ spacing: 'normal' }"
          (badgeClick)="onGroupBadgeClick($event)"
          (badgeClose)="onGroupBadgeClose($event)">
        </app-badge-group>

        <h4 class="demo-subsubtitle">Vertical</h4>
        <app-badge-group 
          [badges]="verticalBadges"
          [config]="{ orientation: 'vertical', spacing: 'tight' }"
          (badgeClick)="onGroupBadgeClick($event)"
          (badgeClose)="onGroupBadgeClose($event)">
        </app-badge-group>

        <h4 class="demo-subsubtitle">Con límite y "Ver más"</h4>
        <app-badge-group 
          [badges]="manyBadges"
          [config]="{ maxItems: 3, showMoreText: 'Ver más categorías' }"
          (badgeClick)="onGroupBadgeClick($event)"
          (badgeClose)="onGroupBadgeClose($event)"
          (showMore)="onShowMore($event)">
        </app-badge-group>
      </div>

      <!-- Casos de Uso Comunes -->
      <div class="demo-section">
        <h3 class="demo-subtitle">Casos de Uso Comunes</h3>
        
        <div class="use-case">
          <h4 class="demo-subsubtitle">Estados de Usuario</h4>
          <div class="demo-grid">
            <app-institutional-badge [config]="{ variant: 'success', icon: 'verified_user', iconPosition: 'left' }">Activo</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'warning', icon: 'schedule', iconPosition: 'left' }">Pendiente</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'danger', icon: 'block', iconPosition: 'left' }">Bloqueado</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'light', icon: 'pause_circle', iconPosition: 'left' }">Inactivo</app-institutional-badge>
          </div>
        </div>

        <div class="use-case">
          <h4 class="demo-subsubtitle">Roles y Permisos</h4>
          <div class="demo-grid">
            <app-institutional-badge [config]="{ variant: 'primary', icon: 'admin_panel_settings', iconPosition: 'left' }">Admin</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'secondary', icon: 'supervisor_account', iconPosition: 'left' }">Supervisor</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'info', icon: 'person', iconPosition: 'left' }">Usuario</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'light', icon: 'visibility', iconPosition: 'left' }">Solo lectura</app-institutional-badge>
          </div>
        </div>

        <div class="use-case">
          <h4 class="demo-subsubtitle">Prioridades</h4>
          <div class="demo-grid">
            <app-institutional-badge [config]="{ variant: 'danger', icon: 'priority_high', iconPosition: 'left', size: 'small' }">Alta</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'warning', icon: 'remove', iconPosition: 'left', size: 'small' }">Media</app-institutional-badge>
            <app-institutional-badge [config]="{ variant: 'info', icon: 'low_priority', iconPosition: 'left', size: 'small' }">Baja</app-institutional-badge>
          </div>
        </div>

        <div class="use-case">
          <h4 class="demo-subsubtitle">Categorías Dinámicas</h4>
          <app-badge-group 
            [badges]="categoryBadges"
            [config]="{ spacing: 'normal' }"
            (badgeClick)="onCategoryClick($event)"
            (badgeClose)="onCategoryRemove($event)">
          </app-badge-group>
        </div>
      </div>

      <!-- Mensaje de eventos -->
      <div class="demo-section" *ngIf="lastMessage">
        <div class="demo-message">
          {{ lastMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge-demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Montserrat', sans-serif;
    }

    .demo-section {
      margin-bottom: 3rem;
    }

    .demo-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--institucional-primario);
      margin-bottom: 0.5rem;
    }

    .demo-subtitle {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--institucional-secundario);
      margin-bottom: 1rem;
    }

    .demo-subsubtitle {
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: 0.75rem;
      margin-top: 1.5rem;
    }

    .demo-description {
      font-size: 1rem;
      color: var(--gray-600);
      margin-bottom: 1rem;
    }

    .demo-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .use-case {
      margin-bottom: 2rem;
    }

    .demo-message {
      background-color: var(--gray-100);
      border-left: 4px solid var(--institucional-primario);
      padding: 1rem;
      border-radius: 0.5rem;
      font-style: italic;
      color: var(--gray-700);
    }

    @media (max-width: 640px) {
      .badge-demo-container {
        padding: 1rem;
      }

      .demo-grid {
        gap: 0.5rem;
      }

      .demo-title {
        font-size: 1.5rem;
      }

      .demo-subtitle {
        font-size: 1.25rem;
      }
    }
  `]
})
export class BadgeDemoComponent {
  lastMessage = '';

  // Configuraciones de ejemplo
  outlinePrimary: BadgeConfig = { variant: 'primary', customClass: 'institutional-badge-outline' };
  outlineSecondary: BadgeConfig = { variant: 'secondary', customClass: 'institutional-badge-outline' };
  outlineSuccess: BadgeConfig = { variant: 'success', customClass: 'institutional-badge-outline' };
  outlineWarning: BadgeConfig = { variant: 'warning', customClass: 'institutional-badge-outline' };
  outlineDanger: BadgeConfig = { variant: 'danger', customClass: 'institutional-badge-outline' };
  outlineInfo: BadgeConfig = { variant: 'info', customClass: 'institutional-badge-outline' };

  // Datos para agrupación
  horizontalBadges: BadgeItem[] = [
    { id: '1', content: 'Angular', variant: 'primary' },
    { id: '2', content: 'TypeScript', variant: 'info' },
    { id: '3', content: 'CSS', variant: 'success' },
    { id: '4', content: 'HTML', variant: 'warning' },
  ];

  verticalBadges: BadgeItem[] = [
    { id: '5', content: 'Administrador', variant: 'primary', icon: 'admin_panel_settings', iconPosition: 'left' },
    { id: '6', content: 'Supervisor', variant: 'secondary', icon: 'supervisor_account', iconPosition: 'left' },
    { id: '7', content: 'Usuario', variant: 'info', icon: 'person', iconPosition: 'left' },
  ];

  manyBadges: BadgeItem[] = [
    { id: '8', content: 'Frontend', variant: 'primary' },
    { id: '9', content: 'Backend', variant: 'secondary' },
    { id: '10', content: 'DevOps', variant: 'info' },
    { id: '11', content: 'Testing', variant: 'success' },
    { id: '12', content: 'Design', variant: 'warning' },
    { id: '13', content: 'Mobile', variant: 'danger' },
  ];

  categoryBadges: BadgeItem[] = [
    { id: '14', content: 'Urgente', variant: 'danger', closable: true, clickable: true },
    { id: '15', content: 'En revisión', variant: 'warning', closable: true, clickable: true },
    { id: '16', content: 'Aprobado', variant: 'success', closable: true, clickable: true },
  ];

  onBadgeClick(message: string) {
    this.lastMessage = `Evento: ${message}`;
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onBadgeClose(message: string) {
    this.lastMessage = `Evento: ${message}`;
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onGroupBadgeClick(event: { badge: BadgeItem, event: Event }) {
    this.lastMessage = `Evento: Badge "${event.badge.content}" clickeado en grupo`;
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onGroupBadgeClose(event: { badge: BadgeItem, event: Event }) {
    this.lastMessage = `Evento: Badge "${event.badge.content}" cerrado en grupo`;
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onShowMore(event: Event) {
    this.lastMessage = 'Evento: "Ver más" clickeado - implementar lógica para mostrar todos los badges';
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onCategoryClick(event: { badge: BadgeItem, event: Event }) {
    this.lastMessage = `Evento: Categoría "${event.badge.content}" seleccionada`;
    setTimeout(() => this.lastMessage = '', 3000);
  }

  onCategoryRemove(event: { badge: BadgeItem, event: Event }) {
    // Eliminar badge de la lista
    this.categoryBadges = this.categoryBadges.filter(badge => badge.id !== event.badge.id);
    this.lastMessage = `Evento: Categoría "${event.badge.content}" eliminada`;
    setTimeout(() => this.lastMessage = '', 3000);
  }
}