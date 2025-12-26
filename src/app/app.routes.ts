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
  
  // --- EDITOR VISUAL EN PANTALLA COMPLETA (Sin Layout) ---
  {
    path: 'documentos/templates/editor/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/templates/pages/template-editor/template-editor.component').then(m => m.TemplateEditorComponent)
  },

  // --- RUTA PÚBLICA DE REGISTRO (Sin Auth) ---
  {
    path: 'registro-publico',
    loadComponent: () => import('./shared/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: ':id', // ID del token/grupo
        loadComponent: () => import('./features/cursos/pages/public-registration/public-registration.component').then(m => m.PublicRegistrationComponent)
      }
    ]
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
      },
      {
        path: 'breadcrumb-demo',
        loadComponent: () => import('./shared/components/breadcrumb/breadcrumb-demo.component').then(m => m.BreadcrumbDemoComponent)
      },
      {
        path: 'cursos',
        loadChildren: () => import('./features/cursos/cursos.routes').then(m => m.CURSOS_ROUTES)
      }
      ,
      {
        path: 'documentos',
        loadChildren: () => import('./features/templates/documents.routes').then(m => m.DOCUMENTS_ROUTES)
      }


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