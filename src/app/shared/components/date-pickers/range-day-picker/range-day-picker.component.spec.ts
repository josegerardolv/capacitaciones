import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RangeDayPickerComponent, DateRange } from './range-day-picker.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('RangeDayPickerComponent', () => {
  let component: RangeDayPickerComponent;
  let fixture: ComponentFixture<RangeDayPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RangeDayPickerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RangeDayPickerComponent);
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

    const title = fixture.debugElement.query(By.css('.app-range-daypicker__title'));
    expect(title.nativeElement.textContent.trim()).toContain('enero');
    expect(title.nativeElement.textContent.trim()).toContain('2024');
  });

  it('should emit rangeChange when a complete range is selected', () => {
    spyOn(component.rangeChange, 'emit');
    
    component.ngOnInit();
    fixture.detectChanges();

    const startDate = new Date(2024, 0, 10);
    const endDate = new Date(2024, 0, 15);

    // Simular selección de inicio
    const startDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    if (startDay) {
      component.selectDay(startDay, { shiftKey: false } as MouseEvent);
      expect(component.start).toBeTruthy();
      expect(component.end).toBeNull();
    }

    // Simular selección de fin
    const endDay = component.calendarDays.find(day => 
      day.date.getDate() === 15 && day.isCurrentMonth
    );
    
    if (endDay) {
      component.selectDay(endDay, { shiftKey: false } as MouseEvent);
      expect(component.rangeChange.emit).toHaveBeenCalled();
      expect(component.start).toBeTruthy();
      expect(component.end).toBeTruthy();
    }
  });

  it('should swap start and end dates if end is before start', () => {
    component.ngOnInit();
    fixture.detectChanges();

    // Seleccionar fecha posterior primero
    const laterDay = component.calendarDays.find(day => 
      day.date.getDate() === 20 && day.isCurrentMonth
    );
    
    if (laterDay) {
      component.selectDay(laterDay, { shiftKey: false } as MouseEvent);
    }

    // Seleccionar fecha anterior después
    const earlierDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    if (earlierDay) {
      component.selectDay(earlierDay, { shiftKey: false } as MouseEvent);
      
      // Verificar que las fechas se intercambiaron
      expect(component.start!.getDate()).toBe(10);
      expect(component.end!.getDate()).toBe(20);
    }
  });

  it('should handle Shift+click for quick range selection', () => {
    spyOn(component.rangeChange, 'emit');
    
    component.ngOnInit();
    fixture.detectChanges();

    // Establecer fecha de inicio
    const startDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    if (startDay) {
      component.selectDay(startDay, { shiftKey: false } as MouseEvent);
    }

    // Usar Shift+click para seleccionar fin
    const endDay = component.calendarDays.find(day => 
      day.date.getDate() === 15 && day.isCurrentMonth
    );
    
    if (endDay) {
      component.selectDay(endDay, { shiftKey: true } as MouseEvent);
      
      expect(component.start).toBeTruthy();
      expect(component.end).toBeTruthy();
      expect(component.rangeChange.emit).toHaveBeenCalled();
    }
  });

  it('should clear range when clearRange is called', () => {
    spyOn(component.rangeChange, 'emit');
    
    // Establecer un rango
    component.start = new Date(2024, 0, 10);
    component.end = new Date(2024, 0, 15);
    
    component.clearRange();
    
    expect(component.start).toBeNull();
    expect(component.end).toBeNull();
    expect(component.rangeChange.emit).toHaveBeenCalledWith({ start: null, end: null });
  });

  it('should identify range start and end days correctly', () => {
    const startDate = new Date(2024, 0, 10);
    const endDate = new Date(2024, 0, 15);
    
    component.start = startDate;
    component.end = endDate;
    component.ngOnInit();
    fixture.detectChanges();

    const startDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    const endDay = component.calendarDays.find(day => 
      day.date.getDate() === 15 && day.isCurrentMonth
    );

    const middleDay = component.calendarDays.find(day => 
      day.date.getDate() === 12 && day.isCurrentMonth
    );
    
    if (startDay && endDay && middleDay) {
      expect(component.isRangeStart(startDay)).toBe(true);
      expect(component.isRangeEnd(endDay)).toBe(true);
      expect(component.isInRange(middleDay)).toBe(true);
      expect(component.isInRange(startDay)).toBe(true);
      expect(component.isInRange(endDay)).toBe(true);
    }
  });

  it('should calculate days count correctly', () => {
    component.start = new Date(2024, 0, 10);
    component.end = new Date(2024, 0, 15);
    
    const daysCount = component.getDaysCount();
    expect(daysCount).toBe(6); // 10, 11, 12, 13, 14, 15
  });

  it('should format dates according to locale', () => {
    component.locale = 'es-MX';
    component.ngOnInit();
    
    const testDate = new Date(2024, 0, 15);
    const formatted = component.formatDate(testDate);
    
    expect(formatted).toContain('ene'); // Abreviación de enero en español
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should respect minDate and maxDate constraints', () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), 10);
    const maxDate = new Date(today.getFullYear(), today.getMonth(), 20);
    
    component.minDate = minDate;
    component.maxDate = maxDate;
    component.ngOnInit();
    fixture.detectChanges();

    const beforeMinDay = component.calendarDays.find(day => 
      day.date.getDate() === 5 && day.isCurrentMonth
    );
    
    const afterMaxDay = component.calendarDays.find(day => 
      day.date.getDate() === 25 && day.isCurrentMonth
    );
    
    expect(beforeMinDay?.isDisabled).toBe(true);
    expect(afterMaxDay?.isDisabled).toBe(true);
  });

  it('should handle hover range preview when selecting', () => {
    component.ngOnInit();
    fixture.detectChanges();

    // Establecer fecha de inicio
    const startDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    if (startDay) {
      component.selectDay(startDay, { shiftKey: false } as MouseEvent);
    }

    // Simular hover sobre otra fecha
    const hoverDay = component.calendarDays.find(day => 
      day.date.getDate() === 15 && day.isCurrentMonth
    );
    
    if (hoverDay) {
      component.onDayMouseEnter(hoverDay);
      expect(component.hoveredDay).toBe(hoverDay);
      
      // Verificar que los días entre start y hover están en hover range
      const middleDay = component.calendarDays.find(day => 
        day.date.getDate() === 12 && day.isCurrentMonth
      );
      
      if (middleDay) {
        expect(component.isInHoverRange(middleDay)).toBe(true);
      }
    }
  });

  it('should navigate months correctly', () => {
    const initialDate = new Date(2024, 5, 15); // Junio 2024
    component.currentDate = initialDate;
    component.ngOnInit();
    fixture.detectChanges();

    component.previousMonth();
    expect(component.currentDate.getMonth()).toBe(4); // Mayo

    component.nextMonth();
    expect(component.currentDate.getMonth()).toBe(5); // Junio otra vez
  });

  it('should handle keyboard navigation', () => {
    component.ngOnInit();
    fixture.detectChanges();

    // Establecer día enfocado
    const firstDay = component.calendarDays.find(day => 
      day.isCurrentMonth && day.date.getDate() === 1
    );
    
    if (firstDay) {
      component.setFocusedDay(firstDay);
      
      // Simular presionar Enter para seleccionar
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(keyEvent, 'preventDefault');
      
      component.onKeyDown(keyEvent);
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
      expect(component.start).toBeTruthy();
    }
  });

  it('should handle Escape key to clear range', () => {
    // Establecer un rango
    component.start = new Date(2024, 0, 10);
    component.end = new Date(2024, 0, 15);
    
    // Simular presionar Escape
    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onKeyDown(keyEvent);
    
    expect(component.start).toBeNull();
    expect(component.end).toBeNull();
  });

  it('should apply correct CSS classes to range days', () => {
    const startDate = new Date(2024, 0, 10);
    const endDate = new Date(2024, 0, 15);
    
    component.start = startDate;
    component.end = endDate;
    component.ngOnInit();
    fixture.detectChanges();

    const startDay = component.calendarDays.find(day => 
      day.date.getDate() === 10 && day.isCurrentMonth
    );
    
    const endDay = component.calendarDays.find(day => 
      day.date.getDate() === 15 && day.isCurrentMonth
    );

    const middleDay = component.calendarDays.find(day => 
      day.date.getDate() === 12 && day.isCurrentMonth
    );
    
    if (startDay && endDay && middleDay) {
      const startClasses = component.getDayClasses(startDay);
      const endClasses = component.getDayClasses(endDay);
      const middleClasses = component.getDayClasses(middleDay);
      
      expect(startClasses).toContain('app-range-daypicker__day--range-start');
      expect(endClasses).toContain('app-range-daypicker__day--range-end');
      expect(middleClasses).toContain('app-range-daypicker__day--in-range');
    }
  });

  it('should show range info when enabled', () => {
    component.showRangeInfo = true;
    component.start = new Date(2024, 0, 10);
    component.end = new Date(2024, 0, 15);
    component.ngOnInit();
    fixture.detectChanges();

    const rangeInfo = fixture.debugElement.query(By.css('.app-range-daypicker__info'));
    expect(rangeInfo).toBeTruthy();
    expect(rangeInfo.nativeElement.textContent).toContain('6 días');
  });
});