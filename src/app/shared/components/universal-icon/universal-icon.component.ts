import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../core/services/icon.service';

export type IconType = 'bootstrap' | 'material';

@Component({
  selector: 'app-universal-icon',
  standalone: true,
  imports: [CommonModule],
    template: `
    <!-- Bootstrap Icons -->
    <ng-container *ngIf="resolvedType === 'bootstrap'">
      <i 
        [class]="'bi bi-' + resolvedName"
        [style.fontSize.px]="size"
        [ngClass]="customClass">
      </i>
    </ng-container>

    <!-- Material (Symbols or Classic) -->
    <ng-container *ngIf="resolvedType === 'material'">
      <span
        class="material-symbols-outlined"
        [style.fontSize.px]="size + 4"
        [attr.style]="'font-variation-settings: ' + fontVariationSettings"
        [attr.aria-hidden]="decorative ? 'true' : null"
        [attr.role]="decorative ? null : 'img'"
        [ngClass]="customClass">
        {{ resolvedName }}
      </span>
    </ng-container>
  `,
    styles: [`
    :host {
      display: inline-flex;
      height: 100%;
      align-items: center; /* center vertically */
      justify-content: center;
    }

    i, span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      line-height: 1;
    }

    `]

})
export class UniversalIconComponent implements OnInit, OnChanges {
  @Input() name!: string;
  @Input() type?: IconType;
  @Input() size: number = 24;
  @Input() customClass: string = '';
  @Input() context?: 'navigation' | 'action' | 'status';
  @Input() autoConvert: boolean = true;
  // 'symbols' -> Material Symbols (recommended)
  // 'classic' -> legacy Material Icons

  // Material Symbols variation axes (see https://developers.google.com/fonts/docs/material_symbols)
  @Input() materialFill: 0 | 1 = 0; // 0 = outline, 1 = filled
  @Input() materialWeight: number = 400; // wght axis
  @Input() materialGrade: number = 0; // GRAD axis
  @Input() materialOpticalSize: number = 24; // opsz axis

  // Accessibility: if true the icon is decorative and hidden from assistive tech
  @Input() decorative: boolean = true;

  resolvedName: string = '';
  resolvedType: IconType = 'bootstrap';

  private iconService = inject(IconService);

  ngOnInit(): void {
    this.resolveIcon();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en name, type, o context
    if (changes['name'] || changes['type'] || changes['context']) {
      this.resolveIcon();
    }
  }

  private resolveIcon(): void {
    if (this.context) {
      // Usar configuración contextual
      const contextualIcon = this.iconService.getContextualIcon(this.context, this.name);
      this.resolvedName = contextualIcon.name;
      this.resolvedType = contextualIcon.type;
      if (!this.size || this.size === 24) {
        this.size = contextualIcon.size;
      }
    } else {
      // Usar configuración manual o por defecto
      const icon = this.iconService.getIcon(this.name, this.type);
      this.resolvedName = icon.name;
      this.resolvedType = icon.type;
    }
  }

  // Compose a CSS font-variation-settings string for Material Symbols
  get fontVariationSettings(): string {
    // Use quoted axis names per spec
    const opsz = Number(this.materialOpticalSize) || 24;
    const wght = Number(this.materialWeight) || 400;
    const grad = Number(this.materialGrade) || 0;
    const fill = Number(this.materialFill) ? 1 : 0;
    return `'FILL' ${fill}, 'wght' ${wght}, 'GRAD' ${grad}, 'opsz' ${opsz}`;
  }
}
