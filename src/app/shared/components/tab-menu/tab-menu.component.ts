import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BootstrapIconComponent } from '../material-icon/material-icon.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tab-menu',
  standalone: true,
  imports: [CommonModule, BootstrapIconComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div class="bg-morena-vino" style="position: relative;">
            <button type="button" class="absolute left-1 sm:left-6 top-1/2 transform -translate-y-1/2 block sm:hidden text-white/80 hover:text-white bg-transparent z-20" (click)="scrollLeft()" aria-label="Anterior pestaña">
              <app-bootstrap-icon name="caret-left" [size]="20" customClass="text-white/80"></app-bootstrap-icon>
            </button>
            <nav class="max-w-6xl mx-auto px-8 sm:px-6 overflow-hidden" aria-label="Tabs">
                <div class="flex items-center">
                    <!-- scroll controls visible only on small screens -->
                    <div #tablistRef class="w-full flex gap-2 overflow-x-auto no-scrollbar pt-2 px-4 sm:px-0 snap-x snap-mandatory scroll-smooth tablist" role="tablist" (keydown)="onKeydown($event)">
                        <button
                        *ngFor="let tab of tabs"
                        (click)="onTabClick(tab)"
                        [disabled]="tab.disabled"
                        role="tab"
                        [attr.aria-selected]="activeTabId === tab.id"
                        [attr.aria-controls]="'panel-' + tab.id"
                        [attr.id]="'tab-' + tab.id"
                        class="flex-shrink-0 min-w-[8rem] whitespace-nowrap snap-start px-4 py-2 md:py-3 text-sm font-medium rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-morena-guinda transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        [ngClass]="getTabClasses(tab)">
                        {{ tab.label }}
                        </button>
                    </div>
                </div>
            </nav>
            <button type="button" class="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 block sm:hidden text-white/80 hover:text-white bg-transparent z-20" (click)="scrollRight()" aria-label="Siguiente pestaña">
              <app-bootstrap-icon name="caret-right" [size]="20" customClass="text-white/80"></app-bootstrap-icon>
            </button>
        </div>
        <div class="p-8">
            <ng-content></ng-content>
        </div>
    </div>
  `,
  styles: [
    `:host ::ng-deep .no-scrollbar::-webkit-scrollbar { display: none; }
     :host ::ng-deep .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
     :host ::ng-deep .tablist { -webkit-overflow-scrolling: touch; }
     `
  ]
})
export class TabMenuComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Output() tabChange = new EventEmitter<string>();
  @ViewChild('tablistRef', { read: ElementRef, static: false }) tablistRef?: ElementRef<HTMLDivElement>;
  showLeft = false;
  showRight = false;
  private resizeObserver?: ResizeObserver;
  private scrollHandler = () => this.updateScrollButtons();

  onTabClick(tab: TabItem): void {
    if (!tab.disabled && this.activeTabId !== tab.id) {
      this.tabChange.emit(tab.id);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTabId'] && !changes['activeTabId'].firstChange) {
      // small delay to allow template to update from parent before scrolling
      setTimeout(() => this.scrollToActive(), 50);
    }
  }

  ngAfterViewInit(): void {
    const el = this.tablistRef?.nativeElement;
    if (el) {
      el.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.updateScrollButtons();

      // observe resize to update controls
      try {
        this.resizeObserver = new ResizeObserver(() => this.updateScrollButtons());
        this.resizeObserver.observe(el);
      } catch (e) {
        // ResizeObserver may not be supported in some environments
      }
    }
    // ensure active tab visible on init
    setTimeout(() => this.scrollToActive(), 80);
  }

  ngOnDestroy(): void {
    const el = this.tablistRef?.nativeElement;
    if (el) el.removeEventListener('scroll', this.scrollHandler);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  scrollLeft(): void {
    const el = this.tablistRef?.nativeElement;
    if (el) {
      el.scrollBy({ left: -Math.max(120, el.clientWidth / 2), behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    const el = this.tablistRef?.nativeElement;
    if (el) {
      el.scrollBy({ left: Math.max(120, el.clientWidth / 2), behavior: 'smooth' });
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const idx = this.tabs.findIndex(t => t.id === this.activeTabId);
    if (event.key === 'ArrowLeft') {
      const prev = this.findEnabledTab(idx - 1, -1);
      if (prev) this.tabChange.emit(prev.id);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      const next = this.findEnabledTab(idx + 1, 1);
      if (next) this.tabChange.emit(next.id);
      event.preventDefault();
    } else if (event.key === 'Home') {
      const first = this.findEnabledTab(0, 1);
      if (first) this.tabChange.emit(first.id);
      event.preventDefault();
    } else if (event.key === 'End') {
      const last = this.findEnabledTab(this.tabs.length - 1, -1);
      if (last) this.tabChange.emit(last.id);
      event.preventDefault();
    }
  }

  private findEnabledTab(startIndex: number, step: number): TabItem | undefined {
    let i = startIndex;
    while (i >= 0 && i < this.tabs.length) {
      const t = this.tabs[i];
      if (!t.disabled) return t;
      i += step;
    }
    return undefined;
  }

  private updateScrollButtons(): void {
    const el = this.tablistRef?.nativeElement;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth - 1; // small tolerance
    this.showLeft = scrollLeft > 5;
    this.showRight = scrollLeft < maxScrollLeft;
    // trigger change detection if needed
    try { this._cdr?.markForCheck(); } catch {}
  }

  private scrollToActive(): void {
    const el = this.tablistRef?.nativeElement;
    if (!el || !this.activeTabId) return;
    const btn = el.querySelector('#tab-' + this.activeTabId) as HTMLElement | null;
    if (!btn) return;
    const target = btn.offsetLeft + (btn.offsetWidth / 2) - (el.clientWidth / 2);
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }

  constructor(private _renderer: Renderer2, private _cdr: ChangeDetectorRef) {}

  getTabClasses(tab: TabItem): string {
    const baseClasses = this.activeTabId === tab.id 
      ? 'bg-white text-morena-guinda shadow-md border-b-2 border-morena-guinda' 
      : 'text-white/80 hover:text-white hover:bg-white/10';
    
    return tab.disabled ? baseClasses + ' opacity-50 cursor-not-allowed' : baseClasses;
  }
}
