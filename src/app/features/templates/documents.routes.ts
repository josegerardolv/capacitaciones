import { Routes } from '@angular/router';
import { TemplatesListComponent } from './pages/templates-list/templates-list.component';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'templates', pathMatch: 'full' },
      { path: 'templates', component: TemplatesListComponent }
      // NOTA: Las rutas del editor están en app.routes.ts (pantalla completa sin layout)
    ]
  }
];
