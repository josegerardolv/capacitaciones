import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, map, catchError, of, switchMap, forkJoin } from "rxjs";
import { environment } from "src/environments/environment";
import {
  CertificateTemplate,
  GeneratedCertificate,
  CertificateData,
  TemplateVariable,
  PageConfig,
  Concept,
  TemplateDocument,
  CreateTemplateDocumentPayload,
  UpdateTemplateDocumentPayload,
  CanvasDesign,
} from "../../../../core/models/template.model";
import { Requirement } from "../../../../core/services/requirements.service";

/** Mapeo de fieldName (RequirementFieldsperson) a nombre de variable normalizado */
const FIELD_NAME_TO_VAR: Record<string, string> = {
  Nombre: "nombre",
  nombre: "nombre",
  "Primer Apellido": "primer_apellido",
  "Apellido Paterno": "primer_apellido",
  "Segundo Apellido": "segundo_apellido",
  "Apellido Materno": "segundo_apellido",
  CURP: "curp",
  curp: "curp",
  "Correo Electrónico": "email",
  "Correo electrónico": "email",
  Email: "email",
  email: "email",
  Teléfono: "telefono",
  Telefono: "telefono",
  Dirección: "direccion",
  Direccion: "direccion",
  NUC: "nuc",
  nuc: "nuc",
  Licencia: "licencia",
  licencia: "licencia",
  Sexo: "sexo",
  sexo: "sexo",
};

const VAR_ICONS: Record<string, string> = {
  nombre: "person",
  primer_apellido: "person",
  segundo_apellido: "person",
  curp: "badge",
  email: "email",
  telefono: "phone",
  direccion: "home",
  nuc: "badge",
  licencia: "credit_card",
  sexo: "person",
};

export interface GroupWithVariables {
  group: { id: number; name: string };
  courseName?: string;
  variables: TemplateVariable[];
}

/** Enrollment con sus variables (valores de esa persona) */
export interface EnrollmentWithVariables {
  enrollmentId: number;
  person?: {
    name?: string;
    paternal_lastName?: string;
    maternal_lastName?: string;
  };
  variables: TemplateVariable[];
}

/** Grupo con enrollments (cada uno con sus variables) */
export interface GroupWithEnrollments {
  group: { id: number; name: string };
  courseName?: string;
  courseDuration?: number;
  groupStartDate?: string;
  enrollments: EnrollmentWithVariables[];
}

interface RequirementFieldPersonLike {
  fieldName: string;
  fieldType?: string;
}

@Injectable({ providedIn: "root" })
export class TemplateService {
  private apiUrl = `${environment.apiUrl}/api`;
  private templateDocUrl = `${environment.apiUrl}/template-document`;
  private conceptsUrl = `${environment.apiUrl}/payment-concepts`;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ===== TEMPLATES (Backend: /template-document) =====
  getTemplates(): Observable<TemplateDocument[]> {
    return this.http.get<TemplateDocument[]>(this.templateDocUrl);
  }

  getTemplateById(id: number): Observable<TemplateDocument> {
    return this.http.get<TemplateDocument>(`${this.templateDocUrl}/${id}`);
  }

  createTemplate(
    payload: CreateTemplateDocumentPayload,
  ): Observable<TemplateDocument> {
    return this.http.post<TemplateDocument>(this.templateDocUrl, payload);
  }

  updateTemplate(
    id: number,
    payload: UpdateTemplateDocumentPayload,
  ): Observable<TemplateDocument> {
    return this.http.patch<TemplateDocument>(
      `${this.templateDocUrl}/${id}`,
      payload,
    );
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete<any>(`${this.templateDocUrl}/${id}`);
  }

  configureTemplate(
    id: number,
    fields?: string[],
    imageFile?: File,
    qrFile?: File,
  ): Observable<TemplateDocument> {
    const formData = new FormData();
    if (fields) {
      formData.append("fields", JSON.stringify(fields));
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (qrFile) {
      formData.append("qr", qrFile);
    }
    return this.http.post<TemplateDocument>(
      `${this.templateDocUrl}/${id}/configuration`,
      formData,
    );
  }

  static base64ToFile(dataUri: string, filename: string): File {
    const [header, base64] = dataUri.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/png";
    const bytes = atob(base64);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    return new File([buffer], filename, { type: mime });
  }

  uploadMedia(
    id: number,
    file: File,
    type: "image" | "qr",
  ): Observable<string> {
    return this.configureTemplate(
      id,
      undefined,
      type === "image" ? file : undefined,
      type === "qr" ? file : undefined,
    ).pipe(
      map((doc) => {
        const medias = [...doc.medias].sort((a: any, b: any) => b.id - a.id);
        return medias[0]?.url || "";
      }),
    );
  }

  static serializeDesign(design: CanvasDesign): string[] {
    return [JSON.stringify(design)];
  }

  static parseDesign(fields: string[]): CanvasDesign | null {
    if (!fields?.length) return null;
    try {
      return JSON.parse(fields[0]);
    } catch {
      return null;
    }
  }

  getTemplate(id: number): Observable<CertificateTemplate | undefined> {
    return this.http.get<CertificateTemplate>(`${this.apiUrl}/templates/${id}`);
  }

  duplicateTemplate(id: number): Observable<CertificateTemplate> {
    return this.http.post<CertificateTemplate>(
      `${this.apiUrl}/templates/${id}/duplicate`,
      {},
    );
  }

  // ===== CONCEPTOS =====
  getConcepts(): Observable<Concept[]> {
    return this.http.get<Concept[]>(this.conceptsUrl);
  }

  searchConcepts(query: string): Observable<Concept[]> {
    const params = new HttpParams().set("q", query);
    return this.http.get<Concept[]>(this.conceptsUrl, { params });
  }

  createConcept(concept: Omit<Concept, "id">): Observable<Concept> {
    return this.http.post<Concept>(this.conceptsUrl, concept);
  }

  updateConcept(id: number, changes: Partial<Concept>): Observable<Concept> {
    return this.http.patch<Concept>(`${this.conceptsUrl}/${id}`, changes);
  }

  deleteConcept(id: number): Observable<void> {
    return this.http.delete<void>(`${this.conceptsUrl}/${id}`);
  }

  // ===== GENERACIÓN DE CERTIFICADOS =====
  generateCertificate(data: CertificateData): Observable<GeneratedCertificate> {
    return this.http.post<GeneratedCertificate>(
      `${this.apiUrl}/certificates/generate`,
      data,
    );
  }

  getGeneratedCertificates(): Observable<GeneratedCertificate[]> {
    return this.http.get<GeneratedCertificate[]>(`${this.apiUrl}/certificates`);
  }

  // ===== UTILIDADES =====
  getDefaultPageConfig(): PageConfig {
    return {
      width: 279.4,
      height: 215.9,
      orientation: "landscape",
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      backgroundColor: "#ffffff",
    };
  }

  /**
   * Mapea objetos con fieldName/fieldType (RequirementFieldPerson o Requirement) a TemplateVariable[].
   */
  static mapRequirementFieldsToVariables(
    fields: RequirementFieldPersonLike[],
  ): TemplateVariable[] {
    if (!fields?.length) return [];
    const seen = new Set<string>();
    return fields
      .filter((f) => f?.fieldName)
      .map((f) => {
        const name =
          FIELD_NAME_TO_VAR[f.fieldName.trim()] ??
          f.fieldName
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");
        const label = f.fieldName.trim();
        const type: "text" | "number" | "date" =
          f.fieldType === "number" ? "number" : "text";
        const icon = VAR_ICONS[name] ?? "data_object";
        return {
          name,
          label,
          type,
          required: false,
          icon,
          category: "participante" as const,
          description: `Dato de persona: ${label}`,
        };
      })
      .filter((v) => {
        if (seen.has(v.name)) return false;
        seen.add(v.name);
        return true;
      });
  }

  /**
   * Mapea Requirement[] (desde /requirement-fieldsperson) a TemplateVariable[].
   * Usa nombres normalizados para coincidir con Person y EnrollmentResponse en el backend.
   */
  static mapRequirementsToVariables(
    requirements: Requirement[],
  ): TemplateVariable[] {
    const seen = new Set<string>();
    return requirements
      .filter((req) => req?.fieldName)
      .map((req) => {
        const name =
          FIELD_NAME_TO_VAR[req.fieldName.trim()] ??
          req.fieldName
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_");
        const label = req.fieldName.trim();
        const type: "text" | "number" | "date" =
          req.fieldType === "number" ? "number" : "text";
        const icon = VAR_ICONS[name] ?? "data_object";
        return {
          name,
          label,
          type,
          required: false,
          icon,
          category: "participante" as const,
          description: `Dato de persona: ${label}`,
        };
      })
      .filter((v) => {
        if (seen.has(v.name)) return false;
        seen.add(v.name);
        return true;
      });
  }

  /**
   * Fusiona variables del design con variables dinámicas (de requirements).
   * Prioridad: design vars primero por nombre; las dinámicas complementan sin duplicar.
   */
  static mergeVariables(
    designVars: TemplateVariable[],
    dynamicVars: TemplateVariable[],
  ): TemplateVariable[] {
    const byName = new Map<string, TemplateVariable>();
    designVars.forEach((v) => byName.set(v.name, v));
    dynamicVars.forEach((v) => {
      if (!byName.has(v.name)) byName.set(v.name, v);
    });
    return Array.from(byName.values());
  }

  /**
   * Lista completa de variables de participante (desde Nombre hasta Sexo) para el editor.
   * Siempre visible en la edición de plantillas, sin datos de ejemplo.
   */
  static getAllParticipanteVariablesForEditor(): TemplateVariable[] {
    const fieldDefs: Array<{ name: string; label: string }> = [
      { name: "nombre", label: "Nombre" },
      { name: "primer_apellido", label: "Primer apellido" },
      { name: "segundo_apellido", label: "Segundo apellido" },
      { name: "curp", label: "CURP" },
      { name: "email", label: "Correo electrónico" },
      { name: "telefono", label: "Teléfono" },
      { name: "direccion", label: "Dirección" },
      { name: "nuc", label: "NUC" },
      { name: "licencia", label: "Licencia" },
      { name: "sexo", label: "Sexo" },
    ];
    return fieldDefs.map((d) => ({
      name: d.name,
      label: d.label,
      type: "text" as const,
      required: false,
      icon: VAR_ICONS[d.name] ?? "data_object",
      category: "participante" as const,
      description: `Dato de persona: ${d.label}`,
    }));
  }

  /**
   * Construye variables para el editor: participante (todas desde nombre a sexo) sin sampleValue,
   * más variables de curso/institucion/media de design o dynamic.
   */
  static buildEditorVariables(
    designVars: TemplateVariable[],
    dynamicVars: TemplateVariable[],
  ): TemplateVariable[] {
    const participante = TemplateService.getAllParticipanteVariablesForEditor();
    const othersFromDesign = (designVars || []).filter(
      (v) => v.category !== "participante",
    );
    const othersFromDynamic = (dynamicVars || []).filter(
      (v) => v.category !== "participante",
    );
    const byName = new Map<string, TemplateVariable>();
    participante.forEach((v) => byName.set(v.name, v));
    othersFromDesign.forEach((v) => {
      if (!byName.has(v.name))
        byName.set(v.name, { ...v, sampleValue: undefined });
    });
    othersFromDynamic.forEach((v) => {
      if (!byName.has(v.name))
        byName.set(v.name, { ...v });
    });
    const participanteNames = new Set(participante.map((p) => p.name));
    const others = Array.from(byName.values()).filter(
      (v) => !participanteNames.has(v.name),
    );
    return [...participante, ...others];
  }

  /**
   * Obtiene enrollments de un grupo desde GET /enrollment/group/{groupId}.
   */
  getEnrollmentGroup(groupId: number): Observable<any[]> {
    const params = new HttpParams().set("isAcepted", "true");
    return this.http
      .get<any>(`${this.baseUrl}/enrollment/group/${groupId}`, { params })
      .pipe(
        map((res) => {
          const arr = Array.isArray(res) ? res : (res?.data ?? res);
          return Array.isArray(arr) ? arr : [];
        }),
        catchError(() => of([])),
      );
  }

  /**
   * Extrae variables de persona desde un solo enrollment (person + enrollmentResponse).
   * Cada variable tiene sampleValue = valor real de esa persona.
   */
  static extractVariablesFromEnrollment(enrollment: any): TemplateVariable[] {
    if (!enrollment) return [];

    const getErValue = (er: any[], fieldNames: string[]): any => {
      if (!er?.length) return null;
      const r = er.find((e: any) => {
        const fn =
          e?.courseConfigField?.requirementFieldPerson?.fieldName?.trim();
        return fn && fieldNames.includes(fn);
      });
      return r?.value ?? null;
    };

    const hasValue = (v: any): boolean => v != null && String(v).trim() !== "";

    const fieldDefs: Array<{
      name: string;
      label: string;
      getValue: (e: any) => any;
    }> = [
      { name: "nombre", label: "Nombre", getValue: (e) => e?.person?.name },
      {
        name: "primer_apellido",
        label: "Primer apellido",
        getValue: (e) => e?.person?.paternal_lastName,
      },
      {
        name: "segundo_apellido",
        label: "Segundo apellido",
        getValue: (e) => e?.person?.maternal_lastName,
      },
      {
        name: "curp",
        label: "CURP",
        getValue: (e) =>
          e?.person?.curp ?? getErValue(e?.enrollmentResponse, ["CURP"]),
      },
      {
        name: "email",
        label: "Correo electrónico",
        getValue: (e) =>
          e?.person?.email ??
          getErValue(e?.enrollmentResponse, [
            "Correo Electrónico",
            "Correo electrónico",
            "Email",
          ]),
      },
      {
        name: "telefono",
        label: "Teléfono",
        getValue: (e) =>
          getErValue(e?.enrollmentResponse, ["Telefono", "Teléfono"]),
      },
      {
        name: "direccion",
        label: "Dirección",
        getValue: (e) =>
          getErValue(e?.enrollmentResponse, ["Dirección", "Direccion"]),
      },
      {
        name: "nuc",
        label: "NUC",
        getValue: (e) =>
          e?.person?.nuc ?? getErValue(e?.enrollmentResponse, ["NUC"]),
      },
      {
        name: "licencia",
        label: "Licencia",
        getValue: (e) =>
          e?.person?.license ?? getErValue(e?.enrollmentResponse, ["Licencia"]),
      },
      {
        name: "sexo",
        label: "Sexo",
        getValue: (e) => getErValue(e?.enrollmentResponse, ["Sexo"]),
      },
    ];

    const personVars = fieldDefs
      .filter((def) => hasValue(def.getValue(enrollment)))
      .map((def) => {
        const sampleValue = String(def.getValue(enrollment)).trim();
        return {
          name: def.name,
          label: def.label,
          type: "text" as const,
          required: false,
          icon: VAR_ICONS[def.name] ?? "data_object",
          category: "participante" as const,
          description: `Dato de persona: ${def.label}`,
          sampleValue: sampleValue || undefined,
        };
      });

    const courseVars: TemplateVariable[] = [];
    const group = enrollment?.group;
    const course = group?.course;

    if (hasValue(course?.name)) {
      courseVars.push({
        name: "nombre_curso",
        label: "Nombre del curso",
        type: "text",
        required: false,
        icon: "school",
        category: "curso",
        description: "Nombre del curso",
        sampleValue: String(course.name).trim(),
      });
    }

    if (hasValue(course?.duration)) {
      const hours = Math.round(Number(course.duration) / 60);
      courseVars.push({
        name: "tiempo_curso",
        label: "Duración del curso",
        type: "text",
        required: false,
        icon: "schedule",
        category: "curso",
        description: "Duración del curso en horas",
        sampleValue: `${hours} ${hours === 1 ? "hora" : "horas"}`,
      });
    }

    if (hasValue(group?.groupStartDate)) {
      const d = new Date(group.groupStartDate);
      const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
      const dateStr = `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} del ${d.getUTCFullYear()}`;
      courseVars.push({
        name: "fecha_curso",
        label: "Fecha del curso",
        type: "date",
        required: false,
        icon: "calendar_today",
        category: "curso",
        description: "Fecha de inicio del grupo",
        sampleValue: dateStr,
      });
    }

    return [...personVars, ...courseVars];
  }

  /**
   * Extrae variables de persona desde enrollments (person + enrollmentResponse).
   * Solo incluye campos que tengan al menos un valor no nulo/no vacío.
   */
  static extractVariablesFromEnrollments(
    enrollments: any[],
  ): TemplateVariable[] {
    if (!enrollments?.length) return [];

    const getErValue = (er: any[], fieldNames: string[]): any => {
      if (!er?.length) return null;
      const r = er.find((e: any) => {
        const fn =
          e?.courseConfigField?.requirementFieldPerson?.fieldName?.trim();
        return fn && fieldNames.includes(fn);
      });
      return r?.value ?? null;
    };

    const hasValue = (v: any): boolean => v != null && String(v).trim() !== "";

    const fieldDefs: Array<{
      name: string;
      label: string;
      getValue: (e: any) => any;
    }> = [
      { name: "nombre", label: "Nombre", getValue: (e) => e?.person?.name },
      {
        name: "primer_apellido",
        label: "Primer apellido",
        getValue: (e) => e?.person?.paternal_lastName,
      },
      {
        name: "segundo_apellido",
        label: "Segundo apellido",
        getValue: (e) => e?.person?.maternal_lastName,
      },
      {
        name: "curp",
        label: "CURP",
        getValue: (e) =>
          e?.person?.curp ?? getErValue(e?.enrollmentResponse, ["CURP"]),
      },
      {
        name: "email",
        label: "Correo electrónico",
        getValue: (e) =>
          e?.person?.email ??
          getErValue(e?.enrollmentResponse, [
            "Correo Electrónico",
            "Correo electrónico",
            "Email",
          ]),
      },
      {
        name: "telefono",
        label: "Teléfono",
        getValue: (e) =>
          getErValue(e?.enrollmentResponse, ["Telefono", "Teléfono"]),
      },
      {
        name: "direccion",
        label: "Dirección",
        getValue: (e) =>
          getErValue(e?.enrollmentResponse, ["Dirección", "Direccion"]),
      },
      {
        name: "nuc",
        label: "NUC",
        getValue: (e) =>
          e?.person?.nuc ?? getErValue(e?.enrollmentResponse, ["NUC"]),
      },
      {
        name: "licencia",
        label: "Licencia",
        getValue: (e) =>
          e?.person?.license ?? getErValue(e?.enrollmentResponse, ["Licencia"]),
      },
      {
        name: "sexo",
        label: "Sexo",
        getValue: (e) => getErValue(e?.enrollmentResponse, ["Sexo"]),
      },
    ];

    return fieldDefs
      .filter((def) => enrollments.some((e) => hasValue(def.getValue(e))))
      .map((def) => {
        const sampleEnrollment = enrollments.find((e) =>
          hasValue(def.getValue(e)),
        );
        const sampleValue = sampleEnrollment
          ? String(def.getValue(sampleEnrollment)).trim()
          : undefined;
        return {
          name: def.name,
          label: def.label,
          type: "text" as const,
          required: false,
          icon: VAR_ICONS[def.name] ?? "data_object",
          category: "participante" as const,
          description: `Dato de persona: ${def.label}`,
          sampleValue: sampleValue || undefined,
        };
      });
  }

  /**
   * Obtiene los grupos asociados al template con sus enrollments.
   * Cada enrollment tiene sus variables con valores de esa persona.
   */
  getGroupsForTemplate(templateId: number): Observable<GroupWithEnrollments[]> {
    const params = new HttpParams().set("page", "1").set("limit", "100");
    return this.http
      .get<{
        data: any[];
        meta: any;
      }>(`${this.baseUrl}/group/search`, { params })
      .pipe(
        switchMap((res) => {
          const rawData = res?.data ?? (Array.isArray(res) ? res : []);
          const groups = (rawData || []).filter((g: any) => {
            const docCourses = g?.course?.courseType?.documentCourses || [];
            return docCourses.some((dc: any) => {
              const tid = dc?.templateDocument?.id ?? dc?.templateDocumentId;
              return tid != null && Number(tid) === Number(templateId);
            });
          });
          if (groups.length === 0) return of([]);
          return forkJoin(
            groups.map((g: any) =>
              this.getEnrollmentGroup(g.id).pipe(
                map((enrollments) => {
                  const enrollmentItems: EnrollmentWithVariables[] = (
                    enrollments || []
                  ).map((e: any) => ({
                    enrollmentId: e.enrollmentId ?? e.id,
                    person: e?.person,
                    variables:
                      TemplateService.extractVariablesFromEnrollment(e),
                  }));
                  return {
                    group: { id: g.id, name: g.name || `Grupo ${g.id}` },
                    courseName: g.course?.name,
                    courseDuration: g.course?.duration,
                    groupStartDate: g.groupStartDate,
                    enrollments: enrollmentItems,
                  } as GroupWithEnrollments;
                }),
              ),
            ),
          );
        }),
        catchError(() => of([])),
      );
  }

  // Las variables comunes suelen ser estáticas o config del sistema, no necesariamente un endpoint.
  // De momento las mantenemos hardcodeadas en el servicio limpio también, o podrían venir de un endpoint /config
  // Para simplificar, las dejaré aquí, ya que no "ensucian" con lógica de negocio compleja, solo definiciones.
  getCommonVariables(): TemplateVariable[] {
    return [
      // Participante
      {
        name: "nombre",
        label: "Nombre(s)",
        type: "text",
        required: true,
        icon: "person",
        category: "participante",
        description: "Nombre(s) del participante",
      },
      {
        name: "primer_apellido",
        label: "Primer Apellido",
        type: "text",
        required: false,
        icon: "person",
        category: "participante",
        description: "Apellido paterno del participante",
      },
      {
        name: "segundo_apellido",
        label: "Segundo Apellido",
        type: "text",
        required: false,
        icon: "person",
        category: "participante",
        description: "Apellido materno del participante",
      },
      {
        name: "nombre_completo",
        label: "Nombre Completo",
        type: "text",
        required: false,
        icon: "person",
        category: "participante",
        description: "Nombre + Primer Apellido + Segundo Apellido",
      },
      {
        name: "curp",
        label: "CURP",
        type: "text",
        required: false,
        icon: "badge",
        category: "participante",
        description: "CURP del participante",
      },
      {
        name: "email",
        label: "Correo electrónico",
        type: "text",
        required: false,
        icon: "email",
        category: "participante",
        description: "Email del participante",
      },

      // Curso
      {
        name: "curso",
        label: "Nombre del curso",
        type: "text",
        required: true,
        icon: "school",
        category: "curso",
        description: "Título del curso o capacitación",
      },
      {
        name: "fecha_inicio",
        label: "Fecha de inicio",
        type: "date",
        required: false,
        icon: "event",
        category: "curso",
        description: "Fecha de inicio del curso",
      },
      {
        name: "fecha_fin",
        label: "Fecha de finalización",
        type: "date",
        required: false,
        icon: "event_available",
        category: "curso",
        description: "Fecha de término del curso",
      },
      {
        name: "duracion",
        label: "Duración",
        type: "text",
        required: false,
        icon: "schedule",
        category: "curso",
        description: "Duración total (ej: 40 horas)",
      },
      {
        name: "instructor",
        label: "Nombre del instructor",
        type: "text",
        required: false,
        icon: "record_voice_over",
        category: "curso",
        description: "Instructor o facilitador",
      },
      {
        name: "modalidad",
        label: "Modalidad",
        type: "text",
        required: false,
        icon: "devices",
        category: "curso",
        description: "Presencial, en línea, híbrido",
      },
      {
        name: "nombre_curso",
        label: "Nombre del curso",
        type: "text",
        required: false,
        icon: "school",
        category: "curso",
        description: "Nombre del curso (desde API)",
      },
      {
        name: "tiempo_curso",
        label: "Duración del curso",
        type: "text",
        required: false,
        icon: "schedule",
        category: "curso",
        description: "Duración del curso en horas (desde API)",
      },
      {
        name: "fecha_curso",
        label: "Fecha del curso",
        type: "date",
        required: false,
        icon: "calendar_today",
        category: "curso",
        description: "Fecha de inicio del grupo (desde API)",
      },

      // Institución
      {
        name: "folio",
        label: "Número de folio",
        type: "text",
        required: false,
        icon: "tag",
        category: "institucion",
        description: "Folio único del documento",
      },
      {
        name: "institucion",
        label: "Nombre de la institución",
        type: "text",
        required: false,
        icon: "domain",
        category: "institucion",
        description: "Nombre de la institución emisora",
      },
      {
        name: "director",
        label: "Nombre del director",
        type: "text",
        required: false,
        icon: "supervisor_account",
        category: "institucion",
        description: "Director o responsable",
      },
      {
        name: "cargo_director",
        label: "Cargo del director",
        type: "text",
        required: false,
        icon: "work",
        category: "institucion",
        description: "Puesto del firmante",
      },

      // Media (imagen y QR dinámicos)
      {
        name: "foto_participante",
        label: "Foto del participante",
        type: "image",
        required: false,
        icon: "account_circle",
        category: "media",
        description: "Fotografía del participante desde API",
      },
      {
        name: "logo_institucion",
        label: "Logo de la institución",
        type: "image",
        required: false,
        icon: "image",
        category: "media",
        description: "Logo institucional desde API",
      },
      {
        name: "firma_digital",
        label: "Firma digital",
        type: "image",
        required: false,
        icon: "draw",
        category: "media",
        description: "Imagen de firma del responsable",
      },
      {
        name: "qr_verificacion",
        label: "QR de verificación",
        type: "qr",
        required: false,
        icon: "qr_code_2",
        category: "media",
        description: "Código QR para verificar autenticidad",
      },
      {
        name: "qr_documento",
        label: "QR del documento",
        type: "qr",
        required: false,
        icon: "qr_code",
        category: "media",
        description: "Código QR con enlace al documento",
      },
      {
        name: "qr_validacion_api",
        label: "Código de validación (API)",
        type: "qr",
        required: false,
        icon: "qr_code_2",
        category: "media",
        description: "Código QR de validación traído desde la API",
      },
      {
        name: "imagen_api",
        label: "Imagen desde API",
        type: "image",
        required: false,
        icon: "image",
        category: "media",
        description: "Imagen dinámica (URL/Base64/Archivo) traída desde la API",
      },
    ];
  }
}
