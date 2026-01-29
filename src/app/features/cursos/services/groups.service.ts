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

    getGroups(): Observable<Group[]> {
        // Obtenemos todos los grupos del backend
        return this.http.get<Group[]>(`${this.apiUrl}/group`);
    }

    getPersonsByGroupId(groupId: number): Observable<Person[]> {
        return this.http.get<Person[]>(`${this.apiUrl}/group/${groupId}/persons`);
    }

    getRequestsByGroupId(groupId: number): Observable<Person[]> {
        // Filtramos por estatus 'Pendiente' usando query param si el backend lo soporta
        const params = new HttpParams().set('status', 'Pendiente');
        return this.http.get<Person[]>(`${this.apiUrl}/group/${groupId}/persons`, { params });
    }

    registerPerson(groupId: number, data: Person): Observable<boolean> {
        // POST /api/group/{id}/persons
        // Enviamos los datos de la persona. El backend debe manejar la creación.
        // Asumimos que data.person es lo que se envía o data directamente. 
        // En el mock se usaba 'const { id, ...personData } = data'.
        // Aquí enviamos el objeto limpio.

        // Si 'data' contiene ID (por edición/reuso), lo ideal es quitarlo para creación, 
        // pero el backend suele ignorarlo. 
        return this.http.post<any>(`${this.apiUrl}/group/${groupId}/persons`, data)
            .pipe(map(() => true));
    }

    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/group/${id}`);
    }

    searchPersonByLicense(license: string): Observable<Person | null> {
        // Buscamos persona por licencia
        const params = new HttpParams().set('q', license);
        return this.http.get<Person[]>(`${this.apiUrl}/persons`, { params }) // Endpoint asumido de búsqueda general (check json.json for persons)
            .pipe(map(results => (results && results.length > 0) ? results[0] : null));
    }

    createGroup(group: Group): Observable<Group> {
        return this.http.post<Group>(`${this.apiUrl}/group`, group);
    }

    updateGroup(id: number, updatedGroup: Group): Observable<Group> {
        return this.http.put<Group>(`${this.apiUrl}/group/${id}`, updatedGroup);
    }

    getGroupById(id: number): Observable<Group | undefined> {
        return this.http.get<Group>(`${this.apiUrl}/group/${id}`);
    }
}
