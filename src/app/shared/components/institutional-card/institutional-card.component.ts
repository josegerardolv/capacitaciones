import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'standard' | 'compact' | 'highlighted';
export type CardSize = 'small' | 'medium' | 'large' | 'auto';

export interface CardConfig {
  variant?: CardVariant;
  size?: CardSize;
  showHeader?: boolean;
  showFooter?: boolean;
  showShadow?: boolean;
  showBorder?: boolean;
  customClass?: string;
}

@Component({
  selector: 'app-institutional-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="getCardClasses()"
      role="region">
      
      <!-- Header Section -->
      <div 
        *ngIf="config.showHeader !== false"
        [class]="getHeaderClasses()">
        <ng-content select="[slot=header]"></ng-content>
      </div>
      
      <!-- Body Section -->
      <div [class]="getBodyClasses()">
        <ng-content></ng-content>
      </div>
      
      <!-- Footer Section -->
      <div 
        *ngIf="config.showFooter !== false"
        [class]="getFooterClasses()">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    /* === BASE CARD STYLES === */
    .institutional-card {
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 0.75rem;
      overflow: hidden;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
      width: 100%;
    }

    /* === CARD VARIANTS === */
    .institutional-card-standard {
      min-height: 150px;
    }

    .institutional-card-compact {
      min-height: 100px;
    }

    .institutional-card-highlighted {
      min-height: 200px;
      border: 2px solid var(--institucional-primario);
    }

    /* === CARD SIZES === */
    .institutional-card-small { max-width: 300px; }
    .institutional-card-medium { max-width: 500px; }
    .institutional-card-large { max-width: 800px; }
    .institutional-card-auto { width: 100%; max-width: none; }

    /* === SHADOW === */
    .institutional-card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .institutional-card-shadow:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    /* === BORDER === */
    .institutional-card-border {
      border: 1px solid #e5e7eb;
    }

    /* === HEADER STYLES === */
    .institutional-card-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
      background: transparent;
    }

    .institutional-card-header-compact {
      padding: 1rem 1rem 0 1rem;
    }

    /* === BODY STYLES === */
    .institutional-card-body {
      flex: 1;
      padding: 1.5rem;
      color: var(--institucional-neutro-oscuro);
    }

    .institutional-card-body-compact {
      padding: 1rem;
    }

    .institutional-card-body-no-header {
      padding-top: 1.5rem;
    }

    .institutional-card-body-no-footer {
      padding-bottom: 1.5rem;
    }

    /* === FOOTER STYLES === */
    .institutional-card-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .institutional-card-footer-compact {
      padding: 0 1rem 1rem 1rem;
      gap: 0.5rem;
    }

    /* === RESPONSIVE === */
    @media (max-width: 640px) {
      .institutional-card {
        border-radius: 0.5rem;
      }

      .institutional-card-header,
      .institutional-card-body,
      .institutional-card-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .institutional-card-footer {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
      }
    }
  `]
})
export class InstitutionalCardComponent implements OnInit {
  @Input() config: CardConfig = {};

  ngOnInit(): void {
    // Set default values
    this.config = {
      variant: 'standard',
      size: 'auto',
      showHeader: true,
      showFooter: true,
      showShadow: true,
      showBorder: false,
      ...this.config
    };
  }

  getCardClasses(): string {
    const classes = ['institutional-card'];
    
    // Add variant class
    if (this.config.variant) {
      classes.push(`institutional-card-${this.config.variant}`);
    }
    
    // Add size class
    if (this.config.size) {
      classes.push(`institutional-card-${this.config.size}`);
    }
    
    // Add shadow class
    if (this.config.showShadow) {
      classes.push('institutional-card-shadow');
    }
    
    // Add border class
    if (this.config.showBorder) {
      classes.push('institutional-card-border');
    }
    
    // Add custom class
    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }
    
    return classes.join(' ');
  }

  getHeaderClasses(): string {
    const classes = ['institutional-card-header'];
    
    if (this.config.variant === 'compact') {
      classes.push('institutional-card-header-compact');
    }
    
    return classes.join(' ');
  }

  getBodyClasses(): string {
    const classes = ['institutional-card-body'];
    
    // Add variant-specific class
    if (this.config.variant === 'compact') {
      classes.push('institutional-card-body-compact');
    }
    
    // Add conditional padding classes
    if (this.config.showHeader === false) {
      classes.push('institutional-card-body-no-header');
    }
    
    if (this.config.showFooter === false) {
      classes.push('institutional-card-body-no-footer');
    }
    
    return classes.join(' ');
  }

  getFooterClasses(): string {
    const classes = ['institutional-card-footer'];
    
    if (this.config.variant === 'compact') {
      classes.push('institutional-card-footer-compact');
    }
    
    return classes.join(' ');
  }
}