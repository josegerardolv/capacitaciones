import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CourseTypeConfig, RegistrationFieldConfig, DEFAULT_REGISTRATION_FIELDS } from '../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class CourseTypeService {

    // Datos de prueba iniciales
    private courseTypes: CourseTypeConfig[] = [
        {
            id: 1,
            name: 'Licencia Transporte Público (Tipo A)',
            description: 'Curso obligatorio para choferes de transporte público',
            status: 'Activo',
            paymentType: 'Pagado',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                // Requiere todo: Licencia, NUC, CURP, Dirección...
                license: { visible: true, required: true },
                nuc: { visible: true, required: true },
                curp: { visible: true, required: true },
                address: { visible: true, required: true },
                sex: { visible: true, required: true }
            }),
            availableDocuments: [
                { id: 'doc_constancia', name: 'Constancia de Capacitación', templateId: 1, cost: 0, requiresApproval: true },
                { id: 'doc_tarjeton', name: 'Tarjetón de Identidad', templateId: 4, cost: 253, requiresApproval: true },
                { id: 'doc_manejo', name: 'Constancia de Curso de Manejo', templateId: 6, cost: 150, requiresApproval: true }
            ]
        },
        {
            id: 2,
            name: 'Capacitación Escolar',
            description: 'Curso de educación vial para escuelas primarias',
            status: 'Activo',
            paymentType: 'Gratuito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                // Solo datos básicos. Ocultamos cosas de choferes.
                license: { visible: false, required: false },
                nuc: { visible: false, required: false },
                curp: { visible: false, required: false }, // Niños quizas no tienen a mano
                address: { visible: false, required: false },
                sex: { visible: true, required: false }
            }),
            availableDocuments: [
                { id: 'doc_diploma', name: 'Diploma de Participación', templateId: 5, cost: 0, requiresApproval: false },
                { id: 'doc_honor', name: 'Diploma de Honor', templateId: 3, cost: 0, requiresApproval: true }
            ]
        },
        // MOCK: Curso Simple solicitado por usuario
        {
            id: 3,
            name: 'Curso Simple',
            description: 'Curso básico solo para validar vista pública',
            status: 'Activo',
            paymentType: 'Gratuito',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                // "Solo nombre y apellido"
                name: { visible: true, required: true },
                firstSurname: { visible: true, required: true },
                secondSurname: { visible: true, required: false },
                // Ocultar TODO lo demás
                curp: { visible: false, required: false },
                license: { visible: false, required: false },
                nuc: { visible: false, required: false },
                address: { visible: false, required: false },
                phone: { visible: false, required: false },
                email: { visible: false, required: false },
                sex: { visible: false, required: false }
            }),
            availableDocuments: [
                // "Solo certificado de aprobación" (templateId 2 es el real para 'Certificado de Aprobación' en TemplateService)
                { id: 'doc_constancia', name: 'Certificado de Aprobación', templateId: 2, cost: 0, requiresApproval: false }
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
