import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LoadingConfig {
  title?: string;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  showCancel?: boolean;
  preventClose?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

@Component({
  selector: 'app-loading-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay del modal -->
    <div *ngIf="isOpen" 
         class="loading-modal-overlay">
      
      <!-- Contenedor del modal -->
      <div class="loading-modal-container"
           [class.modal-size-sm]="config.size === 'sm'"
           [class.modal-size-md]="config.size === 'md' || !config.size"
           [class.modal-size-lg]="config.size === 'lg'">
        
        <!-- Contenido del modal -->
        <div class="loading-modal-content">
          <!-- Spinner principal -->
          <div class="loading-spinner-section">
            <div class="loading-spinner-container">
              <!-- Spinner institucional mejorado -->
              <div class="loading-spinner-wrapper">
                <div class="spinner-ring spinner-outer"></div>
                <div class="spinner-ring spinner-middle"></div>
                <div class="spinner-ring spinner-inner"></div>
              </div>
            </div>
          </div>
          
          <!-- Título -->
          <h3 *ngIf="config.title" class="loading-modal-title">
            {{ config.title }}
          </h3>
          
          <!-- Mensaje -->
          <p *ngIf="config.message" class="loading-modal-message">
            {{ config.message }}
          </p>
          
          <!-- Contenido adicional -->
          <div *ngIf="hasContent" class="loading-modal-extra">
            <ng-content></ng-content>
          </div>
          
          <!-- Barra de progreso -->
          <div *ngIf="config.showProgress" class="loading-progress-section">
            <div class="progress-info">
              <span class="progress-label">Progreso</span>
              <span class="progress-percentage">{{ config.progress || 0 }}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill"
                   [style.width.%]="config.progress || 0">
                <!-- Efecto de brillo -->
                <div class="progress-shine"></div>
              </div>
            </div>
          </div>
          
          <!-- Pasos del proceso -->
          <div *ngIf="showSteps" class="loading-steps-section">
            <ng-content select="[slot=steps]"></ng-content>
          </div>
          
          <!-- Botón cancelar -->
          <div *ngIf="config.showCancel && !config.preventClose" class="loading-cancel-section">
            <button type="button"
                    class="loading-cancel-btn"
                    (click)="onCancel()">
              <span class="material-symbols-outlined">close</span>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* === LOADING MODAL OVERLAY === */
    .loading-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
      animation: fadeIn 0.3s ease-out;
    }

    .loading-modal-container {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      border: 1px solid rgba(139, 21, 56, 0.1);
      width: 100%;
      animation: slideUp 0.3s ease-out;
      position: relative;
      margin: auto;
    }

    .modal-size-sm { max-width: 20rem; }
    .modal-size-md { max-width: 28rem; }
    .modal-size-lg { max-width: 32rem; }

    .loading-modal-content {
      padding: 2.5rem 2rem;
      text-align: center;
    }

    /* === SPINNER SECTION === */
    .loading-spinner-section {
      margin-bottom: 2rem;
    }

    .loading-spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-spinner-wrapper {
      position: relative;
      width: 4rem;
      height: 4rem;
    }

    .spinner-ring {
      position: absolute;
      border-radius: 50%;
      border: 3px solid transparent;
      animation: spin 2s linear infinite;
    }

    .spinner-outer {
      width: 4rem;
      height: 4rem;
      border-top-color: var(--institucional-primario);
      border-right-color: var(--institucional-primario);
      animation-duration: 2s;
    }

    .spinner-middle {
      width: 3rem;
      height: 3rem;
      top: 0.5rem;
      left: 0.5rem;
      border-top-color: var(--institucional-secundario);
      border-left-color: var(--institucional-secundario);
      animation-duration: 1.5s;
      animation-direction: reverse;
    }

    .spinner-inner {
      width: 2rem;
      height: 2rem;
      top: 1rem;
      left: 1rem;
      border-top-color: var(--institucional-dorado);
      border-bottom-color: var(--institucional-dorado);
      animation-duration: 1s;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); opacity: 1; }
      50% { opacity: 0.8; }
      100% { transform: rotate(360deg); opacity: 1; }
    }

    /* === TYPOGRAPHY === */
    .loading-modal-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--institucional-primario);
      margin-bottom: 1rem;
      line-height: 1.3;
      letter-spacing: -0.025em;
    }

    .loading-modal-message {
      font-family: 'Montserrat', sans-serif;
      font-size: 1rem;
      color: var(--gray-600);
      margin-bottom: 1.5rem;
      line-height: 1.5;
      font-weight: 500;
    }

    .loading-modal-extra {
      margin-bottom: 1.5rem;
      color: var(--gray-700);
      font-family: 'Montserrat', sans-serif;
    }

    /* === PROGRESS BAR === */
    .loading-progress-section {
      margin-bottom: 2rem;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .progress-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.875rem;
      color: var(--gray-500);
      font-weight: 500;
    }

    .progress-percentage {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--institucional-primario);
    }

    .progress-bar-container {
      width: 100%;
      height: 0.75rem;
      background: var(--gray-200);
      border-radius: 0.375rem;
      overflow: hidden;
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, 
        var(--institucional-primario) 0%, 
        var(--institucional-secundario) 50%, 
        var(--institucional-dorado) 100%);
      border-radius: 0.375rem;
      transition: width 0.5s ease-out;
      position: relative;
    }

    .progress-shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.4) 50%, 
        transparent 100%);
      animation: shine 2s ease-in-out infinite;
    }

    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* === STEPS SECTION === */
    .loading-steps-section {
      margin-bottom: 2rem;
      text-align: left;
      font-family: 'Montserrat', sans-serif;
    }

    /* === CANCEL BUTTON === */
    .loading-cancel-section {
      margin-top: 2rem;
    }

    .loading-cancel-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid var(--gray-300);
      background: white;
      color: var(--gray-700);
      border-radius: 0.5rem;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .loading-cancel-btn:hover {
      border-color: var(--error);
      color: var(--error);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }

    .loading-cancel-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .loading-cancel-btn .material-symbols-outlined {
      font-size: 1.125rem;
    }

    /* === ANIMATIONS === */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* === RESPONSIVE === */
    @media (max-width: 640px) {
      .loading-modal-content {
        padding: 2rem 1.5rem;
      }

      .loading-modal-title {
        font-size: 1.25rem;
      }

      .loading-modal-message {
        font-size: 0.9rem;
      }
    }
  `]
})
export class LoadingModalComponent {
  @Input() isOpen = false;
  @Input() config: LoadingConfig = {};
  @Input() hasContent = false;
  @Input() showSteps = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() modalClose = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
    if (!this.config.preventClose) {
      this.close();
    }
  }

  close(): void {
    if (this.config.preventClose) return;
    
    this.isOpen = false;
    this.modalClose.emit();
  }
}
