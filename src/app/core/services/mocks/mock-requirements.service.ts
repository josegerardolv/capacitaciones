import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Requirement } from '../requirements.service';

@Injectable({
    providedIn: 'root'
})
export class MockRequirementsService {
    private requirements: Requirement[] = [
        { id: 1, fieldName: 'Nombre', fieldType: 'string' },
        { id: 2, fieldName: 'Primer Apellido', fieldType: 'string' },
        { id: 3, fieldName: 'Segundo Apellido', fieldType: 'string' },
        { id: 4, fieldName: 'Dirección', fieldType: 'string' },
        { id: 5, fieldName: 'NUC', fieldType: 'string' },
        { id: 6, fieldName: 'Sexo', fieldType: 'string' },
        { id: 7, fieldName: 'Correo Electrónico', fieldType: 'string' },
        { id: 8, fieldName: 'Teléfono', fieldType: 'string' },
        { id: 9, fieldName: 'Licencia', fieldType: 'string' },
        { id: 10, fieldName: 'CURP', fieldType: 'string' }
    ];

    constructor() { }

    getRequirements(): Observable<Requirement[]> {
        console.log('[MockRequirementsService] getRequirements called');
        return of([...this.requirements]).pipe(delay(400));
    }
}
