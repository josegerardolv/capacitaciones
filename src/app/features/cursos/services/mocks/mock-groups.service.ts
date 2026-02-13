import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Group } from '../../../../core/models/group.model';
import { Person } from '../../../../core/models/person.model';

@Injectable({
    providedIn: 'root'
})
export class MockGroupsService {

    // Datos simulados: En producción esto vendrá de la API
    private groups: Group[] = [
        {
            id: 1,
            name: 'G-CHOFERES-01',
            duration: '4 Horas',
            location: 'Aula Central - Semovi',
            groupStartDate: '2026-10-15',
            schedule: '09:00',
            limitStudents: 40,
            endInscriptionDate: '2026-10-15',
            requests: 3,
            status: 'Activo',
            courseTypeId: 1,
            course: 1, // Curso 1
            uuid: '550e8400-e29b-41d4-a716-446655440001'
        },
        {
            id: 2,
            name: 'G-EXPIRED-TEST',
            duration: '2 Horas',
            location: 'Oficina Virtual',
            groupStartDate: '2026-02-01',
            schedule: '10:30',
            limitStudents: 100,
            endInscriptionDate: '2026-02-10', // Vencido
            requests: 0,
            status: 'Activo',
            courseTypeId: 2,
            course: 2, // Curso 2
            uuid: 'exp-uuid-9999-vencido'
        },
        {
            id: 3,
            name: 'G-SIMPLE-01',
            duration: '1 Hora',
            location: 'Aula Virtual',
            groupStartDate: '2026-12-01',
            schedule: '09:00',
            limitStudents: 20,
            endInscriptionDate: '2026-12-01',
            requests: 5,
            status: 'Activo',
            courseTypeId: 3,
            course: 3, // Curso 3
            uuid: '550e8400-e29b-41d4-a716-446655440003'
        },
        {
            id: 4,
            name: 'G-NUEVO-01',
            duration: '4 Horas',
            location: 'Aula 2',
            groupStartDate: '2026-12-15',
            schedule: '10:00',
            limitStudents: 30,
            endInscriptionDate: '2026-12-15',
            requests: 0,
            status: 'Inactivo',
            courseTypeId: 1,
            course: 1, // Curso 1
            uuid: '' // Sin uuid para probar generación
        },
        {
            id: 5,
            name: 'G-TRANSPORTE-01',
            duration: '3 Horas',
            location: 'Aula 5',
            groupStartDate: '2026-05-20',
            schedule: '11:00',
            limitStudents: 25,
            endInscriptionDate: '2026-05-19',
            requests: 2,
            status: 'Activo',
            courseTypeId: 4,
            course: 4, // Curso 4
            uuid: '' // Sin uuid para probar generación
        },
        {
            id: 6,
            name: 'G-ESCOLAR-01',
            duration: '2 Horas',
            location: 'Escuela Primaria Central',
            groupStartDate: '2026-11-10',
            schedule: '10:00',
            limitStudents: 50,
            endInscriptionDate: '2026-11-10',
            requests: 0,
            status: 'Activo',
            courseTypeId: 2, // Educación Vial Escolar
            course: 2,
            uuid: 'vial-escolar-2026-valid'
        }
    ];

    // Simulación de conductores por grupo (Mock DB)
    private mockPersons: { [groupId: number]: Person[] } = {
        1: [
            // CASO 1: NO APROBADO (Todo bloqueado, estado inicial)
            { id: 1, name: 'Juan', paternal_lastName: 'Pérez', maternal_lastName: 'Gómez', license: 'A123456789', curp: 'AAAA000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Calle 1, Col. Centro', phone: '5512345678', email: 'juan.perez@example.com', nuc: 'NUC-84001A', requestedDocuments: [], paidDocumentIds: [] },

            // CASO 2: APROBADO PERO OBLIGATORIO PENDIENTE (Debe bloquear el opcional)
            // Constancia (Obligatoria) -> PENDIENTE (Esto bloquea cualquier opcional dependiente)
            // paidDocumentIds: [] significa que no ha pagado nada.
            { id: 2, name: 'María', paternal_lastName: 'López', maternal_lastName: 'Hernández', license: 'B987654321', curp: 'BBBB000000MDFXXX00', status: 'Aprobado', requestTarjeton: true, paymentStatus: 'Pendiente', coursePaymentStatus: 'Pagado', sex: 'Mujer', address: 'Av. Reforma 222', phone: '5587654321', email: 'maria.lopez@example.com', nuc: 'NUC-7762X2', requestedDocuments: ['doc_tarjeton'], paidDocumentIds: [] },

            // CASO 3: APROBADO Y TODO PAGADO (Todo desbloqueado)
            // Obligatorio (Constancia) y Opcional (Tarjetón) están en paidDocumentIds.
            { id: 3, name: 'Carlos', paternal_lastName: 'Ruiz', maternal_lastName: 'Díaz', license: 'C123123123', curp: 'CCCC000000HDFXXX00', status: 'Aprobado', requestTarjeton: true, paymentStatus: 'Pagado', coursePaymentStatus: 'Pagado', sex: 'Hombre', address: 'Calle Sur 8', phone: '5511223344', email: 'carlos.ruiz@example.com', nuc: 'NUC-3321Y5', requestedDocuments: ['doc_tarjeton'], paidDocumentIds: ['doc_constancia', 'doc_tarjeton'] },
        ],
        2: [
            { id: 4, name: 'Ana', paternal_lastName: 'Martínez', maternal_lastName: 'López', license: '', curp: 'MALA000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Av. Escuela 123', phone: '5599887766', email: 'ana.mtz@escuela.edu.mx' },
            { id: 5, name: 'Pedro', paternal_lastName: 'Sánchez', maternal_lastName: 'Ruiz', license: '', curp: 'SARP000000HDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Calle Tarea 456', phone: '5544332211', email: 'pedro.sanchez@escuela.edu.mx' },
        ],
        3: [
            { id: 6, name: 'Luisa', paternal_lastName: 'García', maternal_lastName: 'Torres', license: '', curp: 'GATL000000MDFXXX00', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Mujer', address: 'Calle Curso 789', phone: '5566778899', email: 'luisa.garcia@gmail.com' }
        ],
        6: [
            { id: 701, name: 'Mateo', paternal_lastName: 'Vázquez', maternal_lastName: 'Sosa', license: '', curp: 'VASM101010HDFXXX01', status: 'Pendiente', requestTarjeton: false, coursePaymentStatus: 'Pendiente', sex: 'Hombre', address: 'Calle Escolar 10, Col. Niños Héroes', phone: '5501010101', email: 'mateo.vazquez@correo.com' },
            { id: 702, name: 'Sofía', paternal_lastName: 'Reyes', maternal_lastName: 'Luna', license: '', curp: 'RELS202020MDFXXX02', status: 'Aprobado', requestTarjeton: false, coursePaymentStatus: 'Pagado', sex: 'Mujer', address: 'Av. Educación 50', phone: '5502020202', email: 'sofia.reyes@correo.com' }
        ]
    };

    constructor() { }

    getGroups(page: number = 1, limit: number = 10, search: string = '', courseId?: number): Observable<any> {
        // En el mock, podemos simplemente devolver el array,
        // Calculamos dinámicamente el número de solicitudes pendientes para cada grupo
        const groupsWithCounts = this.groups.map(group => {
            const persons = this.mockPersons[group.id] || [];
            const pendingRequests = persons.filter(d => d.status === 'Pendiente').length;
            return {
                ...group,
                requests: pendingRequests
            };
        });

        // Aplicar filtros de búsqueda y curso si existen
        let filtered = [...groupsWithCounts];
        if (courseId) {
            filtered = filtered.filter(g => g.course === Number(courseId));
        }

        if (search) {
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(search.toLowerCase()) ||
                g.location.toLowerCase().includes(search.toLowerCase())
            );
        }

        const totalItems = filtered.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = filtered.slice(start, end);

        return of({
            data: data,
            meta: {
                total: totalItems,
                page: page,
                limit: limit
            }
        }).pipe(delay(150));
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
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex > -1) {
            this.groups[groupIndex].requests = (this.groups[groupIndex].requests || 0) + 1;
        }

        return of(true).pipe(delay(500));
    }

    deleteGroup(id: number): Observable<void> {
        this.groups = this.groups.filter(g => g.id !== id);
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
                paternal_lastName: 'Pérez',
                maternal_lastName: 'Encontrado',
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
        const newId = Math.max(...this.groups.map(g => g.id), 0) + 1;
        const newGroup = { ...group, id: newId, requests: 0, status: 'Activo' as 'Activo' };
        this.groups.push(newGroup);
        return of(newGroup).pipe(delay(200));
    }

    updateGroup(id: number, updatedGroup: Group): Observable<Group> {
        const index = this.groups.findIndex(g => g.id === id);
        if (index > -1) {
            this.groups[index] = { ...this.groups[index], ...updatedGroup };
        }
        return of(this.groups[index]).pipe(delay(200));
    }

    generateGroupUuid(id: number): Observable<any> {
        const index = this.groups.findIndex(g => g.id === id);
        if (index > -1) {
            // Generar un UUID simulado
            const uuid = '550e8400-e' + Math.floor(Math.random() * 999) + 'b-41d4-a716-' + Date.now();
            this.groups[index].uuid = uuid;
            // Simulamos respuesta de éxito con el nuevo UUID
            return of({
                success: true,
                uuid: uuid,
                data: { uuid: uuid } // Para cubrir ambas posibilidades de respuesta
            }).pipe(delay(500));
        }
        return throwError(() => new Error('Grupo no encontrado')).pipe(delay(300));
    }

    getGroupById(id: number): Observable<Group | undefined> {
        const group = this.groups.find(g => g.id === id);
        return of(group).pipe(delay(100));
    }

    getGroupByUuid(uuid: string): Observable<Group> {
        const group = this.groups.find(g => g.uuid === uuid);
        return of(group!).pipe(delay(300));
    }
}
