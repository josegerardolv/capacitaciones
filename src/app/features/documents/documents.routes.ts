import { Routes } from '@angular/router';
import { CertificatesListComponent } from './pages/certificates-list/certificates-list.component';
import { TarjetonesListComponent } from './pages/tarjetones-list/tarjetones-list.component';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'certificados', pathMatch: 'full' },
      
      // Gestión de certificados
      { path: 'certificados', component: CertificatesListComponent },
      
      // Gestión de tarjetones
      { path: 'tarjetones', component: TarjetonesListComponent }
      
      // NOTA: Las rutas del editor están en app.routes.ts (pantalla completa sin layout)
    ]
  }
];
