import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CourseTypeConfig, DEFAULT_REGISTRATION_FIELDS } from '../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class CourseTypeService {

    private apiUrl = `${environment.apiUrl}/course-type`;

    constructor(private http: HttpClient) { }

    getCourseTypes(): Observable<CourseTypeConfig[]> {
        const params = new HttpParams().set('limit', '10').set('page', '1');
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(response => {
                if (Array.isArray(response)) return response;
                return response.data || response.items || response.results || [];
            })
        );
    }

    getCourseTypeById(id: number): Observable<CourseTypeConfig | undefined> {
        return this.http.get<CourseTypeConfig>(`${this.apiUrl}/${id}`);
    }

    createCourseType(config: Omit<CourseTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Observable<CourseTypeConfig> {
        return this.http.post<CourseTypeConfig>(this.apiUrl, config);
    }

    updateCourseType(id: number, config: Partial<CourseTypeConfig>): Observable<CourseTypeConfig> {
        return this.http.patch<CourseTypeConfig>(`${this.apiUrl}/${id}`, config);
    }

    deleteCourseType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}
