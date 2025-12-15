import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Course } from '../../../core/models/course.model';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {

    private courses: Course[] = [
        {
            id: 1,
            code: 'A05',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: '3 horas'
        },
        {
            id: 2,
            code: 'A06',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: '2 horas'
        },
        {
            id: 3,
            code: 'B13',
            description: 'Lorem Ipsum is simply dummy text of the',
            duration: '1 hora'
        },
        {
            id: 4,
            code: 'C01',
            description: 'Curso de manejo básico para principiantes',
            duration: '5 horas'
        },
        {
            id: 5,
            code: 'C02',
            description: 'Curso avanzado de seguridad vial',
            duration: '4 horas'
        }
    ];

    constructor() { }

    getCourses(): Observable<Course[]> {
        return of([...this.courses]).pipe(delay(500));
    }

    deleteCourse(id: number): Observable<boolean> {
        this.courses = this.courses.filter(c => c.id !== id);
        return of(true).pipe(delay(300));
    }
}
