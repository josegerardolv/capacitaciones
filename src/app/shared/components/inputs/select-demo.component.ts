import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectComponent } from './select.component';

/**
 * Componente de demostración para el SelectComponent reutilizable
 * Muestra diferentes casos de uso y configuraciones
 */
@Component({
  selector: 'app-select-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectComponent],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-institucional-primario mb-8">Componente Select Reutilizable</h1>
      
      <form [formGroup]="demoForm" class="space-y-8">
        
        <!-- Select básico -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Select Básico</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-select
              controlName="basicSelect"
              label="Opción Básica"
              placeholder="Selecciona una opción"
              [options]="basicOptions"
              [validationMap]="validationMap">
            </app-select>
            
            <app-select
              controlName="requiredSelect"
              label="Opción Requerida"
              placeholder="Selecciona una opción"
              [options]="basicOptions"
              [validationMap]="validationMap"
              [required]="true">
            </app-select>
          </div>
        </section>

        <!-- Select con floating label -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Select con Floating Label</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-select
              controlName="floatingSelect"
              label="Floating Label"
              [options]="basicOptions"
              [floating]="true">
            </app-select>
            
            <app-select
              controlName="floatingWithIcon"
              label="Con Icono"
              [options]="basicOptions"
              [floating]="true"
              iconLeft="🏷️">
            </app-select>
          </div>
        </section>

        <!-- Select con opciones agrupadas -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Select con Opciones Agrupadas</h2>
          <app-select
            controlName="groupedSelect"
            label="Categorías Agrupadas"
            placeholder="Selecciona una categoría"
            [options]="groupedOptions">
          </app-select>
        </section>

        <!-- Select con diferentes tamaños -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Diferentes Tamaños</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-select
              controlName="smallSelect"
              label="Pequeño"
              [options]="basicOptions"
              size="sm">
            </app-select>
            
            <app-select
              controlName="mediumSelect"
              label="Mediano"
              [options]="basicOptions"
              size="md">
            </app-select>
            
            <app-select
              controlName="largeSelect"
              label="Grande"
              [options]="basicOptions"
              size="lg">
            </app-select>
          </div>
        </section>

        <!-- Select con diferentes variantes -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Diferentes Variantes</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-select
              controlName="outlineSelect"
              label="Outline"
              [options]="basicOptions"
              variant="outline">
            </app-select>
            
            <app-select
              controlName="filledSelect"
              label="Filled"
              [options]="basicOptions"
              variant="filled">
            </app-select>
          </div>
        </section>

        <!-- Select con evento change -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Select con Evento Change</h2>
          <app-select
            controlName="changeEventSelect"
            label="Cambia y verás el valor"
            [options]="basicOptions"
            (change)="onSelectChange($event)">
          </app-select>
          
          <div *ngIf="selectedValue" class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <strong>Valor seleccionado:</strong> {{ selectedValue }}
          </div>
        </section>

        <!-- Select con validación personalizada -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">Select con Validación Personalizada</h2>
          <app-select
            controlName="customValidationSelect"
            label="Solo opciones pares"
            placeholder="Selecciona un número par"
            [options]="numberOptions"
            [validationMap]="validationMap">
          </app-select>
        </section>

        <!-- Valores del formulario -->
        <section class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Valores del Formulario</h2>
          <pre class="bg-white p-4 rounded border text-sm overflow-auto">{{ getFormValues() }}</pre>
        </section>
      </form>
    </div>
  `,
  styles: [`
    pre {
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class SelectDemoComponent {
  demoForm: FormGroup;
  selectedValue: any = null;

  // Opciones básicas
  basicOptions = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3' },
    { value: 'option4', label: 'Opción 4' }
  ];

  // Opciones agrupadas
  groupedOptions = [
    { value: 'cat1_item1', label: 'Item 1', group: 'Categoría 1' },
    { value: 'cat1_item2', label: 'Item 2', group: 'Categoría 1' },
    { value: 'cat2_item1', label: 'Item 1', group: 'Categoría 2' },
    { value: 'cat2_item2', label: 'Item 2', group: 'Categoría 2' },
    { value: 'cat3_item1', label: 'Item 1', group: 'Categoría 3' }
  ];

  // Opciones numéricas para validación
  numberOptions = [
    { value: 1, label: 'Número 1 (Impar)' },
    { value: 2, label: 'Número 2 (Par)' },
    { value: 3, label: 'Número 3 (Impar)' },
    { value: 4, label: 'Número 4 (Par)' },
    { value: 5, label: 'Número 5 (Impar)' },
    { value: 6, label: 'Número 6 (Par)' }
  ];

  // Mapa de validaciones
  validationMap = {
    requiredSelect: {
      required: true,
      messages: {
        required: 'Esta selección es obligatoria'
      }
    },
    customValidationSelect: {
      required: true,
      custom: (value: any) => {
        if (!value) return 'Selecciona un valor';
        const num = Number(value);
        if (isNaN(num) || num % 2 !== 0) {
          return 'Solo se permiten números pares';
        }
        return null;
      },
      messages: {
        required: 'Debes seleccionar un número'
      }
    }
  };

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      basicSelect: [''],
      requiredSelect: ['', Validators.required],
      floatingSelect: [''],
      floatingWithIcon: [''],
      groupedSelect: [''],
      smallSelect: [''],
      mediumSelect: [''],
      largeSelect: [''],
      outlineSelect: [''],
      filledSelect: [''],
      changeEventSelect: [''],
      customValidationSelect: ['', Validators.required]
    });
  }

  onSelectChange(value: any): void {
    this.selectedValue = value;
    console.log('Valor seleccionado:', value);
  }

  getFormValues(): string {
    return JSON.stringify(this.demoForm.value, null, 2);
  }
}
