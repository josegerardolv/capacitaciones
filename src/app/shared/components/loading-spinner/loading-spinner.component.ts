import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-spinner',
    imports: [CommonModule],
    template: `
    <div class="flex justify-center items-center" [ngClass]="containerClasses">
      <div class="bg-white rounded-3xl shadow-2xl p-12">
        <div class="flex flex-col items-center space-y-4">
          <!-- Spinner principal -->
          <div class="loader-institucional mb-6"></div>
          
          <!-- Título -->
          <h3 class="text-2xl font-semibold text-institucional-primario mb-3">{{ title }}</h3>
          
          <!-- Mensaje -->
          <p class="text-gray-600 text-lg">{{ message }}</p>
          
          <!-- Puntos animados -->
          <div class="mt-4 flex justify-center space-x-2">
            <div class="w-3 h-3 bg-institucional-primario rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-institucional-secundario rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-3 h-3 bg-institucional-secundario rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .loader-institucional {
      border: 4px solid var(--gray-200);
      border-top: 4px solid var(--institucional-vino);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: none;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() title: string = 'Cargando';
  @Input() message: string = 'Por favor espere...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() fullHeight: boolean = true;

  get containerClasses(): string {
    const baseClasses = this.fullHeight ? 'h-96' : 'min-h-[200px]';
    return baseClasses;
  }
}
