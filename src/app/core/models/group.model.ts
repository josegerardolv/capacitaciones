export interface Group {
    id: number;
    name: string; // e.g., "A05"
    description: string; // e.g., "Regular text column"
    location: string; // e.g., "Carlos Gracida"
    dateTime: string; // e.g., "12/07/2026, 14:30" - Could be Date object, using string for mock simplicity
    quantity: number; // e.g., 55
    autoRegisterLimit: string; // e.g., "s" or number
    url: string; // e.g., "https://example.com"
    requests: number; // For the "Solicitudes" badge/button
    status: 'Activo' | 'Inactivo';
    selected?: boolean; // For checkbox logic
}
