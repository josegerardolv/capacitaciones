import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface TabModalTab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabModalConfig {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showTabIcons?: boolean;
  tabPosition?: 'top' | 'left';
}

@Component({
  selector: 'app-tab-modal',
  standalone: true,
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="institutional-modal-overlay entering"
         role="dialog"
         aria-modal="true"
         [attr.aria-labelledby]="'modal-title-' + modalId"
         (click)="onOverlayClick($event)">
      
      <!-- Contenedor del modal -->
      <div class="institutional-modal-container entering"
           [class.size-sm]="config.size === 'sm'"
           [class.size-md]="!config.size || config.size === 'md'"
           [class.size-lg]="config.size === 'lg'"
           [class.size-xl]="config.size === 'xl'"
           [class.size-full]="config.size === 'full'"
           (click)="$event.stopPropagation()">
        
        <!-- Header del modal -->
        <div class="institutional-modal-header" *ngIf="config.title">
          <h3 class="institutional-modal-title" [id]="'modal-title-' + modalId">
            {{ config.title }}
          </h3>
          <p *ngIf="config.subtitle" class="text-sm mt-1 opacity-90">{{ config.subtitle }}</p>
          
          <!-- Botón cerrar -->
          <app-institutional-button
            [config]="{
              variant: 'modal-close',
              icon: 'close',
              iconPosition: 'only',
              size: 'medium',
              ariaLabel: 'Cerrar modal'
            }"
            class="institutional-modal-close"
            (buttonClick)="close()">
          </app-institutional-button>
        </div>

        <!-- Contenido con tabs -->
        <div class="flex flex-1"
             [class.flex-col]="config.tabPosition !== 'left'"
             [class.flex-row]="config.tabPosition === 'left'">
          
          <!-- Navegación de tabs -->
          <div class="bg-gray-50 border-b border-gray-200"
               [class.border-r]="config.tabPosition === 'left'"
               [class.border-b-0]="config.tabPosition === 'left'"
               [class.w-64]="config.tabPosition === 'left'"
               [class.flex-shrink-0]="config.tabPosition === 'left'">
            
            <nav class="flex p-1"
                 [class.flex-row]="config.tabPosition !== 'left'"
                 [class.flex-col]="config.tabPosition === 'left'"
                 [class.overflow-x-auto]="config.tabPosition !== 'left'"
                 [class.space-x-1]="config.tabPosition !== 'left'"
                 [class.space-y-1]="config.tabPosition === 'left'">
              
              <button *ngFor="let tab of tabs; trackBy: trackByTabId"
                      type="button"
                      class="relative px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                      [class.bg-white]="activeTabId === tab.id"
                      [class.text-blue-600]="activeTabId === tab.id"
                      [class.shadow-sm]="activeTabId === tab.id"
                      [class.text-gray-600]="activeTabId !== tab.id"
                      [class.hover:text-gray-900]="activeTabId !== tab.id"
                      [class.opacity-50]="tab.disabled"
                      [class.cursor-not-allowed]="tab.disabled"
                      [class.whitespace-nowrap]="config.tabPosition !== 'left'"
                      [class.text-left]="config.tabPosition === 'left'"
                      [class.w-full]="config.tabPosition === 'left'"
                      [disabled]="tab.disabled"
                      (click)="selectTab(tab.id)">
                
                <div class="flex items-center gap-2"
                     [class.justify-center]="config.tabPosition !== 'left'"
                     [class.justify-start]="config.tabPosition === 'left'">
                  <!-- Icono del tab -->
                  <span *ngIf="tab.icon && config.showTabIcons !== false" 
                        class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
                  
                  <!-- Label del tab -->
                  <span>{{ tab.label }}</span>
                  
                  <!-- Badge del tab -->
                  <span *ngIf="tab.badge" 
                        class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {{ tab.badge }}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <!-- Contenido del tab activo -->
          <div class="flex-1 overflow-auto institutional-modal-body">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Footer opcional -->
        <div class="institutional-modal-footer" *ngIf="hasFooterContent">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class TabModalComponent {
  @Input() isOpen = false;
  @Input() config: TabModalConfig = {
    size: 'lg',
    showTabIcons: true,
    tabPosition: 'top'
  };
  @Input() tabs: TabModalTab[] = [];
  @Input() activeTabId = '';
  @Input() closeOnEscape = true;
  @Input() closeOnOverlay = true;
  @Input() hasFooterContent = false;

  @Output() tabChange = new EventEmitter<string>();
  @Output() modalClose = new EventEmitter<void>();

  // ID único para accesibilidad
  modalId = Math.random().toString(36).substr(2, 9);

  ngOnInit(): void {
    if (!this.activeTabId && this.tabs.length > 0) {
      const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
      if (firstEnabledTab) {
        this.activeTabId = firstEnabledTab.id;
      }
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    const currentIndex = this.tabs.findIndex(tab => tab.id === this.activeTabId);
    const enabledTabs = this.tabs.filter(tab => !tab.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.id === this.activeTabId);

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (currentEnabledIndex > 0) {
          this.selectTab(enabledTabs[currentEnabledIndex - 1].id);
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (currentEnabledIndex < enabledTabs.length - 1) {
          this.selectTab(enabledTabs[currentEnabledIndex + 1].id);
        }
        break;
      case 'Home':
        event.preventDefault();
        if (enabledTabs.length > 0) {
          this.selectTab(enabledTabs[0].id);
        }
        break;
      case 'End':
        event.preventDefault();
        if (enabledTabs.length > 0) {
          this.selectTab(enabledTabs[enabledTabs.length - 1].id);
        }
        break;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlay) {
      this.close();
    }
  }

  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      this.activeTabId = tabId;
      this.tabChange.emit(tabId);
    }
  }

  close(): void {
    this.isOpen = false;
    this.modalClose.emit();
  }

  trackByTabId(index: number, tab: TabModalTab): string {
    return tab.id;
  }
}
