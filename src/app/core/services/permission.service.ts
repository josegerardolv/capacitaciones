import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

export interface Permission {
  resource: string;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private userPermissions: Permission[] = [
    // Permisos por defecto para desarrollo
    { resource: 'dashboard', action: 'read' },
    { resource: 'admin', action: 'read' },
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' }
  ];

  constructor(private authService: AuthService) {}

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(resource: string, action: string = 'read'): Observable<boolean> {
    const hasPermission = this.userPermissions.some(
      permission => permission.resource === resource && permission.action === action
    );
    return of(hasPermission);
  }

  /**
   * Verificar si el usuario tiene alguno de los permisos especificados
   */
  hasAnyPermission(permissions: Permission[]): Observable<boolean> {
    const hasAny = permissions.some(permission =>
      this.userPermissions.some(
        userPermission => 
          userPermission.resource === permission.resource && 
          userPermission.action === permission.action
      )
    );
    return of(hasAny);
  }

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   */
  hasAllPermissions(permissions: Permission[]): Observable<boolean> {
    const hasAll = permissions.every(permission =>
      this.userPermissions.some(
        userPermission => 
          userPermission.resource === permission.resource && 
          userPermission.action === permission.action
      )
    );
    return of(hasAll);
  }

  /**
   * Obtener todos los permisos del usuario
   */
  getUserPermissions(): Observable<Permission[]> {
    return of([...this.userPermissions]);
  }

  /**
   * Establecer permisos del usuario (normalmente se llamaría después del login)
   */
  setUserPermissions(permissions: Permission[]): void {
    this.userPermissions = [...permissions];
  }

  /**
   * Verificar permiso de forma síncrona
   */
  checkPermission(resource: string, action: string = 'read'): boolean {
    return this.userPermissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.role) {
      return of(false);
    }
    
    const userRoles = [currentUser.role];
    const hasRole = roles.some(role => userRoles.includes(role));
    return of(hasRole);
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados (síncrono)
   */
  checkAnyRole(roles: string[]): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.role) {
      return false;
    }
    
    const userRoles = [currentUser.role];
    return roles.some(role => userRoles.includes(role));
  }
}
