import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';

/**
 * Guard paramétrico que valida que el usuario tenga alguno de los roles indicados.
 * Uso en rutas: canActivate: [ authGuard, roleGuard(['admin','superuser']) ]
 */
export const roleGuard = (roles: string[]) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    switchMap(isAuth => {
      if (!isAuth) {
        // Si no está autenticado, redirigir al login
        router.navigate(['/login']);
        return of(false);
      }

      // Verificar roles mediante PermissionService
      return permissionService.hasAnyRole(roles).pipe(
        map(has => {
          if (!has) {
            // Si no tiene el rol requerido, redirigir a la página de acceso denegado
            router.navigate(['/unauthorized']);
            return false;
          }
          return true;
        })
      );
    })
  );
};
