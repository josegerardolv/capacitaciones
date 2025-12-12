import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaces unificadas para todas las métricas
export interface BaseMetricData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  // Colores permitidos: colores institucionales y paleta de estadísticas gubernamentales
  color:
    | 'guinda'
    | 'rosa'
    | 'vino'
    | 'guinda-dark'
    // Paleta gubernamental (sin prefijo 'stats-')
    | 'morado'
    | 'naranja'
    | 'azul'
    | 'verde'
    | 'rojo'
    | 'amarillo'
    | 'celeste'
    | 'vino-gob'
    | 'turquesa'
    | 'blanco'
    | string; // fallback: permitir clases/variables personalizadas
  badge?: string;
  description?: string;
}

export interface TrendData {
  value: string | number;
  label: string;
  icon: string;
}

export interface ProgressData {
  percentage: number;
  label: string;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface UniversalMetricData extends BaseMetricData {
  // Tipo de métrica - determina el layout y funcionalidades
  type: 'simple' | 'trend' | 'progress' | 'alert' | 'chart' | 'action';
  
  // Datos opcionales según el tipo
  trend?: TrendData;
  progress?: ProgressData;
  chartData?: ChartData[];
  chartType?: 'bar' | 'donut' | 'progress';
  
  // Para alertas
  alertType?: 'warning' | 'danger' | 'info';
  visible?: boolean;
  
  // Para acciones
  actionButton?: {
    text: string;
    route?: string;
    action?: () => void;
  };
  
  // Control de tamaño
  size?: 'small' | 'medium' | 'large' | 'auto';
}

@Component({
    selector: 'app-universal-metric',
    imports: [CommonModule, RouterModule],
    template: `
    <div class="h-full w-full" [ngClass]="getContainerClasses()">
    <div [ngClass]="getCardClasses()" [ngStyle]="getCardStyles()" class="metric-card h-full p-6 rounded-3xl shadow-2xl flex flex-col">
        
        <!-- Círculo decorativo -->
        <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"
             *ngIf="data.type !== 'alert'"></div>
        
        <div class="relative z-10 flex-1 flex flex-col" [ngClass]="getContentLayout()">
          
          <!-- Header: Icono y Valor Principal -->
          <div class="flex items-center justify-between" [ngClass]="getHeaderSpacing()">
            <div class="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors duration-300 flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path [attr.d]="data.icon"/>
              </svg>
            </div>
            <div class="text-right flex-1 min-w-0 ml-3">
              <div class="text-2xl lg:text-3xl font-black text-white truncate">{{ data.value }}</div>
              <div class="text-xs lg:text-sm text-white/90 truncate">{{ data.subtitle }}</div>
            </div>
          </div>

          <!-- Trend Information (solo para type='trend') -->
          <div *ngIf="data.type === 'trend' && data.trend" class="mt-4">
            <div class="flex items-center space-x-2">
              <span class="text-lg">{{ data.trend.icon }}</span>
              <span class="text-white font-bold">{{ data.trend.value }}</span>
              <span class="text-white/80 text-sm">{{ data.trend.label }}</span>
            </div>
          </div>

          <!-- Progress Bar (solo para type='progress') -->
          <div *ngIf="data.type === 'progress' && data.progress" class="mt-4">
            <div class="w-full bg-white/20 rounded-full h-2">
              <div class="bg-white h-2 rounded-full transition-all duration-500" 
                   [style.width.%]="data.progress.percentage"></div>
            </div>
            <div class="text-xs text-white/90 mt-1">{{ data.progress.label }}</div>
          </div>

          <!-- Chart Visualization (solo para type='chart') -->
          <div *ngIf="data.type === 'chart' && data.chartData" class="mt-4 flex-1">
            
            <!-- Bar Chart -->
            <div *ngIf="data.chartType === 'bar'" class="space-y-2">
              <div *ngFor="let item of data.chartData" class="flex items-center space-x-2">
                <div class="text-xs text-white/90 w-16 truncate">{{ item.label }}</div>
                <div class="flex-1 bg-white/20 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-500" 
                       [style.width.%]="item.percentage"
                       [style.background-color]="item.color"></div>
                </div>
                <div class="text-xs text-white font-medium w-8 text-right">{{ item.value }}</div>
              </div>
            </div>

            <!-- Donut Chart (simplified) -->
            <div *ngIf="data.chartType === 'donut'" class="flex justify-center">
              <div class="relative w-24 h-24">
                <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" stroke-opacity="0.2" stroke-width="8" fill="none"/>
                  <circle *ngFor="let item of data.chartData; let i = index" 
                          cx="50" cy="50" r="40" 
                          [attr.stroke]="item.color" 
                          stroke-width="8" 
                          fill="none"
                          [attr.stroke-dasharray]="getCircumference()"
                          [attr.stroke-dashoffset]="getDashOffset(i)"
                          class="transition-all duration-500"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-white font-bold text-sm">{{ getTotalChartValue() }}</span>
                </div>
              </div>
            </div>

            <!-- Progress Circle -->
            <div *ngIf="data.chartType === 'progress'" class="flex justify-center">
              <div class="relative w-20 h-20">
                <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" stroke-opacity="0.2" stroke-width="8" fill="none"/>
                  <circle cx="50" cy="50" r="40" stroke="white" stroke-width="8" fill="none"
                          [attr.stroke-dasharray]="251.2"
                          [attr.stroke-dashoffset]="251.2 - (251.2 * (data.chartData[0].percentage || 0) / 100)"
                          class="transition-all duration-1000"/>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-white font-bold text-xs">{{ data.chartData[0].percentage || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert Content (para type='alert') -->
          <div *ngIf="data.type === 'alert'" class="mt-2 flex-1">
            <p class="text-white/90 text-sm leading-relaxed">{{ data.description }}</p>
          </div>

          <!-- Action Button (para type='action') -->
          <div *ngIf="data.type === 'action' && data.actionButton" class="mt-4">
            <button *ngIf="data.actionButton.route; else actionCallback"
                    [routerLink]="data.actionButton.route"
                    class="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl transition-colors duration-300 text-sm font-medium">
              {{ data.actionButton.text }}
            </button>
            <ng-template #actionCallback>
              <button (click)="data.actionButton.action?.()"
                      class="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-xl transition-colors duration-300 text-sm font-medium">
                {{ data.actionButton.text }}
              </button>
            </ng-template>
          </div>

          <!-- Footer: Badge (siempre al final) -->
          <div class="mt-auto pt-4" *ngIf="data.badge">
            <div class="flex items-center justify-between">
              <span class="text-xs bg-white/20 px-3 py-1 rounded-full truncate">{{ data.badge }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
    styles: [`
    /* Evitar selección de texto dentro de las tarjetas de métricas
       y asegurar que el texto se muestre en blanco */
    .metric-card, .metric-card * {
      -webkit-user-select: none; /* Safari */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* IE10+/Edge */
      user-select: none;
      color: #ffffff !important;
    }
    .metric-card {
      transition: all 0.3s ease;
      min-height: 120px;
    }
    
    .metric-card:hover {
      transform: translateY(-2px);
    }
    
    .group:hover .metric-card {
      transform: translateY(-4px);
    }
    
    /* Gradientes institucionales */
    .bg-institucional-primario {
      background: linear-gradient(135deg, var(--institucional-vino) 0%, var(--institucional-primario) 100%);
    }
    
    .bg-institucional-secundario {
      background: linear-gradient(135deg, var(--institucional-secundario) 0%, var(--institucional-vino) 100%);
    }
    
    .bg-institucional-terciario {
      background: linear-gradient(135deg, var(--institucional-primario) 0%, var(--institucional-primario-dark) 100%);
    }
    
    .bg-institucional-primario-dark {
      background: linear-gradient(135deg, var(--institucional-primario-dark) 0%, var(--institucional-vino) 100%);
    }
    
    /* Alertas */
    .bg-alert-warning {
      background: linear-gradient(135deg, var(--warning) 0%, var(--stats6) 100%);
    }
    
    .bg-alert-danger {
      background: linear-gradient(135deg, var(--error) 0%, var(--stats5) 100%);
    }
    
    .bg-alert-info {
      background: linear-gradient(135deg, var(--info) 0%, var(--stats3) 100%);
    }
    
    /* Tamaños responsivos */
    .size-small .metric-card {
      min-height: 100px;
    }
    
    .size-medium .metric-card {
      min-height: 140px;
    }
    
    .size-large .metric-card {
      min-height: 180px;
    }
    
    .size-auto .metric-card {
      min-height: fit-content;
    }
  `]
})
export class UniversalMetricComponent {
  @Input() data!: UniversalMetricData;

  getContainerClasses(): string {
  // Permitimos overflow para que elementos decorativos o contenido puedan sobresalir
  const baseClasses = 'group relative overflow-visible';
    const sizeClass = this.data.size ? `size-${this.data.size}` : '';
    return `${baseClasses} ${sizeClass}`.trim();
  }

  getCardClasses(): string {
    // Clases base ya aplicadas en el template; aquí añadimos clases condicionales
    const classes: string[] = [];

    if (this.data.type === 'alert') {
      if (this.data.alertType === 'warning') classes.push('bg-alert-warning');
      else if (this.data.alertType === 'danger') classes.push('bg-alert-danger');
      else if (this.data.alertType === 'info') classes.push('bg-alert-info');
      else classes.push('bg-alert-warning');

      return classes.join(' ');
    }

    // Colores institucionales preexistentes -> clases CSS ya definidas en styles
    switch (this.data.color) {
      case 'guinda':
        classes.push('bg-institucional-primario');
        break;
      case 'rosa':
        classes.push('bg-institucional-secundario');
        break;
      case 'vino':
        classes.push('bg-institucional-secundario');
        break;
      case 'guinda-dark':
        classes.push('bg-institucional-primario-dark');
        break;
      default:
        // Si es una clase que empieza con 'bg-' la aceptamos directamente
        if (typeof this.data.color === 'string' && this.data.color.startsWith('bg-')) {
          classes.push(this.data.color);
        } else {
          // Para otros casos, mantenemos un fondo por defecto
          classes.push('bg-institucional-primario');
        }
        break;
    }

    return classes.join(' ');
  }

  /**
   * Devuelve un objeto para binding [ngStyle] cuando el color proviene de
   * la paleta de estadísticas (variables CSS) o cuando se quiere usar una
   * variable personalizada.
   */
  getCardStyles(): Record<string, string> | null {
    const statsMap: Record<string, string> = {
      // keys sin 'stats-' para uso directo en data.color
      'morado': 'var(--stats1)',
      'naranja': 'var(--stats2)',
      'azul': 'var(--stats3)',
      'verde': 'var(--stats4)',
      'rojo': 'var(--stats5)',
      'amarillo': 'var(--stats6)',
      'celeste': 'var(--stats7)',
      'vino-gob': 'var(--stats8)',
      'turquesa': 'var(--stats9)',
      'blanco': 'var(--stats10)'
    };

    const colorKey = String(this.data.color || '').trim();
    // Si es uno de los stats, devolvemos background con la variable CSS
    if (statsMap[colorKey]) {
      return { background: statsMap[colorKey] };
    }

    // Si el usuario pasó una variable CSS directamente (por ejemplo "--my-color"), usarla
    if (colorKey.startsWith('--')) {
      return { background: `var(${colorKey})` };
    }

    return null;
  }

  getContentLayout(): string {
    switch (this.data.type) {
      case 'chart':
        return 'justify-start';
      case 'alert':
        return 'justify-start';
      default:
        return 'justify-between';
    }
  }

  getHeaderSpacing(): string {
    switch (this.data.type) {
      case 'simple':
        return 'mb-auto';
      case 'alert':
        return 'mb-3';
      default:
        return 'mb-4';
    }
  }

  // Métodos para charts
  getCircumference(): number {
    return 2 * Math.PI * 40; // r=40
  }

  getDashOffset(index: number): number {
    const circumference = this.getCircumference();
    let totalPercentage = 0;
    
    for (let i = 0; i < index; i++) {
      totalPercentage += this.data.chartData?.[i]?.percentage || 0;
    }
    
    return circumference - (circumference * totalPercentage / 100);
  }

  getTotalChartValue(): number {
    return this.data.chartData?.reduce((sum, item) => sum + item.value, 0) || 0;
  }
}
