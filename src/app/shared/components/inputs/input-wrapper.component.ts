import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { InputEnhancedComponent } from './input-enhanced.component';

/**
 * Wrapper component para mantener compatibilidad con el selector 'app-input'
 * Redirige todas las propiedades al InputEnhancedComponent
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [InputEnhancedComponent],
  template: `
    <app-input-enhanced
      [controlName]="controlName || ''"
      [control]="control"
      [label]="label || ''"
      [placeholder]="placeholder || ''"
      [type]="type"
      [required]="required || false"
      [readonly]="readonly || false"
      [size]="size || 'md'"
      [variant]="variant === 'borderless' || variant === 'underlined' || variant === 'rounded' || variant === 'square' ? 'outlined' : (variant || 'outlined')"
      [iconLeft]="iconLeft"
      [iconRight]="iconRight"
      [clear]="clear || false"
      [floating]="floating || false"
      [helperText]="helperText"
      [helperPosition]="helperPosition || 'bottom'"
      [validationMap]="validationMap || {}"
      [extraClasses]="extraClasses || ''"
      [width]="width"
      [height]="height"
      [min]="min"
      [max]="max"
      [step]="step"
      [accept]="accept"
      [multiple]="multiple || false"
      [rows]="rows || 3"
      [autocomplete]="autocomplete"
      [optional]="optional || false"
      [fullWidth]="fullWidth || false"
      [loading]="loading || false"
      [helperIcon]="helperIcon || false"
      [showCharCount]="showCharCount || false"
      (focus)="focus.emit($event)"
      (blur)="blur.emit($event)"
      (keydown)="keydown.emit($event)"
      (keyup)="keyup.emit($event)">
    </app-input-enhanced>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputWrapperComponent),
      multi: true
    }
  ]
})
export class InputWrapperComponent implements ControlValueAccessor {
  // Inputs - solo las propiedades que realmente existen en InputEnhancedComponent
  @Input() controlName?: string;
  @Input() control?: FormControl;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: string = 'text';
  @Input() required?: boolean;
  @Input() optional?: boolean;
  @Input() readonly?: boolean;
  @Input() size?: 'sm' | 'md' | 'lg';
  @Input() variant?: 'filled' | 'outlined' | 'borderless' | 'underlined' | 'rounded' | 'square';
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() clear?: boolean;
  @Input() floating?: boolean;
  @Input() helperText?: string;
  @Input() helperPosition?: 'top' | 'bottom';
  @Input() validationMap?: any;
  @Input() extraClasses?: string;
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth?: boolean;
  @Input() loading?: boolean;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number | string;
  @Input() accept?: string;
  @Input() multiple?: boolean;
  @Input() rows?: number;
  @Input() autocomplete?: string;
  @Input() helperIcon?: boolean;
  @Input() showCharCount?: boolean;

  // Outputs - solo los eventos que realmente existen
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() keyup = new EventEmitter<KeyboardEvent>();

  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    // Este será manejado por el control de FormControl directamente
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Esto será manejado por el FormControl directamente
  }
}
