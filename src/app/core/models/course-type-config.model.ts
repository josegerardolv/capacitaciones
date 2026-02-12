export interface RegistrationFieldConfig {
    fieldName: string; // 'license', 'nuc', 'curp', 'address', 'phone', 'email', 'sex', 'name', 'paternal_lastName', 'maternal_lastName'
    label: string;
    visible: boolean;
    required: boolean;
    requirementId?: number; // ID del Backend para requirementFieldPerson
}

export interface DocumentConfig {
    id: string;
    name: string; // ej. 'Constancia de Participación', 'Tarjetón'
    description?: string;
    templateId?: number; // ID de Template vinculado del TemplateService
    cost?: number; // Costo del trámite
    requiresApproval?: boolean; // Si requiere aprobación del instructor/admin
    isMandatory?: boolean; // Si es obligatorio seleccionar este documento
}

export interface CourseTypeConfig {
    id: number;
    name: string; // ej. 'Capacitación Escolar', 'Licencia Tipo A'
    description: string;
    status: 'Activo' | 'Inactivo';
    type?: string; // ej. 'Taller', 'Diplomado' (Mapeado desde category en frontend)
    paymentType: 'Gratuito' | 'De Paga'; // Para mostrar en la tabla como en la imagen ('Gratuito'/'De Paga')

    // Configuración del Formulario de Registro
    registrationFields: RegistrationFieldConfig[];

    // Configuración de Documentos Disponibles (Constancias)
    availableDocuments: DocumentConfig[];

    // Nuevo formato de configuración del Backend
    courseConfigField?: Array<{
        requirementFieldPerson: number;
        required: boolean;
    }>;

    createdAt: string;
    updatedAt: string;
}

// Helper para configuración por defecto
export const DEFAULT_REGISTRATION_FIELDS: RegistrationFieldConfig[] = [
    // Campos Base (El Backend asume que siempre se envían, no enviar ID en payload)
    { fieldName: 'name', label: 'Nombre', visible: true, required: true },
    { fieldName: 'paternal_lastName', label: 'Primer Apellido', visible: true, required: false }, // No obligatorio según solicitud
    { fieldName: 'maternal_lastName', label: 'Segundo Apellido', visible: true, required: false }, // Base (En tabla Person)
    { fieldName: 'curp', label: 'CURP', visible: true, required: true },

    { fieldName: 'email', label: 'Correo Electrónico', visible: true, required: true, requirementId: 7 },
    // Campos Configurables (Se deben obtener dinámicamente de RequirementsService)
    { fieldName: 'address', label: 'Dirección', visible: true, required: true },
    { fieldName: 'nuc', label: 'NUC', visible: true, required: false },
    { fieldName: 'sex', label: 'Sexo', visible: true, required: true },
    { fieldName: 'phone', label: 'Teléfono', visible: true, required: false },

    // { fieldName: 'license', label: 'Licencia', visible: true, required: false }, // Comentado: No soportado por Backend aún
];
