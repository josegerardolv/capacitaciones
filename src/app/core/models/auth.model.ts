export interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string; // Agregamos este campo para compatibilidad (puede venir de person.email)
  is_active?: boolean;
  is_verified?: boolean;
  last_login?: string;
  must_change_password?: boolean;
  created_at?: string;
  updated_at?: string;
  person?: Person;
  area?: Area;
  instalacion?: Facilities;
  role: string;
  role_id?: string | null;
}

export interface BackendLoginResponse {
  token: string;
  user: {
    usuario_id: string | number;
    rol: number;
    person?: Person; // Usamos la interfaz Person para obligar a que venga con esta estructura
  };
}

export interface Person {
  id: string;
  first_name: string;
  paternal_lastName: string;
  maternal_lastName?: string;
  email: string;
  phone?: string;
  area?: Area;
  instalacion?: Facilities;
  employee_id?: string;
  position?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Facilities {
  id: string;
  name: string;
  description?: string;
  location?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  role: Role;
  application: Application;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  redirect_uris: string[];
  scopes: string[];
  grant_types: string[];
  response_types: string[];
  is_confidential: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  user: {
    id: number;
    email: string;
    role: string;
    role_id?: string | null;
  };
  person: {
    id: number;
    first_name: string;
    paternal_lastName: string;
    maternal_lastName?: string;
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
    allows_24_7_access: boolean;
    allows_flexible_hours: boolean;
    break_periods: any[];
    description: string;
    employment_status: string;
    end_time: string;
    has_custom_schedule: boolean;
    is_night_shift: boolean;
    puesto: string;
    puesto_codigo: string;
    requires_supervisor_approval: boolean;
    schedule_type: string;
    start_time: string;
    work_days: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: User;
    expires_in: number;
  };
  errors?: any;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  first_name: string;
  paternal_lastName: string;
  maternal_lastName?: string;
  email: string;
  phone?: string;
  employee_id?: string;
  position?: string;
  birth_date?: string;
  department_id: string;
  module_id: string;
  is_active?: boolean;
  must_change_password?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  paternal_lastName?: string;
  maternal_lastName?: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  position?: string;
  department_id?: string;
  module_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
  password?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
