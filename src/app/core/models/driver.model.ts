export interface Driver {
    id: number;
    name: string;
    firstSurname?: string; // Apellido Paterno
    secondSurname?: string; // Apellido Materno
    license: string;
    curp: string;
    status: 'Pendiente' | 'Aprobado' | 'No Aprobado';
    requestTarjeton: boolean; // Anteriormente 'wantsTarjeton'
    paymentStatus?: 'Pendiente' | 'Pagado'; // Estatus de pago del Tarjetón
    coursePaymentStatus?: 'Pendiente' | 'Pagado'; // Estatus de pago del Curso
    sex?: 'Hombre' | 'Mujer'; // Agregado para consistencia con formulario
    address?: string; // Agregado para consistencia con formulario
    nuc?: string; // Agregado para consistencia con solicitudes
}
