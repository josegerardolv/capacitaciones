import { Injectable } from '@angular/core';
import { Observable, of, delay, map, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Group } from '../../../core/models/group.model';
import { Person } from '../../../core/models/person.model';

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
            linkExpiration: '2026-10-15', // Fecha expiración
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
            linkExpiration: '2026-10-20',
            url: 'http://localhost:4200/public/register/2',
            requests: 3,
            status: 'Activo',
            courseType: 'CAPACITACION_ESCOLAR', // Updated
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
            linkExpiration: '2026-12-01',
            url: 'http://localhost:4200/public/register/3',
            requests: 5,
            status: 'Activo',
            courseType: 'CURSO_SIMPLE', // Updated
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
            linkExpiration: '2026-12-15',
            url: '', // sin link
            requests: 0,
            status: 'Inactivo',
            courseType: 'LICENCIA',
            courseTypeId: 1
        }
    ];

    // Simulación de conductores por grupo (Mock DB)
    private mockPersons: { [groupId: number]: Person[] } = {
        1: [
            { id: 1, name: 'Juan', firstSurname: 'Pérez', secondSurname: 'Gómez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle 1, Col. Centro', phone: '5512345678', email: 'juan.perez@example.com' },
            { id: 2, name: 'María', firstSurname: 'López', secondSurname: 'Hernández', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Pendiente', requestTarjeton: true, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Reforma 222', phone: '5587654321', email: 'maria.lopez@example.com' },
            { id: 3, name: 'Carlos', firstSurname: 'Ruiz', secondSurname: 'Díaz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', requestTarjeton: true, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle Sur 8', phone: '5511223344', email: 'carlos.ruiz@example.com' },
        ],
        2: [
            { id: 4, name: 'Ana', firstSurname: 'Martínez', secondSurname: 'López', license: '', curp: 'MALA000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Escuela 123', phone: '5599887766', email: 'ana.mtz@escuela.edu.mx' },
            { id: 5, name: 'Pedro', firstSurname: 'Sánchez', secondSurname: 'Ruiz', license: '', curp: 'SARP000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Calle Tarea 456', phone: '5544332211', email: 'pedro.sanchez@escuela.edu.mx' },
        ],
        3: [
            { id: 6, name: 'Luisa', firstSurname: 'García', secondSurname: 'Torres', license: '', curp: 'GATL000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Calle Curso 789', phone: '5566778899', email: 'luisa.garcia@gmail.com' },
            { id: 7, name: 'Jorge', firstSurname: 'Ramírez', secondSurname: 'Flores', license: '', curp: 'RAFJ000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Av. Educación 101', phone: '5500112233', email: 'jorge.ramirez@outlook.com' }
        ]
    };

    constructor(private http: HttpClient) { }

    getGroups(): Observable<Group[]> {
        // Calculamos dinámicamente el número de solicitudes pendientes para cada grupo
        const groupsWithCounts = this.mockGroups.map(group => {
            const persons = this.mockPersons[group.id] || [];
            const pendingRequests = persons.filter(d => d.status === 'Pendiente').length;
            return {
                ...group,
                requests: pendingRequests
            };
        });
        return of(groupsWithCounts).pipe(delay(150));
    }

    getPersonsByGroupId(groupId: number): Observable<Person[]> {
        // MOCK: Consulta local mientras arreglan CORS
        const persons = this.mockPersons[groupId] || [];
        return of(persons).pipe(delay(200));
    }

    getRequestsByGroupId(groupId: number): Observable<Person[]> {
        // En lugar de una lista separada, filtramos los conductores con status 'Pendiente'
        const persons = this.mockPersons[groupId] || [];
        const requests = persons.filter(d => d.status === 'Pendiente');
        return of(requests).pipe(delay(200));
    }

    registerPerson(groupId: number, data: Person): Observable<boolean> {
        // MOCK: Guardado local temporal hasta que el Backend arregle CORS
        if (!this.mockPersons[groupId]) {
            this.mockPersons[groupId] = [];
        }

        const newId = (this.mockPersons[groupId].length + 1) * 1000 + Math.floor(Math.random() * 999);

        // Agregamos a los conductores con estado 'Pendiente'
        // Usamos destructuring para evitar conflicto de ID y conservamos los datos del modelo Person
        const { id, ...personData } = data;

        this.mockPersons[groupId].push({
            ...personData,
            id: newId,
            status: 'Pendiente', // Default status
            paymentStatus: 'Pendiente',
            coursePaymentStatus: 'Pendiente'
        });

        // Actualizar contador de solicitudes en el grupo localmente
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
    searchPersonByLicense(license: string): Observable<Person | null> {
        // Simulamos que si la licencia empieza por "EXIST", la encuentra
        // Si no, retorna null
        if (license.toUpperCase().startsWith('EXIST')) {
            const mockPerson: Person = {
                id: 999,
                name: 'Juan',
                firstSurname: 'Pérez',
                secondSurname: 'Encontrado',
                license: license.toUpperCase(),
                curp: 'PEHJ901212HDFR05',
                sex: 'H',
                address: 'Calle Conocida 123, Centro',
                status: 'Pendiente',
                paymentStatus: 'Pendiente',
                coursePaymentStatus: 'Pendiente',
                requestTarjeton: false
            };
            return of(mockPerson).pipe(delay(800));
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
