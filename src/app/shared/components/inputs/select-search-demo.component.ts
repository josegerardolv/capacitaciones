import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectSearchComponent } from './select-search.component';

@Component({
  selector: 'app-select-search-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectSearchComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">app-select-search Component Demo</h1>
      
      <!-- NEW API Examples -->
      <div class="space-y-8">
        <section class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h2 class="text-xl font-semibold mb-4 text-green-800">NEW API (Recommended) ✨</h2>
          <p class="text-sm text-green-700 mb-4">
            These examples demonstrate the new "dumb component" approach with endpoint-based data fetching.
          </p>
          
          <form [formGroup]="newApiForm" class="space-y-6">
            
            <!-- Areas Example -->
            <div>
              <h3 class="text-lg font-medium mb-2">Areas Selection</h3>
              <app-select-search
                endpoint="catalogs/areas"
                label="Área"
                placeholder="Buscar área..."
                formControlName="area"
                [required]="true"
                helperText="Minimal API: Only endpoint and basic config needed"
                (selectionChange)="onNewApiAreaChange($event)">
              </app-select-search>
            </div>

            <!-- Positions Example -->
            <div>
              <h3 class="text-lg font-medium mb-2">Positions Selection</h3>
              <app-select-search
                endpoint="catalogs/positions"
                label="Puesto"
                placeholder="Buscar puesto..."
                formControlName="position"
                [minSearchLength]="2"
                [debounceTime]="500"
                helperText="Custom search configuration"
                (selectionChange)="onNewApiPositionChange($event)">
              </app-select-search>
            </div>

            <!-- Facilities Example -->
            <div>
              <h3 class="text-lg font-medium mb-2">Facilities Selection</h3>
              <app-select-search
                endpoint="catalogs/facilities"
                label="Instalación"
                placeholder="Buscar instalación..."
                formControlName="facility"
                [fullWidth]="true"
                [clearable]="true"
                helperText="Full width with clear button"
                (selectionChange)="onNewApiFacilityChange($event)">
              </app-select-search>
            </div>

            <!-- Form Values Display -->
            <div class="bg-white p-4 rounded border">
              <h4 class="font-medium mb-2">Form Values (NEW API):</h4>
              <pre class="text-sm text-gray-600">{{ newApiForm.value | json }}</pre>
            </div>
          </form>
        </section>

        <!-- OLD API Examples -->
        <section class="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h2 class="text-xl font-semibold mb-4 text-yellow-800">OLD API (Deprecated) ⚠️</h2>
          <p class="text-sm text-yellow-700 mb-4">
            These examples show backward compatibility with the existing API. 
            <strong>This approach is deprecated and should be migrated to the new endpoint-based API.</strong>
          </p>
          
          <form [formGroup]="oldApiForm" class="space-y-6">
            
            <!-- Legacy Example with Endpoint (Updated) -->
            <div>
              <h3 class="text-lg font-medium mb-2">Example with Endpoint</h3>
              <app-select-search
                endpoint="/api/catalogs/areas/select"
                label="Legacy Select"
                placeholder="Search areas..."
                formControlName="legacy"
                [floating]="true"
                [searchable]="true"
                [clearable]="true"
                helperText="Uses endpoint API"
                (selectionChange)="onOldApiChange($event)">
              </app-select-search>
            </div>

            <!-- Form Values Display -->
            <div class="bg-white p-4 rounded border">
              <h4 class="font-medium mb-2">Form Values (OLD API):</h4>
              <pre class="text-sm text-gray-600">{{ oldApiForm.value | json }}</pre>
            </div>
          </form>
        </section>

        <!-- Code Examples -->
        <section class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Usage Examples</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium mb-2 text-green-700">NEW API Usage (Recommended)</h3>
              <pre class="bg-white p-4 rounded border text-sm overflow-x-auto"><code>&lt;app-select-search
  endpoint="catalogs/areas"
  label="Área"
  placeholder="Buscar área..."
  formControlName="area"
  [required]="true"
  (selectionChange)="onAreaChange($event)"&gt;
&lt;/app-select-search&gt;</code></pre>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-2 text-yellow-700">OLD API Usage (Deprecated)</h3>
              <pre class="bg-white p-4 rounded border text-sm overflow-x-auto"><code>&lt;app-select-search
  label="Legacy Select"
  formControlName="legacy"
  [options]="optionsArray"
  [floating]="true"
  [searchable]="true"
  (change)="onChange($event)"
  (search)="onSearch($event)"&gt;
&lt;/app-select-search&gt;</code></pre>
            </div>
          </div>
        </section>

        <!-- Key Benefits -->
        <section class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 class="text-xl font-semibold mb-4 text-blue-800">Key Benefits of NEW API</h2>
          <ul class="space-y-2 text-blue-700">
            <li>✅ <strong>Dumb Component:</strong> Doesn't know what data it's fetching</li>
            <li>✅ <strong>Minimal API:</strong> Only endpoint required, rest is optional</li>
            <li>✅ <strong>Encapsulated Logic:</strong> Manages its own data lifecycle</li>
            <li>✅ <strong>Reactive Forms Ready:</strong> Implements ControlValueAccessor</li>
            <li>✅ <strong>Built-in Search:</strong> debounceTime, distinctUntilChanged, switchMap</li>
            <li>✅ <strong>Error Handling:</strong> Internal error management</li>
            <li>✅ <strong>Loading States:</strong> Automatic loading indicators</li>
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: [`
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class SelectSearchDemoComponent implements OnInit {
  newApiForm: FormGroup;
  oldApiForm: FormGroup;


  constructor(private fb: FormBuilder) {
    this.newApiForm = this.fb.group({
      area: [null, Validators.required],
      position: [null],
      facility: [null]
    });

    this.oldApiForm = this.fb.group({
      legacy: [null]
    });
  }

  ngOnInit(): void {
    console.log('SelectSearchDemoComponent initialized');
  }

  // NEW API Event Handlers
  onNewApiAreaChange(value: any): void {
    console.log('NEW API - Area selected:', value);
  }

  onNewApiPositionChange(value: any): void {
    console.log('NEW API - Position selected:', value);
  }

  onNewApiFacilityChange(value: any): void {
    console.log('NEW API - Facility selected:', value);
  }

  // OLD API Event Handlers (for backward compatibility)
  onOldApiChange(value: any): void {
    console.log('OLD API - Selection changed:', value);
  }
}