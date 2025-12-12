import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  {
    path: '',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  
  // Rutas administrativas (requieren autenticación)
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
    ]
  },

  // Autenticación
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent)
  },
  
  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  
  // Wildcard route - debe ir al final
  {
    path: '**',
    redirectTo: '404'
  }
]