import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- GRUPO 1: SIN LAYOUT (Pantalla completa) ---
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent)
  },

  // --- GRUPO 2: LAYOUT ADMINISTRATIVO (Sidebar + Header) ---
  {
    path: '',
    canActivate: [authGuard], // Protegido
    loadComponent: () => import('./shared/layout/layout-wrapper.component').then(m => m.LayoutWrapperComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
      // Aquí agregaremos 'cursos', 'busqueda', etc.
    ]
  },

  // --- GRUPO 3: LAYOUT PÚBLICO (Para Errores y Avisos) ---
  // Esto hace que el 404 tenga Header y Footer institucionales
  /* 
  // Desactivado temporalmente hasta tener PublicLayoutComponent confirmado/limpio
  {
    path: '',
    loadComponent: () => import('./shared/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'unauthorized', // Página de "No tienes permisos"
        loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      },
      {
        path: '404', // Página de "No encontrado" explícita
        loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
      },
    ]
  },
  */

  // --- WILDCARD DIRECTO (Temporal para evitar problemas con PublicLayout) ---
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  // --- WILDCARD (Ruta no encontrada) ---
  {
    path: '**',
    redirectTo: '404'
  }
];