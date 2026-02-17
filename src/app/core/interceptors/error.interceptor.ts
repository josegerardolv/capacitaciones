import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // No redirigir al login si es una petición de la zona pública
            const isPublicRequest = req.url.includes('/group/registro/') || req.url.includes('/public/');
            const isPublicRoute = router.url.includes('/public/register');

            if (isPublicRequest || isPublicRoute) {
              errorMessage = 'No se pudieron validar los datos o la sesión no es válida para este recurso.';
            } else {
              errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
              authService.logout();
              router.navigate(['/login']);
            }
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor.';
            break;
          default:
            errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }

      // Show notification for user-facing errors
      const isPublic = req.url.includes('/group/registro/') || req.url.includes('/public/') || router.url.includes('/public/register');

      if (error.status !== 401 || isPublic) {
        notificationService.error('Error', errorMessage);
      }

      return throwError(() => error);
    })
  );
};
