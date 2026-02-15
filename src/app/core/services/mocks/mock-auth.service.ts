import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, Person } from '../../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class MockAuthService {
    // Subject to emulate real auth state changes
    private _isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this._isAuthenticatedSubject.asObservable();

    constructor() {
        console.warn(' MOCK AUTH SERVICE ACTIVE: Using simulated authentication');
        // Restore session
        const stored = localStorage.getItem('mock_session');
        if (stored) {
            const session = JSON.parse(stored);
            this._isAuthenticated = true;
            this._currentUser = session.user;
            this._isAuthenticatedSubject.next(true); // Notify subscribers
        }
    }

    // State for mock session
    private _isAuthenticated = false;
    private _currentUser: User | null = null;

    // Base mock user to clone
    private readonly BASE_USER: User = {
        id: '1',
        username: 'admin',
        name: 'Usuario Simulado',
        email: 'test@semovi.gob.mx',
        role: 'admin',
        role_id: '1',
        person: {
            id: '1',
            first_name: 'Usuario',
            paternal_lastName: 'Simulado',
            email: 'test@semovi.gob.mx',
            area: { id: '1', name: 'Dirección de Licencias' },
            instalacion: { id: '1', name: 'Edificio Central' }
        }
    };

    /**
     * Simulates login process with role detection based on username
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        const username = credentials.username; // Remove forced uppercase
        const upperUser = username.toUpperCase();
        let role = 'admin'; // Default
        let name = 'Administrador Sistema';

        // "Magic" login logic
        if (upperUser.includes('SUPER')) role = 'SUPER_ADMINISTRADOR';
        else if (upperUser.includes('CAPTURISTA')) { role = 'CAPTURISTA'; name = 'Juan Capturista'; }
        else if (upperUser.includes('CONSULTA')) { role = 'CONSULTA'; name = 'Maria Consulta'; }
        else if (upperUser.includes('SUPERVISOR')) { role = 'SUPERVISOR'; name = 'Pedro Supervisor'; }
        else if (username.toLowerCase() === 'admin') { role = 'admin'; } // Exact match check lowercase
        else {
            return throwError(() => new Error('Usuario no encontrado. Intente con: admin, capturista, super o consulta'));
        }

        // Clone and customize user
        const mockUser = JSON.parse(JSON.stringify(this.BASE_USER));
        mockUser.role = role;
        mockUser.name = name;
        if (mockUser.person) mockUser.person.first_name = name.split(' ')[0];

        // Update state
        this._isAuthenticated = true;
        this._currentUser = mockUser;
        this._isAuthenticatedSubject.next(true); // Notify subscribers
        localStorage.setItem('mock_session', JSON.stringify({ user: mockUser }));

        return of({
            success: true,
            message: 'Login Simulado Exitoso',
            data: {
                access_token: 'mock_token_' + Date.now(),
                refresh_token: 'mock_refresh_' + Date.now(),
                user: {
                    ...mockUser,
                    // Simular campos del nuevo formato para pruebas
                    usuario: credentials.username,
                    persona_nombre: name,
                    modulo_nombre: 'MÓDULO DE PRUEBA CENTRAL',
                    area: '1',
                    modulo: '1'
                },
                expires_in: 3600
            }
        }).pipe(delay(800)); // Simulate network delay
    }

    // Compatibility methods
    getAccessToken(): string | null {
        return this._isAuthenticated ? 'mock_token_active' : null;
    }

    getCurrentUser(): User | null {
        return this._currentUser;
    }

    isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    checkAuthStatus(): Promise<boolean> {
        return Promise.resolve(this._isAuthenticated);
    }

    logout(): Observable<any> {
        this._isAuthenticated = false;
        this._currentUser = null;
        this._isAuthenticatedSubject.next(false); // Notify subscribers
        localStorage.removeItem('mock_session');
        return of({ success: true }).pipe(delay(400));
    }
    // ==================== MOCK API HANDLER ====================

    /**
     * Intercepts requests and returns mock data based on URL
     * This mimics the real AuthService.requestWithAuth signature
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
        console.log(`[MockAuth] ${method} ${url}`, options);

        // Simulate network delay
        const delayMs = 500;

        // 1. Mock para /users (UsuariosService)
        if (url.includes('/users')) {
            if (method === 'GET') {
                // Return list of mock users
                return of(this.getMockUsers() as unknown as T).pipe(delay(delayMs));
            }
        }

        // 2. Mock Default para cualquier otra cosa (evita errores)
        console.warn(`[MockAuth] No specific mock found for ${url}, returning empty object/array`);
        return of([] as unknown as T).pipe(delay(delayMs));
    }

    // --- Helper Data Generators ---

    private getMockUsers() {
        return [
            {
                id: 1,
                email: 'admin@semovi.gob.mx',
                rol: 'admin',
                activo: true,
                person: {
                    id: 1,
                    first_name: 'Admin',
                    paternal_lastName: 'Sistema',
                    area: { id: 1, name: 'Dirección TIC' },
                    facilities: { id: 1, name: 'Edificio Central' }
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                email: 'operador@semovi.gob.mx',
                rol: 'operador',
                activo: true,
                person: {
                    id: 2,
                    first_name: 'Juan',
                    paternal_lastName: 'Pérez',
                    area: { id: 2, name: 'Licencias' },
                    facilities: { id: 2, name: 'Módulo Reforma' }
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }
}
