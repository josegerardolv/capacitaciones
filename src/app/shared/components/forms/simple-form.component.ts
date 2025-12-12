import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BaseFormComponent, FormAction } from './base-form.component';

@Component({
  selector: 'app-simple-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseFormComponent],
  template: `
    <app-base-form
      [formGroup]="formGroup"
      [title]="title"
      [subtitle]="subtitle"
      [primaryActions]="primaryActions"
      [secondaryActions]="secondaryActions"
      [isLoading]="isLoading"
      [globalError]="globalError"
      [successMessage]="successMessage"
      (formSubmit)="onFormSubmit($event)"
      (actionClick)="onActionClick($event)">
      
      <!-- Contenido dinámico del formulario -->
      <ng-content></ng-content>
      
      <!-- Template personalizado si se proporciona -->
      <ng-container *ngIf="contentTemplate">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </ng-container>
    </app-base-form>
  `
})
export class SimpleFormComponent {
  @Input() formGroup!: FormGroup;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() isLoading = false;
  @Input() globalError?: string;
  @Input() successMessage?: string;
  
  // Acciones por defecto
  @Input() primaryActions: FormAction[] = [
    {
      label: 'Guardar',
      type: 'submit',
      variant: 'primary',
      icon: 'save'
    }
  ];
  
  @Input() secondaryActions: FormAction[] = [
    {
      label: 'Cancelar',
      type: 'button',
      variant: 'outline',
      icon: 'close'
    }
  ];

  @Output() formSubmit = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<FormAction>();
  @Output() cancel = new EventEmitter<void>();

  @ContentChild('content', { read: TemplateRef }) contentTemplate?: TemplateRef<any>;

  onFormSubmit(formValue: any): void {
    this.formSubmit.emit(formValue);
  }

  onActionClick(action: FormAction): void {
    if (action.label === 'Cancelar') {
      this.cancel.emit();
    }
    this.actionClick.emit(action);
  }
}
