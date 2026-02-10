export interface Person {
    id: number;
    name: string;
    paternal_lastName?: string;
    maternal_lastName?: string;
    license: string;
    curp: string;
    status: 'Pendiente' | 'Aprobado' | 'No Aprobado';
    requestTarjeton: boolean;
    paymentStatus?: 'Pendiente' | 'Pagado'; // Estatus global de pago
    coursePaymentStatus?: 'Pendiente' | 'Pagado'; // Estatus de pago del Curso
    sex?: 'Hombre' | 'Mujer' | 'H' | 'M';
    address?: string;
    phone?: string;
    email?: string;
    nuc?: string;
    requestedDocuments?: string[]; // IDs de documentos seleccionados/obligatorios
    paidDocumentIds?: string[]; // IDs de documentos específicos ya pagados
}
