import { Routes } from '@angular/router';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { GroupListComponent } from './pages/group-list/group-list.component';
import { GroupPersonsComponent } from './pages/group-persons/group-persons.component';
import { PersonRegistrationComponent } from './pages/person-registration/person-registration.component';

export const CURSOS_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: '', pathMatch: 'full' },
            { path: '', component: CourseListComponent },
            { path: ':cursoId/grupos', component: GroupListComponent },
            { path: ':cursoId/grupos/:groupId/conductores', component: GroupPersonsComponent },
            { path: ':cursoId/grupos/:groupId/conductores/nuevo', component: PersonRegistrationComponent } // Nueva ruta
        ]
    }
];
