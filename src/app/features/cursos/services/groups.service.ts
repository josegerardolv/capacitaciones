import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Group } from '../../../core/models/group.model';
import { Person } from '../../../core/models/person.model';

@Injectable({
    providedIn: 'root'
})
export class GroupsService {

    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getGroups(page: number = 1, limit: number = 10, search: string = '', courseId?: number): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) {
            params = params.set('name', search);
        }

        if (courseId) {
            params = params.set('course', courseId.toString());
        }

        // Según Swagger, /group/search es el endpoint para "Listar y buscar grupos"
        return this.http.get<any>(`${this.apiUrl}/group/search`, { params });
    }

    getPersonsByGroupId(groupId: number): Observable<Person[]> {
        return this.http.get<any>(`${this.apiUrl}/person?group=${groupId}`).pipe(
            map(response => response?.data || response)
        );
    }

    getEnrollmentsByGroupId(groupId: number, isAcepted: boolean = true): Observable<any[]> {
        const params = new HttpParams().set('isAcepted', isAcepted.toString());
        return this.http.get<any[]>(`${this.apiUrl}/enrollment/group/${groupId}`, { params });
    }

    getRequestsByGroupId(groupId: number): Observable<Person[]> {
        const params = new HttpParams().set('isAcepted', 'false');
        return this.http.get<any[]>(`${this.apiUrl}/enrollment/group/${groupId}`, { params }).pipe(
            map(response => response.map(item => {
                // Flatten responses into the root object for the table
                const dynamicFields: any = {};
                if (item.enrollmentResponse) {
                    item.enrollmentResponse.forEach((resp: any) => {
                        // Intentar mapear por el nombre del campo del requisito
                        const fieldName = resp.courseConfigField?.requirementFieldPerson?.fieldName;
                        if (fieldName) {
                            // Normalizar (ej: "Dirección" -> "address")
                            // Usaremos una lógica simple de mapeo aquí
                            const lower = fieldName.toLowerCase();
                            if (lower.includes('dirección')) dynamicFields['address'] = resp.value;
                            else if (lower.includes('sexo')) dynamicFields['sex'] = resp.value;
                            else if (lower.includes('telefono')) dynamicFields['phone'] = resp.value;
                            else if (lower.includes('licencia')) dynamicFields['license'] = resp.value;
                            else if (lower.includes('nuc')) dynamicFields['nuc'] = resp.value;
                            else if (lower.includes('correo') || lower.includes('email')) {
                                if (resp.value) dynamicFields['email'] = resp.value;
                            }
                            else dynamicFields[fieldName] = resp.value;
                        }
                    });
                }

                // Contador de documentos que este alumno en específico está solicitando
                const documentCount = (item.documentCoursesEnrollments || []).length;

                const fullName = [item.person?.name, item.person?.paternal_lastName, item.person?.maternal_lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim();

                return {
                    ...item.person,
                    name: fullName || 'Sin Nombre',
                    ...dynamicFields,
                    enrollmentId: item.enrollmentId,
                    dateReject: item.dateReject,
                    isAcepted: item.isAcepted,
                    documentCount: documentCount
                };
            }))
        );
    }

    // Payload structure based on BACKEND_INTEGRATION.md
    registerPerson(groupId: number, data: Person): Observable<boolean> {
        const payload = {
            groupId: groupId,
            person: data, // El objeto Person completo (incluyendo email, phone, etc.)
            requestedDocuments: data.requestedDocuments || [] // Extraer documentos a nivel raíz
        };

        return this.http.post<any>(`${this.apiUrl}/group/${groupId}/persons`, payload)
            .pipe(map(() => true));
    }

    /**
     * Crea una nueva inscripción (Enrollment) con el formato estructurado
     * para campos de tabla y campos dinámicos.
     */
    createEnrollment(payload: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/enrollment`, payload);
    }

    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/group/${id}`);
    }

    searchPersonByLicense(license: string, includeTypeCFilter: boolean = false): Observable<Person | null> {
        let params = new HttpParams().set('numero', license);

        // Agregar filtro de tipo si es requerido (ej. público)
        if (includeTypeCFilter) {
            params = params.append('tipo', 'TIPO_C');
        }

        // Consulta GraphQL real al servicio de licencias a través de nuestro proxy
        return this.http.get<any>(`${this.apiUrl}/api-licenses/license`, { params }).pipe(
            map(response => {
                // El server envía todo envuelto en 'data' por GraphQL
                const data = response?.data?.licenseByNumber;
                if (!data || !data.contribuyente) return null;

                const contribuyente = data.contribuyente;
                const person: Person = {
                    id: 0, // Nueva persona en el contexto local (se ignorará o creará al registrar)
                    name: contribuyente.nombre || '',
                    paternal_lastName: contribuyente.primer_apellido || '',
                    maternal_lastName: contribuyente.segundo_apellido || '',
                    license: license,
                    curp: contribuyente.curp || '',
                    status: 'Pendiente',
                    requestTarjeton: false
                };

                // Tratar de mapear la dirección si viene en el objeto
                if (contribuyente.ubicacion) {
                    const u = contribuyente.ubicacion;
                    let fullAddress = `${u.calle || ''} ${u.numero_exterior || ''}`;
                    if (u.numero_interior) fullAddress += ` Int. ${u.numero_interior}`;
                    if (u.colonia) fullAddress += `, Col. ${u.colonia}`;
                    person.address = fullAddress.trim();
                }

                return person;
            })
        );
    }

    createGroup(group: any): Observable<Group> {
        // Estructura según Swagger: name, location, schedule, limitStudents, groupStartDate, endInscriptionDate, course
        return this.http.post<Group>(`${this.apiUrl}/group`, group);
    }

    updateGroup(id: number, updatedGroup: any): Observable<Group> {
        // Estructura PATCH /group/{id} según Swagger
        return this.http.patch<Group>(`${this.apiUrl}/group/${id}`, updatedGroup);
    }

    /**
     * Genera un UUID para un grupo existente
     * Según Swagger: PATCH /group/uuid/{id}
     */
    generateGroupUuid(id: number): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/group/uuid/${id}`, {});
    }

    getGroupById(id: number): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/group/${id}`);
    }
    // /group/registro/{uuid} PARA REGISTRO PUBLICO 
    getGroupByUuid(uuid: string): Observable<Group> {
        return this.http.get<any>(`${this.apiUrl}/group/registro/${uuid}`).pipe(
            map(response => response?.data || response)
        );
    }

    acceptEnrollment(enrollmentId: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/enrollment/${enrollmentId}`, { isAcepted: true });
    }

    rejectEnrollment(enrollmentId: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/enrollment/${enrollmentId}`, { dateReject: new Date().toISOString() });
    }

    /**
     * Actualiza el estatus del alumno en el curso (CURSANDO, REPROBADO, APROBADO)
     */
    updateEnrollmentStatus(enrollmentId: number, isApproved: 'CURSANDO' | 'REPROBADO' | 'APROBADO'): Observable<any> {
        return this.http.patch(`${this.apiUrl}/enrollment/${enrollmentId}`, { isApproved: isApproved });
    }

    deleteEnrollment(enrollmentId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/enrollment/${enrollmentId}`);
    }
}
