import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalButtonComponent, ButtonConfig } from './institutional-button.component';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';
export type ButtonGroupSize = 'small' | 'medium' | 'large';
export type ButtonGroupAlignment = 'start' | 'center' | 'end' | 'stretch';

export interface ButtonGroupButton {
  id: string;
  label: string;
  config: ButtonConfig;
  visible?: boolean;
  tooltip?: string;
}

export interface ButtonGroupConfig {
  orientation?: ButtonGroupOrientation;
  size?: ButtonGroupSize;
  alignment?: ButtonGroupAlignment;
  fullWidth?: boolean;
  separated?: boolean;
  outlined?: boolean;
  customClass?: string;
  responsive?: boolean;
}

@Component({
  selector: 'app-button-group',
  standalone: true,
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
    <div 
      [class]="getGroupClasses()" 
      role="group" 
      [attr.aria-label]="ariaLabel">
      
      <app-institutional-button
        *ngFor="let button of visibleButtons; trackBy: trackByFn"
        [config]="getButtonConfig(button)"
        [title]="button.tooltip"
        (buttonClick)="onButtonClick(button.id, $event)">
        {{ button.label }}
      </app-institutional-button>
    </div>
  `,
  styles: [`
    /* Grupos horizontales */
    .btn-group-horizontal {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
    }
    
    .btn-group-horizontal.btn-group-separated {
      gap: 0.5rem;
    }
    
    .btn-group-horizontal:not(.btn-group-separated) app-institutional-button:not(:first-child) :deep(.institutional-btn) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      margin-left: -1px;
    }
    
    .btn-group-horizontal:not(.btn-group-separated) app-institutional-button:not(:last-child) :deep(.institutional-btn) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    .btn-group-horizontal:not(.btn-group-separated) app-institutional-button:hover :deep(.institutional-btn) {
      z-index: 2;
      position: relative;
    }
    
    /* Grupos verticales */
    .btn-group-vertical {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: fit-content;
    }
    
    .btn-group-vertical.btn-group-separated {
      gap: 0.5rem;
    }
    
    .btn-group-vertical:not(.btn-group-separated) app-institutional-button:not(:first-child) :deep(.institutional-btn) {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      margin-top: -1px;
    }
    
    .btn-group-vertical:not(.btn-group-separated) app-institutional-button:not(:last-child) :deep(.institutional-btn) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    .btn-group-vertical:not(.btn-group-separated) app-institutional-button:hover :deep(.institutional-btn) {
      z-index: 2;
      position: relative;
    }
    
    /* Alineación */
    .btn-group-align-start {
      justify-content: flex-start;
    }
    
    .btn-group-align-center {
      justify-content: center;
    }
    
    .btn-group-align-end {
      justify-content: flex-end;
    }
    
    .btn-group-align-stretch app-institutional-button {
      flex: 1;
    }
    
    /* Ancho completo */
    .btn-group-full-width {
      width: 100%;
    }
    
    .btn-group-full-width.btn-group-horizontal app-institutional-button {
      flex: 1;
    }
    
    /* Outlined groups */
    .btn-group-outlined {
      border: 2px solid var(--institucional-primario);
      border-radius: 0.5rem;
      padding: 0.25rem;
      background-color: rgba(139, 21, 56, 0.02);
    }
    
    /* Responsivo */
    @media (max-width: 640px) {
      .btn-group-responsive.btn-group-horizontal {
        flex-direction: column;
      }
      
      .btn-group-responsive.btn-group-horizontal:not(.btn-group-separated) app-institutional-button:not(:first-child) :deep(.institutional-btn) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom-left-radius: 0.5rem;
        margin-left: 0;
        margin-top: -1px;
      }
      
      .btn-group-responsive.btn-group-horizontal:not(.btn-group-separated) app-institutional-button:not(:last-child) :deep(.institutional-btn) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0.5rem;
      }
    }
  `]
})
export class ButtonGroupComponent implements OnInit {
  @Input() buttons: ButtonGroupButton[] = [];
  @Input() config: ButtonGroupConfig = {};
  @Input() ariaLabel?: string;
  @Output() buttonClick = new EventEmitter<{ buttonId: string; event: Event }>();

  visibleButtons: ButtonGroupButton[] = [];

  ngOnInit() {
    // Set defaults
    this.config = {
      orientation: 'horizontal',
      size: 'medium',
      alignment: 'start',
      fullWidth: false,
      separated: false,
      outlined: false,
      responsive: true,
      ...this.config
    };

    this.updateVisibleButtons();
  }

  ngOnChanges() {
    this.updateVisibleButtons();
  }

  private updateVisibleButtons() {
    this.visibleButtons = this.buttons.filter(button => button.visible !== false);
  }

  getGroupClasses(): string {
    const classes = [
      'btn-group',
      `btn-group-${this.config.orientation}`,
      `btn-group-${this.config.size}`,
      `btn-group-align-${this.config.alignment}`
    ];

    if (this.config.fullWidth) {
      classes.push('btn-group-full-width');
    }

    if (this.config.separated) {
      classes.push('btn-group-separated');
    }

    if (this.config.outlined) {
      classes.push('btn-group-outlined');
    }

    if (this.config.responsive) {
      classes.push('btn-group-responsive');
    }

    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }

    return classes.join(' ');
  }

  getButtonConfig(button: ButtonGroupButton): ButtonConfig {
    const baseConfig = { ...button.config };
    
    // Override size if group size is specified
    if (!baseConfig.size) {
      baseConfig.size = this.config.size === 'small' ? 'small' :
                      this.config.size === 'large' ? 'large' : 'medium';
    }

    // Full width for stretch alignment in vertical groups
    if (this.config.alignment === 'stretch' && this.config.orientation === 'vertical') {
      baseConfig.fullWidth = true;
    }

    return baseConfig;
  }

  onButtonClick(buttonId: string, event: Event) {
    this.buttonClick.emit({ buttonId, event });
  }

  trackByFn(index: number, button: ButtonGroupButton): string {
    return button.id;
  }
}

// Factory functions para casos comunes
export class ButtonGroupFactory {
  
  /**
   * Crea un grupo de acciones CRUD típico
   */
  static createCrudActions(options: {
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    size?: ButtonGroupSize;
    separated?: boolean;
  } = {}): ButtonGroupButton[] {
    const buttons: ButtonGroupButton[] = [];
    
    if (options.showView !== false) {
      buttons.push({
        id: 'view',
        label: '',
        config: {
          variant: 'info',
          icon: 'visibility',
          iconPosition: 'only',
          size: options.size || 'small',
          ariaLabel: 'Ver detalles'
        },
        tooltip: 'Ver detalles'
      });
    }
    
    if (options.showEdit !== false) {
      buttons.push({
        id: 'edit',
        label: '',
        config: {
          variant: 'warning',
          icon: 'edit',
          iconPosition: 'only',
          size: options.size || 'small',
          ariaLabel: 'Editar'
        },
        tooltip: 'Editar'
      });
    }
    
    if (options.showDelete !== false) {
      buttons.push({
        id: 'delete',
        label: '',
        config: {
          variant: 'danger',
          icon: 'delete',
          iconPosition: 'only',
          size: options.size || 'small',
          ariaLabel: 'Eliminar'
        },
        tooltip: 'Eliminar'
      });
    }
    
    return buttons;
  }

  /**
   * Crea un grupo de botones de formulario típico
   */
  static createFormActions(options: {
    showCancel?: boolean;
    showSave?: boolean;
    showReset?: boolean;
    isLoading?: boolean;
    isValid?: boolean;
  } = {}): ButtonGroupButton[] {
    const buttons: ButtonGroupButton[] = [];
    
    if (options.showCancel !== false) {
      buttons.push({
        id: 'cancel',
        label: 'Cancelar',
        config: {
          variant: 'ghost',
          size: 'medium'
        }
      });
    }
    
    if (options.showReset !== false) {
      buttons.push({
        id: 'reset',
        label: 'Limpiar',
        config: {
          variant: 'light',
          icon: 'refresh',
          iconPosition: 'left',
          size: 'medium'
        }
      });
    }
    
    if (options.showSave !== false) {
      buttons.push({
        id: 'save',
        label: 'Guardar',
        config: {
          variant: 'primary',
          icon: 'save',
          iconPosition: 'left',
          size: 'medium',
          type: 'submit',
          loading: options.isLoading,
          disabled: options.isValid === false
        }
      });
    }
    
    return buttons;
  }

  /**
   * Crea un grupo de filtros/tabs
   */
  static createFilterTabs(filters: Array<{
    id: string;
    label: string;
    active?: boolean;
    count?: number;
  }>): ButtonGroupButton[] {
    return filters.map(filter => ({
      id: filter.id,
      label: filter.count !== undefined ? `${filter.label} (${filter.count})` : filter.label,
      config: {
        variant: filter.active ? 'primary' : 'ghost',
        size: 'medium'
      }
    }));
  }

  /**
   * Crea botones de navegación
   */
  static createPagination(options: {
    currentPage: number;
    totalPages: number;
    showFirstLast?: boolean;
  }): ButtonGroupButton[] {
    const buttons: ButtonGroupButton[] = [];
    const { currentPage, totalPages, showFirstLast = true } = options;
    
    if (showFirstLast) {
      buttons.push({
        id: 'first',
        label: '',
        config: {
          variant: 'ghost',
          icon: 'first_page',
          iconPosition: 'only',
          disabled: currentPage === 1,
          ariaLabel: 'Primera página'
        }
      });
    }
    
    buttons.push({
      id: 'prev',
      label: '',
      config: {
        variant: 'ghost',
        icon: 'chevron_left',
        iconPosition: 'only',
        disabled: currentPage === 1,
        ariaLabel: 'Página anterior'
      }
    });
    
    // Páginas visibles (lógica simplificada)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push({
        id: `page-${i}`,
        label: i.toString(),
        config: {
          variant: i === currentPage ? 'primary' : 'ghost',
          size: 'small'
        }
      });
    }
    
    buttons.push({
      id: 'next',
      label: '',
      config: {
        variant: 'ghost',
        icon: 'chevron_right',
        iconPosition: 'only',
        disabled: currentPage === totalPages,
        ariaLabel: 'Página siguiente'
      }
    });
    
    if (showFirstLast) {
      buttons.push({
        id: 'last',
        label: '',
        config: {
          variant: 'ghost',
          icon: 'last_page',
          iconPosition: 'only',
          disabled: currentPage === totalPages,
          ariaLabel: 'Última página'
        }
      });
    }
    
    return buttons;
  }
}