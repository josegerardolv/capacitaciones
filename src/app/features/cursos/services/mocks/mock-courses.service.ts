import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Course } from '../../../../core/models/course.model';

@Injectable({
    providedIn: 'root'
})
export class MockCoursesService {

    // Listado de cursos para pruebas locales
    private courses: Course[] = [
        {
            id: 1,
            name: 'Curso para Licencia Tipo A',
            description: 'Curso oficial para obtener la Licencia de Transporte Público (Tipo A).',
            duration: 240,
            courseTypeId: 1 // Vinculado a 'Licencia Transporte Público'
        },
        {
            id: 2,
            name: 'Curso de Educación Vial Escolar',
            description: 'Capacitación para escuelas primaria.',
            duration: 120,
            courseTypeId: 2 // Vinculado a 'Capacitación Escolar'
        },
        // MOCK: Curso Simple solicitado (ID 3)
        {
            id: 3,
            name: 'Curso Básico General',
            description: 'Curso introductorio de prueba.',
            duration: 60,
            courseTypeId: 3 // Vinculado a 'Curso Simple'
        }
    ];

    constructor() { }

    getCourses(page: number = 1, limit: number = 10, search: string = '', courseTypeId?: number): Observable<any> {
        // En el mock, podemos simplemente devolver el array, 
        // pero el componente espera un objeto con 'data' o el array directo.
        // Mantenemos el array directo ya que el componente lo soporta.
        return of([...this.courses]).pipe(delay(500));
    }

    getCourseById(id: number): Observable<Course | undefined> {
        const course = this.courses.find(c => c.id === id);
        return of(course ? { ...course } : undefined).pipe(delay(300));
    }

    mapBackendCourseToFrontend(backendCourse: any): Course {
        // En el mock los datos ya están en formato frontend,
        // pero incluimos la lógica de normalización por si acaso.
        return {
            ...backendCourse,
            courseTypeId: backendCourse.courseTypeId || backendCourse.courseType?.id
        };
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        const newCourse = { ...course, id: this.generateNewId() } as Course;
        this.courses.push(newCourse);
        return of(newCourse).pipe(delay(500));
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        const index = this.courses.findIndex(c => c.id === id);
        if (index > -1) {
            this.courses[index] = { ...updatedCourse, id };
            return of(this.courses[index]).pipe(delay(500));
        }
        return of(null as any).pipe(delay(500)); // Simular no encontrado
    }

    deleteCourse(id: number): Observable<boolean> {
        this.courses = this.courses.filter(c => c.id !== id);
        return of(true).pipe(delay(300));
    }

    private generateNewId(): number {
        const maxId = this.courses.length > 0 ? Math.max(...this.courses.map(c => c.id)) : 0;
        return maxId + 1;
    }
}
