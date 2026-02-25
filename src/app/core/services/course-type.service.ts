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

    getCourseTypes(page: number = 1, limit: number = 10, name?: string): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (name) {
            params = params.set('name', name);
        }

        // Usamos /search para permitir filtrado global y paginación correcta
        return this.http.get<any>(`${this.apiUrl}/search`, { params });
    }

    // Usar para dropdowns en modales para asegurar ver más de 10
    getActiveCourseTypes(limit: number = 100): Observable<any> {
        const params = new HttpParams()
            .set('page', '1')
            .set('limit', limit.toString());
        return this.http.get<any>(`${this.apiUrl}/actives`, { params });
    }

    getCourseTypeById(id: number): Observable<CourseTypeConfig | undefined> {
        return this.http.get<CourseTypeConfig>(`${this.apiUrl}/${id}`);
    }

    createCourseType(config: Omit<CourseTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Observable<CourseTypeConfig> {
        return this.http.post<CourseTypeConfig>(this.apiUrl, config);
    }

    updateCourseType(id: number, config: Partial<CourseTypeConfig>, validatedRequired: boolean = true): Observable<CourseTypeConfig> {
        const params = new HttpParams().set('validatedRequired', validatedRequired.toString());
        return this.http.patch<CourseTypeConfig>(`${this.apiUrl}/${id}`, config, { params });
    }

    deleteCourseType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    removeCourseType(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/remove/${id}`, {});
    }

    restoreCourseType(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/restore/${id}`, {});
    }

}
