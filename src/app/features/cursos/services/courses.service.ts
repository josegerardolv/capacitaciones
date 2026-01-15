import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Course } from '../../../core/models/course.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = `${environment.apiUrl}/courses`; // Asumiendo un endpoint de API

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

    constructor(private http: HttpClient) { } // Inyectar HttpClient

    getCourses(): Observable<Course[]> {
        // En una aplicación real, se usaría this.http.get<Course[]>(this.apiUrl);
        return of([...this.courses]).pipe(delay(500));
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        // En una aplicación real, se usaría this.http.post<Course>(this.apiUrl, course);
        const newCourse = { ...course, id: this.generateNewId() };
        this.courses.push(newCourse);
        return of(newCourse).pipe(delay(500));
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        // En una aplicación real, se usaría this.http.put<Course>(`${this.apiUrl}/${id}`, updatedCourse);
        const index = this.courses.findIndex(c => c.id === id);
        if (index > -1) {
            this.courses[index] = { ...updatedCourse, id };
            return of(this.courses[index]).pipe(delay(500));
        }
        return of(null as any).pipe(delay(500)); // Simular no encontrado
    }

    deleteCourse(id: number): Observable<boolean> {
        // En una aplicación real, se usaría this.http.delete<boolean>(`${this.apiUrl}/${id}`);
        this.courses = this.courses.filter(c => c.id !== id);
        return of(true).pipe(delay(300));
    }

    private generateNewId(): number {
        const maxId = this.courses.length > 0 ? Math.max(...this.courses.map(c => c.id)) : 0;
        return maxId + 1;
    }
}

