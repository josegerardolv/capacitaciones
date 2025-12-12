import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface UserApplication {
  application: {
    id: number;
    name: string;
    description: string;
  };
  assigned_at: string;
  assigned_by: number;
  role: {
    id: number;
    name: string;
    description: string;
    permissions: string[];
  };
}

export interface User {
  id: number;
  username?: string;
  email: string;
  person_id?: number;
  is_admin: boolean;
  is_active: boolean;
  is_verified: boolean;
  must_change_password: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  applications?: UserApplication[];
  person?: {
    id: number;
    first_name: string;
    last_name: string;
    second_last_name?: string;
    full_name: string;
    email: string;
    phone?: string;
    telefono?: string;
    RFC?: string;
    NSS?: string;
    CURP?: string;
    NUP?: string;
    NUE?: string;
    birth_date?: string;
    hire_date?: string;
    termination_date?: string;
    employment_status: string;
    bank_account?: string;
    fechaIngreso?: string;
    area_id?: number;
    puesto_id?: number;
    instalacion_id?: number;
    schedule_type_id?: number;
    is_active: boolean;
    area?: {
      id: number;
      name: string;
      description?: string;
      hierarchy_path: string;
      hierarchy_path_string: string;
      level: number;
      allows_sub_areas: boolean;
      parent_area_id?: number;
      parent_area?: {
        id: number;
        name: string;
        description?: string;
        hierarchy_path: string;
        hierarchy_path_string: string;
      };
    };
    puesto?: {
      id: number;
      nombre: string;
      codigo: string;
      descripcion?: string;
      nivel: string;
      area_id?: number;
      requisitos?: string;
      salario_minimo?: number;
      salario_maximo?: number;
    };
    instalacion?: {
      id: number;
      name: string;
      description?: string;
      atencion_contribuyente: boolean;
      tipo_id: number;
      tipo?: {
        id: number;
        name: string;
        description?: string;
      };
      region?: string;
      country?: string;
      state?: string;
      municipality?: string;
      localidad?: string;
      district?: string;
      colonia?: string;
      street?: string;
      exterior_number?: string;
      interior_number?: string;
      between_streets?: string;
      references?: string;
      postal_code?: string;
      latitude?: number;
      longitude?: number;
    };
    schedule_type?: {
      id: number;
      name: string;
      description: string;
      allows_24_7_access: boolean;
      allows_flexible_hours: boolean;
      is_night_shift: boolean;
      requires_supervisor_approval: boolean;
      default_start_time: string;
      default_end_time: string;
      default_work_days: string;
      break_periods: any[];
    };
    work_schedule_info?: {
      employment_status: string;
      puesto: string;
      puesto_codigo: string;
      schedule_type: string;
      description: string;
      work_days: string;
      start_time: string;
      end_time: string;
      break_periods: any[];
      allows_24_7_access: boolean;
      allows_flexible_hours: boolean;
      is_night_shift: boolean;
      requires_supervisor_approval: boolean;
      has_custom_schedule: boolean;
    };
  };
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  person_id?: number;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  person_id?: number;
  is_admin?: boolean;
  is_active?: boolean;
}

export interface ResetPasswordRequest {
  new_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/catalogs/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  getUsers(params?: { [key: string]: any }): Observable<UsersResponse> {
    let httpParams = new HttpParams();

    if (!params) return this.http.get<UsersResponse>(this.apiUrl, { params: httpParams });

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value === undefined || value === null) return;

      // Skip empty strings
      if (typeof value === 'string' && value === '') return;

      if (Array.isArray(value)) {
        // For arrays, append multiple values for the same key
        value.forEach(v => {
          if (v !== undefined && v !== null) {
            httpParams = httpParams.append(key, String(v));
          }
        });
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<UsersResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Obtener usuario específico por ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo usuario
   */
  createUser(userData: CreateUserRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(this.apiUrl, userData);
  }

  /**
   * Actualizar usuario existente
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Eliminar usuario (soft delete - desactivar)
   */
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activar usuario desactivado
   */
  activateUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Resetear contraseña de usuario
   */
  resetUserPassword(id: number, passwordData: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/reset-password`, passwordData);
  }

  /**
   * Asignar una aplicación a un usuario
   * NOTE: endpoint asumido: POST /api/catalogs/users/:id/applications
   */
  assignApplicationToUser(userId: number, applicationId: number, roleId: number): Observable<any> {
    const body = { application_id: applicationId, role_id: roleId };
    return this.http.post<any>(`${this.apiUrl}/${userId}/applications`, body);
  }

  /**
   * Actualizar el rol de una aplicación asignada a un usuario
   * NOTE: endpoint asumido: PUT /api/catalogs/users/:id/applications/:appId
   */
  updateUserApplicationRole(userId: number, applicationId: number, roleId: number): Observable<any> {
    const body = { role_id: roleId };
    return this.http.put<any>(`${this.apiUrl}/${userId}/applications/${applicationId}`, body);
  }

  /**
   * Quitar una aplicación asignada a un usuario
   * NOTE: endpoint asumido: DELETE /api/catalogs/users/:id/applications/:appId
   */
  removeApplicationFromUser(userId: number, applicationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}/applications/${applicationId}`);
  }

  /**
   * Obtener usuarios para selección (formato simplificado)
   */
  getUsersForSelect(): Observable<{ value: number; label: string }[]> {
    return this.http.get<{ value: number; label: string }[]>(`${this.apiUrl}/select`);
  }
}
