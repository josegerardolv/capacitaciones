import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UniversalIconComponent } from '../../universal-icon/universal-icon.component';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, UniversalIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="time-picker-wrapper mb-3" [class.full-width]="fullWidth">
      <label *ngIf="label && !floating" class="form-label block text-sm font-medium text-gray-700 mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <div class="relative" #container>
        <!-- Input Display -->
        <div class="relative">
          <div 
            class="time-display flex items-center justify-between px-4 transition-all duration-200 border rounded-lg bg-white"
            [ngClass]="{
              'cursor-pointer': !disabled,
              'cursor-not-allowed bg-opacity-50 bg-gray-50 opacity-70': disabled,
              'border-gray-300 hover:border-institucional-primario': !isOpen && !hasError && !disabled,
              'border-gray-200': disabled,
              'border-institucional-primario ring-2 ring-institucional-primario ring-opacity-10': isOpen,
              'border-red-500 ring-red-500': hasError,
              'min-h-[3.5rem]': floating
            }"
            (click)="!disabled && togglePicker()"
            (focus)="!disabled && onFocus()"
            (blur)="!disabled && onBlur()"
            [attr.tabindex]="disabled ? '-1' : '0'"
            (keydown.enter)="!disabled && togglePicker()"
            (keydown.space)="!disabled && togglePicker(); $event.preventDefault()">
            
            <div class="flex items-center justify-between w-full h-full">
              <span class="text-sm truncate" [class.text-gray-400]="!value" [class.text-gray-900]="value" [style.marginTop]="floating && value ? '0.5rem' : '0'">
                {{ getFormattedDisplayValue() }}
              </span>
              <app-universal-icon name="schedule" type="material" [size]="20" class="text-gray-400 flex-shrink-0"></app-universal-icon>
            </div>
          </div>

          <!-- Floating label -->
          <label
            *ngIf="floating"
            class="absolute left-4 text-gray-500 pointer-events-none transition-all duration-200 bg-white px-1"
            [ngStyle]="{
              'top': (value || isOpen || isFocused) ? '0' : '50%',
              'transform': 'translateY(-50%)',
              'font-size': (value || isOpen || isFocused) ? '0.75rem' : '1rem',
              'color': (isOpen || isFocused) ? 'var(--institucional-primario)' : '#6b7280',
              'font-weight': (value || isOpen || isFocused) ? '600' : 'normal',
              'z-index': 10
            }">
            {{ label }} <span *ngIf="required" class="text-red-500">*</span>
          </label>
        </div>

        <!-- Dropdown Picker -->
        <div 
          *ngIf="isOpen" 
          class="absolute z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200"
          [ngClass]="{
            'bottom-full mb-3': dropdownPosition === 'top',
            'top-full mt-1': dropdownPosition === 'bottom'
          }"
          [style.width]="'280px'">
          
          <div class="p-4">
            <div class="flex gap-2">
              <!-- Hours Column (1-12) -->
              <div class="flex-1">
                <div class="text-[10px] font-bold text-gray-400 mb-2 text-center uppercase tracking-widest">Hora</div>
                <div class="scroll-container h-48 overflow-y-auto px-1 custom-scrollbar" #hourScroll>
                  <button 
                    type="button"
                    *ngFor="let h of hours12" 
                    class="w-full py-2 mb-1 rounded-lg text-sm transition-colors"
                    [ngClass]="{
                      'bg-institucional-primario text-white font-semibold shadow-md': selectedHour12 === h,
                      'hover:bg-gray-100 text-gray-700': selectedHour12 !== h
                    }"
                    (click)="selectHour(h); $event.stopPropagation()">
                    {{ h }}
                  </button>
                </div>
              </div>

              <div class="flex items-center text-gray-300 font-bold self-center mt-4">:</div>

              <!-- Minutes Column -->
              <div class="flex-1">
                <div class="text-[10px] font-bold text-gray-400 mb-2 text-center uppercase tracking-widest">Min</div>
                <div class="scroll-container h-48 overflow-y-auto px-1 custom-scrollbar" #minuteScroll>
                  <button 
                    type="button"
                    *ngFor="let m of minutes" 
                    class="w-full py-2 mb-1 rounded-lg text-sm transition-colors"
                    [ngClass]="{
                      'bg-institucional-primario text-white font-semibold shadow-md': selectedMinute === m,
                      'hover:bg-gray-100 text-gray-700': selectedMinute !== m
                    }"
                    (click)="selectMinute(m); $event.stopPropagation()">
                    {{ m }}
                  </button>
                </div>
              </div>

              <!-- AM/PM Column -->
              <div class="flex flex-col justify-center gap-2 pl-2 border-l border-gray-100">
                <button 
                  type="button"
                  class="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  [ngClass]="selectedPeriod === 'AM' ? 'bg-institucional-primario text-white' : 'bg-gray-50 text-gray-400'"
                  (click)="selectedPeriod = 'AM'; $event.stopPropagation()">
                  AM
                </button>
                <button 
                  type="button"
                  class="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  [ngClass]="selectedPeriod === 'PM' ? 'bg-institucional-primario text-white' : 'bg-gray-50 text-gray-400'"
                  (click)="selectedPeriod = 'PM'; $event.stopPropagation()">
                  PM
                </button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between gap-2">
              <button 
                type="button"
                class="flex-1 py-2 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                (click)="closePicker(); $event.stopPropagation()">
                Cerrar
              </button>
              <button 
                type="button"
                class="flex-1 py-2 px-3 text-xs font-semibold text-white bg-institucional-primario hover:bg-opacity-90 rounded-lg transition-colors shadow-sm"
                (click)="confirmSelection(); $event.stopPropagation()">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="hasError && errorMessage" class="mt-1 text-xs text-red-500 font-medium">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      --institucional-primario: #8B1538;
      display: block;
    }

    .time-display {
      font-family: 'Montserrat', sans-serif;
    }

    .full-width {
      width: 100%;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 10px;
    }

    .scroll-container {
      scrollbar-width: thin;
      scrollbar-color: #ddd #f1f1f1;
    }

    .animate-in {
      animation: animateIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes animateIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class TimePickerComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label: string = '';
  @Input() placeholder: string = '00:00';
  @Input() required: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() floating: boolean = false;
  @Input() disabled: boolean = false;
  @Input() preferredPosition: 'auto' | 'top' | 'bottom' = 'auto';

  @Output() timeChange = new EventEmitter<string>();

  @ViewChild('container') container!: ElementRef;
  @ViewChild('hourScroll') hourScroll?: ElementRef;
  @ViewChild('minuteScroll') minuteScroll?: ElementRef;

  value: string = ''; // Always in 24h HH:mm format
  isOpen: boolean = false;
  isFocused: boolean = false;

  hours12: string[] = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  selectedHour12: string = '12';
  selectedMinute: string = '00';
  selectedPeriod: 'AM' | 'PM' = 'AM';
  dropdownPosition: 'top' | 'bottom' = 'top';

  private onChange = (val: string) => { };
  private onTouched = () => { };

  constructor() { }

  ngAfterViewInit() { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.container.nativeElement.contains(event.target)) {
      this.closePicker();
    }
  }

  getFormattedDisplayValue(): string {
    if (!this.value) return this.placeholder;
    const [h, m] = this.value.split(':');
    let hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, '0')}:${m} ${period}`;
  }

  public open(): void {
    if (!this.isOpen) {
      this.calculateDropdownPosition();
      this.parseCurrentValue();
      setTimeout(() => this.scrollToSelected(), 0);
      this.isOpen = true;
      this.onFocus();
    }
  }

  public close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.onBlur();
    }
  }

  togglePicker() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  calculateDropdownPosition() {
    if (!this.container) {
      this.dropdownPosition = 'bottom';
      return;
    }

    if (this.preferredPosition !== 'auto') {
      this.dropdownPosition = this.preferredPosition;
      return;
    }

    const rect = this.container.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 300 && spaceAbove > spaceBelow) {
      this.dropdownPosition = 'top';
    } else {
      this.dropdownPosition = 'bottom';
    }
  }

  closePicker() {
    this.isOpen = false;
    this.onTouched();
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
    this.onTouched();
  }

  selectHour(h: string) {
    this.selectedHour12 = h;
  }

  selectMinute(m: string) {
    this.selectedMinute = m;
  }

  confirmSelection() {
    let hour = parseInt(this.selectedHour12);
    if (this.selectedPeriod === 'PM' && hour < 12) hour += 12;
    if (this.selectedPeriod === 'AM' && hour === 12) hour = 0;

    const finalValue = `${hour.toString().padStart(2, '0')}:${this.selectedMinute}`;
    this.updateValue(finalValue);
    this.isOpen = false;
  }

  private updateValue(val: string) {
    this.value = val;
    this.onChange(val);
    this.timeChange.emit(val);
  }

  private parseCurrentValue() {
    if (this.value && this.value.includes(':')) {
      const [h, m] = this.value.split(':');
      let hour = parseInt(h);
      this.selectedPeriod = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
      this.selectedHour12 = hour.toString().padStart(2, '0');
      this.selectedMinute = m.padStart(2, '0');
    }
  }

  private scrollToSelected() {
    if (this.hourScroll) {
      const selectedHourEl = this.hourScroll.nativeElement.querySelector('.bg-institucional-primario');
      if (selectedHourEl) {
        this.hourScroll.nativeElement.scrollTop = selectedHourEl.offsetTop - 80;
      }
    }
    if (this.minuteScroll) {
      const selectedMinuteEl = this.minuteScroll.nativeElement.querySelector('.bg-institucional-primario');
      if (selectedMinuteEl) {
        this.minuteScroll.nativeElement.scrollTop = selectedMinuteEl.offsetTop - 80;
      }
    }
  }

  writeValue(value: any): void {
    this.value = value || '';
    this.parseCurrentValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
