export type CourseType = 'LICENCIA' | 'GENERICO' | 'CAPACITACION_ESCOLAR' | 'CURSO_SIMPLE';

export interface Group {
    id: number;
    uid?: string; // UUID v4 from Backend
    name: string; // e.g., "A05"
    description?: string; // Opcional, puede mapearse a duración o notas internas
    duration: string; // e.g., "3 horas" - Requerido por diseño
    location: string; // e.g., "Carlos Gracida"
    groupStartDate: string; // "2026-02-02T..." or "2026-02-02"
    schedule: string; // "14:00"
    endInscriptionDate?: string; // Antes linkExpiration
    limitStudents: number;
    autoRegisterLimit?: number;
    inscriptionURL: string;
    requests: number;
    status: 'Activo' | 'Inactivo';
    selected?: boolean;

    // Relations (Backend sends 'course' as number, or object)
    course: number; // ID del Curso padre
    courseTypeId?: number; // Puede venir si el backend cambia, pero principalmente usamos 'course' para fitrar
}
