/**
 * Mapeo de nombres técnicos del Frontend a los nombres descriptivos del Backend (fieldName).
 * Estos nombres deben coincidir con lo que aparece en la tabla 'requirement_fieldsperson'.
 */
export const REQUIREMENT_FIELD_NAMES = {
    ADDRESS: 'Dirección',
    EMAIL: 'Correo Electrónico',
    NUC: 'NUC',
    PHONE: 'Telefono',
    SEX: 'Sexo',
    LICENSE: 'Licencia',
    CURP: 'CURP',
};

/**
 * Helper para normalizar nombres y facilitar la comparación case-insensitive.
 */
export function normalizeFieldName(name: string): string {
    return name?.toLowerCase()
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/\s+/g, '_');
}
