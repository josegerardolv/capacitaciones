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
        return this.http.get<Person[]>(`${this.apiUrl}/group/${groupId}/persons`);
    }

    getRequestsByGroupId(groupId: number): Observable<Person[]> {
        const params = new HttpParams().set('status', 'Pendiente');
        return this.http.get<Person[]>(`${this.apiUrl}/group/${groupId}/persons`, { params });
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

    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/group/${id}`);
    }

    searchPersonByLicense(license: string): Observable<Person | null> {
        const params = new HttpParams().set('q', license);
        return this.http.get<Person[]>(`${this.apiUrl}/persons`, { params })
            .pipe(map(results => (results && results.length > 0) ? results[0] : null));
    }

    createGroup(group: any): Observable<Group> {
        return this.http.post<Group>(`${this.apiUrl}/group`, group);
    }

    updateGroup(id: number, updatedGroup: any): Observable<Group> {
        return this.http.patch<Group>(`${this.apiUrl}/group/${id}`, updatedGroup);
    }

    getGroupById(id: number): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/group/${id}`);
    }

    getGroupByUuid(uuid: string): Observable<Group> {
        return this.http.get<Group>(`${this.apiUrl}/group/uuid/${uuid}`);
    }
}
