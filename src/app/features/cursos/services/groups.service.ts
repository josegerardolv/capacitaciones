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
            name: 'G-CHOFERES-01',
            duration: '4 Horas',
            location: 'Aula Central - Semovi',
            dateTime: '15/10/2026, 09:00',
            quantity: 40,
            autoRegisterLimit: 5,
            url: 'http://localhost:4200/public/register/1',
            requests: 3,
            status: 'Activo',
            courseType: 'LICENCIA',
            courseTypeId: 1 // Link to 'Licencia Transporte Público'
        },
        {
            id: 2,
            name: 'G-ESCOLAR-B',
            duration: '2 Horas',
            location: 'Escuela Primaria Benito Juárez',
            dateTime: '20/10/2026, 10:30',
            quantity: 100,
            autoRegisterLimit: 10,
            url: 'http://localhost:4200/public/register/2',
            requests: 3,
            status: 'Activo',
            courseType: 'GENERICO', // Legacy
            courseTypeId: 2 // Enlace a 'Capacitación Escolar'
        },
        // MOCK: Grupo Simple solicitado por usuario
        {
            id: 3,
            name: 'G-SIMPLE-01',
            duration: '1 Hora',
            location: 'Aula Virtual',
            dateTime: '01/12/2026, 09:00',
            quantity: 20,
            autoRegisterLimit: 20,
            url: 'http://localhost:4200/public/register/3',
            requests: 5,
            status: 'Activo',
            courseType: 'GENERICO',
            courseTypeId: 3 // Enlace estático al 'Curso Simple'
        },
        // MOCK: Grupo sin enlace para probar generación
        {
            id: 4,
            name: 'G-NUEVO-01',
            duration: '4 Horas',
            location: 'Aula 2',
            dateTime: '15/12/2026, 10:00',
            quantity: 30,
            autoRegisterLimit: 5,
            url: '', // sin link
            requests: 0,
            status: 'Inactivo',
            courseType: 'LICENCIA',
            courseTypeId: 1
        }
    ];

    // Simulación de conductores por grupo (Mock DB)
    private mockDrivers: { [groupId: number]: Driver[] } = {
        1: [
            { id: 1, name: 'Juan Pérez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle 1, Col. Centro' },
            { id: 2, name: 'María López', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', requestTarjeton: true, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Reforma 222' },
            { id: 3, name: 'Carlos Ruiz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', requestTarjeton: true, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle Sur 8' },
        ],
        2: [
            { id: 4, name: 'Ana Estudiante', license: '', curp: 'ESTU000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Escuela 123' },
            { id: 5, name: 'Pedro Alumno', license: '', curp: 'ALUM000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Calle Tarea 456' }
        ],
        3: [
            { id: 6, name: 'Luisa Interesada', license: '', curp: 'INTE000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Calle Curso 789' }
        ]
    };

    // Simulación de solicitudes por grupo (Mock DB)
    // Se ha eliminado mockRequests, se usa mockDrivers con status 'Pendiente'

    constructor() { }

    getGroups(): Observable<Group[]> {
        // Calculamos dinámicamente el número de solicitudes pendientes para cada grupo
        const groupsWithCounts = this.mockGroups.map(group => {
            const drivers = this.mockDrivers[group.id] || [];
            const pendingRequests = drivers.filter(d => d.status === 'Pendiente').length;
            return {
                ...group,
                requests: pendingRequests
            };
        });
        return of(groupsWithCounts).pipe(delay(150));
    }

    getDriversByGroupId(groupId: number): Observable<Driver[]> {
        const drivers = this.mockDrivers[groupId] || [];
        return of([...drivers]).pipe(delay(200)); // Simular carga de datos 
    }

    getRequestsByGroupId(groupId: number): Observable<Driver[]> {
        // En lugar de una lista separada, filtramos los conductores con status 'Pendiente'
        const drivers = this.mockDrivers[groupId] || [];
        const requests = drivers.filter(d => d.status === 'Pendiente');
        return of(requests).pipe(delay(200));
    }

    registerRequest(groupId: number, data: any): Observable<boolean> {
        if (!this.mockDrivers[groupId]) {
            this.mockDrivers[groupId] = [];
        }

        const newId = (this.mockDrivers[groupId].length + 1) * 1000 + Math.floor(Math.random() * 999);

        // Agregamos a los conductores con estado 'Pendiente'
        this.mockDrivers[groupId].push({
            id: newId,
            ...data,
            status: 'Pendiente',
            paymentStatus: 'Pendiente',
            coursePaymentStatus: 'Pendiente'
        });

        // Actualizar contador de solicitudes en el grupo (requests = total - approved?)
        // Dejaremos que 'requests' sea el contador de pendientes
        const groupIndex = this.mockGroups.findIndex(g => g.id === groupId);
        if (groupIndex > -1) {
            this.mockGroups[groupIndex].requests = (this.mockGroups[groupIndex].requests || 0) + 1;
        }

        return of(true).pipe(delay(500));
    }

    deleteGroup(id: number): Observable<void> {
        this.mockGroups = this.mockGroups.filter(g => g.id !== id);
        return of(void 0).pipe(delay(200));
    }

    // Nueva función para búsqueda simulada de conductores
    searchDriverByLicense(license: string): Observable<Driver | null> {
        // Simulamos que si la licencia empieza por "EXIST", la encuentra
        // Si no, retorna null
        if (license.toUpperCase().startsWith('EXIST')) {
            const mockDriver: Driver = {
                id: 999,
                name: 'Juan',
                firstSurname: 'Pérez',
                secondSurname: 'Encontrado',
                license: license.toUpperCase(),
                curp: 'PEHJ901212HDFR05',
                // rfc: 'PEHJ901212', // Removed as it is not in Driver interface
                sex: 'H', // Added for consistency
                address: 'Calle Conocida 123, Centro', // Added for consistency
                status: 'Pendiente',
                paymentStatus: 'Pendiente',
                coursePaymentStatus: 'Pendiente',
                requestTarjeton: false
            };
            return of(mockDriver).pipe(delay(800));
        }
        return of(null).pipe(delay(800));
    }

    createGroup(group: Group): Observable<Group> {
        const newId = Math.max(...this.mockGroups.map(g => g.id), 0) + 1;
        const newGroup = { ...group, id: newId };
        this.mockGroups.push(newGroup);
        return of(newGroup).pipe(delay(200));
    }

    updateGroup(id: number, updatedGroup: Group): Observable<Group> {
        const index = this.mockGroups.findIndex(g => g.id === id);
        if (index > -1) {
            this.mockGroups[index] = { ...this.mockGroups[index], ...updatedGroup };
        }
        return of(this.mockGroups[index]).pipe(delay(200));
    }

    getGroupById(id: number): Observable<Group | undefined> {
        const group = this.mockGroups.find(g => g.id === id);
        return of(group).pipe(delay(100));
    }
}
