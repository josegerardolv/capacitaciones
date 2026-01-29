import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CourseTypeConfig } from '../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class CourseTypeService {

    private apiUrl = `${environment.apiUrl}/api/course-types`;

    constructor(private http: HttpClient) { }

    getCourseTypes(): Observable<CourseTypeConfig[]> {
        return this.http.get<CourseTypeConfig[]>(this.apiUrl);
    }

    getCourseTypeById(id: number): Observable<CourseTypeConfig | undefined> {
        return this.http.get<CourseTypeConfig>(`${this.apiUrl}/${id}`);
    }

    createCourseType(config: Omit<CourseTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Observable<CourseTypeConfig> {
        return this.http.post<CourseTypeConfig>(this.apiUrl, config);
    }

    updateCourseType(id: number, config: Partial<CourseTypeConfig>): Observable<CourseTypeConfig> {
        return this.http.put<CourseTypeConfig>(`${this.apiUrl}/${id}`, config);
    }

    deleteCourseType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
