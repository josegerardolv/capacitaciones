export type CourseType = 'LICENCIA' | 'GENERICO' | 'CAPACITACION_ESCOLAR' | 'CURSO_SIMPLE';

export interface Group {
    id: number;
    uuid?: string; // UUID v4 from Backend
    name: string; // e.g., "A05"
    description?: string; // Opcional, puede mapearse a duración o notas internas
    duration: string; // e.g., "3 horas" - Requerido por diseño
    location: string; // e.g., "Carlos Gracida"
    groupStartDate: string; // "2026-02-02T..." or "2026-02-02"
    schedule: string; // "14:00"
    endInscriptionDate?: string; // Antes linkExpiration
    limitStudents: number;
    autoRegisterLimit?: number;
    inscriptionURL?: string;
    requests: number; // Mantenemos por retrocompatibilidad momentánea, pero migrar a pendingRequestsCount
    pendingRequestsCount?: number; // Requerido: Enviado por Backend en /group/search
    acceptedCount?: number; // Requerido: Enviado por Backend en /group/search (para control de cupo)
    rejectCount?: number; // Agregado: para el conteo de solicitudes rechazadas
    availablePlaces?: number; // Agregado: lugares disponibles actuales
    status: 'Activo' | 'Inactivo';
    selected?: boolean;

    // Relations (Backend sends 'course' as number, or object)
    course: any; // ID del Curso padre o el objeto Course completo
    courseTypeId?: number; // Puede venir si el backend cambia, pero principalmente usamos 'course' para fitrar

    // Auxiliar para campos dinámicos en vista pública (Backend lo envía en /group/registro/{uuid})
    fields?: any[];
}
