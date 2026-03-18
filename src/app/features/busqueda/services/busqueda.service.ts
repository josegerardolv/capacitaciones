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
    if (environment.useMocks) {
      return this.getMockData(searchType, searchValue, page, limit);
    }

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

  private getMockData(
    searchType: string,
    searchValue: string,
    page: number,
    limit: number,
  ): Observable<PersonSearchResponse> {
    const q = (searchValue || "").trim().toLowerCase();

    const courses: Record<number, Course> = {
      1: {
        id: 1,
        name: "Manejo Preventivo",
        description: "Curso de manejo defensivo y prevención de accidentes",
        duration: 40,
        isActive: true,
      },
      2: {
        id: 2,
        name: "Capacitación en Seguridad Vial",
        description: "Curso obligatorio para conductores de transporte público",
        duration: 40,
        isActive: true,
      },
      3: {
        id: 3,
        name: "Reglas y Normas de Tránsito",
        description: "Normativa vial vigente y señalización",
        duration: 20,
        isActive: true,
      },
    };

    const samplePersons = [
      {
        id: 1,
        nombre: "Juan Jose Morales",
        licencia: "VXCE910803MCCRCK34",
        curp: "MOGJ800101HDFRRN01",
        fechaRegistro: "26/11/2025",
        email: "juan.morales@example.com",
      },
      {
        id: 2,
        nombre: "Juana Martinez Cruz",
        licencia: "ABCD123456EFG7890",
        curp: "MACJ850505MDFRRN02",
        fechaRegistro: "15/08/2024",
        email: "juana.martinez@example.com",
      },
      {
        id: 3,
        nombre: "Jose Lopez Garcia",
        licencia: "LMNO567890PQRS1234",
        curp: "LOGJ900202HDFRRN03",
        fechaRegistro: "10/02/2025",
        email: "jose.lopez@example.com",
      },
      {
        id: 4,
        nombre: "Maria Fernanda Sanchez",
        licencia: "QRST123456UVWX5678",
        curp: "SAMF920315MDFRNN04",
        fechaRegistro: "05/11/2025",
        email: "maria.sanchez@example.com",
      },
      {
        id: 5,
        nombre: "Carlos Eduardo Ramirez",
        licencia: "UVWX567890YZAB1234",
        curp: "RACE880720HDFRRN05",
        fechaRegistro: "20/01/2025",
        email: "carlos.ramirez@example.com",
      },
      {
        id: 6,
        nombre: "Ana Sofia Gomez",
        licencia: "YZAB123456CDEF5678",
        curp: "GOAS950410MDFRNN06",
        fechaRegistro: "30/09/2024",
        email: "ana.gomez@example.com",
      },
    ];

    const sampleEnrollments: Record<number, any[]> = {
      1: [
        {
          enrollmentId: 11,
          groupId: 101,
          groupName: "Grupo A - Turno Matutino",
          location: "Oaxaca Centro",
          schedule: "Lunes y Miércoles 09:00-13:00",
          courseId: 1,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: true,
          dateReject: "",
        },
        {
          enrollmentId: 12,
          groupId: 102,
          groupName: "Grupo B - Turno Vespertino",
          location: "Oaxaca Norte",
          schedule: "Martes y Jueves 15:00-19:00",
          courseId: 2,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: false,
          dateReject: "",
        },
      ],
      2: [
        {
          enrollmentId: 21,
          groupId: 103,
          groupName: "Grupo C - Turno Matutino",
          location: "Oaxaca Sur",
          schedule: "Lunes y Miércoles 09:00-13:00",
          courseId: 1,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: false,
          dateReject: "20/12/2024",
        },
        {
          enrollmentId: 22,
          groupId: 104,
          groupName: "Grupo D - Turno Vespertino",
          location: "Oaxaca Este",
          schedule: "Martes y Jueves 15:00-19:00",
          courseId: 3,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: false,
          dateReject: "30/10/2025",
        },
      ],
      3: [
        {
          enrollmentId: 31,
          groupId: 105,
          groupName: "Grupo E - Turno Matutino",
          location: "Oaxaca Centro",
          schedule: "Viernes 08:00-14:00",
          courseId: 2,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: false,
          dateReject: "",
        },
        {
          enrollmentId: 32,
          groupId: 106,
          groupName: "Grupo F - Turno Nocturno",
          location: "Oaxaca Oeste",
          schedule: "Sábado 18:00-22:00",
          courseId: 3,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: false,
          dateReject: "",
        },
      ],
      4: [
        {
          enrollmentId: 41,
          groupId: 107,
          groupName: "Grupo G - Turno Matutino",
          location: "Oaxaca Norte",
          schedule: "Lunes a Viernes 07:00-09:00",
          courseId: 1,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: false,
          dateReject: "",
        },
        {
          enrollmentId: 42,
          groupId: 108,
          groupName: "Grupo H - Turno Vespertino",
          location: "Oaxaca Sur",
          schedule: "Martes y Jueves 16:00-20:00",
          courseId: 2,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: false,
          dateReject: "",
        },
      ],
      5: [
        {
          enrollmentId: 51,
          groupId: 109,
          groupName: "Grupo I - Turno Matutino",
          location: "Oaxaca Este",
          schedule: "Lunes y Miércoles 10:00-14:00",
          courseId: 3,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: true,
          dateReject: "",
        },
        {
          enrollmentId: 52,
          groupId: 110,
          groupName: "Grupo J - Turno Vespertino",
          location: "Oaxaca Centro",
          schedule: "Martes y Jueves 14:00-18:00",
          courseId: 1,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: true,
          dateReject: "",
        },
      ],
      6: [
        {
          enrollmentId: 61,
          groupId: 111,
          groupName: "Grupo K - Turno Nocturno",
          location: "Oaxaca Oeste",
          schedule: "Viernes y Sábado 19:00-23:00",
          courseId: 2,
          groupStartDate: "12/12/2024",
          endInscriptionDate: "05/12/2024",
          isAcepted: false,
          dateReject: "20/12/2024",
        },
        {
          enrollmentId: 62,
          groupId: 112,
          groupName: "Grupo L - Turno Matutino",
          location: "Oaxaca Norte",
          schedule: "Lunes a Viernes 08:00-10:00",
          courseId: 3,
          groupStartDate: "24/10/2025",
          endInscriptionDate: "18/10/2025",
          isAcepted: false,
          dateReject: "01/11/2025",
        },
      ],
    };

    const matches = samplePersons.filter(p => {
      if (!q) return false;

      const nombreCompleto = this.normalize(
        `${p.nombre}`
      );

      const licencia = this.normalize(p.licencia);
      const curp = this.normalize(p.curp);
      const nuc = this.normalize(`NUC${p.id}123456789`);

      switch (searchType) {
        case 'nombre':
          return nombreCompleto.includes(q);

        case 'licencia':
          return licencia.includes(q);

        case 'nuc':
          return nuc.includes(q);

        case 'curp':
          return curp.includes(q);

        default:
          return false;
      }
    });

    if (matches.length === 0) {
      return of({
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      }).pipe(delay(800));
    }

    const mockPersonsData: PersonData[] = matches.map((p) => {
      const nameParts = p.nombre.split(" ");
      const firstName = nameParts[0];
      const paternalLastName = nameParts[1] || "";
      const maternalLastName = nameParts.slice(2).join(" ") || "";

      const enrollments: Enrollment[] = (sampleEnrollments[p.id] || []).map(
        (e) => {
          const course = courses[e.courseId];
          return {
            id: e.enrollmentId,
            isAcepted: e.isAcepted,
            dateReject: e.dateReject || "",
            createdAt: this.parseDate(e.groupStartDate),
            updatedAt: this.parseDate(e.groupStartDate),
            isActive: true,
            deletedAt: null,
            group: {
              id: e.groupId,
              name: e.groupName,
              location: e.location,
              schedule: e.schedule,
              limitStudents: 30,
              uuid: `uuid-${e.groupId}`,
              groupStartDate: this.parseDate(e.groupStartDate),
              endInscriptionDate: this.parseDate(e.endInscriptionDate),
              isActive: true,
              course: {
                id: course.id,
                name: course.name,
                description: course.description,
                duration: course.duration,
                isActive: course.isActive,
              },
            },
            enrollmentResponse: [
              {
                id: e.enrollmentId * 10,
                value: p.licencia,
                courseConfigField: {
                  id: 3,
                  required: true,
                  requirementFieldPerson: {
                    id: 7,
                    fieldName: "Número de Licencia",
                    fieldType: "text",
                  },
                },
              },
            ],
          };
        },
      );

      return {
        id: p.id,
        name: firstName,
        paternal_lastName: paternalLastName,
        maternal_lastName: maternalLastName,
        curp: p.curp,
        email: p.email,
        isActive: true,
        license: p.licencia,
        nuc: `NUC${p.id}123456789`,
        createdAt: this.parseDate(p.fechaRegistro),
        updatedAt: this.parseDate(p.fechaRegistro),
        deletedAt: null,
        enrollments,
      };
    });

    const total = mockPersonsData.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const pagedData = mockPersonsData.slice(startIndex, startIndex + limit);

    return of({
      data: pagedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    }).pipe(delay(800));
  }

  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    const [day, month, year] = dateStr.split("/");
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month}-${day}T00:00:00.000Z`;
  }

  private normalize(text: string): string {
    return (text || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
}
