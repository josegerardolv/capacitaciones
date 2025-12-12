import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AlertCardData {
  title: string;
  value: string | number;
  subtitle: string;
  description: string;
  icon: string;
  color: 'warning' | 'danger' | 'info';
  visible: boolean;
}

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300" 
         [ngClass]="getColorClass()" 
         *ngIf="data.visible">
      <div class="flex items-center space-x-4">
        <!-- Icono -->
        <div class="p-3 bg-white/20 rounded-xl">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" [innerHTML]="data.icon">
          </svg>
        </div>
        
        <!-- Contenido -->
        <div>
          <div class="font-bold text-2xl">{{ data.value }}</div>
          <div class="text-white/90">{{ data.subtitle }}</div>
          <div class="text-sm text-white/80 mt-1">{{ data.description }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-card {
      transition: all 0.3s ease;
    }
    
    .alert-card:hover {
      transform: scale(1.05);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25);
    }
    
    .bg-alert-warning {
      background: linear-gradient(135deg, var(--institucional-vino) 0%, var(--institucional-primario) 100%);
    }
    
    .bg-alert-danger {
      background: linear-gradient(135deg, var(--institucional-primario) 0%, var(--institucional-secundario) 100%);
    }
    
    .bg-alert-info {
      background: linear-gradient(135deg, var(--institucional-vino) 0%, var(--institucional-primario) 100%);
    }
  `]
})
export class AlertCardComponent {
  @Input() data!: AlertCardData;

  getColorClass(): string {
    const colorClasses = {
      'warning': 'bg-morena-vino alert-card',
      'danger': 'bg-morena-rosa alert-card',
      'info': 'bg-morena-guinda-dark alert-card'
    };
    return colorClasses[this.data.color] || 'bg-morena-vino alert-card';
  }
}
