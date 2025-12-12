import { Component, Input, OnInit, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ElementRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { InputEnhancedComponent } from './input-enhanced.component';

@Component({
  selector: 'app-password-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, ReactiveFormsModule, InputEnhancedComponent],
  template: `
    <div class="space-y-2">
      <app-input-enhanced 
        [controlName]="passwordName"
        [label]="labelPassword" 
        [floating]="floating" 
        [type]="showPassword ? 'text' : 'password'" 
        [required]="true"
        [clear]="true">
      </app-input-enhanced>
      <app-input-enhanced 
        [controlName]="confirmName"
        [label]="labelConfirm" 
        [floating]="floating" 
        [type]="showPassword ? 'text' : 'password'" 
        [required]="true"
        [clear]="true">
      </app-input-enhanced>
    </div>
  `
})
export class PasswordConfirmComponent implements OnInit, AfterViewInit {
  @Input() passwordName = 'password';
  @Input() confirmName = 'passwordConfirm';
  @Input() labelPassword = 'Contraseña';
  @Input() labelConfirm = 'Confirmar contraseña';
  @Input() minLength = 8;
  @Input() floating = true;
  @Input() required = false;

  passwordControl!: FormControl;
  confirmControl!: FormControl;
  showPassword = false;

  constructor(@Optional() private controlContainer: ControlContainer, private cdr: ChangeDetectorRef, private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    // Componente inicializado
  }

  ngOnInit(): void {
    const parent = this.controlContainer && (this.controlContainer.control as FormGroup);

    if (parent) {
      // Asegurar que los controles existen en el formulario padre
      if (!parent.get(this.passwordName)) {
        parent.addControl(this.passwordName, new FormControl(''));
      }
      if (!parent.get(this.confirmName)) {
        parent.addControl(this.confirmName, new FormControl(''));
      }
      
      // Obtener referencias a los controles
      this.passwordControl = parent.get(this.passwordName) as FormControl;
      this.confirmControl = parent.get(this.confirmName) as FormControl;
    } else {
      // standalone controls
      this.passwordControl = new FormControl('');
      this.confirmControl = new FormControl('');
    }

    // add secure password validator to passwordControl (preserve existing validators)
    const secureFn: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
      if (c.value === null || c.value === '') return null;
      const v = String(c.value);
      const missing: string[] = [];
      if (v.length < this.minLength) missing.push('length');
      if (!/[A-Z]/.test(v)) missing.push('upper');
      if (!/[a-z]/.test(v)) missing.push('lower');
      if (!/[0-9]/.test(v)) missing.push('digit');
      if (!/[^A-Za-z0-9]/.test(v)) missing.push('special');
      if (missing.length === 0) return null;
      return { securePassword: { missing } };
    };

    const existing = this.passwordControl.validator ? [this.passwordControl.validator] : [];
    this.passwordControl.setValidators([...existing, secureFn]);
    this.passwordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    // confirm validator: ensure matches password
    const matchFn: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
      const val = c.value;
      const pw = this.passwordControl.value;
      if (!val && !pw) return null;
      return val === pw ? null : { custom: 'Las contraseñas no coinciden' };
    };

    const existingC = this.confirmControl.validator ? [this.confirmControl.validator] : [];
    this.confirmControl.setValidators([...existingC, matchFn]);
    this.confirmControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    // re-evaluate confirm when password changes
    this.passwordControl.valueChanges.subscribe(() => {
        this.confirmControl.updateValueAndValidity();
    });
  }

  /**
   * Muestra temporalmente la contraseña por unos segundos
   */
  showTemporarily(duration: number = 3000): void {
        this.showPassword = true;
        this.cdr.detectChanges();
        setTimeout(() => {
            this.showPassword = false;
            this.cdr.detectChanges();
        }, duration);
    }

  /**
   * Método público para establecer valores y mostrar temporalmente
   * @param password La contraseña a establecer en ambos campos
   */
  setPasswordAndShow(password: string): void {
    // Establecer valores en FormControls
    if (this.passwordControl) {
      this.passwordControl.setValue(password);
      this.passwordControl.markAsDirty();
      this.passwordControl.markAsTouched();
      this.passwordControl.updateValueAndValidity({ emitEvent: true });
    }
    
    if (this.confirmControl) {
      this.confirmControl.setValue(password);
      this.confirmControl.markAsDirty();
      this.confirmControl.markAsTouched();
      this.confirmControl.updateValueAndValidity({ emitEvent: true });
    }
    
    // Forzar actualización del formulario padre si existe
    const parent = this.controlContainer && (this.controlContainer.control as FormGroup);
    if (parent) {
      parent.updateValueAndValidity({ emitEvent: true });
    }
    
    // Mostrar temporalmente la contraseña
    this.showTemporarily(5000);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }
}
