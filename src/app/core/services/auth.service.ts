import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, firstValueFrom, timer, EMPTY } from 'rxjs';
import { map, catchError, tap, switchMap, retry, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ComponentLoadingService } from '../../shared/services/component-loading.service';

import { User, LoginRequest, LoginResponse, AuthTokens, BackendLoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'oauth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'oauth_refresh_token';
  private readonly USER_KEY = 'oauth_user';
  private readonly STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

  // BehaviorSubjects para el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Control de renovación de tokens
  private refreshTimer: any;
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private componentLoading: ComponentLoadingService
  ) {
    this.loadTokenFromStorage();
    this.initializeTokenRefreshTimer();
  }

  // ===================== ALMACENAMIENTO DE TOKENS =====================

  /**
   * Obtiene el storage a utilizar
   */
  private getStorage(): Storage {
    return this.STORAGE_TYPE === 'sessionStorage' ? sessionStorage : localStorage;
  }

  /**
   * Almacena el access token
   */
  private setAccessToken(token: string): void {
    this.getStorage().setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
    this.updateAuthenticationState();
  }

  /**
   * Almacena el refresh token
   */
  private setRefreshToken(token: string): void {
    this.getStorage().setItem(this.REFRESH_TOKEN_KEY, token);
    this.refreshTokenSubject.next(token);
  }

  /**
   * Almacena los datos del usuario
   */
  private setUser(user: User): void {
    this.getStorage().setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.updateAuthenticationState();
  }

  /**
   * Obtiene el access token
   */
  getAccessToken(): string | null {
    return this.tokenSubject.value || this.getStorage().getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token
   */
  private getRefreshToken(): string | null {
    return this.refreshTokenSubject.value || this.getStorage().getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene los datos del usuario actual
   */
  getCurrentUser(): User | null {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return currentUser;
    }

    const userStr = this.getStorage().getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        return user;
      } catch (error) {
        console.warn('Error parsing stored user data:', error);
        this.clearStoredUser();
      }
    }
    return null;
  }

  /**
   * Elimina todos los tokens y datos del usuario
   */
  private clearTokens(): void {
    this.getStorage().removeItem(this.TOKEN_KEY);
    this.getStorage().removeItem(this.REFRESH_TOKEN_KEY);
    this.getStorage().removeItem(this.USER_KEY);

    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.clearRefreshTimer();
  }

  /**
   * Elimina solo los datos del usuario almacenados
   */
  private clearStoredUser(): void {
    this.getStorage().removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.updateAuthenticationState();
  }

  // ===================== LÓGICA DE INICIO DE SESIÓN =====================

  /**
   * Iniciar sesión con credenciales
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Limpiar cualquier sesión existente
    this.clearTokens();

    const body = {
      /*grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
      client_id: environment.oauth.clientId,
      scope: environment.oauth.scopes.join(' ')*/
      email: credentials.username,
      password: credentials.password
    };

    return this.http.post<BackendLoginResponse>(`${environment.apiUrl}/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      map(response => {
        if (response && response.token) {
          // 1. Almacenar el token
          this.setAccessToken(response.token);
          // (No refresh token provided by backend yet)

          // 2. Mapear la respuesta mínima del backend a nuestro modelo User completo
          // Backend devuelve: { user: { usuario_id: "1", rol: 2 }, token: "..." }
          // Necesitamos construir un objeto User válido para evitar crashes

          const roleMapping: { [key: number]: string } = {
            1: 'admin',
            2: 'admin', // Asumiendo 2 es admin basado en el email 'administrador'
            3: 'capturista',
            4: 'supervisor',
            5: 'consulta'
          };

          const roleName = roleMapping[response.user.rol] || 'user';
          const userId = response.user.usuario_id.toString();

          // Extraer nombres reales si el backend los envía
          const fullName = response.user.persona_nombre || response.user.usuario?.split('@')[0].toUpperCase() || 'USUARIO';
          const areaName = response.user.modulo_nombre || 'General';

          // Construir usuario basado en la nueva estructura del Backend
          const user: User = {
            id: userId,
            username: response.user.usuario,
            email: response.user.usuario,
            name: fullName,
            role: roleName,
            role_id: response.user.rol.toString(),
            person: {
              id: response.user.persona?.toString() || userId,
              first_name: fullName,
              paternal_lastName: '',
              email: response.user.usuario,
              area: { id: response.user.area?.toString() || '1', name: areaName },
              instalacion: { id: response.user.modulo?.toString() || '1', name: areaName }
            },
            area: { id: response.user.area?.toString() || '1', name: areaName },
            instalacion: { id: response.user.modulo?.toString() || '1', name: areaName }
          };

          this.setUser(user);

          // Inicializar renovación automática (si el token tiene exp)
          this.initializeTokenRefreshTimer();

          return {
            success: true,
            message: 'Sesión iniciada exitosamente',
            user: user
          };
        } else {
          throw new Error('Respuesta de autenticación inválida');
        }
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  // ===================== LÓGICA DE CIERRE DE SESIÓN =====================

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    const hasToken = !!this.getAccessToken();

    // Limpiar tokens y datos localmente primero
    this.clearTokens();

    // Si no había token, solo retornar éxito local
    if (!hasToken) {
      return new Observable(observer => {
        observer.next({ success: true, message: 'Sesión cerrada exitosamente' });
        observer.complete();
      });
    }

    // Intentar notificar al servidor, pero no fallar si hay error
    return this.http.post<any>(`${environment.apiUrl}/oauth/revoke`, {}).pipe(
      map(response => ({ success: true, message: 'Sesión cerrada exitosamente' })),
      catchError(error => {
        // Aún si la API falla, considerar el logout exitoso ya que limpiamos los datos locales
        console.warn('Error notificando logout al servidor:', error);
        return new Observable(observer => {
          observer.next({ success: true, message: 'Sesión cerrada exitosamente' });
          observer.complete();
        });
      })
    );
  }

  /**
   * Limpiar sesión localmente sin llamar al backend
   */
  clearSession(): void {
    console.log('Limpiando sesión localmente');
    this.clearTokens();
  }

  // ===================== PETICIONES AUTENTICADAS CONTROLADAS =====================

  /**
   * Realiza peticiones con autenticación automática
   */
  requestWithAuth<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    options: {
      body?: any;
      params?: { [key: string]: any };
      headers?: { [key: string]: string };
      retryCount?: number;
    } = {}
  ): Observable<T> {
    const componentId = 'Realizando petición';
    // Mostrar modal de carga global antes de la petición
    try {
      this.componentLoading.setLoading(componentId, true, 'Cargando...');
    } catch (e) {
      // ignore
    }

    return this.ensureValidToken().pipe(
      switchMap((token) => {
        if (!token) {
          throw new Error('No access token available');
        }

        // Construir URL completa
        const fullUrl = url.startsWith('http') ? url : `${environment.apiUrl}${url}`;

        // Construir headers
        let headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        // Agregar headers personalizados
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            headers = headers.set(key, options.headers![key]);
          });
        }

        // Construir parámetros
        let httpParams = new HttpParams();
        if (options.params) {
          Object.keys(options.params).forEach(key => {
            const value = options.params![key];
            if (value !== null && value !== undefined) {
              if (Array.isArray(value)) {
                value.forEach(item => {
                  httpParams = httpParams.append(key, item.toString());
                });
              } else {
                httpParams = httpParams.set(key, value.toString());
              }
            }
          });
        }

        const httpOptions = { headers, params: httpParams };

        // Realizar la petición según el método
        let request: Observable<T>;
        switch (method) {
          case 'GET':
            request = this.http.get<T>(fullUrl, httpOptions);
            break;
          case 'POST':
            request = this.http.post<T>(fullUrl, options.body, httpOptions);
            break;
          case 'PUT':
            request = this.http.put<T>(fullUrl, options.body, httpOptions);
            break;
          case 'PATCH':
            request = this.http.patch<T>(fullUrl, options.body, httpOptions);
            break;
          case 'DELETE':
            request = this.http.delete<T>(fullUrl, httpOptions);
            break;
          default:
            throw new Error(`Método HTTP no soportado: ${method}`);
        }

        return request.pipe(
          retry(options.retryCount || 0),
          catchError((error: HttpErrorResponse) => this.handleRequestError<T>(error, method, url, options)),
          // Cerrar modal de carga cuando termine o haya error
          // usare finalize-like pattern with tap+catchError outside but RxJS finalize operator is not imported in this file
        );
      })
    ).pipe(
      // asegurar que siempre se cierre el loader global
      // usando finalize from rxjs/operators
      // importar finalize arriba no es necesario si ya está disponible; but we'll import it at top
      finalize(() => {
        try {
          this.componentLoading.setLoading(componentId, false);
        } catch (e) {
          // ignore
        }
      })
    );
  }

  // ===================== VERIFICACIÓN Y RENOVACIÓN DE TOKENS =====================

  /**
   * Verifica si hay un token válido y lo renueva si es necesario
   */
  private ensureValidToken(): Observable<string> {
    const token = this.getAccessToken();

    if (!token) {
      return throwError(() => new Error('No access token available'));
    }

    // Verificar si el token está próximo a expirar
    if (this.isTokenNearExpiry(token)) {
      return this.refreshAccessToken().pipe(
        map(() => {
          const newToken = this.getAccessToken();
          if (!newToken) {
            throw new Error('Failed to refresh token');
          }
          return newToken;
        })
      );
    }

    return new Observable<string>(observer => {
      observer.next(token);
      observer.complete();
    });
  }

  /**
   * Verifica si el token está próximo a expirar (5 minutos antes)
   */
  private isTokenNearExpiry(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutos de buffer

      return payload.exp && (payload.exp - currentTime) < bufferTime;
    } catch (error) {
      console.warn('Error decoding token:', error);
      return true; // Si no se puede decodificar, asumir que debe renovarse
    }
  }

  /**
   * Renueva el access token usando el refresh token
   */
  private refreshAccessToken(): Observable<AuthTokens> {
    if (this.isRefreshing) {
      // Si ya está renovando, esperar
      return timer(100).pipe(
        switchMap(() => this.refreshAccessToken())
      );
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing = true;

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', environment.oauth.clientId);

    return this.http.post<AuthTokens>(`${environment.apiUrl}/oauth/token`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.setAccessToken(response.access_token);
          if (response.refresh_token) {
            this.setRefreshToken(response.refresh_token);
          }

          // Actualizar usuario si viene en la respuesta
          if (response.user) {
            const user = this.mapTokenResponseToUser(response);
            this.setUser(user);
          }
        }
        this.isRefreshing = false;
      }),
      catchError(error => {
        this.isRefreshing = false;
        console.error('Error refreshing token:', error);
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Inicializa el temporizador de renovación automática
   */
  private initializeTokenRefreshTimer(): void {
    this.clearRefreshTimer();

    const token = this.getAccessToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - currentTime;

      // Renovar 10 minutos antes de la expiración
      const refreshTime = Math.max(0, (expiresIn - 600) * 1000);

      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken().subscribe({
          next: () => {
            console.log('Token renovado automáticamente');
            this.initializeTokenRefreshTimer(); // Reiniciar el timer
          },
          error: (error) => {
            console.error('Error en renovación automática:', error);
          }
        });
      }, refreshTime);

    } catch (error) {
      console.warn('Error parsing token for refresh timer:', error);
    }
  }

  /**
   * Limpia el temporizador de renovación
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // ===================== ESTADO DE AUTENTICACIÓN =====================

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    // Verificar si el token no ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Token inválido:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Verifica el estado de autenticación (para inicialización de la app)
   */
  async checkAuthStatus(): Promise<boolean> {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();

    if (!token || !user) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Validación de token falló:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthenticationState(): void {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user);

    this.isAuthenticatedSubject.next(isAuth);
  }

  // ===================== MÉTODOS DE COMPATIBILIDAD =====================

  /**
   * Login con credenciales (método de compatibilidad)
   */
  async loginWithCredentials(credentials: LoginRequest): Promise<boolean> {
    try {
      const result = await firstValueFrom(this.login(credentials));
      return result.success;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  }

  /**
   * Obtener token de acceso (método de compatibilidad)
   */
  getToken(): string | null {
    return this.getAccessToken();
  }

  // ===================== MÉTODOS PRIVADOS =====================

  /**
   * Carga tokens desde el almacenamiento al inicializar
   */
  private loadTokenFromStorage(): void {
    const token = this.getStorage().getItem(this.TOKEN_KEY);
    const refreshToken = this.getStorage().getItem(this.REFRESH_TOKEN_KEY);
    const userStr = this.getStorage().getItem(this.USER_KEY);

    if (token) {
      this.tokenSubject.next(token);
    }

    if (refreshToken) {
      this.refreshTokenSubject.next(refreshToken);
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.warn('Error parsing stored user data:', error);
        this.clearStoredUser();
      }
    }

    this.updateAuthenticationState();
  }

  /**
   * Mapea la respuesta del token a un objeto User
   */
  private mapTokenResponseToUser(response: AuthTokens): User {
    const currentDate = new Date().toISOString();

    if (!response.user) {
      throw new Error('No user data in token response');
    }
    if (!response.person) {
      throw new Error('No person data in token response');
    }

    const person = response.person;
    const fullName = `${person.first_name} ${person.paternal_lastName}${person.maternal_lastName ? ' ' + person.maternal_lastName : ''}`;

    return {
      id: response.user.id.toString(),
      username: response.user.email,
      name: fullName,
      email: response.user.email,
      role: response.user.role || '',
      role_id: response.user.role_id || null,
      person: {
        id: person.id.toString(),
        first_name: person.first_name || '',
        paternal_lastName: person.paternal_lastName || '',
        maternal_lastName: person.maternal_lastName || '',
        email: response.user.email,
        phone: '',
        position: response.work_schedule?.puesto || 'Usuario',
        area: {
          id: person.area.id.toString(),
          name: person.area.name,
          description: person.area.description,
          is_active: true,
          created_at: currentDate,
          updated_at: currentDate
        },
        instalacion: {
          id: person.facilities.id.toString(),
          name: person.facilities.name,
          description: person.facilities.description,
          is_active: true,
          created_at: currentDate,
          updated_at: currentDate
        }
      },
      area: {
        id: person.area.id.toString(),
        name: person.area.name,
        description: person.area.description,
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate
      },
      instalacion: {
        id: person.facilities.id.toString(),
        name: person.facilities.name,
        description: person.facilities.description,
        is_active: true,
        created_at: currentDate,
        updated_at: currentDate
      }
    };
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado en la autenticación';

    if (error.status === 400) {
      errorMessage = error.error?.error_description || error.error?.message || 'Datos de autenticación incorrectos';
    } else if (error.status === 401) {
      errorMessage = error.error?.error_description || error.error?.message || 'Usuario o contraseña incorrectos';
    } else if (error.status === 403) {
      errorMessage = error.error?.error_description || error.error?.message || 'Acceso denegado';
    } else if (error.status === 422) {
      errorMessage = error.error?.error_description || error.error?.message || 'Error de validación en los datos de autenticación';
    } else if (error.status === 500) {
      errorMessage = error.error?.error_description || error.error?.message || 'Error interno del servidor de autenticación';
    } else if (error.error?.error_description) {
      errorMessage = error.error.error_description;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message && !error.message.includes('Http failure')) {
      errorMessage = error.message;
    } else {
      errorMessage = `Error de autenticación (${error.status || 'desconocido'}): ${error.statusText || 'Error inesperado'}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Maneja errores en las peticiones autenticadas
   */
  private handleRequestError<T>(
    error: HttpErrorResponse,
    method: string,
    url: string,
    options: any
  ): Observable<T> {
    if (error.status === 401) {
      // Token inválido, intentar renovarlo
      return this.refreshAccessToken().pipe(
        switchMap(() => {
          // Reintentar la petición original
          return this.requestWithAuth<T>(method as any, url, options);
        }),
        catchError((refreshError) => {
          // Si no se pudo renovar, cerrar sesión
          this.clearSession();
          return throwError(() => new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
        })
      );
    }

    // Para otros errores, simplemente reenviarlos
    let errorMessage = 'Error en la petición';

    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || error.error?.error || 'Solicitud incorrecta. Verifique los datos enviados';
        break;
      case 403:
        errorMessage = error.error?.message || error.error?.error || 'No tiene permisos para realizar esta acción';
        break;
      case 404:
        errorMessage = error.error?.message || error.error?.error || 'Recurso no encontrado';
        break;
      case 422:
        errorMessage = error.error?.message || error.error?.error || 'Error de validación en los datos enviados';
        break;
      case 500:
        errorMessage = error.error?.message || error.error?.error || 'Error interno del servidor';
        break;
      default:
        errorMessage = error.error?.message || error.error?.error || `Error del servidor (${error.status}): ${error.statusText || 'Error desconocido'}`;
    }

    const customError = {
      message: errorMessage,
      status: error.status,
      statusText: error.statusText,
      details: error.error,
      url: error.url,
      timestamp: new Date().toISOString()
    };

    console.error('Error en petición autenticada:', customError);
    return throwError(() => customError);
  }
}