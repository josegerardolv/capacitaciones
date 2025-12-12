import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bootstrap-icon',
    imports: [CommonModule],
    template: `
    <i 
      [class]="'bi bi-' + name"
      [style.font-size.px]="size"
      [ngClass]="customClass">
    </i>
  `,
    styles: [`
    i {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      vertical-align: middle;
      line-height: 1;
    }
  `]
})
export class BootstrapIconComponent {
  @Input() name!: string;
  @Input() size: number = 24;
  @Input() customClass: string = '';
}
