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

    private apiUrl = `${environment.apiUrl}/api`;

    constructor(private http: HttpClient) { }

    getGroups(): Observable<Group[]> {
        // Obtenemos todos los grupos del backend
        return this.http.get<Group[]>(`${this.apiUrl}/groups`);
    }

    getPersonsByGroupId(groupId: number): Observable<Person[]> {
        return this.http.get<Person[]>(`${this.apiUrl}/groups/${groupId}/persons`);
    }

    getRequestsByGroupId(groupId: number): Observable<Person[]> {
        // Filtramos por estatus 'Pendiente' usando query param si el backend lo soporta
        const params = new HttpParams().set('status', 'Pendiente');
        return this.http.get<Person[]>(`${this.apiUrl}/groups/${groupId}/persons`, { params });
    }

    registerPerson(groupId: number, data: Person): Observable<boolean> {
        // POST /api/groups/{id}/persons
        // Enviamos los datos de la persona. El backend debe manejar la creación.
        // Asumimos que data.person es lo que se envía o data directamente. 
        // En el mock se usaba 'const { id, ...personData } = data'.
        // Aquí enviamos el objeto limpio.

        // Si 'data' contiene ID (por edición/reuso), lo ideal es quitarlo para creación, 
        // pero el backend suele ignorarlo. 
        return this.http.post<any>(`${this.apiUrl}/groups/${groupId}/persons`, data)
            .pipe(map(() => true));
    }

    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/groups/${id}`);
    }

    searchPersonByLicense(license: string): Observable<Person | null> {
        // Buscamos persona por licencia
        const params = new HttpParams().set('q', license);
        return this.http.get<Person[]>(`${this.apiUrl}/persons`, { params }) // Endpoint asumido de búsqueda general
            .pipe(map(results => (results && results.length > 0) ? results[0] : null));
    }

    createGroup(group: Group): Observable<Group> {
        return this.http.post<Group>(`${this.apiUrl}/groups`, group);
    }

    updateGroup(id: number, updatedGroup: Group): Observable<Group> {
        return this.http.put<Group>(`${this.apiUrl}/groups/${id}`, updatedGroup);
    }

    getGroupById(id: number): Observable<Group | undefined> {
        return this.http.get<Group>(`${this.apiUrl}/groups/${id}`);
    }
}
