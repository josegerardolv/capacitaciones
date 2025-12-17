import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Group } from '../../../core/models/group.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {

    // Datos simulados: En producción esto vendrá de la API
    private mockGroups: Group[] = [
        {
            id: 1,
            name: 'A05',
            description: 'Regular text column',
            location: 'Carlos Gracida',
            dateTime: '12/07/2026, 14:30',
            quantity: 55,
            autoRegisterLimit: 's',
            url: 'https://example.com',
            requests: 0,
            status: 'Activo'
        },
        {
            id: 2,
            name: 'A06',
            description: 'Regular text column',
            location: 'Reforma',
            dateTime: '12/07/2026, 14:30',
            quantity: 40,
            autoRegisterLimit: 's',
            url: '',
            requests: 0,
            status: 'Inactivo'
        },
        {
            id: 3,
            name: 'B13',
            description: 'Regular text column',
            location: 'Carlos Gracida',
            dateTime: '12/07/2026, 14:30',
            quantity: 30,
            autoRegisterLimit: 's',
            url: 'https://example.com',
            requests: 0,
            status: 'Activo'
        }
    ];

    constructor() { }

    getGroups(): Observable<Group[]> {
        return of([...this.mockGroups]).pipe(delay(500));
    }

    deleteGroup(id: number): Observable<void> {
        this.mockGroups = this.mockGroups.filter(g => g.id !== id);
        return of(void 0).pipe(delay(500));
    }
}
