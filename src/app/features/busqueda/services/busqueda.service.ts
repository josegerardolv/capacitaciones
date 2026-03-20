import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { environment } from "src/environments/environment";

export interface PersonSearchResponse {
  data: PersonData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface PersonData {
  id: number;
  name: string;
  paternal_lastName: string;
  maternal_lastName: string;
  curp: string;
  email: string;
  isActive: boolean;
  license: string;
  nuc: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  enrollments: Enrollment[];
}

export interface Enrollment {
  id: number;
  group: Group;
  isAcepted: boolean;
  dateReject?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  deletedAt?: string | null;
  enrollmentResponse: EnrollmentResponse[];
}

export interface Group {
  id: number;
  name: string;
  location: string;
  schedule: string;
  limitStudents: number;
  uuid: string;
  groupStartDate: string;
  endInscriptionDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  course: Course;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
}

export interface EnrollmentResponse {
  id: number;
  value: string;
  createdAt?: string;
  updatedAt?: string;
  courseConfigField: CourseConfigField;
}

export interface CourseConfigField {
  id: number;
  required: boolean;
  requirementFieldPerson: RequirementFieldPerson;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequirementFieldPerson {
  id: number;
  fieldName: string;
  fieldType: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class BusquedaService {
  private apiUrl = `${environment.apiUrl}/persons/search`;

  constructor(private http: HttpClient) { }

  searchPerson(
    searchType: "nombre" | "licencia" | "nuc" | "curp",
    searchValue: string,
    page: number = 1,
    limit: number = 10,
  ): Observable<PersonSearchResponse> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString());

    switch (searchType) {
      case "nombre":
        params = params.set("name", searchValue);
        break;
      case "licencia":
        params = params.set("license", searchValue);
        break;
      case "nuc":
        params = params.set("nuc", searchValue);
        break;
      case "curp":
        params = params.set("curp", searchValue);
        break;
    }
console.log('PARAMS:', params.toString());
    return this.http.get<PersonSearchResponse>(this.apiUrl, { params });
  }
}
