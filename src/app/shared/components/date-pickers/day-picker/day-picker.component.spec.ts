import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayPickerComponent } from './day-picker.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('DayPickerComponent', () => {
  let component: DayPickerComponent;
  let fixture: ComponentFixture<DayPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayPickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DayPickerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current month and year in header', () => {
    const testDate = new Date(2024, 0, 15); // 15 de enero 2024
    component.currentDate = testDate;
    component.locale = 'es-MX';
    component.ngOnInit();
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('.app-daypicker__title'));
    expect(title.nativeElement.textContent.trim()).toContain('enero');
    expect(title.nativeElement.textContent.trim()).toContain('2024');
  });

  it('should emit dateChange when a day is selected', () => {
    spyOn(component.dateChange, 'emit');
    
    const testDate = new Date(2024, 0, 15);
    component.ngOnInit();
    fixture.detectChanges();

    // Buscar el botón del día 15
    const dayButtons = fixture.debugElement.queryAll(By.css('.app-daypicker__day'));
    const day15Button = dayButtons.find(btn => 
      btn.nativeElement.textContent.trim() === '15'
    );

    expect(day15Button).toBeTruthy();
    
    // Simular click
    day15Button.nativeElement.click();
    
    expect(component.dateChange.emit).toHaveBeenCalled();
  });

  it('should respect minDate constraint', () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 15);
    const testDate = new Date(today.getFullYear(), today.getMonth(), 10); // Antes del mínimo
    
    component.minDate = minDate;
    component.ngOnInit();
    fixture.detectChanges();

    // Verificar que las fechas antes del mínimo están deshabilitadas
    const disabledDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    expect(disabledDay?.isDisabled).toBe(true);
  });

  it('should respect maxDate constraint', () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), 15);
    
    component.maxDate = maxDate;
    component.ngOnInit();
    fixture.detectChanges();

    // Verificar que las fechas después del máximo están deshabilitadas
    const disabledDay = component.calendarDays.find(day => 
      day.date.getDate() === 20 && day.isCurrentMonth
    );
    
    expect(disabledDay?.isDisabled).toBe(true);
  });

  it('should disable dates in disabledDates array', () => {
    const today = new Date();
    const disabledDate = new Date(today.getFullYear(), today.getMonth(), 10);
    
    component.disabledDates = [disabledDate];
    component.ngOnInit();
    fixture.detectChanges();

    const disabledDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    expect(disabledDay?.isDisabled).toBe(true);
  });

  it('should disable dates using disabledDates function', () => {
    // Deshabilitar todos los lunes
    component.disabledDates = (date: Date) => date.getDay() === 1;
    component.ngOnInit();
    fixture.detectChanges();

    const mondayDays = component.calendarDays.filter(day => 
      day.date.getDay() === 1 && day.isCurrentMonth
    );
    
    mondayDays.forEach(day => {
      expect(day.isDisabled).toBe(true);
    });
  });

  it('should navigate to previous month', () => {
    const initialDate = new Date(2024, 5, 15); // Junio 2024
    component.currentDate = initialDate;
    component.ngOnInit();
    fixture.detectChanges();

    component.previousMonth();
    
    expect(component.currentDate.getMonth()).toBe(4); // Mayo
    expect(component.currentDate.getFullYear()).toBe(2024);
  });

  it('should navigate to next month', () => {
    const initialDate = new Date(2024, 5, 15); // Junio 2024
    component.currentDate = initialDate;
    component.ngOnInit();
    fixture.detectChanges();

    component.nextMonth();
    
    expect(component.currentDate.getMonth()).toBe(6); // Julio
    expect(component.currentDate.getFullYear()).toBe(2024);
  });

  it('should not navigate to previous month if it would go before minDate', () => {
    const currentDate = new Date(2024, 5, 15); // Junio 2024
    const minDate = new Date(2024, 5, 1); // 1 de junio 2024
    
    component.currentDate = currentDate;
    component.minDate = minDate;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.canNavigateToPreviousMonth()).toBe(false);
    
    const prevButton = fixture.debugElement.query(By.css('.app-daypicker__nav-btn'));
    expect(prevButton.nativeElement.disabled).toBe(true);
  });

  it('should handle keyboard navigation correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();

    // Simular focus en el primer día del mes
    const firstDay = component.calendarDays.find(day => 
      day.isCurrentMonth && day.date.getDate() === 1
    );
    
    if (firstDay) {
      component.setFocusedDay(firstDay);
      
      // Simular presionar flecha derecha
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      spyOn(keyEvent, 'preventDefault');
      
      component.onKeyDown(keyEvent);
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
      expect(component.focusedDay?.date.getDate()).toBe(2);
    }
  });

  it('should mark today correctly', () => {
    const today = new Date();
    component.currentDate = today;
    component.ngOnInit();
    fixture.detectChanges();

    const todayDay = component.calendarDays.find(day => 
      day.isToday && day.isCurrentMonth
    );
    
    expect(todayDay).toBeTruthy();
    expect(todayDay?.date.toDateString()).toBe(today.toDateString());
  });

  it('should display month/year selectors when showMonthYearSelector is true', () => {
    component.showMonthYearSelector = true;
    component.monthYearSelectAsDropdown = true;
    component.ngOnInit();
    fixture.detectChanges();

    const monthSelect = fixture.debugElement.query(By.css('.app-daypicker__month-select'));
    const yearSelect = fixture.debugElement.query(By.css('.app-daypicker__year-select'));
    
    expect(monthSelect).toBeTruthy();
    expect(yearSelect).toBeTruthy();
  });

  it('should generate correct calendar days including previous and next month', () => {
    const testDate = new Date(2024, 0, 15); // 15 de enero 2024
    component.currentDate = testDate;
    component.ngOnInit();
    fixture.detectChanges();

    // Enero 2024 comienza en lunes, entonces debería tener algunos días de diciembre 2023
    const prevMonthDays = component.calendarDays.filter(day => !day.isCurrentMonth && day.date < testDate);
    const currentMonthDays = component.calendarDays.filter(day => day.isCurrentMonth);
    const nextMonthDays = component.calendarDays.filter(day => !day.isCurrentMonth && day.date > testDate);
    
    expect(prevMonthDays.length).toBeGreaterThan(0);
    expect(currentMonthDays.length).toBe(31); // Enero tiene 31 días
    expect(nextMonthDays.length).toBeGreaterThan(0);
    expect(component.calendarDays.length).toBe(42); // 6 semanas x 7 días
  });

  it('should apply correct CSS classes to days', () => {
    const today = new Date();
    component.currentDate = today;
    component.selected = today;
    component.ngOnInit();
    fixture.detectChanges();

    const todayDay = component.calendarDays.find(day => day.isToday);
    expect(todayDay).toBeTruthy();
    
    if (todayDay) {
      const classes = component.getDayClasses(todayDay);
      expect(classes).toContain('app-daypicker__day--today');
      expect(classes).toContain('app-daypicker__day--selected');
    }
  });
});