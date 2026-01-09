import { Routes } from '@angular/router';
import { CourseTypeListComponent } from './pages/course-type-list/course-type-list.component';

export const CONFIGURATION_ROUTES: Routes = [
    {
        path: 'tipos-cursos',
        component: CourseTypeListComponent,
        title: 'Configuración - Tipos de Curso'
    },
    // Future: path: 'tipos-cursos/nuevo', component: CourseTypeFormComponent
    {
        path: '',
        redirectTo: 'tipos-cursos',
        pathMatch: 'full'
    }
];
