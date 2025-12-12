import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectSearchParams {
  search?: string;
  limit?: number;
  [key: string]: any; // Allow additional custom parameters
}

@Injectable({
  providedIn: 'root'
})
export class SelectDataService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Generic method to fetch select options from any endpoint
   * @param endpoint - The API endpoint (e.g., 'catalogs/areas', 'users', 'facilities')
   * @param params - Search parameters including search term and additional filters
   * @returns Observable array of SelectOption objects
   */
  getSelectOptions(endpoint: string, params: SelectSearchParams = {}): Observable<SelectOption[]> {
    let httpParams = new HttpParams();
    
    // Add all parameters to the HTTP request
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    const url = `${this.baseUrl}/api/${endpoint}`;
    return this.http.get<SelectOption[]>(url, { params: httpParams });
  }

  /**
   * Helper method for common catalog endpoints that return data in a specific format
   * @param endpoint - The catalog endpoint (e.g., 'catalogs/areas/select')
   * @param params - Search parameters
   * @returns Observable array of SelectOption objects
   */
  getCatalogOptions(endpoint: string, params: SelectSearchParams = {}): Observable<SelectOption[]> {
    return this.getSelectOptions(`catalogs/${endpoint}/select`, params);
  }
}