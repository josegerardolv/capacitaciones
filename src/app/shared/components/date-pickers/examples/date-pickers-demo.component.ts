import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DayPickerModule } from '../day-picker.module';

@Component({
  selector: 'app-date-pickers-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DayPickerModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Demo: Date Picker Components</h1>
        <p class="text-gray-600">Ejemplos prácticos de uso de los componentes de selección de fechas</p>
      </div>

      <!-- Ejemplo 1: DayPicker básico -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">1. Selector de día básico</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Selecciona tu fecha de nacimiento
            </label>
            <app-daypicker
              [selected]="birthDate"
              [maxDate]="today"
              [locale]="'es-MX'"
              [showFooter]="true"
              ariaLabel="Selector de fecha de nacimiento"
              (dateChange)="onBirthDateChange($event)">
            </app-daypicker>
          </div>
          <div class="bg-gray-50 p-4 rounded-md">
            <h3 class="font-medium text-gray-900 mb-2">Fecha seleccionada:</h3>
            <p class="text-gray-700">
              {{ birthDate ? (birthDate | date:'fullDate':'es-MX') : 'Ninguna' }}
            </p>
            <p *ngIf="birthDate" class="text-sm text-gray-500 mt-1">
              Edad aproximada: {{ calculateAge(birthDate) }} años
            </p>
          </div>
        </div>
      </div>

      <!-- Ejemplo 2: DayPicker con restricciones -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">2. Selector con restricciones</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fecha de cita (solo días laborales)
            </label>
            <app-daypicker
              [selected]="appointmentDate"
              [minDate]="tomorrow"
              [disabledDates]="isWeekendOrHoliday"
              [locale]="'es-MX'"
              ariaLabel="Selector de fecha de cita"
              (dateChange)="onAppointmentDateChange($event)">
            </app-daypicker>
            <p class="text-xs text-gray-500 mt-2">
              * No disponible fines de semana ni días festivos
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-md">
            <h3 class="font-medium text-gray-900 mb-2">Cita programada:</h3>
            <p class="text-gray-700">
              {{ appointmentDate ? (appointmentDate | date:'fullDate':'es-MX') : 'Selecciona una fecha' }}
            </p>
            <div *ngIf="appointmentDate" class="mt-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Día laboral confirmado
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ejemplo 3: RangeDayPicker para vacaciones -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">3. Selector de rango para vacaciones</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Período de vacaciones
            </label>
            <app-range-daypicker
              [start]="vacationStart"
              [end]="vacationEnd"
              [minDate]="today"
              [maxDate]="maxVacationDate"
              [locale]="'es-MX'"
              [showRangeInfo]="true"
              [showActions]="true"
              ariaLabel="Selector de período de vacaciones"
              (rangeChange)="onVacationRangeChange($event)">
            </app-range-daypicker>
            <p class="text-xs text-gray-500 mt-2">
              * Máximo 6 meses desde hoy
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-md">
            <h3 class="font-medium text-gray-900 mb-2">Período seleccionado:</h3>
            <div *ngIf="vacationStart && vacationEnd; else noVacationRange">
              <div class="space-y-1">
                <p class="text-sm">
                  <span class="font-medium">Inicio:</span> 
                  {{ vacationStart | date:'shortDate':'es-MX' }}
                </p>
                <p class="text-sm">
                  <span class="font-medium">Fin:</span> 
                  {{ vacationEnd | date:'shortDate':'es-MX' }}
                </p>
                <p class="text-sm">
                  <span class="font-medium">Duración:</span> 
                  {{ getVacationDays() }} días
                </p>
              </div>
              <div class="mt-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getVacationDays() }} días de vacaciones
                </span>
              </div>
            </div>
            <ng-template #noVacationRange>
              <p class="text-gray-500 text-sm">Selecciona el período de vacaciones</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Ejemplo 4: Formulario completo -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">4. Formulario de reserva de viaje</h2>
        <form [formGroup]="travelForm" (ngSubmit)="onSubmitTravel()" class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Fecha de salida -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de salida *
              </label>
              <app-daypicker
                [selected]="travelForm.get('departureDate')?.value"
                [minDate]="today"
                [locale]="'es-MX'"
                ariaLabel="Fecha de salida del viaje"
                (dateChange)="onDepartureDateChange($event)">
              </app-daypicker>
              <div *ngIf="travelForm.get('departureDate')?.invalid && travelForm.get('departureDate')?.touched" 
                   class="text-red-600 text-sm mt-1">
                La fecha de salida es requerida
              </div>
            </div>

            <!-- Fecha de regreso -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fecha de regreso *
              </label>
              <app-daypicker
                [selected]="travelForm.get('returnDate')?.value"
                [minDate]="getMinReturnDate()"
                [locale]="'es-MX'"
                ariaLabel="Fecha de regreso del viaje"
                (dateChange)="onReturnDateChange($event)">
              </app-daypicker>
              <div *ngIf="travelForm.get('returnDate')?.invalid && travelForm.get('returnDate')?.touched" 
                   class="text-red-600 text-sm mt-1">
                La fecha de regreso es requerida y debe ser posterior a la salida
              </div>
            </div>
          </div>

          <!-- Resumen del viaje -->
          <div *ngIf="getTravelDuration() > 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 class="font-medium text-blue-900 mb-2">Resumen del viaje</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-blue-700 font-medium">Salida:</span>
                {{ travelForm.get('departureDate')?.value | date:'fullDate':'es-MX' }}
              </div>
              <div>
                <span class="text-blue-700 font-medium">Regreso:</span>
                {{ travelForm.get('returnDate')?.value | date:'fullDate':'es-MX' }}
              </div>
              <div class="col-span-2">
                <span class="text-blue-700 font-medium">Duración:</span>
                {{ getTravelDuration() }} días
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3">
            <button type="button" 
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    (click)="resetTravelForm()">
              Limpiar
            </button>
            <button type="submit" 
                    [disabled]="travelForm.invalid"
                    class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              Reservar viaje
            </button>
          </div>
        </form>
      </div>

      <!-- Información de uso -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-3 text-gray-900">💡 Consejos de uso</h2>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 class="font-medium mb-2">Navegación por teclado:</h4>
            <ul class="space-y-1">
              <li>• Flechas: navegar entre días</li>
              <li>• Enter/Espacio: seleccionar</li>
              <li>• Page Up/Down: cambiar mes</li>
              <li>• Home/End: inicio/fin de semana</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium mb-2">RangePicker especial:</h4>
            <ul class="space-y-1">
              <li>• Shift+Click: selección rápida</li>
              <li>• Hover: preview del rango</li>
              <li>• Escape: limpiar selección</li>
              <li>• Intercambio automático de fechas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

      <!-- Ejemplo adicional: Solo mes actual -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">Ejemplo: Solo mes actual</h2>
        <div>
          <app-daypicker
            [selected]="null"
            [locale]="'es-MX'"
            [onlyCurrentMonth]="true"
            ariaLabel="Solo mes actual ejemplo">
          </app-daypicker>
        </div>
      </div>
  `
})
export class DatePickersDemoComponent {
  // Fechas de referencia
  today = new Date();
  tomorrow = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
  maxVacationDate = new Date(this.today.getFullYear(), this.today.getMonth() + 6, this.today.getDate());

  // Estados de los date pickers
  birthDate: Date | null = null;
  appointmentDate: Date | null = null;
  vacationStart: Date | null = null;
  vacationEnd: Date | null = null;

  // Formulario de viaje
  travelForm: FormGroup;

  // Días festivos (ejemplo)
  holidays = [
    new Date(2024, 11, 25), // Navidad
    new Date(2025, 0, 1),   // Año nuevo
    new Date(2024, 8, 16),  // Independencia
    new Date(2024, 10, 20), // Revolución
  ];

  constructor(private fb: FormBuilder) {
    this.travelForm = this.fb.group({
      departureDate: [null, Validators.required],
      returnDate: [null, Validators.required]
    });
  }

  // Funciones para DayPicker básico
  onBirthDateChange(date: Date) {
    this.birthDate = date;
  }

  calculateAge(birthDate: Date): number {
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Funciones para DayPicker con restricciones
  onAppointmentDateChange(date: Date) {
    this.appointmentDate = date;
  }

  isWeekendOrHoliday = (date: Date): boolean => {
    // Verificar si es fin de semana
    const day = date.getDay();
    if (day === 0 || day === 6) return true;

    // Verificar si es día festivo
    return this.holidays.some(holiday => 
      holiday.getFullYear() === date.getFullYear() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getDate() === date.getDate()
    );
  };

  // Funciones para RangeDayPicker
  onVacationRangeChange(range: { start: Date | null; end: Date | null }) {
    this.vacationStart = range.start;
    this.vacationEnd = range.end;
  }

  getVacationDays(): number {
    if (!this.vacationStart || !this.vacationEnd) return 0;
    const diffTime = Math.abs(this.vacationEnd.getTime() - this.vacationStart.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  // Funciones para formulario de viaje
  onDepartureDateChange(date: Date) {
    this.travelForm.patchValue({ departureDate: date });
    
    // Si ya hay fecha de regreso y es anterior a la nueva salida, limpiarla
    const returnDate = this.travelForm.get('returnDate')?.value;
    if (returnDate && returnDate <= date) {
      this.travelForm.patchValue({ returnDate: null });
    }
  }

  onReturnDateChange(date: Date) {
    this.travelForm.patchValue({ returnDate: date });
  }

  getMinReturnDate(): Date {
    const departureDate = this.travelForm.get('departureDate')?.value;
    if (departureDate) {
      // El regreso debe ser al menos un día después de la salida
      return new Date(departureDate.getTime() + 24 * 60 * 60 * 1000);
    }
    return this.today;
  }

  getTravelDuration(): number {
    const departure = this.travelForm.get('departureDate')?.value;
    const returnDate = this.travelForm.get('returnDate')?.value;
    
    if (!departure || !returnDate) return 0;
    
    const diffTime = Math.abs(returnDate.getTime() - departure.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  resetTravelForm() {
    this.travelForm.reset();
  }

  onSubmitTravel() {
    if (this.travelForm.valid) {
      const formData = this.travelForm.value;
      console.log('Reserva de viaje:', formData);
      alert('¡Viaje reservado exitosamente! Revisa la consola para ver los datos.');
    }
  }
}