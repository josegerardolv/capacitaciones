import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Usuario {
  id: number;
  email: string;
  rol: 'admin' | 'operador' | 'consulta';
  activo: boolean;
  person?: {
    id: number;
    first_name: string;
    paternal_lastName: string;
    maternal_lastName?: string;
    phone?: string;
    position?: string;
    area: {
      id: number;
      name: string;
      description: string;
    };
    facilities: {
      id: number;
      name: string;
      description: string;
    };
  };
  work_schedule?: {
    start_time: string;
    end_time: string;
    work_days: string;
    puesto: string;
    employment_status: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  rol: 'admin' | 'operador' | 'consulta';
  person: {
    first_name: string;
    paternal_lastName: string;
    maternal_lastName?: string;
    phone?: string;
    position?: string;
    area_id: number;
    facilities_id: number;
  };
  work_schedule?: {
    start_time: string;
    end_time: string;
    work_days: string;
    puesto: string;
  };
}

export interface UpdateUsuarioDto {
  email?: string;
  rol?: 'admin' | 'operador' | 'consulta';
  activo?: boolean;
  person?: {
    first_name?: string;
    paternal_lastName?: string;
    maternal_lastName?: string;
    phone?: string;
    position?: string;
    area_id?: number;
    facilities_id?: number;
  };
  work_schedule?: {
    start_time?: string;
    end_time?: string;
    work_days?: string;
    puesto?: string;
  };
}

export interface Area {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Instalacion {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtener todos los usuarios
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.authService.requestWithAuth<any[]>('GET', '/users', {}).pipe(
      map(response => response.map(this.mapUsuarioFromApi)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un usuario por ID
   */
  getUsuario(id: number): Observable<Usuario> {
    return this.authService.requestWithAuth<any>('GET', `/users/${id}`, {}).pipe(
      map(this.mapUsuarioFromApi),
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo usuario
   */
  createUsuario(usuario: CreateUsuarioDto): Observable<Usuario> {
    return this.authService.requestWithAuth<any>('POST', '/users', { body: usuario }).pipe(
      map(this.mapUsuarioFromApi),
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un usuario
   */
  updateUsuario(id: number, usuario: UpdateUsuarioDto): Observable<Usuario> {
    return this.authService.requestWithAuth<any>('PATCH', `/users/${id}`, { body: usuario }).pipe(
      map(this.mapUsuarioFromApi),
      catchError(this.handleError)
    );
  }

  /**
   * Cambiar contraseña de un usuario
   */
  cambiarPassword(id: number, nuevaPassword: string, passwordActual?: string): Observable<void> {
    const body: any = { password: nuevaPassword };
    if (passwordActual) {
      body.current_password = passwordActual;
    }

    return this.authService.requestWithAuth<void>('PATCH', `/users/${id}/password`, { body }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cambiar estado activo/inactivo de un usuario
   */
  toggleStatusUsuario(id: number): Observable<Usuario> {
    return this.authService.requestWithAuth<any>('PATCH', `/users/${id}/toggle-status`, {}).pipe(
      map(this.mapUsuarioFromApi),
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un usuario
   */
  deleteUsuario(id: number): Observable<void> {
    return this.authService.requestWithAuth<void>('DELETE', `/users/${id}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las áreas
   */
  getAreas(): Observable<Area[]> {
    return this.authService.requestWithAuth<any[]>('GET', '/areas', {}).pipe(
      map(response => response.map(this.mapAreaFromApi)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las instalaciones
   */
  getInstalaciones(): Observable<Instalacion[]> {
    return this.authService.requestWithAuth<any[]>('GET', '/instalaciones', {}).pipe(
      map(response => response.map(this.mapInstalacionFromApi)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener estadísticas de usuarios
   */
  getEstadisticasUsuarios(): Observable<any> {
    return this.authService.requestWithAuth<any>('GET', '/users/estadisticas', {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Buscar usuarios por texto
   */
  buscarUsuarios(busqueda: string): Observable<Usuario[]> {
    return this.authService.requestWithAuth<any[]>('GET', '/users/buscar', {
      params: { q: busqueda }
    }).pipe(
      map(response => response.map(this.mapUsuarioFromApi)),
      catchError(this.handleError)
    );
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Mapear respuesta de la API a objeto Usuario
   */
  private mapUsuarioFromApi = (data: any): Usuario => ({
    id: data.id,
    email: data.email,
    rol: data.rol,
    activo: data.activo,
    person: data.person ? {
      id: data.person.id,
      first_name: data.person.first_name,
      paternal_lastName: data.person.paternal_lastName || data.person.last_name, // Fallback for compatibility
      maternal_lastName: data.person.maternal_lastName || data.person.second_last_name,
      phone: data.person.phone,
      position: data.person.position,
      area: data.person.area,
      facilities: data.person.facilities
    } : undefined,
    work_schedule: data.work_schedule ? {
      start_time: data.work_schedule.start_time,
      end_time: data.work_schedule.end_time,
      work_days: data.work_schedule.work_days,
      puesto: data.work_schedule.puesto,
      employment_status: data.work_schedule.employment_status
    } : undefined,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });

  /**
   * Mapear respuesta de la API a objeto Area
   */
  private mapAreaFromApi = (data: any): Area => ({
    id: data.id,
    name: data.name,
    description: data.description,
    is_active: data.is_active,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });

  /**
   * Mapear respuesta de la API a objeto Instalacion
   */
  private mapInstalacionFromApi = (data: any): Instalacion => ({
    id: data.id,
    name: data.name,
    description: data.description,
    is_active: data.is_active,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at)
  });

  /**
   * Manejar errores de la API
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en UsuariosService:', error);

    let errorMessage = 'Error inesperado en el servicio de usuarios';

    if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos para el usuario';
    } else if (error.status === 404) {
      errorMessage = 'Usuario no encontrado';
    } else if (error.status === 409) {
      errorMessage = error.error?.message || 'El email ya está registrado';
    } else if (error.status === 422) {
      errorMessage = error.error?.message || 'Error de validación en los datos';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta operación';
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Validar datos de usuario
   */
  validateUsuario(usuario: Partial<Usuario>): string[] {
    const errors: string[] = [];

    if (!usuario.email) {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
      errors.push('El email debe tener un formato válido');
    }

    if (!usuario.rol) {
      errors.push('El rol es requerido');
    }

    if (usuario.person) {
      if (!usuario.person.first_name || usuario.person.first_name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      }

      if (!usuario.person.paternal_lastName || usuario.person.paternal_lastName.trim().length < 2) {
        errors.push('El apellido paterno debe tener al menos 2 caracteres');
      }

      if (usuario.person.phone && !/^\d{10}$/.test(usuario.person.phone.replace(/\D/g, ''))) {
        errors.push('El teléfono debe tener 10 dígitos');
      }
    }

    return errors;
  }

  /**
   * Validar contraseña
   */
  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (!password || password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    return errors;
  }
}