import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course } from '../../../core/models/course.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getCourses(): Observable<Course[]> {
        return this.http.get<any[]>(`${this.apiUrl}/course`).pipe(
            map(courses => courses.map(course => this.mapBackendCourseToFrontend(course)))
        );
    }

    private mapBackendCourseToFrontend(backendCourse: any): Course {
        return {
            ...backendCourse,
            // Backend sends 'duration' as number (hours).
            // Frontend model expects number.
            // Direct mapping is fine, but this method ensures extensibility.
            duration: backendCourse.duration
        };
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        return this.http.post<Course>(`${this.apiUrl}/course`, course);
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        return this.http.put<Course>(`${this.apiUrl}/course/${id}`, updatedCourse);
    }

    deleteCourse(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/course/${id}`);
    }
}
