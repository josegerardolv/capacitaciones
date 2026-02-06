import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CourseTypeConfig } from '../models/course-type-config.model';

@Injectable({
    providedIn: 'root'
})
export class CourseTypeService {

    private apiUrl = `${environment.apiUrl}/course-type`;
    // Nota: Se asume endpoint singular '/course-type' al igual que '/group' y '/course'.
    // Si falla, verificar si es plural '/course-types' o requiere prefijo.

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

    // Actualizar un Tipo de Curso existente
    updateCourseType(id: number, config: Partial<CourseTypeConfig>): Observable<CourseTypeConfig> {
        // Se cambió PUT por PATCH ya que el backend requiere actualización parcial
        return this.http.patch<CourseTypeConfig>(`${this.apiUrl}/${id}`, config);
    }

    deleteCourseType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
