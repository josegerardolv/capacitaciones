import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importar componentes de inputs
import { InputEnhancedComponent } from '../inputs/input-enhanced.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-demo-simple',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputEnhancedComponent, InstitutionalButtonComponent],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Demo Simple</h1>
      <form [formGroup]="testForm" class="space-y-4">
        <app-input-enhanced
          [control]="getControl('nombre')"
          label="Nombre"
          placeholder="Ingresa tu nombre">
        </app-input-enhanced>
        
        <app-input-enhanced
          [control]="getControl('email')"
          label="Email"
          type="email"
          placeholder="tu@email.com">
        </app-input-enhanced>
        
        <app-institutional-button
          [config]="{
            type: 'submit',
            variant: 'primary'
          }">
          Enviar
        </app-institutional-button>
      </form>
    </div>
  `
})
export class DemoSimpleComponent implements OnInit {
  testForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.testForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getControl(field: string): FormControl {
    return this.testForm.get(field) as FormControl;
  }
}
