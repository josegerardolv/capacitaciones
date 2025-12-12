import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styles: [],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Container principal moderno -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10">
          <!-- Header -->
          <div class="text-center">
            <div class="mx-auto h-20 w-20 bg-guinda-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform hover:scale-105 transition-all duration-300">
              <img src="assets/images/icons/Icon_vino.svg" alt="SEMOVI Logo" class="h-12 w-12">
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-guinda-900 mb-2">
              Sistema de Soporte Informático
            </h2>
            <p class="text-sm sm:text-base text-gray-600 mb-8">
              <span class="font-semibold text-guinda-700">SEMOVI</span> - Secretaría de Movilidad
            </p>
          </div>

          <!-- Formulario de Login -->
          <form class="space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <!-- Campo Usuario -->
              <div class="relative group">
                <label for="username" class="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-institucional-guinda">Usuario</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-institucional-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    formControlName="username"
                    class="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-institucional-guinda focus:border-institucional-guinda transition-all duration-200 bg-white hover:bg-gray-50 focus:bg-white"
                    placeholder="Ingrese su usuario"
                    [class.border-red-400]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                    [class.ring-red-400]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                    [class.bg-red-50]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                  />
                </div>
                <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="text-red-500 text-sm mt-1 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  El usuario es requerido
                </div>
              </div>

              <!-- Campo Contraseña -->
              <div class="relative group">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-institucional-guinda">Contraseña</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400 transition-colors duration-200 group-focus-within:text-institucional-guinda" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    formControlName="password"
                    class="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-institucional-guinda focus:border-institucional-guinda transition-all duration-200 bg-white hover:bg-gray-50 focus:bg-white"
                    placeholder="Ingrese su contraseña"
                    [class.border-red-400]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    [class.ring-red-400]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    [class.bg-red-50]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  />
                </div>
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1 flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  La contraseña es requerida
                </div>
              </div>
            </div>

            <!-- Error general -->
            <div *ngIf="loginError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative animate-fadeIn">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm">{{ loginError }}</span>
              </div>
            </div>

            <!-- Botón de login -->
            <div>
              <button
                type="submit"
                [disabled]="!loginForm.get('username')?.value || !loginForm.get('password')?.value || isLoading"
                class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-institucional-guinda hover:bg-institucional-guinda-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-institucional-guinda disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span *ngIf="!isLoading" class="flex items-center">
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Iniciar Sesión
                </span>
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              </button>
            </div>
          </form>

          <!-- Footer -->
          <div class="text-center mt-8 pt-6 border-t border-gray-200">
            <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div class="h-6 w-6 bg-guinda-600 rounded-lg flex items-center justify-center shadow-sm">
                <img src="assets/images/icons/Icon_vino.svg" alt="SEMOVI Logo" class="h-4 w-4">
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
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (
      this.loginForm.get('username')?.value &&
      this.loginForm.get('password')?.value &&
      !this.isLoading
    ) {
      this.isLoading = true;
      this.loginError = '';

      const credentials: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.notificationService.showSuccess(
              'Bienvenido',
              `Sesión iniciada correctamente. Bienvenido ${response.data?.user.person?.first_name || response.data?.user.name || 'Usuario'}!`
            );
            this.router.navigate(['/dashboard']);
          } else {
            this.loginError = response.message || 'Error al iniciar sesión';
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.loginError = 'Usuario o contraseña incorrectos';
          } else {
            this.loginError = error.message || 'Error al iniciar sesión. Verifique sus credenciales.';
          }
          this.notificationService.showError(
            'Error de autenticación',
            this.loginError
          );
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
