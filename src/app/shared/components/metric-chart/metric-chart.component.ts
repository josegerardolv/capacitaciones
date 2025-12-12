import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface MetricChartData {
  title: string;
  subtitle: string;
  data: ChartData[];
  type: 'bar' | 'donut' | 'progress';
  color: 'guinda' | 'rosa' | 'vino' | 'guinda-dark';
}

@Component({
  selector: 'app-metric-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="text-white px-8 py-6" [ngClass]="getHeaderClass()">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
          <div>
            <h3 class="text-xl font-bold">{{ chartData.title }}</h3>
            <p class="text-sm opacity-90">{{ chartData.subtitle }}</p>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-8">
        <!-- Bar Chart -->
        <div *ngIf="chartData.type === 'bar'" class="space-y-4">
          <div *ngFor="let item of chartData.data" class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                <span class="text-sm font-bold" [style.color]="item.color">{{ item.value }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full transition-all duration-500" 
                     [style.width.%]="item.percentage"
                     [style.background-color]="item.color">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Progress Chart -->
        <div *ngIf="chartData.type === 'progress'" class="space-y-6">
          <div *ngFor="let item of chartData.data" class="text-center">
            <div class="relative inline-flex items-center justify-center w-32 h-32 mb-4">
              <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                <circle cx="60" cy="60" r="54" fill="none" [attr.stroke]="item.color" stroke-width="8"
                        stroke-linecap="round" [style.stroke-dasharray]="2 * Math.PI * 54"
                        [style.stroke-dashoffset]="2 * Math.PI * 54 * (1 - item.percentage / 100)"
                        class="transition-all duration-1000"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-2xl font-bold" [style.color]="item.color">{{ item.value }}</div>
                  <div class="text-xs text-gray-500">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
            <div class="text-sm font-medium text-gray-700">{{ item.label }}</div>
          </div>
        </div>
        
        <!-- Simple List -->
        <div *ngIf="chartData.type === 'donut'" class="grid grid-cols-2 gap-4">
          <div *ngFor="let item of chartData.data" class="text-center p-4 rounded-2xl"
               [style.background-color]="item.color + '20'">
            <div class="text-2xl font-bold mb-2" [style.color]="item.color">{{ item.value }}</div>
            <div class="text-sm text-gray-600">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      transition: all 0.3s ease;
    }
    
    .chart-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class MetricChartComponent {
  @Input() chartData!: MetricChartData;
  
  // Exponer Math para el template
  Math = Math;

  getHeaderClass(): string {
    const colorClasses = {
      'guinda': 'bg-morena-guinda',
      'rosa': 'bg-morena-rosa',
      'vino': 'bg-morena-vino',
      'guinda-dark': 'bg-morena-guinda-dark'
    };
    return colorClasses[this.chartData.color] || 'bg-morena-guinda';
  }
}
