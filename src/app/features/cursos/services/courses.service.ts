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
    private apiUrl = `${environment.apiUrl}/courses`; // Assuming an API endpoint

    // Listado de cursos para pruebas locales
    private courses: Course[] = [
        {
            id: 1,
            code: 'A05',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: 180
        },
        {
            id: 2,
            code: 'A06',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: 120
        },
        {
            id: 3,
            code: 'B13',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: 60
        },
        {
            id: 4,
            code: 'C01',
            description: 'Curso de manejo básico para principiantes',
            duration: 300
        },
        {
            id: 5,
            code: 'C02',
            description: 'Curso avanzado de seguridad vial',
            duration: 240
        }
    ];

    constructor(private http: HttpClient) { } // Inject HttpClient

    getCourses(): Observable<Course[]> {
        // In a real application, you would use this.http.get<Course[]>(this.apiUrl);
        return of([...this.courses]).pipe(delay(500));
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        // In a real application, you would use this.http.post<Course>(this.apiUrl, course);
        const newCourse = { ...course, id: this.generateNewId() };
        this.courses.push(newCourse);
        return of(newCourse).pipe(delay(500));
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        // In a real application, you would use this.http.put<Course>(`${this.apiUrl}/${id}`, updatedCourse);
        const index = this.courses.findIndex(c => c.id === id);
        if (index > -1) {
            this.courses[index] = { ...updatedCourse, id };
            return of(this.courses[index]).pipe(delay(500));
        }
        return of(null as any).pipe(delay(500)); // Simulate not found
    }

    deleteCourse(id: number): Observable<boolean> {
        // In a real application, you would use this.http.delete<boolean>(`${this.apiUrl}/${id}`);
        this.courses = this.courses.filter(c => c.id !== id);
        return of(true).pipe(delay(300));
    }

    private generateNewId(): number {
        const maxId = this.courses.length > 0 ? Math.max(...this.courses.map(c => c.id)) : 0;
        return maxId + 1;
    }
}

