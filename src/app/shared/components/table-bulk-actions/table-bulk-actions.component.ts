import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

export interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkActionEvent {
  action: string;
  selectedItems: any[];
}

@Component({
  selector: 'app-table-bulk-actions',
  standalone: true,
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
    <div 
      *ngIf="selectedItems.length > 0" 
      class="institucional-table-bulk-actions">
      
      <!-- Información de selección -->
      <div class="institucional-table-bulk-info">
        {{ selectedItems.length }} elemento(s) seleccionado(s)
      </div>

      <!-- Acciones disponibles -->
      <div class="institucional-table-bulk-actions-list">
        <button
          *ngFor="let action of availableActions"
          type="button"
          class="institucional-table-bulk-btn"
          [class.institucional-table-bulk-btn-primary]="action.variant === 'primary'"
          [class.institucional-table-bulk-btn-secondary]="action.variant === 'secondary'"
          [class.institucional-table-bulk-btn-danger]="action.variant === 'danger'"
          [class.institucional-table-bulk-btn-success]="action.variant === 'success'"
          [disabled]="action.disabled"
          (click)="executeAction(action)"
          [title]="action.label">
          
          <span class="material-symbols-outlined mr-1">{{ action.icon }}</span>
          {{ action.label }}
        </button>
      </div>

      <!-- Botón para deseleccionar todos -->
      <button
        type="button"
        class="institucional-table-bulk-btn-clear"
        (click)="clearSelection()"
        title="Deseleccionar todos">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div 
      *ngIf="showConfirmation" 
      class="institucional-modal-backdrop"
      (click)="cancelConfirmation()">
      
      <div 
        class="institucional-modal-content"
        (click)="$event.stopPropagation()">
        
        <div class="institucional-modal-header">
          <h3 class="institucional-modal-title">
            Confirmar acción
          </h3>
          <button 
            type="button"
            class="institucional-modal-close"
            (click)="cancelConfirmation()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="institucional-modal-body">
          <div class="institucional-modal-icon-warning">
            <span class="material-symbols-outlined">warning</span>
          </div>
          
          <p class="institucional-modal-message">
            {{ confirmationMessage }}
          </p>
          
          <p class="institucional-modal-submessage">
            Esta acción se aplicará a {{ selectedItems.length }} elemento(s) seleccionado(s).
          </p>
        </div>

        <div class="institucional-modal-footer">
          <app-institutional-button
            [config]="{
              variant: 'secondary'
            }"
            (buttonClick)="cancelConfirmation()">
            Cancelar
          </app-institutional-button>
          
          <app-institutional-button
            [config]="{
              variant: 'danger'
            }"
            (buttonClick)="confirmAction()">
            Confirmar
          </app-institutional-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mr-1 {
      margin-right: 0.25rem;
    }
    
    .institucional-table-bulk-actions-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .institucional-table-bulk-btn-primary {
      background: var(--institucional-primario) !important;
      color: white !important;
      border-color: var(--institucional-primario) !important;
    }
    
    .institucional-table-bulk-btn-secondary {
      background: var(--institucional-secundario) !important;
      color: white !important;
      border-color: var(--institucional-secundario) !important;
    }
    
    .institucional-table-bulk-btn-danger {
      background: var(--stats5) !important;
      color: white !important;
      border-color: var(--stats5) !important;
    }
    
    .institucional-table-bulk-btn-success {
      background: var(--stats4) !important;
      color: white !important;
      border-color: var(--stats4) !important;
    }
    
    .institucional-table-bulk-btn-clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: 1px solid var(--gray-300);
      background: white;
      color: var(--gray-500);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: auto;
    }
    
    .institucional-table-bulk-btn-clear:hover {
      background: var(--stats5);
      color: white;
      border-color: var(--stats5);
    }
    
    /* Estilos del modal */
    .institucional-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    }
    
    .institucional-modal-content {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-institucional-lg);
      width: 90%;
      max-width: 28rem;
      animation: scaleIn 0.3s ease-out;
    }
    
    .institucional-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .institucional-modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-800);
      margin: 0;
    }
    
    .institucional-modal-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: none;
      background: none;
      color: var(--gray-400);
      cursor: pointer;
      border-radius: 0.375rem;
      transition: color 0.2s ease, background-color 0.2s ease;
    }
    
    .institucional-modal-close:hover {
      color: var(--gray-600);
      background: var(--gray-100);
    }
    
    .institucional-modal-body {
      padding: 1.5rem;
      text-align: center;
    }
    
    .institucional-modal-icon-warning {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(251, 191, 36, 0.1);
      border-radius: 50%;
      color: var(--stats2);
    }
    
    .institucional-modal-icon-warning .material-symbols-outlined {
      font-size: 2rem;
    }
    
    .institucional-modal-message {
      font-size: 1rem;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }
    
    .institucional-modal-submessage {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 0;
    }
    
    .institucional-modal-footer {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid var(--gray-200);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class TableBulkActionsComponent {
  @Input() selectedItems: any[] = [];
  @Input() actions: BulkAction[] = [];

  @Output() actionExecute = new EventEmitter<BulkActionEvent>();
  @Output() selectionClear = new EventEmitter<void>();

  showConfirmation = false;
  confirmationMessage = '';
  pendingAction: BulkAction | null = null;

  get availableActions(): BulkAction[] {
    return this.actions.filter(action => !action.disabled);
  }

  executeAction(action: BulkAction) {
    if (action.requiresConfirmation) {
      this.pendingAction = action;
      this.confirmationMessage = action.confirmationMessage || 
        `¿Está seguro de que desea ejecutar la acción "${action.label}"?`;
      this.showConfirmation = true;
    } else {
      this.emitAction(action);
    }
  }

  confirmAction() {
    if (this.pendingAction) {
      this.emitAction(this.pendingAction);
    }
    this.cancelConfirmation();
  }

  cancelConfirmation() {
    this.showConfirmation = false;
    this.confirmationMessage = '';
    this.pendingAction = null;
  }

  private emitAction(action: BulkAction) {
    this.actionExecute.emit({
      action: action.key,
      selectedItems: [...this.selectedItems]
    });
  }

  clearSelection() {
    this.selectionClear.emit();
  }
}
