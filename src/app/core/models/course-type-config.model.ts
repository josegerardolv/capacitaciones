export interface RegistrationFieldConfig {
    fieldName: string; // 'license', 'nuc', 'curp', 'address', 'phone', 'email', 'sex', 'name', 'paternal_lastName', 'maternal_lastName'
    label: string;
    visible: boolean;
    required: boolean;
    requirementId?: number; // Backend ID for requirementFieldPerson
}

export interface DocumentConfig {
    id: string;
    name: string; // e.g. 'Constancia de Participación', 'Tarjetón'
    description?: string;
    templateId?: number; // Linked Template ID from TemplateService
    cost?: number; // Costo del trámite
    requiresApproval?: boolean; // Si requiere aprobación del instructor/admin
    isMandatory?: boolean; // Si es obligatorio seleccionar este documento
}

export interface CourseTypeConfig {
    id: number;
    name: string; // e.g. 'Capacitación Escolar', 'Licencia Tipo A'
    description: string;
    status: 'Activo' | 'Inactivo';
    type?: string; // e.g. 'Taller', 'Diplomado' (Mapped from category in frontend)
    paymentType: 'Gratuito' | 'De Paga'; // Para mostrar en la tabla como en la imagen ('Gratuito'/'De Paga')

    // Configuración del Formulario de Registro
    registrationFields: RegistrationFieldConfig[];

    // Configuración de Documentos Disponibles (Constancias)
    availableDocuments: DocumentConfig[];

    createdAt: string;
    updatedAt: string;
}

// Helper para configuración por defecto
export const DEFAULT_REGISTRATION_FIELDS: RegistrationFieldConfig[] = [
    // Campos Base (El Backend asume que siempre se envían, no enviar ID en payload)
    { fieldName: 'name', label: 'Nombre', visible: true, required: true },
    { fieldName: 'paternal_lastName', label: 'Primer Apellido', visible: true, required: true },
    { fieldName: 'curp', label: 'CURP', visible: true, required: true },
    { fieldName: 'email', label: 'Correo Electrónico', visible: true, required: true },

    // Campos Configurables con IDs Confirmados (4-7)
    { fieldName: 'address', label: 'Dirección', visible: true, required: true, requirementId: 4 }, // Confirmado con JSON del usuario
    { fieldName: 'phone', label: 'Teléfono', visible: true, required: true, requirementId: 5 },   // Confirmado (Bloqueado Visible)
    { fieldName: 'sex', label: 'Sexo', visible: true, required: true, requirementId: 6 },         // Confirmado
    { fieldName: 'license', label: 'Licencia', visible: true, required: true, requirementId: 7 }, // Asignado ID 7 según solicitud anterior

    // Otros (Sin ID confirmado aún, no se envían para evitar error 500)
    { fieldName: 'nuc', label: 'NUC', visible: true, required: false },
    { fieldName: 'maternal_lastName', label: 'Segundo Apellido', visible: true, required: false },
];
