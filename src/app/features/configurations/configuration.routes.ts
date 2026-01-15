import { Routes } from '@angular/router';
import { CourseTypeListComponent } from './pages/course-type-list/course-type-list.component';

export const CONFIGURATION_ROUTES: Routes = [
    {
        path: 'config-cursos',
        component: CourseTypeListComponent,
        title: 'Configuración - Crear Curso'
    },
    // Future: path: 'tipos-cursos/nuevo', component: CourseTypeFormComponent
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
        path: '',
        redirectTo: 'crear-cursos',
        pathMatch: 'full'
    }
];
