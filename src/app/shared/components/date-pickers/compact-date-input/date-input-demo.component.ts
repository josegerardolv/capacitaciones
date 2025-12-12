import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompactDateInputComponent } from '@/app/shared/components/date-pickers/compact-date-input/compact-date-input.component';

@Component({
  selector: 'app-date-input-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CompactDateInputComponent],
  template: `
    <div class="p-8 space-y-8">
      <h1 class="text-3xl font-bold mb-8">CompactDateInput - Demo de Versiones</h1>

      <!-- Floating Label Version -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Versión con Floating Label</h2>
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Fecha de nacimiento -->
          <app-compact-date-input
            [formControl]="birthDateControl"
            label="Fecha de nacimiento"
            [floating]="true"
            [required]="true"
            [maxDate]="today"
            [minDate]="minBirthDate"
            placeholder="Seleccionar fecha de nacimiento"
            helperText="Selecciona tu fecha de nacimiento"
            (dateChange)="onBirthDateChange($event)">
          </app-compact-date-input>

          <!-- Fecha de ingreso -->
          <app-compact-date-input
            [formControl]="startDateControl"
            label="Fecha de ingreso"
            [floating]="true"
            [required]="true"
            [maxDate]="today"
            placeholder="Seleccionar fecha de ingreso"
            helperText="Fecha de inicio en el puesto"
            size="lg"
            (dateChange)="onStartDateChange($event)">
          </app-compact-date-input>

          <!-- Fecha opcional -->
          <app-compact-date-input
            [formControl]="optionalDateControl"
            label="Fecha opcional"
            [floating]="true"
            [required]="false"
            placeholder="Fecha opcional"
            helperText="Este campo es opcional"
            size="sm">
          </app-compact-date-input>

        </div>
      </div>

      <!-- Normal Label Version -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Versión con Label Normal</h2>
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Fecha de vencimiento -->
          <app-compact-date-input
            [formControl]="expiryDateControl"
            label="Fecha de vencimiento"
            [floating]="false"
            [required]="true"
            [minDate]="today"
            placeholder="Seleccionar fecha de vencimiento"
            helperText="La fecha debe ser futura"
            width="100%">
          </app-compact-date-input>

          <!-- Fecha de evento -->
          <app-compact-date-input
            [formControl]="eventDateControl"
            label="Fecha del evento"
            [floating]="false"
            [required]="false"
            placeholder="Seleccionar fecha del evento"
            helperText="Fecha en que se realizará el evento">
          </app-compact-date-input>

        </div>
      </div>

      <!-- Sin Label -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Versión Solo Input (Sin Label)</h2>
        <div class="grid md:grid-cols-3 gap-6">
          
          <app-compact-date-input
            [formControl]="simpleDate1Control"
            placeholder="Fecha 1"
            size="sm">
          </app-compact-date-input>

          <app-compact-date-input
            [formControl]="simpleDate2Control"
            placeholder="Fecha 2"
            size="md">
          </app-compact-date-input>

          <app-compact-date-input
            [formControl]="simpleDate3Control"
            placeholder="Fecha 3"
            size="lg">
          </app-compact-date-input>

        </div>
      </div>

      <!-- Estados de Validación -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Estados de Validación</h2>
        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Con error -->
          <app-compact-date-input
            [formControl]="errorDateControl"
            label="Campo con error"
            [floating]="true"
            [required]="true"
            placeholder="Fecha requerida"
            helperText="Este campo es obligatorio">
          </app-compact-date-input>

          <!-- Con valor válido -->
          <app-compact-date-input
            [formControl]="validDateControl"
            label="Campo válido"
            [floating]="true"
            [required]="true"
            placeholder="Fecha válida"
            helperText="Este campo tiene un valor válido">
          </app-compact-date-input>

        </div>
      </div>

      <!-- Información de estado -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-medium mb-4">Estado de los Formularios:</h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Fecha de nacimiento:</strong> {{ birthDateControl.value ? (birthDateControl.value | date:'shortDate') : 'No seleccionada' }}
            <br><strong>Válida:</strong> {{ birthDateControl.valid ? 'Sí' : 'No' }}
          </div>
          <div>
            <strong>Fecha de ingreso:</strong> {{ startDateControl.value ? (startDateControl.value | date:'shortDate') : 'No seleccionada' }}
            <br><strong>Válida:</strong> {{ startDateControl.valid ? 'Sí' : 'No' }}
          </div>
          <div>
            <strong>Fecha de vencimiento:</strong> {{ expiryDateControl.value ? (expiryDateControl.value | date:'shortDate') : 'No seleccionada' }}
            <br><strong>Válida:</strong> {{ expiryDateControl.valid ? 'Sí' : 'No' }}
          </div>
          <div>
            <strong>Fecha del evento:</strong> {{ eventDateControl.value ? (eventDateControl.value | date:'shortDate') : 'No seleccionada' }}
            <br><strong>Válida:</strong> {{ eventDateControl.valid ? 'Sí' : 'No' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class DateInputDemoComponent {
  today = new Date();
  minBirthDate = new Date(1920, 0, 1);

  // FormControls para floating labels
  birthDateControl = new FormControl(null, [Validators.required]);
  startDateControl = new FormControl(null, [Validators.required]);
  optionalDateControl = new FormControl(null);

  // FormControls para labels normales
  expiryDateControl = new FormControl(null, [Validators.required]);
  eventDateControl = new FormControl(null);

  // FormControls sin labels
  simpleDate1Control = new FormControl(null);
  simpleDate2Control = new FormControl(null);
  simpleDate3Control = new FormControl(null);

  // FormControls para estados de validación
  errorDateControl = new FormControl(null, [Validators.required]);
  validDateControl = new FormControl(new Date(), [Validators.required]);

  constructor() {
    // Marcar el control de error como touched para mostrar el error
    setTimeout(() => {
      this.errorDateControl.markAsTouched();
      this.validDateControl.markAsTouched();
    }, 100);
  }

  onBirthDateChange(date: Date | null): void {
    console.log('Fecha de nacimiento seleccionada:', date);
  }

  onStartDateChange(date: Date | null): void {
    console.log('Fecha de ingreso seleccionada:', date);
  }
}