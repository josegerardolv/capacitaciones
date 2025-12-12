import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { IconType } from '../sidebar/sidebar-menu.config';

export interface TooltipItem {
  label: string;
  icon?: string;
  iconType?: IconType;
  route?: string;
  children?: TooltipItem[];
}

export interface TooltipPosition {
  x: number;
  y: number;
}

/**
 * TooltipComponent - Tooltip reutilizable y genérico
 *
 * Proporciona tooltips reutilizables con dos modos:
 * - simple: Muestra solo el texto del elemento
 * - menu: Muestra un menú navegable con los elementos hijos
 */
@Component({
  selector: 'app-tooltip',
  imports: [CommonModule, RouterModule, UniversalIconComponent],
  template: `
    <!-- Tooltip simple para items sin hijos -->
  <div *ngIf="!item?.children"
     #panel
     class="tooltip-panel tooltip-simple fixed z-[60] bg-white rounded-lg border border-gray-200 py-2 px-3 shadow-lg min-w-[160px] max-w-xs pointer-events-auto"
     [class.tooltip-visible]="visible"
     [style.left.px]="computedLeft"
     [style.top.px]="computedTop"
     role="tooltip"
     [attr.aria-hidden]="!visible"
     (mouseenter)="onMouseEnter()"
     (mouseleave)="onMouseLeave()">

      <div class="flex items-center gap-2 text-sm text-institucional-primario font-medium">
        <div *ngIf="item?.icon" class="icon-wrap bg-institucional-primario/10 rounded-full p-1">
          <app-universal-icon
            [name]="getItemIcon()"
            [type]="getItemIconType()"
            [size]="14"
            class="text-institucional-primario">
          </app-universal-icon>
        </div>
        <div class="truncate">{{ item?.label }}</div>
      </div>

      <!-- Flecha indicadora para tooltip simple -->
      <div class="tooltip-arrow"></div>
    </div>

    <!-- Tooltip con submenu para items con hijos -->
  <div *ngIf="item?.children"
     #panel
     class="tooltip-panel tooltip-menu fixed z-[60] bg-white rounded-lg border border-gray-200 py-1 shadow-lg min-w-[200px] pointer-events-auto"
     [class.tooltip-visible]="visible"
     [style.left.px]="computedLeft"
     [style.top.px]="computedTop"
     role="menu"
     [attr.aria-hidden]="!visible"
     (mouseenter)="onMouseEnter()"
     (mouseleave)="onMouseLeave()">

      <!-- Título del submenu -->
      <div class="px-3 py-2 text-sm font-semibold text-institucional-primario border-b border-gray-100 flex items-center gap-2">
        <app-universal-icon
          *ngIf="item?.icon"
          [name]="getItemIcon()"
          [type]="getItemIconType()"
          [size]="16"
          class="mr-2 flex-shrink-0">
        </app-universal-icon>
        {{ item?.label }}
      </div>

      <!-- Items del submenu -->
      <div class="py-1">
        <a *ngFor="let child of item?.children"
           [routerLink]="child.route"
           class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-institucional-primario hover:bg-opacity-10 hover:text-institucional-primario transition-colors duration-150"
           (click)="onItemClick(child)">
          <app-universal-icon
            *ngIf="child.icon"
            [name]="child.icon"
            [type]="child.iconType || 'bootstrap'"
            [size]="16"
            class="mr-2 flex-shrink-0">
          </app-universal-icon>
          {{ child.label }}
        </a>
      </div>

      <div class="tooltip-arrow tooltip-arrow-menu"></div>
    </div>
  `,
  styles: [
    `:host { position: relative; }
     .tooltip-panel { opacity: 0; transform: translateY(-6px) scale(.98); transition: opacity .16s ease, transform .16s ease; box-shadow: 0 8px 20px rgba(15,23,42,0.08); }
     .tooltip-panel.tooltip-visible { opacity: 1; transform: translateY(0) scale(1); }
     .tooltip-panel .icon-wrap { width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; }
     .tooltip-panel .truncate { max-width: 12rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
     .tooltip-arrow { position: absolute; left: 8px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid white; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.06)); }
     .tooltip-simple .tooltip-arrow { top: 50%; transform: translateY(-50%) translateX(-100%); border-top-color: transparent; border-bottom: none; border-right-color: white; border-right-width: 8px; border-top-width: 6px; border-bottom-width: 6px; border-left: none; }
     .tooltip-menu .tooltip-arrow-menu { top: 12px; left: -8px; border-right-color: white; border-top-color: transparent; border-bottom-color: transparent; border-left: none; }
     @media (prefers-reduced-motion: reduce) { .tooltip-panel { transition: none; } }
    `
  ]
})
export class TooltipComponent {
  @Input() visible = false;
  @Input() item: TooltipItem | null = null;
  @Input() position: TooltipPosition = { x: 0, y: 0 };
  @ViewChild('panel') panelRef!: ElementRef<HTMLElement>;

  // posición ajustada para evitar que el tooltip se salga de la ventana
  computedLeft = 0;
  computedTop = 0;
  
  @Output() mouseEnter = new EventEmitter<void>();
  @Output() mouseLeave = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<TooltipItem>();

  onMouseEnter(): void {
    this.mouseEnter.emit();
  }

  onMouseLeave(): void {
    this.mouseLeave.emit();
  }

  onItemClick(item: TooltipItem): void {
    this.itemClick.emit(item);
  }

  getItemIcon(): string {
    return this.item?.icon || '';
  }

  getItemIconType(): IconType {
    return (this.item?.iconType || 'bootstrap') as IconType;
  }

  ngAfterViewInit(): void {
    // inicializar posición si es visible desde el inicio
    setTimeout(() => this.updatePosition(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['position'] || changes['item']) {
      // esperar que el DOM se actualice para medir
      setTimeout(() => this.updatePosition(), 0);
    }
  }

  private updatePosition(): void {
    try {
      const panel = this.panelRef?.nativeElement;
      if (!panel) {
        // sin referencia, usar posición original
        this.computedLeft = this.position.x;
        this.computedTop = this.position.y;
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const padding = 8; // separación mínima del borde de la ventana
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // comenzar con la posición solicitada
      let left = this.position.x;
      let top = this.position.y;

      // si el tooltip se saldría por la derecha, ajustamos para que quepa
      if (left + panelRect.width + padding > viewportW) {
        left = Math.max(padding, viewportW - panelRect.width - padding);
      }

      // si se sale por la izquierda
      if (left < padding) {
        left = padding;
      }

      // si se sale por abajo
      if (top + panelRect.height + padding > viewportH) {
        top = Math.max(padding, viewportH - panelRect.height - padding);
      }

      if (top < padding) {
        top = padding;
      }

      this.computedLeft = Math.round(left);
      this.computedTop = Math.round(top);
    } catch (e) {
      // en caso de error, usar la posición original
      this.computedLeft = this.position.x;
      this.computedTop = this.position.y;
    }
  }
}

// Mantener export con el nombre anterior para compatibilidad de importaciones existentes
export { TooltipComponent as SidebarTooltipComponent };
