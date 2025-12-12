import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

/**
 * Ejemplo de servicio que utiliza el AuthService mejorado
 * para realizar peticiones autenticadas automáticamente
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  
  constructor(private authService: AuthService) {}

  /**
   * Ejemplo: Obtener perfil del usuario actual
   */
  getCurrentUserProfile(): Observable<any> {
    return this.authService.requestWithAuth(
      'GET',
      '/api/catalogs/users/profile'
    );
  }

  /**
   * Ejemplo: Crear un nuevo usuario
   */
  createUser(userData: any): Observable<any> {
    return this.authService.requestWithAuth(
      'POST',
      '/api/catalogs/users',
      {
        body: userData
      }
    );
  }

  /**
   * Ejemplo: Actualizar usuario
   */
  updateUser(userId: number, userData: any): Observable<any> {
    return this.authService.requestWithAuth(
      'PUT',
      `/api/catalogs/users/${userId}`,
      {
        body: userData
      }
    );
  }

  /**
   * Ejemplo: Buscar usuarios con parámetros
   */
  searchUsers(searchParams: { 
    search?: string; 
    page?: number; 
    per_page?: number;
    include_inactive?: boolean;
  }): Observable<any> {
    return this.authService.requestWithAuth(
      'GET',
      '/api/catalogs/users',
      {
        params: searchParams
      }
    );
  }

  /**
   * Ejemplo: Subir archivo (usando FormData)
   */
  uploadUserDocument(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.authService.requestWithAuth(
      'POST',
      `/api/catalogs/users/${userId}/documents`,
      {
        body: formData,
        headers: {
          // No establecer Content-Type para FormData
          // El navegador lo establecerá automáticamente
        }
      }
    );
  }

  /**
   * Ejemplo: Petición con headers personalizados
   */
  getUserWithCustomHeaders(userId: number): Observable<any> {
    return this.authService.requestWithAuth(
      'GET',
      `/api/catalogs/users/${userId}`,
      {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Accept': 'application/json'
        }
      }
    );
  }

  /**
   * Ejemplo: Petición con reintentos automáticos
   */
  getUserWithRetry(userId: number): Observable<any> {
    return this.authService.requestWithAuth(
      'GET',
      `/api/catalogs/users/${userId}`,
      {
        retryCount: 3
      }
    );
  }
}

/**
 * Ejemplo de cómo usar el servicio en un componente
 */
/*
@Component({
  selector: 'app-user-list',
  template: `...`
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private userApiService: UserApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    
    // Suscribirse a cambios en el estado de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.users = [];
        this.error = 'Usuario no autenticado';
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userApiService.searchUsers({ 
      page: 1, 
      per_page: 20 
    }).subscribe({
      next: (response) => {
        this.users = response.users || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  createUser(userData: any): void {
    this.userApiService.createUser(userData).subscribe({
      next: (response) => {
        console.log('Usuario creado exitosamente:', response);
        this.loadUsers(); // Recargar la lista
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
      }
    });
  }

  // El AuthService maneja automáticamente:
  // - Agregación del token Bearer
  // - Renovación automática si el token está próximo a expirar
  // - Reintento automático si recibe 401 (después de renovar token)
  // - Cierre de sesión automático si no se puede renovar el token
}
*/