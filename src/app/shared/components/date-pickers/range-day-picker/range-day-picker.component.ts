import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, HostBinding, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-range-daypicker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="app-range-daypicker bg-white border border-gray-200 rounded-lg shadow-sm p-4 font-montserrat"
      [ngClass]="className"
      [attr.aria-label]="ariaLabel || 'Selector de rango de fechas'"
      role="application">
      
      <!-- Header con navegación y selectores -->
      <div class="app-range-daypicker__header flex items-center justify-between mb-4">
        <button 
          type="button"
          class="app-range-daypicker__nav-btn p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          [attr.aria-label]="'Mes anterior'"
          (click)="previousMonth()"
          [disabled]="!canNavigateToPreviousMonth()">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="app-range-daypicker__header-content flex items-center space-x-2">
          <ng-container *ngIf="showMonthYearSelector && monthYearSelectAsDropdown; else buttonMode">
            <!-- Selectores dropdown -->
            <select 
              class="app-range-daypicker__month-select bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [value]="currentDate.getMonth()"
              (change)="onMonthChange($event)"
              [attr.aria-label]="'Seleccionar mes'">
              <option *ngFor="let month of monthNames; let i = index" [value]="i">
                {{ month }}
              </option>
            </select>
            
            <select 
              class="app-range-daypicker__year-select bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              [value]="currentDate.getFullYear()"
              (change)="onYearChange($event)"
              [attr.aria-label]="'Seleccionar año'">
              <option *ngFor="let year of availableYears" [value]="year">
                {{ year }}
              </option>
            </select>
          </ng-container>

          <ng-template #buttonMode>
            <!-- Título con mes y año -->
            <h2 class="app-range-daypicker__title text-lg font-semibold text-gray-900">
              {{ getMonthYearTitle() }}
            </h2>
          </ng-template>
        </div>

        <button 
          type="button"
          class="app-range-daypicker__nav-btn p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          [attr.aria-label]="'Mes siguiente'"
          (click)="nextMonth()"
          [disabled]="!canNavigateToNextMonth()">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Información del rango seleccionado -->
      <div *ngIf="showRangeInfo" class="app-range-daypicker__info mb-4 p-3 bg-gray-50 rounded-md">
        <div class="text-sm text-gray-700">
          <div *ngIf="!start && !end" class="text-gray-500">
            Selecciona la fecha de inicio
          </div>
          <div *ngIf="start && !end" class="flex items-center space-x-2">
            <span class="font-medium">Inicio:</span>
            <span>{{ formatDate(start) }}</span>
            <span class="text-gray-500">(selecciona fecha final)</span>
          </div>
          <div *ngIf="start && end" class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <span class="font-medium">Inicio:</span>
              <span>{{ formatDate(start) }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="font-medium">Fin:</span>
              <span>{{ formatDate(end) }}</span>
            </div>
            <span class="text-blue-600 text-xs">({{ getDaysCount() }} días)</span>
          </div>
        </div>
      </div>

      <!-- Calendario grid -->
      <div 
        class="app-range-daypicker__calendar"
        role="grid"
        [attr.aria-label]="'Calendario para ' + getMonthYearTitle()"
        (keydown)="onKeyDown($event)">
        
        <!-- Encabezado de días de la semana -->
        <div class="app-range-daypicker__weekdays grid grid-cols-7 gap-1 mb-2" role="row">
          <div 
            *ngFor="let dayName of weekDayNames"
            class="app-range-daypicker__weekday text-center text-xs font-medium text-gray-500 py-2"
            role="columnheader">
            {{ dayName }}
          </div>
        </div>

        <!-- Días del calendario -->
        <div class="app-range-daypicker__days grid grid-cols-7 gap-1" role="rowgroup">
          <button
            *ngFor="let day of calendarDays; trackBy: trackByDay"
            type="button"
            class="app-range-daypicker__day relative w-10 h-10 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            [ngClass]="getDayClasses(day)"
            [attr.aria-label]="getDayAriaLabel(day)"
            [attr.aria-selected]="isInRange(day)"
            [attr.aria-disabled]="isDisabled(day)"
            [disabled]="isDisabled(day)"
            [tabindex]="getFocusTabIndex(day)"
            role="gridcell"
            (click)="selectDay(day, $event)"
            (focus)="setFocusedDay(day)"
            (mouseenter)="onDayMouseEnter(day)"
            (mouseleave)="onDayMouseLeave(day)">
            
            <span class="relative z-10">{{ day.date.getDate() }}</span>
            
            <!-- Indicador de "hoy" -->
            <div 
              *ngIf="isToday(day)"
              class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full">
            </div>

            <!-- Indicadores de rango -->
            <div 
              *ngIf="isRangeStart(day)"
              class="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-md opacity-70">
            </div>
            <div 
              *ngIf="isRangeEnd(day)"
              class="absolute top-0 right-0 w-2 h-full bg-blue-500 rounded-r-md opacity-70">
            </div>
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div *ngIf="showActions" class="app-range-daypicker__actions mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
        <button 
          type="button"
          class="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:underline"
          (click)="clearRange()">
          Limpiar selección
        </button>
        
        <div class="text-xs text-gray-500">
          {{ getTodayString() }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-range-daypicker {
      --daypicker-primary: var(--institucional-primario, #8B1538);
      --daypicker-primary-light: var(--institucional-primario-light, #A61E42);
      --daypicker-range: var(--institucional-secundario, #D63384);
      --daypicker-range-light: var(--institucional-secundario-light, #E85AA0);
      --daypicker-border: var(--gray-300, #cbd5e1);
      --daypicker-text: var(--gray-900, #0f172a);
      --daypicker-text-muted: var(--gray-500, #64748b);
      min-width: 280px;
      max-width: 320px;
      user-select: none;
    }

    .app-range-daypicker__day {
      position: relative;
      overflow: hidden;
    }

    .app-range-daypicker__day:hover:not(:disabled) {
      background-color: var(--gray-100, #f1f5f9);
    }

    .app-range-daypicker__day--range-start {
      background-color: var(--daypicker-primary);
      color: white;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    .app-range-daypicker__day--range-end {
      background-color: var(--daypicker-primary);
      color: white;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    .app-range-daypicker__day--range-start.app-range-daypicker__day--range-end {
      border-radius: 6px;
    }

    .app-range-daypicker__day--in-range {
      background-color: var(--daypicker-range-light);
      color: white;
      border-radius: 0;
    }

    .app-range-daypicker__day--hover-range {
      background-color: rgba(214, 51, 132, 0.3);
      border-radius: 0;
    }

    .app-range-daypicker__day--today {
      font-weight: 600;
      color: var(--daypicker-primary);
    }

    .app-range-daypicker__day--today.app-range-daypicker__day--in-range,
    .app-range-daypicker__day--today.app-range-daypicker__day--range-start,
    .app-range-daypicker__day--today.app-range-daypicker__day--range-end {
      color: white;
      font-weight: 700;
    }

    .app-range-daypicker__day--other-month {
      color: var(--gray-400, #94a3b8);
    }

    .app-range-daypicker__day--disabled {
      color: var(--gray-400, #94a3b8);
      background-color: var(--gray-50, #f8fafc);
      cursor: not-allowed;
    }

    .app-range-daypicker__nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .app-range-daypicker__weekday {
      min-height: 32px;
    }

    /* Estados de focus */
    .app-range-daypicker__day:focus {
      ring: 2px solid var(--primary-blue, #3b82f6);
      outline: none;
    }

    /* Responsivo */
    @media (max-width: 640px) {
      .app-range-daypicker {
        min-width: 260px;
      }
      
      .app-range-daypicker__day {
        width: 36px;
        height: 36px;
        font-size: 0.75rem;
      }
    }
  `]
})
export class RangeDayPickerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @HostBinding('class') get cssClass() {
    return 'app-range-daypicker-wrapper';
  }

  // Inputs
  @Input() start: Date | null = null;
  @Input() end: Date | null = null;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates?: Date[] | ((date: Date) => boolean) = [];
  @Input() locale: string = 'es-MX';
  @Input() firstDayOfWeek: number = 1; // 1 = Lunes
  @Input() showMonthYearSelector: boolean = true;
  @Input() monthYearSelectAsDropdown: boolean = true;
  @Input() showRangeInfo: boolean = true;
  @Input() showActions: boolean = true;
  @Input() ariaLabel?: string;
  @Input() className?: string;

  // Outputs
  @Output() rangeChange = new EventEmitter<DateRange>();

  // Estado interno
  currentDate: Date = new Date();
  focusedDay: CalendarDay | null = null;
  hoveredDay: CalendarDay | null = null;
  calendarDays: CalendarDay[] = [];
  monthNames: string[] = [];
  weekDayNames: string[] = [];
  availableYears: number[] = [];
  
  private isSelectingRange = false;
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeLocale();
    this.initializeCalendar();
    this.generateAvailableYears();
    
    // Forzar detección inicial de cambios
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    // Forzar detección de cambios después de inicialización completa
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reinicializar el calendario si cambian las fechas de rango
    if (changes['start'] || changes['end']) {
      this.initializeCalendar();
    }
    // Regenerar años disponibles si cambian los límites de fecha
    if (changes['minDate'] || changes['maxDate']) {
      this.generateAvailableYears();
    }
    
    // Forzar detección de cambios cuando hay cambios relevantes
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeLocale() {
    const formatter = new Intl.DateTimeFormat(this.locale, { month: 'long' });
    this.monthNames = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1);
      return formatter.format(date);
    });

    const weekDayFormatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
    const tempWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2000, 0, 2 + i); // Comenzar desde lunes
      return weekDayFormatter.format(date);
    });

    // Reordenar según firstDayOfWeek
    this.weekDayNames = [
      ...tempWeekDays.slice(this.firstDayOfWeek),
      ...tempWeekDays.slice(0, this.firstDayOfWeek)
    ];
  }

  private initializeCalendar() {
    if (this.start) {
      this.currentDate = new Date(this.start);
    } else if (this.end) {
      this.currentDate = new Date(this.end);
    }
    this.generateCalendarDays();
    
    // Forzar detección inmediata de cambios
    this.cdr.markForCheck();
  }

  private generateAvailableYears() {
    const currentYear = new Date().getFullYear();
    const minYear = this.minDate ? this.minDate.getFullYear() : currentYear - 10;
    const maxYear = this.maxDate ? this.maxDate.getFullYear() : currentYear + 10;
    
    this.availableYears = Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => minYear + i
    );
  }

  private generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Calcular el día de la semana del primer día (ajustado por firstDayOfWeek)
    let startWeekDay = firstDay.getDay() - this.firstDayOfWeek;
    if (startWeekDay < 0) startWeekDay += 7;

    // Días del mes anterior para completar la primera semana
    const daysFromPrevMonth = Array.from({ length: startWeekDay }, (_, i) => {
      const date = new Date(year, month, -startWeekDay + i + 1);
      return this.createCalendarDay(date, false);
    });

    // Días del mes actual
    const daysFromCurrentMonth = Array.from({ length: lastDay.getDate() }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return this.createCalendarDay(date, true);
    });

    // Días del siguiente mes para completar la última semana
    const totalDays = daysFromPrevMonth.length + daysFromCurrentMonth.length;
    const remainingDays = 42 - totalDays; // 6 semanas * 7 días
    const daysFromNextMonth = Array.from({ length: remainingDays }, (_, i) => {
      const date = new Date(year, month + 1, i + 1);
      return this.createCalendarDay(date, false);
    });

    this.calendarDays = [
      ...daysFromPrevMonth,
      ...daysFromCurrentMonth,
      ...daysFromNextMonth
    ];
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    return {
      date: new Date(date),
      isCurrentMonth,
      isToday: this.isSameDay(date, new Date()),
      isSelected: false, // En range picker no usamos isSelected
      isDisabled: this.isDateDisabled(date),
      isHighlighted: false // Podríamos extender esto si es necesario
    };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private isDateDisabled(date: Date): boolean {
    // Verificar minDate y maxDate
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;

    // Verificar disabledDates
    if (Array.isArray(this.disabledDates)) {
      return this.disabledDates.some(disabledDate => this.isSameDay(date, disabledDate));
    } else if (typeof this.disabledDates === 'function') {
      return this.disabledDates(date);
    }

    return false;
  }

  // Métodos para verificar estados de rango
  isRangeStart(day: CalendarDay): boolean {
    return this.start ? this.isSameDay(day.date, this.start) : false;
  }

  isRangeEnd(day: CalendarDay): boolean {
    return this.end ? this.isSameDay(day.date, this.end) : false;
  }

  isInRange(day: CalendarDay): boolean {
    if (!this.start || !this.end) return false;
    return day.date >= this.start && day.date <= this.end;
  }

  isInHoverRange(day: CalendarDay): boolean {
    if (!this.start || !this.hoveredDay || this.end) return false;
    
    const hoverDate = this.hoveredDay.date;
    const startDate = this.start;
    
    // Determinar el rango basado en la posición del hover
    const rangeStart = hoverDate < startDate ? hoverDate : startDate;
    const rangeEnd = hoverDate < startDate ? startDate : hoverDate;
    
    return day.date >= rangeStart && day.date <= rangeEnd;
  }

  // Métodos públicos del template
  getMonthYearTitle(): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: 'long'
    });
    return formatter.format(this.currentDate);
  }

  getTodayString(): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return formatter.format(new Date());
  }

  formatDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return formatter.format(date);
  }

  getDaysCount(): number {
    if (!this.start || !this.end) return 0;
    const diffTime = Math.abs(this.end.getTime() - this.start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  getDayClasses(day: CalendarDay): string {
    const classes = ['app-range-daypicker__day'];
    
    if (this.isRangeStart(day)) classes.push('app-range-daypicker__day--range-start');
    if (this.isRangeEnd(day)) classes.push('app-range-daypicker__day--range-end');
    if (this.isInRange(day)) classes.push('app-range-daypicker__day--in-range');
    if (this.isInHoverRange(day)) classes.push('app-range-daypicker__day--hover-range');
    if (day.isToday) classes.push('app-range-daypicker__day--today');
    if (!day.isCurrentMonth) classes.push('app-range-daypicker__day--other-month');
    if (day.isDisabled) classes.push('app-range-daypicker__day--disabled');

    return classes.join(' ');
  }

  getDayAriaLabel(day: CalendarDay): string {
    const formatter = new Intl.DateTimeFormat(this.locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let label = formatter.format(day.date);
    
    if (this.isRangeStart(day)) label += ', inicio del rango';
    if (this.isRangeEnd(day)) label += ', fin del rango';
    if (this.isInRange(day) && !this.isRangeStart(day) && !this.isRangeEnd(day)) label += ', en rango seleccionado';
    if (day.isToday) label += ', hoy';
    if (day.isDisabled) label += ', no disponible';
    
    return label;
  }

  isDisabled(day: CalendarDay): boolean {
    return day.isDisabled;
  }

  isToday(day: CalendarDay): boolean {
    return day.isToday;
  }

  getFocusTabIndex(day: CalendarDay): number {
    // Solo el día enfocado puede recibir focus
    if (this.focusedDay && this.isSameDay(day.date, this.focusedDay.date)) return 0;
    if (!this.focusedDay && this.isRangeStart(day)) return 0;
    if (!this.focusedDay && !this.start && day.isCurrentMonth && day.date.getDate() === 1) return 0;
    return -1;
  }

  // Navegación
  previousMonth() {
    if (this.canNavigateToPreviousMonth()) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.generateCalendarDays();
      this.cdr.markForCheck();
    }
  }

  nextMonth() {
    if (this.canNavigateToNextMonth()) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.generateCalendarDays();
      this.cdr.markForCheck();
    }
  }

  canNavigateToPreviousMonth(): boolean {
    if (!this.minDate) return true;
    const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    return prevMonth >= new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
  }

  canNavigateToNextMonth(): boolean {
    if (!this.maxDate) return true;
    const nextMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    return nextMonth <= new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
  }

  onMonthChange(event: any) {
    const newMonth = parseInt(event.target.value);
    this.currentDate = new Date(this.currentDate.getFullYear(), newMonth, 1);
    this.generateCalendarDays();
    this.cdr.markForCheck();
  }

  onYearChange(event: any) {
    const newYear = parseInt(event.target.value);
    this.currentDate = new Date(newYear, this.currentDate.getMonth(), 1);
    this.generateCalendarDays();
    this.cdr.markForCheck();
  }

  // Selección de rango
  selectDay(day: CalendarDay, event: MouseEvent) {
    if (day.isDisabled) return;

    const selectedDate = new Date(day.date);

    // Verificar si es Shift+click para selección rápida
    if (event.shiftKey && this.start && !this.end) {
      this.end = selectedDate;
      // Intercambiar si end < start
      if (this.end < this.start) {
        [this.start, this.end] = [this.end, this.start];
      }
      this.emitRangeChange();
      this.generateCalendarDays();
      this.cdr.markForCheck();
      return;
    }

    // Lógica normal de selección
    if (!this.start || (this.start && this.end)) {
      // Comenzar nueva selección
      this.start = selectedDate;
      this.end = null;
      this.isSelectingRange = true;
    } else if (this.start && !this.end) {
      // Completar el rango
      this.end = selectedDate;
      // Intercambiar si end < start
      if (this.end < this.start) {
        [this.start, this.end] = [this.end, this.start];
      }
      this.isSelectingRange = false;
      this.emitRangeChange();
    }

    this.generateCalendarDays();
    this.cdr.markForCheck();
  }

  private emitRangeChange() {
    this.rangeChange.emit({
      start: this.start ? new Date(this.start) : null,
      end: this.end ? new Date(this.end) : null
    });
  }

  clearRange() {
    this.start = null;
    this.end = null;
    this.isSelectingRange = false;
    this.hoveredDay = null;
    this.emitRangeChange();
    this.generateCalendarDays();
    this.cdr.markForCheck();
  }

  setFocusedDay(day: CalendarDay) {
    this.focusedDay = day;
  }

  onDayMouseEnter(day: CalendarDay) {
    if (day.isDisabled) return;
    
    if (this.isSelectingRange && this.start && !this.end) {
      this.hoveredDay = day;
      this.cdr.markForCheck();
    }
  }

  onDayMouseLeave(day: CalendarDay) {
    this.hoveredDay = null;
    this.cdr.markForCheck();
  }

  // Navegación por teclado (similar al DayPickerComponent)
  onKeyDown(event: KeyboardEvent) {
    if (!this.focusedDay) {
      // Si no hay día enfocado, usar el start o el 1ro del mes
      this.focusedDay = this.calendarDays.find(d => this.isRangeStart(d)) || 
                       this.calendarDays.find(d => d.isCurrentMonth && d.date.getDate() === 1) ||
                       this.calendarDays[0];
    }

    const currentIndex = this.calendarDays.findIndex(d => 
      this.focusedDay && this.isSameDay(d.date, this.focusedDay.date)
    );

    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = Math.max(0, currentIndex - 1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        newIndex = Math.min(this.calendarDays.length - 1, currentIndex + 1);
        event.preventDefault();
        break;
      case 'ArrowUp':
        newIndex = Math.max(0, currentIndex - 7);
        event.preventDefault();
        break;
      case 'ArrowDown':
        newIndex = Math.min(this.calendarDays.length - 1, currentIndex + 7);
        event.preventDefault();
        break;
      case 'Home':
        newIndex = currentIndex - (currentIndex % 7);
        event.preventDefault();
        break;
      case 'End':
        newIndex = currentIndex + (6 - (currentIndex % 7));
        event.preventDefault();
        break;
      case 'PageUp':
        if (event.shiftKey) {
          this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1);
        } else {
          this.previousMonth();
        }
        event.preventDefault();
        return;
      case 'PageDown':
        if (event.shiftKey) {
          this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1);
        } else {
          this.nextMonth();
        }
        event.preventDefault();
        return;
      case 'Enter':
      case ' ':
        if (this.focusedDay && !this.focusedDay.isDisabled) {
          this.selectDay(this.focusedDay, { shiftKey: event.shiftKey } as MouseEvent);
        }
        event.preventDefault();
        break;
      case 'Escape':
        this.clearRange();
        break;
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < this.calendarDays.length) {
      this.focusedDay = this.calendarDays[newIndex];
      this.cdr.markForCheck();
      
      // Enfocar el elemento DOM
      setTimeout(() => {
        const dayButton = document.querySelector(`button[tabindex="0"]`) as HTMLElement;
        dayButton?.focus();
      });
    }
  }
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isHighlighted: boolean;
}