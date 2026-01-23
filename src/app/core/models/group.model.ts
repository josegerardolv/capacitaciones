export type CourseType = 'LICENCIA' | 'GENERICO' | 'CAPACITACION_ESCOLAR' | 'CURSO_SIMPLE';

export interface Group {
    id: number;
    name: string; // e.g., "A05"
    description?: string; // Opcional, puede mapearse a duración o notas internas
    duration: string; // e.g., "3 horas" - Requerido por diseño
    location: string; // e.g., "Carlos Gracida"
    dateTime: string; // e.g., "12/07/2026, 14:30" - Could be Date object
    quantity: number; // Cupo máximo de conductores
    autoRegisterLimit: number; // Días para límite de auto-registro (Vigencia del link)
    url: string; // Link público generado
    requests: number; // Cantidad de solicitudes pendientes
    status: 'Activo' | 'Inactivo';
    selected?: boolean; // Para lógica de selección en tabla
    courseType: CourseType; // Nuevo campo para distinguir lógica
    courseTypeId?: number; // ID de la configuración dinámica
}
