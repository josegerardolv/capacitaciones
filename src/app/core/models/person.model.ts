export interface Person {
    id: number;
    name: string;
    firstSurname?: string; // Apellido Paterno
    secondSurname?: string; // Apellido Materno
    license: string;
    curp: string;
    status: 'Pendiente' | 'Aprobado' | 'No Aprobado';
    requestTarjeton: boolean; // Anteriormente 'wantsTarjeton'
    paymentStatus?: 'Pendiente' | 'Pagado'; // Estatus global de pago (Mantenido por compatibilidad)
    coursePaymentStatus?: 'Pendiente' | 'Pagado'; // Estatus de pago del Curso
    sex?: 'Hombre' | 'Mujer' | 'H' | 'M'; // Agregado para consistencia con formulario
    address?: string; // Agregado para consistencia con formulario
    phone?: string;
    email?: string;
    nuc?: string; // Agregado para consistencia con solicitudes
    requestedDocuments?: string[]; // IDs de documentos seleccionados/obligatorios
    paidDocumentIds?: string[]; // [NUEVO] IDs de documentos específicos ya pagados (Control de dependencias)
}
