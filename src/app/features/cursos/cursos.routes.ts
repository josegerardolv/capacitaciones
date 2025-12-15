import { Routes } from '@angular/router';

export const CURSOS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/course-list/course-list.component').then(m => m.CourseListComponent)
    }
];
