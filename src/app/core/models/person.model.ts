export interface Person {
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
    sex?: 'Hombre' | 'Mujer' | 'H' | 'M'; // Agregado para consistencia con formulario
    address?: string; // Agregado para consistencia con formulario
    phone?: string;
    email?: string;
    nuc?: string; // Agregado para consistencia con solicitudes
}
