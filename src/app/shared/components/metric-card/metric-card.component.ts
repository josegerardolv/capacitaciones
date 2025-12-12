import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'guinda' | 'rosa' | 'vino' | 'guinda-dark';
  badge?: string;
  trend?: {
    value: string | number;
    label: string;
    icon: string;
  };
  progress?: {
    percentage: number;
    label: string;
  };
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group relative overflow-hidden">
      <div class="metric-card h-full p-8 rounded-3xl shadow-2xl" [ngClass]="getColorClass()">
        <!-- Elemento decorativo -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
        
        <!-- Contenido principal -->
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <!-- Icono -->
            <div class="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
              <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20" [innerHTML]="data.icon">
              </svg>
            </div>
            
            <!-- Valor y subtítulo -->
            <div class="text-right">
              <div class="text-4xl font-black text-white">{{ data.value }}</div>
              <div class="text-sm text-white/90">{{ data.subtitle }}</div>
            </div>
          </div>
          
          <!-- Footer con badge y trend/progress -->
          <div class="flex items-center justify-between">
            <!-- Badge -->
            <span class="text-xs bg-white/20 px-4 py-2 rounded-full" *ngIf="data.badge">
              {{ data.badge }}
            </span>
            
            <!-- Trend -->
            <div class="flex items-center text-xs" *ngIf="data.trend">
              <span class="mr-1">{{ data.trend.icon }}</span>
              <span>{{ data.trend.value }} {{ data.trend.label }}</span>
            </div>
            
            <!-- Progress bar -->
            <div class="w-24 bg-white/20 rounded-full h-3" *ngIf="data.progress">
              <div class="bg-white h-3 rounded-full transition-all duration-500" 
                   [style.width.%]="data.progress.percentage">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metric-card {
      transition: all 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .bg-morena-guinda {
      background: linear-gradient(135deg, var(--institucional-vino) 0%, var(--institucional-primario) 100%);
    }
    
    .bg-morena-rosa {
      background: linear-gradient(135deg, var(--institucional-secundario) 0%, var(--institucional-secundario-light) 100%);
    }
    
    .bg-morena-vino {
      background: linear-gradient(135deg, var(--institucional-primario) 0%, var(--institucional-vino) 100%);
    }
    
    .bg-morena-guinda-dark {
      background: linear-gradient(135deg, var(--institucional-primario-dark) 0%, var(--institucional-vino) 100%);
    }
  `]
})
export class MetricCardComponent {
  @Input() data!: MetricCardData;

  getColorClass(): string {
    const colorClasses = {
      'guinda': 'bg-morena-guinda',
      'rosa': 'bg-morena-rosa', 
      'vino': 'bg-morena-vino',
      'guinda-dark': 'bg-morena-guinda-dark'
    };
    return colorClasses[this.data.color] || 'bg-morena-guinda';
  }
}
