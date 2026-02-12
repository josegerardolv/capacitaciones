import { Routes } from '@angular/router';
import { CourseTypeListComponent } from './pages/course-type-list/course-type-list.component';

export const CONFIGURATION_ROUTES: Routes = [
    {
        path: 'config-cursos',
        component: CourseTypeListComponent,
        title: 'Configuración - Tipos de Curso'
    },
    {
        path: 'config-cursos/nuevo',
        loadComponent: () => import('./pages/course-type-form/course-type-form.component').then(m => m.CourseTypeFormComponent),
        title: 'Configuración - Nuevo Tipo de Curso'
    },
    {
        path: 'config-cursos/editar/:id',
        loadComponent: () => import('./pages/course-type-form/course-type-form.component').then(m => m.CourseTypeFormComponent),
        title: 'Configuración - Editar Tipo de Curso'
    },
    {
        path: 'concepto',
        loadComponent: () => import('./pages/concepts/concepts-list.component').then(m => m.ConceptsListComponent),
        title: 'Configuración - Conceptos'
    },
    {
        path: 'encuesta',
        loadComponent: () => import('../encuesta/encuesta.component').then(m => m.EncuestaComponent),
        title: 'Configuración - Encuesta'
    },
    {
        path: 'templates',
        loadComponent: () => import('./templates/pages/templates-list/templates-list.component').then(m => m.TemplatesListComponent),
        title: 'Configuración - Templates'
    },
    {
        path: 'templates/preview/:id',
        loadComponent: () => import('./components/modals/template-preview-modal/template-preview-modal.component').then(m => m.TemplatePreviewModalComponent),
        title: 'Configuración - Vista Previa'
    },
    {
        path: '',
        redirectTo: 'config-cursos',
        pathMatch: 'full'
    }
];
