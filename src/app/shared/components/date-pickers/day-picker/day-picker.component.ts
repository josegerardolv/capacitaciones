import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, HostBinding, ChangeDetectionStrategy, ChangeDetectorRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SelectComponent, SelectOption } from '../../inputs/select.component';
import { UniversalIconComponent } from '../../universal-icon/universal-icon.component';

@Component({
  selector: 'app-daypicker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SelectComponent, UniversalIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading state -->
    <div *ngIf="isInitializing" class="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Cargando calendario...</span>
    </div>

    <!-- Component content -->
    <div 
      *ngIf="!isInitializing"
      class="app-daypicker bg-white border border-gray-200 rounded-lg shadow-sm p-4 font-montserrat"
      [ngClass]="className"
      [attr.aria-label]="ariaLabel || 'Selector de fecha'"
      role="application">
      
  <!-- Header con navegación y selectores -->
  <div class="app-daypicker__header flex items-start justify-between mb-4" style="max-height: 3rem; z-index: 10;">
        <button
          type="button"
          class="app-daypicker__nav-btn btn-nav"
          style="margin-right: 5px;"
          [attr.aria-label]="'Mes anterior'"
          (click)="previousMonth()"
          [disabled]="!canNavigateToPreviousMonth()">
          <span class="visually-hidden">Mes anterior</span>
          <app-universal-icon class="btn-nav__icon" name="chevron_left" type="material" [size]="18" [decorative]="true"></app-universal-icon>
        </button>

        <div class="app-daypicker__header-content flex items-center space-x-2">
          <ng-container *ngIf="showMonthYearSelector && monthYearSelectAsDropdown; else buttonMode">
            <!-- Selectores usando componente institucional -->
            <div (click)="$event.stopPropagation()" class="flex items-center space-x-2">
              <app-select
                [options]="monthOptions"
                [control]="monthControl"
                label="Mes"
                [floating]="true"
                placeholder="Seleccionar mes"
                class="min-w-[130px]"
                extraClasses="text-sm">
              </app-select>
              
              <app-select
                [options]="yearOptions"
                [control]="yearControl"
                label="Año"
                [floating]="true"
                placeholder="Seleccionar año"
                class="min-w-[90px]"
                extraClasses="text-sm">
              </app-select>
            </div>
          </ng-container>

          <ng-template #buttonMode>
            <!-- Título con mes y año -->
            <h2 class="app-daypicker__title text-lg font-semibold text-gray-900">
              {{ getMonthYearTitle() }}
            </h2>
          </ng-template>
        </div>

        <button
          type="button"
          class="app-daypicker__nav-btn btn-nav"
          style="margin-left: 5px;"
          [attr.aria-label]="'Mes siguiente'"
          (click)="nextMonth()"
          [disabled]="!canNavigateToNextMonth()">
          <span class="visually-hidden">Mes siguiente</span>
          <app-universal-icon class="btn-nav__icon" name="chevron_right" type="material" [size]="18" [decorative]="true"></app-universal-icon>
        </button>
      </div>

      <!-- Calendario grid -->
      <div 
        class="app-daypicker__calendar"
        role="grid"
        [attr.aria-label]="'Calendario para ' + getMonthYearTitle()"
        (keydown)="onKeyDown($event)">
        
        <!-- Encabezado de días de la semana -->
        <div class="app-daypicker__weekdays grid grid-cols-7 gap-1 mb-2" role="row">
          <div 
            *ngFor="let dayName of weekDayNames"
            class="app-daypicker__weekday text-center text-xs font-medium text-gray-500 py-2"
            role="columnheader">
            {{ dayName }}
          </div>
        </div>

        <!-- Días del calendario -->
        <div class="app-daypicker__days grid grid-cols-7 gap-1" role="rowgroup">
          <ng-container *ngFor="let day of calendarDays; trackBy: trackByDay">
            <!-- Si onlyCurrentMonth=true y el día NO pertenece al mes actual, renderizar como contenedor no interactivo -->
            <div *ngIf="onlyCurrentMonth && !day.isCurrentMonth"
                 class="app-daypicker__day app-daypicker__day--other-month-container relative w-10 h-10 rounded-md text-sm font-medium"
                 role="gridcell"
                 [attr.aria-label]="getDayAriaLabel(day) + ' (no visible en mes actual)'">
              <!-- No se muestran los números ni botones interactivos -->
            </div>

            <!-- Días interactivos (botones) -->
            <button *ngIf="!(onlyCurrentMonth && !day.isCurrentMonth)"
                    type="button"
                    class="app-daypicker__day relative w-10 h-10 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    [ngClass]="getDayClasses(day)"
                    [attr.aria-label]="getDayAriaLabel(day)"
                    [attr.aria-selected]="isSelected(day)"
                    [attr.aria-disabled]="isDisabled(day)"
                    [disabled]="isDisabled(day)"
                    [tabindex]="getFocusTabIndex(day)"
                    role="gridcell"
                    (click)="selectDay(day)"
                    (focus)="setFocusedDay(day)">
              <span class="relative z-10">{{ day.date.getDate() }}</span>
              <!-- Indicador de "hoy" -->
              <div *ngIf="isToday(day)"
                   class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full">
              </div>
            </button>
          </ng-container>
        </div>
      </div>

      <!-- Footer con botón de fecha actual -->
      <div class="app-daypicker__footer mt-4 pt-3 border-t" 
           style="border-color: var(--gray-200);">
        <div class="flex items-center justify-between">
          <div class="text-xs" style="color: var(--gray-500);">
            Hoy: {{ getTodayString() }}
          </div>
          <button
            *ngIf="!isTodaySelected() && isTodaySelectable()"
            type="button"
            class="btn-institucional-outline px-3 py-1 text-xs"
            (click)="selectToday()"
            [attr.aria-label]="'Seleccionar fecha actual'">
            Seleccionar Hoy
          </button>
          <span
            *ngIf="isTodaySelected()"
            class="px-3 py-1 text-xs font-medium rounded-md"
            style="color: var(--success); background-color: var(--gray-50);">
            ✓ Hoy seleccionado
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Variables base */
    .app-daypicker {
      --primary: var(--institucional-primario, #8B1538);
      --primary-light: #A61E42;
      --border: #cbd5e1;
      --gray-50: #f8fafc;
      --gray-100: #f1f5f9;
      --gray-400: #94a3b8;
      min-width: 280px;
      max-width: 320px;
      user-select: none;
    }

    /* Días del calendario */
    .app-daypicker__day {
      transition: all 0.15s ease;
      position: relative;
    }

    .app-daypicker__day:hover:not(:disabled) {
      background-color: var(--gray-100);
    }

    .app-daypicker__day:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--primary);
    }

    /* Estados de días simplificados */
    .app-daypicker__day--selected {
      background-color: var(--primary);
      color: white;
    }

    .app-daypicker__day--selected:hover {
      background-color: var(--primary-light);
    }

    .app-daypicker__day--today {
      font-weight: 600;
      color: var(--primary);
    }

    .app-daypicker__day--other-month {
      color: var(--gray-400);
    }

    /* Contenedor para días de otros meses cuando onlyCurrentMonth=true */
    .app-daypicker__day--other-month-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
      background-color: transparent;
      cursor: default;
      pointer-events: none; /* No interactivo */
    }

    .app-daypicker__day--disabled {
      color: var(--gray-400);
      background-color: var(--gray-50);
      cursor: not-allowed;
    }

    .app-daypicker__day--highlighted {
      background-color: #E85AA0;
      color: white;
    }

    /* Botones de navegación integrados al diseño */
    .btn-nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start;
      min-height: var(--select-height, 2.5rem);
      width: var(--select-height, 2.5rem);
      padding: 0.75rem 0;
      border-radius: var(--border-radius, 0.5rem);
      background-color: white;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
      transition: all 0.15s ease;
      cursor: pointer;
      color: var(--text);
      font-family: 'Montserrat', sans-serif;
      font-size: 1rem;
      font-weight: 500;
    }

    .btn-nav:hover:not(:disabled) {
      background-color: var(--gray-50);
      border-color: var(--primary);
      color: var(--primary);
    }

    .btn-nav:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
    }

    .btn-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--gray-50);
    }

    .btn-nav__icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }

    /* Utilidades */
    .visually-hidden {
      position: absolute !important;
      height: 1px; 
      width: 1px;
      overflow: hidden; 
      clip: rect(1px, 1px, 1px, 1px);
      white-space: nowrap;
    }

    /* Responsivo */
    @media (max-width: 640px) {
      .app-daypicker {
        min-width: 260px;
      }
      
      .app-daypicker__day {
        width: 36px;
        height: 36px;
        font-size: 0.75rem;
      }
    }
  `]
})
export class DayPickerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @HostBinding('class') get cssClass() {
    return 'app-daypicker-wrapper';
  }

  // Inputs
  @Input() selected: Date | null = null;
  @Input() initialDate?: Date; // Fecha inicial para mostrar cuando no hay fecha seleccionada
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates?: Date[] | ((date: Date) => boolean) = [];
  @Input() highlightDates?: Date[] = [];
  @Input() locale: string = 'es-MX';
  @Input() firstDayOfWeek: number = 1; // 1 = Lunes
  @Input() showMonthYearSelector: boolean = true;
  @Input() monthYearSelectAsDropdown: boolean = true;
  @Input() showFooter: boolean = false;
  @Input() ariaLabel?: string;
  @Input() className?: string;
  // Si true, solo mostrar los días del mes actual (ocultar/deshabilitar días de meses anteriores/siguientes)
  @Input() onlyCurrentMonth: boolean = false;

  // Outputs
  @Output() dateChange = new EventEmitter<Date>();

  // Estado interno
  currentDate: Date = new Date();
  focusedDay: CalendarDay | null = null;
  calendarDays: CalendarDay[] = [];
  monthNames: string[] = [];
  weekDayNames: string[] = [];
  availableYears: number[] = [];
  isInitializing = true;
  
  // Propiedades para los selectores
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  // FormControls y opciones para los selectores institucionales
  monthControl = new FormControl(new Date().getMonth());
  yearControl = new FormControl(new Date().getFullYear());
  monthOptions: SelectOption[] = [];
  yearOptions: SelectOption[] = [];

  // Referencias a los SelectComponent hijos para forzar refresh
  @ViewChildren(SelectComponent) selects!: QueryList<SelectComponent>;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeLocale();
    this.initializeCalendar();
    this.generateAvailableYears();
    this.setupSelectSubscriptions();
    
    // Forzar detección inicial de cambios
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    // Asegurar que los select hijos reflejen el estado inicial
    setTimeout(() => {
      this.refreshChildSelects();
      // Forzar detección de cambios después de inicialización completa
      this.cdr.detectChanges();
      // Marcar como inicializado
      this.isInitializing = false;
      this.cdr.detectChanges();
    }, 100); // Aumentar delay para mejor UX
  }

  private setupSelectSubscriptions() {
    // Suscribirse a cambios en el selector de mes
    this.monthControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(month => {
      if (month !== null && month !== undefined) {
        this.onMonthChangeFromModel(month);
      }
    });

    // Suscribirse a cambios en el selector de año
    this.yearControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(year => {
      if (year !== null && year !== undefined) {
        this.onYearChangeFromModel(year);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reinicializar el calendario si cambia la fecha seleccionada o la fecha inicial
    if (changes['selected'] || changes['initialDate']) {
      this.initializeCalendar();
    }
    // Regenerar años disponibles si cambian los límites de fecha
    if (changes['minDate'] || changes['maxDate']) {
      this.generateAvailableYears();
    }

    // Si cambian las fechas deshabilitadas o las fechas destacadas, regenerar los días
    if (changes['disabledDates'] || changes['highlightDates']) {
      // Regenerar el arreglo de días para que se apliquen los cambios
      this.generateCalendarDays();
      // Regenerar opciones de meses ya que disabledDates puede afectar si un mes tiene días habilitados
      this.initializeSelectOptions();
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

    // Inicializar opciones para selectores institucionales
    this.initializeSelectOptions();
  }

  private initializeSelectOptions() {
    // Generar opciones de meses
    this.monthOptions = this.monthNames.map((name, index) => ({
      value: index,
      label: name,
      // Deshabilitar el mes si no contiene ningún día habilitado para el año actualmente seleccionado
      disabled: !this.monthHasEnabledDays(this.selectedYear, index)
    }));

    // Generar opciones de años (se actualizará en generateAvailableYears)
    this.updateYearOptions();
  }

  // Comprueba si un mes (año, mesIndex) tiene al menos un día habilitado según la lógica de isDateDisabled
  private monthHasEnabledDays(year: number, monthIndex: number): boolean {
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const dt = new Date(year, monthIndex, d);
      if (!this.isDateDisabled(dt)) return true;
    }
    return false;
  }

  private updateYearOptions() {
    this.yearOptions = this.availableYears.map(year => ({
      value: year,
      label: year.toString()
    }));
  }

  private initializeCalendar() {
    // Determinar qué fecha usar para mostrar el calendario
    let dateToShow: Date;
    
    if (this.selected) {
      dateToShow = new Date(this.selected);
    } else if (this.initialDate) {
      dateToShow = new Date(this.initialDate);
    } else {
      dateToShow = new Date();
    }
    
    // Actualizar currentDate y regenerar el calendario
    this.currentDate = dateToShow;
    this.syncSelectorsWithCurrentDate();
    this.generateCalendarDays();
    
    // Forzar detección inmediata de cambios
    this.cdr.markForCheck();
  }

  /**
   * Sincroniza las propiedades de los selectores con currentDate
   */
  private syncSelectorsWithCurrentDate(): void {
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
    
    // Sincronizar FormControls para los selectores institucionales
    // Usar timeout para asegurar que se actualicen correctamente
    setTimeout(() => {
      this.monthControl.setValue(this.selectedMonth, { emitEvent: false });
      this.yearControl.setValue(this.selectedYear, { emitEvent: false });
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      // Forzar refresh en hijos select para que reflejen los cambios programáticos
      this.refreshChildSelects();
      // Actualizar opciones de meses en caso de que el año o límites hayan cambiado
      this.initializeSelectOptions();
    }, 0);
  }

  private refreshChildSelects(): void {
    if (!this.selects) return;
    this.selects.forEach(s => {
      try { s.refreshFromControl(); } catch (e) { /* noop */ }
    });
  }

  /**
   * Actualiza currentDate y sincroniza todos los componentes
   */
  private updateCurrentDate(newDate: Date): void {
    this.currentDate = newDate;
    this.syncSelectorsWithCurrentDate();
    this.generateCalendarDays();
    this.cdr.markForCheck();
  }

  private generateAvailableYears() {
    const currentYear = new Date().getFullYear();
    const minYear = this.minDate ? this.minDate.getFullYear() : currentYear - 10;
    const maxYear = this.maxDate ? this.maxDate.getFullYear() : currentYear + 10;

    // Empezar por el año actual si está dentro del rango; si no, empezar por maxYear
    const startYear = Math.min(currentYear, maxYear);
    const endYear = minYear;

    this.availableYears = [];
    for (let y = startYear; y >= endYear; y--) {
      this.availableYears.push(y);
    }

    // Actualizar opciones del selector institucional
    this.updateYearOptions();
    // Actualizar options de meses ya que el rango de años o límites puede afectar meses habilitados
    this.initializeSelectOptions();
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

    let remainingDays: number;
    // Si onlyCurrentMonth=true, calculamos filas necesarias (rows) y rellenamos hasta rows*7
    if (this.onlyCurrentMonth) {
      const rows = Math.ceil(totalDays / 7);
      remainingDays = rows * 7 - totalDays;
    } else {
      // Por compatibilidad, seguimos mostrando 6 semanas (42 días)
      remainingDays = 42 - totalDays; // 6 semanas * 7 días
    }

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
      isSelected: this.selected ? this.isSameDay(date, this.selected) : false,
      isDisabled: this.isDateDisabled(date),
      isHighlighted: this.isDateHighlighted(date)
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
      try {
        return !!this.disabledDates(date);
      } catch (err) {
        // Si la función lanzara, no bloquear todo el calendario
        console.warn('day-picker: error en disabledDates function', err);
        return false;
      }
    }

    return false;
  }

  private isDateHighlighted(date: Date): boolean {
    if (!this.highlightDates) return false;
    return this.highlightDates.some(highlightDate => this.isSameDay(date, highlightDate));
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return formatter.format(new Date());
  }

  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toISOString();
  }

  getDayClasses(day: CalendarDay): string {
    const classes = ['app-daypicker__day'];
    
    if (day.isSelected) classes.push('app-daypicker__day--selected');
    if (day.isToday) classes.push('app-daypicker__day--today');
    if (!day.isCurrentMonth && !this.onlyCurrentMonth) classes.push('app-daypicker__day--other-month');
    if (day.isDisabled) classes.push('app-daypicker__day--disabled');
    if (day.isHighlighted) classes.push('app-daypicker__day--highlighted');

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
    
    if (day.isSelected) label += ', seleccionado';
    if (day.isToday) label += ', hoy';
    if (day.isDisabled) label += ', no disponible';
    
    return label;
  }

  isSelected(day: CalendarDay): boolean {
    return day.isSelected;
  }

  isDisabled(day: CalendarDay): boolean {
    return day.isDisabled;
  }

  isToday(day: CalendarDay): boolean {
    return day.isToday;
  }

  /**
   * Verifica si la fecha actual (hoy) ya está seleccionada
   */
  isTodaySelected(): boolean {
    if (!this.selected) return false;
    const today = new Date();
    return this.isSameDay(this.selected, today);
  }

  /**
   * Devuelve true si la fecha de hoy puede ser seleccionada (no está deshabilitada)
   */
  isTodaySelectable(): boolean {
    try {
      const today = new Date();
      // Normalizar hora para la comparación
      const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return !this.isDateDisabled(dt);
    } catch (e) {
      return false;
    }
  }

  getFocusTabIndex(day: CalendarDay): number {
    // Solo el día enfocado o el seleccionado (o el primero del mes) puede recibir focus
    if (this.focusedDay && this.isSameDay(day.date, this.focusedDay.date)) return 0;
    if (!this.focusedDay && day.isSelected) return 0;
    if (!this.focusedDay && !this.selected && day.isCurrentMonth && day.date.getDate() === 1) return 0;
    return -1;
  }

  // Navegación
  previousMonth() {
    if (this.canNavigateToPreviousMonth()) {
      const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.updateCurrentDate(newDate);
    }
  }

  nextMonth() {
    if (this.canNavigateToNextMonth()) {
      const newDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.updateCurrentDate(newDate);
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
    const newDate = new Date(this.currentDate.getFullYear(), newMonth, 1);
    this.updateCurrentDate(newDate);
  }

  onYearChange(event: any) {
    const newYear = parseInt(event.target.value);
    const newDate = new Date(newYear, this.currentDate.getMonth(), 1);
    this.updateCurrentDate(newDate);
  }

  // Métodos para ngModel binding
  onMonthChangeFromModel(newMonth: number) {
    const newDate = new Date(this.currentDate.getFullYear(), newMonth, 1);
    this.updateCurrentDate(newDate);
    // Actualizar opciones de meses porque el mes seleccionado cambió
    this.initializeSelectOptions();
  }

  onYearChangeFromModel(newYear: number) {
    const newDate = new Date(newYear, this.currentDate.getMonth(), 1);
    this.updateCurrentDate(newDate);
    // Regenerar opciones de meses para el nuevo año
    this.initializeSelectOptions();
  }

  // Selección de día
  selectDay(day: CalendarDay) {
    if (day.isDisabled) return;

    this.selected = new Date(day.date);
    this.generateCalendarDays(); // Regenerar para actualizar el estado seleccionado
    this.dateChange.emit(new Date(day.date));
    this.cdr.markForCheck();
  }

  /**
   * Selecciona la fecha actual (hoy)
   */
  selectToday() {
    const today = new Date();
    
    // Primero navegar al mes/año actual si es necesario
    if (this.currentDate.getMonth() !== today.getMonth() || 
        this.currentDate.getFullYear() !== today.getFullYear()) {
      this.updateCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    
    // Luego seleccionar la fecha de hoy
    this.selected = new Date(today);
    this.generateCalendarDays();
    this.dateChange.emit(new Date(today));
    this.cdr.markForCheck();
  }

  setFocusedDay(day: CalendarDay) {
    this.focusedDay = day;
  }

  // Navegación por teclado
  onKeyDown(event: KeyboardEvent) {
    if (!this.focusedDay) {
      // Si no hay día enfocado, usar el seleccionado o el 1ro del mes
      this.focusedDay = this.calendarDays.find(d => d.isSelected) || 
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
        // Ir al primer día de la semana
        newIndex = currentIndex - (currentIndex % 7);
        event.preventDefault();
        break;
      case 'End':
        // Ir al último día de la semana
        newIndex = currentIndex + (6 - (currentIndex % 7));
        event.preventDefault();
        break;
      case 'PageUp':
        if (event.shiftKey) {
          // Cambiar año
          this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1);
        } else {
          // Cambiar mes
          this.previousMonth();
        }
        event.preventDefault();
        return;
      case 'PageDown':
        if (event.shiftKey) {
          // Cambiar año
          this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1);
        } else {
          // Cambiar mes
          this.nextMonth();
        }
        event.preventDefault();
        return;
      case 'Enter':
      case ' ':
        if (this.focusedDay && !this.focusedDay.isDisabled) {
          this.selectDay(this.focusedDay);
        }
        event.preventDefault();
        break;
      case 'Escape':
        // Podría emitir un evento para cerrar si se usa como popup
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