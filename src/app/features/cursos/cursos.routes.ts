import { Routes } from '@angular/router';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { GroupListComponent } from './pages/group-list/group-list.component';

export const CURSOS_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'lista', pathMatch: 'full' },
            { path: 'lista', component: CourseListComponent },
            { path: 'grupos', component: GroupListComponent }
        ]
    }
];
