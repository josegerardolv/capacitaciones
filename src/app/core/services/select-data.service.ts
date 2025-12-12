import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@/environments/environment';

export interface SelectDataItem {
  id: any;
  name: string;
  description?: string;
  [key: string]: any; // Para propiedades adicionales
}

export interface SelectSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  [key: string]: any; // Para parámetros adicionales específicos del endpoint
}

export interface SelectSearchResponse {
  items: SelectDataItem[];
  total?: number;
  hasMore?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SelectDataService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza una búsqueda en el endpoint especificado
   * @param endpoint - El endpoint a consultar (ej: 'areas', 'positions', 'facilities')
   * @param params - Parámetros de búsqueda
   * @returns Observable con los resultados de la búsqueda
   */
  search(endpoint: string, params: SelectSearchParams = {}): Observable<SelectSearchResponse> {
    let httpParams = new HttpParams();
    
    // Agregar parámetros de búsqueda
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    const url = `${this.baseUrl}/${endpoint}`;
    
    return this.http.get<any>(url, { params: httpParams }).pipe(
      map(response => this.normalizeResponse(response))
    );
  }

  /**
   * Obtiene un elemento específico por ID
   * @param endpoint - El endpoint a consultar
   * @param id - ID del elemento
   * @returns Observable con el elemento encontrado
   */
  getById(endpoint: string, id: any): Observable<SelectDataItem | null> {
    const url = `${this.baseUrl}/${endpoint}/${id}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.normalizeItem(response))
    );
  }

  /**
   * Normaliza la respuesta de la API a un formato estándar
   * Diferentes endpoints pueden devolver estructuras ligeramente diferentes
   */
  private normalizeResponse(response: any): SelectSearchResponse {
    // Si la respuesta es directamente un array
    if (Array.isArray(response)) {
      return {
        items: response.map(item => this.normalizeItem(item)),
        total: response.length,
        hasMore: false
      };
    }

    // Si la respuesta tiene estructura de paginación
    if (response.data && Array.isArray(response.data)) {
      return {
        items: response.data.map((item: any) => this.normalizeItem(item)),
        total: response.total || response.count || response.data.length,
        hasMore: response.hasMore || false
      };
    }

    // Si la respuesta tiene items directamente
    if (response.items && Array.isArray(response.items)) {
      return {
        items: response.items.map((item: any) => this.normalizeItem(item)),
        total: response.total || response.count || response.items.length,
        hasMore: response.hasMore || false
      };
    }

    // Fallback: intentar extraer propiedades comunes
    const items = response.results || response.data || response.items || [];
    return {
      items: Array.isArray(items) ? items.map((item: any) => this.normalizeItem(item)) : [],
      total: response.total || response.count || 0,
      hasMore: response.hasMore || false
    };
  }

  /**
   * Normaliza un elemento individual a la estructura estándar
   */
  private normalizeItem(item: any): SelectDataItem {
    if (!item) return { id: null, name: '' };

    // Intentar extraer ID usando diferentes nombres comunes
    const id = item.id || item.ID || item.uuid || item.key || item.value;
    
    // Intentar extraer nombre usando diferentes nombres comunes
    const name = item.name || item.title || item.label || item.description || item.text || String(id);

    // Crear el objeto normalizado
    const normalized: SelectDataItem = {
      id,
      name,
      ...item // Mantener todas las propiedades originales
    };

    // Agregar descripción si existe
    if (item.description && item.description !== name) {
      normalized.description = item.description;
    }

    return normalized;
  }
}
