import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-8">
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-institucional-guinda">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Bienvenido al Sistema</h1>
        <p class="text-gray-600 text-lg">
          Hola, <span class="font-bold text-institucional-guinda">{{ user?.name || 'Usuario' }}</span>.
          Has iniciado sesión como <span class="px-2 py-1 bg-gray-100 rounded-md text-sm font-mono border border-gray-300">{{ user?.role }}</span>
        </p>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
    user: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
    }
}
