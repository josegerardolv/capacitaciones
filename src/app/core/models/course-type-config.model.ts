export interface RegistrationFieldConfig {
    fieldName: string; // 'license', 'nuc', 'curp', 'address', 'phone', 'email', 'sex', 'name', 'firstSurname', 'secondSurname'
    label: string;
    visible: boolean;
    required: boolean;
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
    { fieldName: 'name', label: 'Nombre', visible: true, required: true }, // Siempre visible por lo general
    { fieldName: 'firstSurname', label: 'Primer Apellido', visible: true, required: true },
    { fieldName: 'secondSurname', label: 'Segundo Apellido', visible: true, required: false },
    { fieldName: 'curp', label: 'CURP', visible: true, required: true },
    { fieldName: 'license', label: 'Licencia', visible: true, required: true },
    { fieldName: 'nuc', label: 'NUC', visible: true, required: false },
    { fieldName: 'address', label: 'Dirección', visible: true, required: true },
    { fieldName: 'phone', label: 'Teléfono', visible: true, required: true },
    { fieldName: 'email', label: 'Correo Electrónico', visible: true, required: true },
    { fieldName: 'sex', label: 'Sexo', visible: true, required: true },
];
