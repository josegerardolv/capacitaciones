import { REQUIREMENT_FIELD_NAMES } from '../constants/requirement-names.constants';

export interface RegistrationFieldConfig {
    fieldName: string; // 'license', 'nuc', 'curp', 'address', 'phone', 'email', 'sex', 'name', 'paternal_lastName', 'maternal_lastName'
    label: string;
    visible: boolean;
    required: boolean;
    requirementId?: number; // ID del Backend para requirementFieldPerson
    courseConfigFieldId?: number; // ID de la instancia de configuración en el curso
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
    status?: 'Activo' | 'Inactivo';
    isActive?: boolean;
    type?: string; // ej. 'Taller', 'Diplomado' (Mapeado desde category en frontend)
    paymentType: 'Gratuito' | 'De Paga'; // Para mostrar en la tabla como en la imagen ('Gratuito'/'De Paga')

    // Configuración del Formulario de Registro
    registrationFields: RegistrationFieldConfig[];

    // Configuración de Documentos Disponibles (Constancias)
    availableDocuments: DocumentConfig[];

    // Nuevo formato de configuración del Backend
    courseConfigField?: Array<{
        id: number;
        requirementFieldPerson: number | { id: number; fieldName: string };
        required: boolean;
    }>;

    // Vínculo con templates (Nuevo formato Backend)
    documentCourse?: Array<{
        id?: number;
        templateDocument: number;
        isRequired: boolean;
        isActive?: boolean;
    }>;

    // Variante plural observada en algunos endpoints y con objetos anidados
    documentCourses?: Array<{
        id?: number;
        templateDocument: number | { id: number; name: string };
        isRequired: boolean;
        isActive?: boolean;
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

    { fieldName: 'email', label: REQUIREMENT_FIELD_NAMES.EMAIL, visible: true, required: true },
    { fieldName: 'phone', label: REQUIREMENT_FIELD_NAMES.PHONE, visible: true, required: false },
    { fieldName: 'address', label: REQUIREMENT_FIELD_NAMES.ADDRESS, visible: false, required: false },
    { fieldName: 'nuc', label: REQUIREMENT_FIELD_NAMES.NUC, visible: false, required: false },
    { fieldName: 'license', label: REQUIREMENT_FIELD_NAMES.LICENSE, visible: false, required: false },
    { fieldName: 'sex', label: REQUIREMENT_FIELD_NAMES.SEX, visible: false, required: false },
];
