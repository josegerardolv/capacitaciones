import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Group } from '../../../core/models/group.model';
import { Driver } from '../../../core/models/driver.model'; // Importamos el nuevo modelo

@Injectable({
    providedIn: 'root'
})
export class GroupsService {

    // Datos simulados: En producción esto vendrá de la API
    private mockGroups: Group[] = [
        {
            id: 1,
            name: 'A05',
            // description: 'Regular text column', // Ya no es obligatorio
            duration: '3 Horas', // Campo requerido restaurado
            location: 'Carlos Gracida',
            dateTime: '12/07/2026, 14:30',
            quantity: 55,
            autoRegisterLimit: 5, // Días (número)
            url: 'http://localhost:4200/public/register/1',
            requests: 2,
            status: 'Activo'
        },
        {
            id: 2,
            name: 'A06',
            duration: '5 Horas',
            location: 'Reforma',
            dateTime: '12/07/2026, 14:30',
            quantity: 40,
            autoRegisterLimit: 3,
            url: '', // Sin URL generada aún
            requests: 0,
            status: 'Inactivo'
        },
        {
            id: 3,
            name: 'B13',
            duration: '4 Horas',
            location: 'Carlos Gracida',
            dateTime: '12/07/2026, 14:30',
            quantity: 30,
            autoRegisterLimit: 2,
            url: 'http://localhost:4200/public/register/3',
            requests: 5,
            status: 'Activo'
        }
    ];

    // Simulación de conductores por grupo (Mock DB)
    private mockDrivers: { [groupId: number]: Driver[] } = {
        1: [
            { id: 1, name: 'Juan Pérez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle 1, Col. Centro' },
            { id: 2, name: 'María López', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', requestTarjeton: true, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Reforma 222' },
            { id: 3, name: 'Carlos Ruiz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', requestTarjeton: true, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle Sur 8' },
        ],
        2: [], // Grupo vacío
        3: []
    };

    constructor() { }

    getGroups(): Observable<Group[]> {
        return of([...this.mockGroups]).pipe(delay(500));
    }

    getDriversByGroupId(groupId: number): Observable<Driver[]> {
        const drivers = this.mockDrivers[groupId] || [];
        return of([...drivers]).pipe(delay(600)); // Simular carga
    }

    deleteGroup(id: number): Observable<void> {
        this.mockGroups = this.mockGroups.filter(g => g.id !== id);
        return of(void 0).pipe(delay(500));
    }

    createGroup(group: Group): Observable<Group> {
        const newId = Math.max(...this.mockGroups.map(g => g.id), 0) + 1;
        const newGroup = { ...group, id: newId };
        this.mockGroups.push(newGroup);
        return of(newGroup).pipe(delay(500));
    }

    updateGroup(id: number, updatedGroup: Group): Observable<Group> {
        const index = this.mockGroups.findIndex(g => g.id === id);
        if (index > -1) {
            this.mockGroups[index] = { ...this.mockGroups[index], ...updatedGroup };
        }
        return of(this.mockGroups[index]).pipe(delay(500));
    }
}
