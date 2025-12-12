import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
    selector: 'app-not-found',
    imports: [CommonModule, UniversalIconComponent, InstitutionalButtonComponent],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl w-full text-center">
        <!-- Container principal moderno -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12">
          <!-- Número 404 grande -->
          <div class="mb-8">
            <h1 class="text-8xl sm:text-9xl font-bold text-institucional-primario">
              404
            </h1>
          </div>
          
          <!-- Icono -->
          <div class="mx-auto h-24 w-24 bg-institucional-primario rounded-2xl flex items-center justify-center shadow-lg mb-6 transform hover:scale-105 transition-all duration-300">
            <app-universal-icon 
              [name]="'wrong_location'" 
              [type]="'material'"
              [size]="60" 
              class="flex-shrink-0 transition-colors duration-200 text-white">
            </app-universal-icon>
          </div>
          
          <!-- Título y descripción -->
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p class="text-lg text-gray-600 mb-8 leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida. 
            <br class="hidden sm:inline">
            Por favor, verifica la URL o regresa al inicio.
          </p>
          
          <!-- Botones de acción -->
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <app-institutional-button
              [config]="{
                variant: 'primary',
                icon: 'home',
                iconPosition: 'left',
                customClass: 'w-full sm:w-auto transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }"
              (buttonClick)="goHome()">
              Ir al Dashboard
            </app-institutional-button>
            
            <app-institutional-button
              [config]="{
                variant: 'ghost',
                icon: 'arrow_back',
                iconPosition: 'left',
                customClass: 'w-full sm:w-auto transform hover:scale-105 shadow-lg hover:shadow-xl'
              }"
              (buttonClick)="goBack()">
              Regresar
            </app-institutional-button>
          </div>
          
          <!-- Footer -->
          <div class="text-center mt-8 pt-6 border-t border-gray-200 border-opacity-50">
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div class="h-6 w-6 bg-institucional-guinda rounded-lg flex items-center justify-center shadow-sm">
                <app-universal-icon 
                [name]="'verified_user'" 
                [type]="'material'"
                [size]="12" 
                class="flex-shrink-0 transition-colors duration-200 text-white">
              </app-universal-icon>
              </div>
              <span class="font-medium">© 2025 SEMOVI Oaxaca</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Sistema de Soporte Técnico - <span class="font-semibold">Versión 1.0.0</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}
