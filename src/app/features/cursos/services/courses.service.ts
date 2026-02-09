import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course } from '../../../core/models/course.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getCourses(): Observable<Course[]> {
        const params = new HttpParams().set('limit', '10').set('page', '1');
        return this.http.get<any>(`${this.apiUrl}/course`, { params }).pipe(
            map(response => {
                const courses = Array.isArray(response) ? response : (response.data || response.items || response.results || []);
                return courses.map((course: any) => this.mapBackendCourseToFrontend(course));
            })
        );
    }

    private mapBackendCourseToFrontend(backendCourse: any): Course {
        return {
            ...backendCourse,
            // Conservamos únicamente esta línea porque corrige el bug visual de "Sin Tipo"
            // al extraer el ID si el backend devuelve un objeto anidado.
            courseTypeId: backendCourse.courseTypeId || backendCourse.courseType?.id
        };
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        return this.http.post<Course>(`${this.apiUrl}/course`, course);
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        return this.http.patch<Course>(`${this.apiUrl}/course/${id}`, updatedCourse);
    }

    deleteCourse(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/course/${id}`);
    }
}
