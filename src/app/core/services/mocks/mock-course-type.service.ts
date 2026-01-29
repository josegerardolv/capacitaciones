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
                { id: 'doc_constancia', name: 'Constancia Básica', description: 'Template básico para constancias de participación', templateId: 1, cost: 473, requiresApproval: true, isMandatory: true }, // Obligatorio
                { id: 'doc_tarjeton', name: 'Tarjetón de Identidad', description: 'Documento de identificación para personas', templateId: 4, cost: 473, requiresApproval: true, isMandatory: true }, // Obligatorio
                { id: 'doc_manejo', name: 'Constancia de Curso de Manejo', description: 'Constancia específica para curso de manejo', templateId: 6, cost: 340, requiresApproval: true } // Opcional
            ]
        },
        {
            id: 2,
            name: 'Capacitación Escolar',
            description: 'Curso de educación vial para escuelas primarias',
            status: 'Activo',
            paymentType: 'De Paga',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registrationFields: this.cloneDefaultsWithOverrides({
                // Predeterminados: Name, Surnames, Curp, Phone, Email
                name: { visible: true, required: true },
                firstSurname: { visible: true, required: true },
                secondSurname: { visible: true, required: true },
                curp: { visible: true, required: true }, // CORREGIDO: Visible y Obligatorio
                sex: { visible: true, required: false }, // Visible pero Opcional

                // Ocultos
                license: { visible: false, required: false },
                nuc: { visible: false, required: false },
                address: { visible: false, required: false }
            }),
            availableDocuments: [
                { id: 'doc_diploma', name: 'Diploma de Participación', description: 'Diploma general de participación', templateId: 5, cost: 0, requiresApproval: false, isMandatory: true }, // Gratuito -> Obligatorio
                { id: 'doc_honor', name: 'Diploma de Honor', description: 'Diploma para alumnos destacados', templateId: 3, cost: 340, requiresApproval: true }
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
                // Configuración según captura de pantalla del usuario
                name: { visible: true, required: true },
                firstSurname: { visible: true, required: true },
                secondSurname: { visible: true, required: true }, // captura shows checked (Obligatorio)
                curp: { visible: true, required: true }, // captura shows checked (Obligatorio)
                phone: { visible: true, required: true }, // captura shows checked (Obligatorio)
                email: { visible: true, required: true }, //    captura shows checked (Obligatorio)

                // Deshabilitados en captura
                license: { visible: false, required: false },
                nuc: { visible: false, required: false },
                address: { visible: false, required: false },
                sex: { visible: false, required: false }
            }),
            availableDocuments: [
                { id: 'doc_diploma_simple', name: 'Diploma de Participación', description: 'Diploma general de participación', templateId: 5, cost: 0, requiresApproval: false, isMandatory: true } // Gratuito -> Obligatorio
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
