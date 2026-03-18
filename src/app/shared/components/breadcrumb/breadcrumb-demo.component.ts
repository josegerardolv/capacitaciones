import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbItem } from './breadcrumb.model';

@Component({
  selector: 'app-breadcrumb-demo',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  template: `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-4">Breadcrumb Demo</h2>

      <h3 class="text-lg font-semibold mt-6 mb-2">Basic Breadcrumb</h3>
      <div class="border rounded-lg p-4">
        <app-breadcrumb [items]="items1"></app-breadcrumb>
      </div>

      <h3 class="text-lg font-semibold mt-6 mb-2">Primary Variant</h3>
      <div class="border rounded-lg p-4">
        <app-breadcrumb [items]="items2" variant="primary"></app-breadcrumb>
      </div>

      <h3 class="text-lg font-semibold mt-6 mb-2">Secondary Variant (Pill Shape)</h3>
      <div class="border rounded-lg p-4">
        <app-breadcrumb [items]="items2" variant="secondary" shape="pill"></app-breadcrumb>
      </div>

      <h3 class="text-lg font-semibold mt-6 mb-2">Rounded Shape</h3>
      <div class="border rounded-lg p-4">
        <app-breadcrumb [items]="items3" shape="rounded"></app-breadcrumb>
      </div>
    </div>
  `,
})
export class BreadcrumbDemoComponent {
  items1: BreadcrumbItem[] = [
    { label: 'Products' },
  ];

  items2: BreadcrumbItem[] = [
    { label: 'Electronics', url: '/electronics' },
    { label: 'Mobile Phones', url: '/electronics/mobile' },
    { label: 'Smartphones' },
  ];

  items3: BreadcrumbItem[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
}
