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

                return {
                    ...item.person,
                    ...dynamicFields,
                    enrollmentId: item.id
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

    searchPersonByLicense(license: string): Observable<Person | null> {
        const params = new HttpParams().set('license', license);
        // El backend ha habilitado el acceso público a este endpoint (/persons/lookup) para consultas de ciudadanos
        return this.http.get<Person[]>(`${this.apiUrl}/persons/lookup`, { params })
            .pipe(map(results => (results && results.length > 0) ? results[0] : null));
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
        return this.http.patch(`${this.apiUrl}/enrollment/${enrollmentId}`, { isAcepted: false });
    }
}
