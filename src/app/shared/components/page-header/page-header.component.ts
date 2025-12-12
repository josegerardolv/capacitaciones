import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';

@Component({
  selector: 'app-page-header',
  standalone: true, // Es buena práctica ser explícito con standalone
  imports: [RouterModule, UniversalIconComponent], // CommonModule ya no es necesario para @if
  template: `
    <div class="relative overflow-hidden mb-8 rounded-2xl shadow-2xl">
      <!-- Fondo y patrón de decoración -->
      <div class="absolute inset-0 bg-gradient-institucional"></div>
      <div class="absolute inset-0 bg-pattern-dots opacity-10"></div>
      
      <div class="relative px-8 py-12 text-white">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          <!-- Título y Subtítulo -->
          <div class="mb-6 lg:mb-0">
            <h1 class="text-4xl lg:text-5xl font-black mb-4 tracking-tight">
              {{ title }}
            </h1>
            <p class="text-xl text-white/90">{{ subtitle }}</p>
          </div>
          
          <!-- Bloque de Botones (con @if) -->
          @if (showBackButton || actionButton) {
            <div class="flex flex-col items-center lg:items-end space-y-4">

              @if (showBackButton) {
                <!-- Botón de Regresar -->
                <a 
                  [routerLink]="backRoute" 
                  class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 shadow-lg">
                  <app-universal-icon name="arrow-left" type="bootstrap" [size]="20" customClass="text-white"></app-universal-icon>
                  <span>{{ backText || 'Regresar' }}</span>
                </a>
              } @else if (actionButton) {
                <!-- Botón de Acción Personalizado -->
                <a 
                  [routerLink]="actionButton.route" 
                  class="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105 shadow-lg">
                  <app-universal-icon [name]="actionButton.icon || 'plus'" [type]="actionButton.iconType || 'bootstrap'" [size]="20" class="flex-shrink-0 transition-colors duration-200"></app-universal-icon>
                  <span>{{ actionButton.text }}</span>
                </a>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backRoute: string = '/';
  @Input() backText: string = 'Regresar';
  @Input() actionButton?: {
    text: string;
    route: string;
    icon?: string;
    iconType?: 'material' | 'bootstrap';
  };
}
