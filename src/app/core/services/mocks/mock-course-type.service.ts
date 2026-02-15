import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CourseTypeConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class MockCourseTypeService {

    // Datos de prueba iniciales
    private courseTypes: CourseTypeConfig[] = [
        {
            id: 1,
            name: 'Licencia Transporte Público (Tipo A)',
            description: 'Curso obligatorio para choferes de transporte público',
            status: 'Activo',
            paymentType: 'De Paga',
            type: 'Licencia',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: [],
            availableDocuments: [
                { id: 'doc_constancia', name: 'Constancia Básica', description: 'Template básico contra participación', templateId: 1, cost: 473, requiresApproval: true, isMandatory: true },
                { id: 'doc_tarjeton', name: 'Tarjetón de Identidad', description: 'Documento de identificación', templateId: 4, cost: 473, requiresApproval: true, isMandatory: true }
            ],
            // Dinámicos corregidos: Dirección(O), NUC(O), Sexo(L), Licencia(O). (O=Obligatorio, L=Libre/Opcional)
            courseConfigField: [
                { requirementFieldPerson: { id: 4, fieldName: 'Dirección' }, required: true },  // Dirección
                { requirementFieldPerson: { id: 5, fieldName: 'NUC' }, required: true },        // NUC
                { requirementFieldPerson: { id: 6, fieldName: 'Sexo' }, required: false },       // Sexo
                { requirementFieldPerson: { id: 9, fieldName: 'licencia' }, required: true }     // Licencia
            ]
        } as any,
        {
            id: 2,
            name: 'Capacitacion Escolar',
            description: 'Curso de educacion vial para escuelas primarias',
            status: 'Activo',
            paymentType: 'De Paga',
            type: 'Curso',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: [],
            availableDocuments: [
                { id: 'doc_diploma', name: 'Diploma de Participación', description: 'Diploma general', templateId: 5, cost: 0, requiresApproval: false, isMandatory: true }
            ],
            courseConfigField: [
                { requirementFieldPerson: { id: 6, fieldName: 'Sexo' }, required: false }
            ]
        } as any,
        {
            id: 3,
            name: 'Curso Simple',
            description: 'Curso basico solo para validar vista publica',
            status: 'Activo',
            paymentType: 'Gratuito',
            type: 'Taller',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: [],
            availableDocuments: [
                { id: 'doc_diploma_simple', name: 'Diploma de Participación', description: 'Diploma general', templateId: 5, cost: 0, requiresApproval: false, isMandatory: true }
            ],
            courseConfigField: [
                { requirementFieldPerson: { id: 8, fieldName: 'telefono' }, required: true }
            ]
        } as any
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
        throw new Error('Tipo de curso no encontrado');
    }

    deleteCourseType(id: number): Observable<void> {
        this.courseTypes = this.courseTypes.filter(t => t.id !== id);
        return of(void 0).pipe(delay(500));
    }

    // Método auxiliar para clonar y modificar campos por defecto fácilmente
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
