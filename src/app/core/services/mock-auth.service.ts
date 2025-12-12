import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, Person } from '../models/auth.model';

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
        role: 'ADMINISTRADOR',
        role_id: '1',
        person: {
            id: '1',
            first_name: 'Usuario',
            last_name: 'Simulado',
            email: 'test@semovi.gob.mx',
            area: { id: '1', name: 'Dirección de Licencias' },
            instalacion: { id: '1', name: 'Edificio Central' }
        }
    };

    /**
     * Simulates login process with role detection based on username
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        const username = credentials.username.toUpperCase();
        let role = 'ADMINISTRADOR'; // Default
        let name = 'Administrador Sistema';

        // "Magic" login logic
        if (username.includes('SUPER')) role = 'SUPER_ADMINISTRADOR';
        else if (username.includes('CAPTURISTA')) { role = 'CAPTURISTA'; name = 'Juan Capturista'; }
        else if (username.includes('CONSULTA')) { role = 'CONSULTA'; name = 'Maria Consulta'; }
        else if (username.includes('SUPERVISOR')) { role = 'SUPERVISOR'; name = 'Pedro Supervisor'; }
        else if (username === 'ADMIN') { role = 'ADMINISTRADOR'; } // Exact match
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
                user: mockUser,
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
}
