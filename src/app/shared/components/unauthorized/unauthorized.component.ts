import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full text-center">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12">
        <div class="mb-8">
          <h1 class="text-8xl sm:text-9xl font-bold text-institucional-primario">403</h1>
        </div>

        <div class="mx-auto h-24 w-24 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform hover:scale-105 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Acceso no autorizado</h2>
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">No tienes los permisos necesarios para ver esta página. Si crees que esto es un error, contacta al administrador.</p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <app-institutional-button
            [config]="{
              variant: 'primary',
              customClass: 'w-full sm:w-auto transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
            }"
            (buttonClick)="goHome()">
            Ir al Dashboard
          </app-institutional-button>
          <app-institutional-button
            [config]="{
              variant: 'ghost',
              customClass: 'w-full sm:w-auto transform hover:scale-105 shadow-lg hover:shadow-xl'
            }"
            (buttonClick)="goBack()">
            Regresar
          </app-institutional-button>
        </div>

        <div class="text-center mt-8 pt-6 border-t border-gray-200 border-opacity-50">
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div class="h-6 w-6 bg-institucional-guinda rounded-lg flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span class="font-medium">© 2025 SEMOVI Oaxaca</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">Sistema de Soporte Técnico - <span class="font-semibold">Versión 1.0.0</span></p>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: []
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}
