import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'light' 
  | 'dark' 
  | 'link' 
  | 'ghost'
  | 'modal-close';

export type ButtonSize = 'small' | 'medium' | 'large' | 'extra-large';

export type IconPosition = 'left' | 'right' | 'only';

export interface ButtonConfig {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: IconPosition;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  title?: string;
  customClass?: string;
  customWidth?: string;
  customHeight?: string;
  customFontSize?: string;
}

@Component({
  selector: 'app-institutional-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="config.type || 'button'"
      [class]="getButtonClasses()"
      [style]="getCustomStyles()"
      [disabled]="config.disabled || config.loading"
      [aria-label]="config.ariaLabel || null"
      [title]="config.title || null"
  (click)="onClick($event)">
      
      <!-- Loading spinner -->
      <span
        *ngIf="config.loading"
        class="institutional-btn-spinner"
        aria-hidden="true">
      </span>
      
      <!-- Left icon -->
      <span
        *ngIf="config.icon && config.iconPosition === 'left' && !config.loading"
        class="material-symbols-outlined institutional-btn-icon-left"
        aria-hidden="true">
        {{ config.icon }}
      </span>
      
      <!-- Button text content -->
      <span
        *ngIf="config.iconPosition !== 'only'"
        class="institutional-btn-text"
        [class.institutional-btn-text-loading]="config.loading">
        <ng-content></ng-content>
      </span>
      
      <!-- Right icon -->
      <span
        *ngIf="config.icon && config.iconPosition === 'right' && !config.loading"
        class="material-symbols-outlined institutional-btn-icon-right"
        aria-hidden="true">
        {{ config.icon }}
      </span>
      
      <!-- Icon only -->
      <span
        *ngIf="config.icon && config.iconPosition === 'only' && !config.loading"
        class="material-symbols-outlined institutional-btn-icon-only"
        aria-hidden="true">
        {{ config.icon }}
      </span>
    </button>
  `,
  styles: [`
    .institutional-btn-spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: institutional-btn-spin 0.8s linear infinite;
      display: inline-block;
    }
    
    @keyframes institutional-btn-spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .institutional-btn-icon-left {
      margin-right: 0.5rem;
    }
    
    .institutional-btn-icon-right {
      margin-left: 0.5rem;
    }
    
    .institutional-btn-icon-only {
      margin: 0;
    }
    
    .institutional-btn-text-loading {
      margin-left: 0.5rem;
    }
  `]
})
export class InstitutionalButtonComponent implements OnInit, OnChanges {
  @Input() config: ButtonConfig = {};
  @Output() buttonClick = new EventEmitter<Event>();

  ngOnInit() {
    // Normalize incoming config and set safe defaults. Use nullish coalescing so
    // that explicit `undefined` from parent inputs won't override defaults
    const incoming = this.config || {};
    this.config = {
      ...incoming,
      variant: incoming.variant ?? 'primary',
      size: incoming.size ?? 'medium',
      fullWidth: incoming.fullWidth ?? false,
      disabled: incoming.disabled ?? false,
      loading: incoming.loading ?? false,
      iconPosition: incoming.iconPosition ?? (incoming.icon ? 'left' : undefined),
      type: incoming.type ?? 'button',
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    // When the input `config` changes we must normalize defaults again so that
    // parents that pass new objects (e.g. inline literals) don't leave fields
    // undefined and cause classes like `institutional-btn-undefined`.
    if (changes['config']) {
      const incoming = changes['config'].currentValue || {};
      this.config = {
        ...incoming,
        variant: incoming.variant ?? 'primary',
        size: incoming.size ?? 'medium',
        fullWidth: incoming.fullWidth ?? false,
        disabled: incoming.disabled ?? false,
        loading: incoming.loading ?? false,
        iconPosition: incoming.iconPosition ?? (incoming.icon ? 'left' : undefined),
        type: incoming.type ?? 'button',
      };
    }
  }

  onClick(event: Event) {
    if (!this.config.disabled && !this.config.loading) {
      this.buttonClick.emit(event);
    }
  }

  getButtonClasses(): string {
    const classes = [
      'institutional-btn',
    ];

    // Guardar contra values undefined para evitar clases como institutional-btn-undefined
    if (this.config.variant) {
      classes.push(`institutional-btn-${this.config.variant}`);
    }

    if (this.config.size) {
      classes.push(`institutional-btn-${this.config.size}`);
    }

    if (this.config.fullWidth) {
      classes.push('institutional-btn-full-width');
    }

    if (this.config.disabled) {
      classes.push('institutional-btn-disabled');
    }

    if (this.config.loading) {
      classes.push('institutional-btn-loading');
    }

    if (this.config.iconPosition === 'only') {
      classes.push('institutional-btn-icon-only-container');
    }

    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }

    return classes.join(' ');
  }

  getCustomStyles(): any {
    const styles: any = {};

    if (this.config.customWidth) {
      styles.width = this.config.customWidth;
    }

    if (this.config.customHeight) {
      styles.height = this.config.customHeight;
    }

    if (this.config.customFontSize) {
      styles.fontSize = this.config.customFontSize;
    }

    return styles;
  }
}