import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalBadgeComponent, BadgeConfig } from './institutional-badge.component';

export interface BadgeGroupConfig {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  wrap?: boolean;
  maxItems?: number;
  showMoreText?: string;
  customClass?: string;
}

export interface BadgeItem extends BadgeConfig {
  id: string;
  content: string;
  visible?: boolean;
}

@Component({
  selector: 'app-badge-group',
  standalone: true,
  imports: [CommonModule, InstitutionalBadgeComponent],
  template: `
    <div 
      [class]="getGroupClasses()"
      role="group"
      [attr.aria-label]="'Grupo de ' + visibleBadges.length + ' badges'">
      
      <!-- Badges visibles -->
      <ng-container *ngFor="let badge of visibleBadges; trackBy: trackByBadgeId">
        <app-institutional-badge
          [config]="getBadgeConfig(badge)"
          (badgeClick)="onBadgeClick(badge, $event)"
          (badgeClose)="onBadgeClose(badge, $event)">
          {{ badge.content }}
        </app-institutional-badge>
      </ng-container>
      
      <!-- Badge "Ver más" cuando hay badges ocultos -->
      <app-institutional-badge
        *ngIf="hasHiddenBadges"
        [config]="getMoreBadgeConfig()"
        (badgeClick)="onShowMoreClick($event)">
        {{ config.showMoreText || 'Ver más' }} ({{ hiddenBadgesCount }})
      </app-institutional-badge>
    </div>
  `,
  styles: [`
    .badge-group {
      display: flex;
      align-items: flex-start;
    }
    
    .badge-group-horizontal {
      flex-direction: row;
      flex-wrap: wrap;
    }
    
    .badge-group-vertical {
      flex-direction: column;
      align-items: stretch;
    }
    
    .badge-group-no-wrap {
      flex-wrap: nowrap;
    }
    
    .badge-group-spacing-tight {
      gap: 0.25rem;
    }
    
    .badge-group-spacing-normal {
      gap: 0.5rem;
    }
    
    .badge-group-spacing-loose {
      gap: 0.75rem;
    }
    
    @media (max-width: 640px) {
      .badge-group-horizontal {
        gap: 0.25rem;
      }
      
      .badge-group-vertical {
        gap: 0.25rem;
      }
    }
  `]
})
export class BadgeGroupComponent implements OnInit, OnChanges {
  @Input() badges: BadgeItem[] = [];
  @Input() config: BadgeGroupConfig = {};
  @Output() badgeClick = new EventEmitter<{ badge: BadgeItem, event: Event }>();
  @Output() badgeClose = new EventEmitter<{ badge: BadgeItem, event: Event }>();
  @Output() showMore = new EventEmitter<Event>();

  visibleBadges: BadgeItem[] = [];
  hiddenBadgesCount = 0;
  hasHiddenBadges = false;

  ngOnInit() {
    this.normalizeConfig();
    this.updateVisibleBadges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] || changes['badges']) {
      this.normalizeConfig();
      this.updateVisibleBadges();
    }
  }

  private normalizeConfig() {
    const incoming = this.config || {};
    this.config = {
      ...incoming,
      orientation: incoming.orientation ?? 'horizontal',
      spacing: incoming.spacing ?? 'normal',
      wrap: incoming.wrap ?? true,
      maxItems: incoming.maxItems ?? undefined,
      showMoreText: incoming.showMoreText ?? 'Ver más',
    };
  }

  private updateVisibleBadges() {
    const activeBadges = this.badges.filter(badge => badge.visible !== false);
    
    if (this.config.maxItems && activeBadges.length > this.config.maxItems) {
      this.visibleBadges = activeBadges.slice(0, this.config.maxItems);
      this.hiddenBadgesCount = activeBadges.length - this.config.maxItems;
      this.hasHiddenBadges = true;
    } else {
      this.visibleBadges = activeBadges;
      this.hiddenBadgesCount = 0;
      this.hasHiddenBadges = false;
    }
  }

  trackByBadgeId(index: number, badge: BadgeItem): string {
    return badge.id;
  }

  getBadgeConfig(badge: BadgeItem): BadgeConfig {
    const { id, content, visible, ...badgeConfig } = badge;
    return badgeConfig;
  }

  getMoreBadgeConfig(): BadgeConfig {
    return {
      variant: 'light',
      size: this.visibleBadges[0]?.size || 'medium',
      clickable: true,
      customClass: 'badge-show-more'
    };
  }

  onBadgeClick(badge: BadgeItem, event: Event) {
    this.badgeClick.emit({ badge, event });
  }

  onBadgeClose(badge: BadgeItem, event: Event) {
    this.badgeClose.emit({ badge, event });
  }

  onShowMoreClick(event: Event) {
    this.showMore.emit(event);
  }

  getGroupClasses(): string {
    const classes = [
      'badge-group',
    ];

    if (this.config.orientation) {
      classes.push(`badge-group-${this.config.orientation}`);
    }

    if (this.config.spacing) {
      classes.push(`badge-group-spacing-${this.config.spacing}`);
    }

    if (!this.config.wrap) {
      classes.push('badge-group-no-wrap');
    }

    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }

    return classes.join(' ');
  }
}