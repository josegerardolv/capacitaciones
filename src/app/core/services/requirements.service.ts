import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Requirement {
    id: number;
    fieldName: string; // "Dirección", "Sexo", etc.
    fieldType: string; // "string", "number", etc.
}

@Injectable({
    providedIn: 'root'
})
export class RequirementsService {
    private apiUrl = `${environment.apiUrl}/requirement-fieldsperson`;

    constructor(private http: HttpClient) { }

    getRequirements(): Observable<Requirement[]> {
        return this.http.get<Requirement[]>(this.apiUrl);
    }
}
