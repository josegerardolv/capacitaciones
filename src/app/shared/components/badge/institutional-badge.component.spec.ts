import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstitutionalBadgeComponent } from './institutional-badge.component';

describe('InstitutionalBadgeComponent', () => {
  let component: InstitutionalBadgeComponent;
  let fixture: ComponentFixture<InstitutionalBadgeComponent>;
  let badgeElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstitutionalBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InstitutionalBadgeComponent);
    component = fixture.componentInstance;
    badgeElement = fixture.debugElement.query(By.css('.institutional-badge'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render badge with default configuration', () => {
    expect(badgeElement).toBeTruthy();
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge');
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-primary');
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-medium');
  });

  it('should apply custom variant class', () => {
    component.config = { variant: 'success' };
    component.ngOnChanges({ config: { currentValue: component.config, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-success');
  });

  it('should apply custom size class', () => {
    component.config = { size: 'large' };
    component.ngOnChanges({ config: { currentValue: component.config, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-large');
  });

  it('should display icon when configured', () => {
    component.config = { icon: 'star', iconPosition: 'left' };
    fixture.detectChanges();
    
    const iconElement = fixture.debugElement.query(By.css('.institutional-badge-icon-left'));
    expect(iconElement).toBeTruthy();
    expect(iconElement.nativeElement.textContent.trim()).toBe('star');
  });

  it('should display close button when closable', () => {
    component.config = { closable: true };
    fixture.detectChanges();
    
    const closeButton = fixture.debugElement.query(By.css('.institutional-badge-close'));
    expect(closeButton).toBeTruthy();
  });

  it('should emit badgeClick when clicked and clickable', () => {
    spyOn(component.badgeClick, 'emit');
    component.config = { clickable: true };
    fixture.detectChanges();
    
    badgeElement.nativeElement.click();
    
    expect(component.badgeClick.emit).toHaveBeenCalled();
  });

  it('should not emit badgeClick when disabled', () => {
    spyOn(component.badgeClick, 'emit');
    component.config = { clickable: true, disabled: true };
    fixture.detectChanges();
    
    badgeElement.nativeElement.click();
    
    expect(component.badgeClick.emit).not.toHaveBeenCalled();
  });

  it('should emit badgeClose when close button is clicked', () => {
    spyOn(component.badgeClose, 'emit');
    component.config = { closable: true };
    fixture.detectChanges();
    
    const closeButton = fixture.debugElement.query(By.css('.institutional-badge-close'));
    closeButton.nativeElement.click();
    
    expect(component.badgeClose.emit).toHaveBeenCalled();
  });

  it('should handle keyboard navigation for clickable badges', () => {
    spyOn(component.badgeClick, 'emit');
    component.config = { clickable: true };
    fixture.detectChanges();
    
    const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    badgeElement.nativeElement.dispatchEvent(keyboardEvent);
    
    expect(component.badgeClick.emit).toHaveBeenCalled();
  });

  it('should apply disabled class when disabled', () => {
    component.config = { disabled: true };
    component.ngOnChanges({ config: { currentValue: component.config, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-disabled');
  });

  it('should apply clickable class when clickable', () => {
    component.config = { clickable: true };
    component.ngOnChanges({ config: { currentValue: component.config, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.classList).toContain('institutional-badge-clickable');
  });

  it('should set appropriate ARIA attributes', () => {
    component.config = { 
      clickable: true, 
      ariaLabel: 'Test badge',
      tooltip: 'Test tooltip'
    };
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.getAttribute('aria-label')).toBe('Test badge');
    expect(badgeElement.nativeElement.getAttribute('title')).toBe('Test tooltip');
    expect(badgeElement.nativeElement.getAttribute('role')).toBe('button');
    expect(badgeElement.nativeElement.getAttribute('tabindex')).toBe('0');
  });

  it('should set status role for non-clickable badges', () => {
    component.config = { clickable: false };
    fixture.detectChanges();
    
    expect(badgeElement.nativeElement.getAttribute('role')).toBe('status');
    expect(badgeElement.nativeElement.getAttribute('tabindex')).toBeNull();
  });
});