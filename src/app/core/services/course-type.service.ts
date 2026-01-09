import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CourseTypeConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class CourseTypeService {

    // Mock Data inicial
    private courseTypes: CourseTypeConfig[] = [
        {
            id: 1,
            name: 'Licencia Tipo A',
            description: 'Curso para obtención de licencia de transporte público',
            status: 'Activo',
            paymentType: 'Pagado',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                license: { visible: true, required: true },
                nuc: { visible: true, required: false }
            }),
            availableDocuments: [
                { id: 'doc_1', name: 'Constancia de Capacitación', templateId: 1, cost: 0, requiresApproval: true },
                { id: 'doc_2', name: 'Tarjetón', templateId: undefined, cost: 250, requiresApproval: true } // El usuario asignará template después
            ]
        },
        {
            id: 2,
            name: 'Capacitación Escolar',
            description: 'Cursos de educación vial para escuelas',
            status: 'Activo',
            paymentType: 'Gratuito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                license: { visible: false, required: false },
                nuc: { visible: false, required: false },
                curp: { visible: false, required: false }, // Quizás no requieren CURP niños
            }),
            availableDocuments: [
                { id: 'doc_3', name: 'Diploma de Participación', templateId: undefined, cost: 0, requiresApproval: false }
            ]
        },
        {
            id: 3,
            name: 'Sensibilización de Operadores',
            description: 'Curso obligatorio para operadores de transporte público',
            status: 'Activo',
            paymentType: 'Pagado',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                license: { visible: true, required: true },
                curp: { visible: true, required: true },
                nuc: { visible: true, required: false }
            }),
            availableDocuments: [
                { id: 'doc_4', name: 'Constancia de Sensibilización', templateId: 1, cost: 150, requiresApproval: true }
            ]
        }
    ];

    constructor() { }

    getCourseTypes(): Observable<CourseTypeConfig[]> {
        return of([...this.courseTypes]).pipe(delay(500));
    }

    getCourseTypeById(id: number): Observable<CourseTypeConfig | undefined> {
        const type = this.courseTypes.find(t => t.id === id);
        return of(type ? { ...type } : undefined).pipe(delay(300));
    }

    createCourseType(config: Omit<CourseTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Observable<CourseTypeConfig> {
        const newId = Math.max(...this.courseTypes.map(t => t.id), 0) + 1;
        const newType: CourseTypeConfig = {
            ...config,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.courseTypes.push(newType);
        return of(newType).pipe(delay(600));
    }

    updateCourseType(id: number, config: Partial<CourseTypeConfig>): Observable<CourseTypeConfig> {
        const index = this.courseTypes.findIndex(t => t.id === id);
        if (index !== -1) {
            this.courseTypes[index] = {
                ...this.courseTypes[index],
                ...config,
                updatedAt: new Date().toISOString()
            };
            return of(this.courseTypes[index]).pipe(delay(600));
        }
        throw new Error('Course Type not found');
    }

    deleteCourseType(id: number): Observable<void> {
        this.courseTypes = this.courseTypes.filter(t => t.id !== id);
        return of(void 0).pipe(delay(500));
    }

    // Helper para clonar y modificar campos por defecto fácilmente
    private cloneDefaultsWithOverrides(overrides: { [fieldName: string]: { visible?: boolean; required?: boolean } }): RegistrationFieldConfig[] {
        return DEFAULT_REGISTRATION_FIELDS.map(f => {
            const override = overrides[f.fieldName];
            if (override) {
                return { ...f, ...override };
            }
            return { ...f };
        });
    }
}
