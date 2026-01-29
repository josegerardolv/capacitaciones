import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../../../core/models/course.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = `${environment.apiUrl}/api/courses`;

    constructor(private http: HttpClient) { }

    getCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(this.apiUrl);
    }

    createCourse(course: Omit<Course, 'id'>): Observable<Course> {
        return this.http.post<Course>(this.apiUrl, course);
    }

    updateCourse(id: number, updatedCourse: Course): Observable<Course> {
        return this.http.put<Course>(`${this.apiUrl}/${id}`, updatedCourse);
    }

    deleteCourse(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    }
}
