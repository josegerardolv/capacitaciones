import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'light' 
  | 'dark' 
  | 'ghost'
  | 'outline';

export type BadgeSize = 'small' | 'medium' | 'large';

export type IconPosition = 'left' | 'right';

export interface BadgeConfig {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  iconPosition?: IconPosition;
  closable?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  ariaLabel?: string;
  title?: string;
  customClass?: string;
  tooltip?: string;
}

@Component({
  selector: 'app-institutional-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="getBadgeClasses()"
      [attr.aria-label]="config.ariaLabel || null"
      [attr.title]="config.tooltip || config.title || null"
      [attr.tabindex]="config.clickable && !config.disabled ? '0' : null"
      [attr.role]="config.clickable ? 'button' : 'status'"
      (click)="onClick($event)"
      (keydown.enter)="onKeydown($event)"
      (keydown.space)="onKeydown($event)">
      
      <!-- Left icon -->
      <span
        *ngIf="config.icon && config.iconPosition === 'left'"
        class="material-symbols-outlined institutional-badge-icon-left"
        aria-hidden="true">
        {{ config.icon }}
      </span>
      
      <!-- Badge content -->
      <span class="institutional-badge-content">
        <ng-content></ng-content>
      </span>
      
      <!-- Right icon -->
      <span
        *ngIf="config.icon && config.iconPosition === 'right'"
        class="material-symbols-outlined institutional-badge-icon-right"
        aria-hidden="true">
        {{ config.icon }}
      </span>
      
      <!-- Close button -->
      <button
        *ngIf="config.closable && !config.disabled"
        type="button"
        class="institutional-badge-close"
        [attr.aria-label]="'Cerrar badge'"
        (click)="onClose($event)">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </span>
  `,
  styles: [`
    .institutional-badge {
      display: inline-flex;
      align-items: center;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      white-space: nowrap;
      text-decoration: none;
      border: 1px solid transparent;
      position: relative;
      overflow: hidden;
    }
    
    .institutional-badge-content {
      display: flex;
      align-items: center;
      line-height: 1;
    }
    
    .institutional-badge-icon-left {
      margin-right: 0.25rem;
      font-size: inherit;
      line-height: 1;
    }
    
    .institutional-badge-icon-right {
      margin-left: 0.25rem;
      font-size: inherit;
      line-height: 1;
    }
    
    .institutional-badge-close {
      background: none;
      border: none;
      padding: 0;
      margin-left: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      opacity: 0.7;
      transition: opacity var(--transition-fast);
      font-size: 0.875em;
      line-height: 1;
    }
    
    .institutional-badge-close:hover {
      opacity: 1;
    }
    
    .institutional-badge-close:focus {
      outline: 2px solid currentColor;
      outline-offset: 1px;
      border-radius: 2px;
      opacity: 1;
    }
    
    .institutional-badge-clickable {
      cursor: pointer;
      user-select: none;
    }
    
    .institutional-badge-clickable:hover:not(.institutional-badge-disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .institutional-badge-clickable:focus:not(.institutional-badge-disabled) {
      outline: 2px solid var(--institucional-primario);
      outline-offset: 2px;
    }
    
    .institutional-badge-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    
    /* Animation for enter/exit */
    .institutional-badge {
      animation: badgeSlideIn 0.2s ease-out;
    }
    
    @keyframes badgeSlideIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .institutional-badge-exit {
      animation: badgeSlideOut 0.15s ease-in forwards;
    }
    
    @keyframes badgeSlideOut {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.8);
      }
    }
  `]
})
export class InstitutionalBadgeComponent implements OnInit, OnChanges {
  @Input() config: BadgeConfig = {};
  @Output() badgeClick = new EventEmitter<Event>();
  @Output() badgeClose = new EventEmitter<Event>();

  ngOnInit() {
    this.normalizeConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.normalizeConfig();
    }
  }

  private normalizeConfig() {
    const incoming = this.config || {};
    this.config = {
      ...incoming,
      variant: incoming.variant ?? 'primary',
      size: incoming.size ?? 'medium',
      iconPosition: incoming.iconPosition ?? 'left',
      closable: incoming.closable ?? false,
      disabled: incoming.disabled ?? false,
      clickable: incoming.clickable ?? false,
    };
  }

  onClick(event: Event) {
    if (!this.config.disabled && this.config.clickable) {
      this.badgeClick.emit(event);
    }
  }

  onKeydown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.config.disabled && this.config.clickable) {
      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
        keyboardEvent.preventDefault();
        this.badgeClick.emit(event);
      }
    }
  }

  onClose(event: Event) {
    event.stopPropagation();
    if (!this.config.disabled) {
      this.badgeClose.emit(event);
    }
  }

  getBadgeClasses(): string {
    const classes = [
      'institutional-badge',
    ];

    if (this.config.variant) {
      classes.push(`institutional-badge-${this.config.variant}`);
    }

    if (this.config.size) {
      classes.push(`institutional-badge-${this.config.size}`);
    }

    if (this.config.clickable) {
      classes.push('institutional-badge-clickable');
    }

    if (this.config.disabled) {
      classes.push('institutional-badge-disabled');
    }

    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }

    return classes.join(' ');
  }
}