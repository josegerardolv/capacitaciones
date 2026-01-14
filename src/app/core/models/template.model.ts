// Tipos de elementos disponibles en el editor
export type ElementType = 'text' | 'image' | 'shape' | 'qr' | 'container' | 'background';

// Configuración base de posicionamiento y transformación
export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

// Estilos visuales comunes
export interface VisualStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

// Configuración específica para elementos de texto
export interface TextConfig {
  content: string;
  isDynamic?: boolean;
  variableName?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
}

// Configuración específica para imágenes
export interface ImageConfig {
  src: string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none';
  isDynamic?: boolean;
  variableName?: string;
}

// Configuración específica para formas
export interface ShapeConfig {
  type: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'polygon';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

// Configuración específica para código QR
export interface QRConfig {
  content: string;
  isDynamic?: boolean;
  variableName?: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Elemento genérico del canvas
export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;
  transform: Transform;
  visualStyle?: VisualStyle;
  locked?: boolean;
  visible?: boolean;

  // Configuraciones específicas por tipo
  textConfig?: TextConfig;
  imageConfig?: ImageConfig;
  shapeConfig?: ShapeConfig;
  qrConfig?: QRConfig;
}

// Variable dinámica disponible
export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'image' | 'date' | 'number' | 'qr';
  defaultValue?: string;
  required?: boolean;
  /** Icono Material Symbols para mostrar en UI */
  icon?: string;
  /** Categoría para agrupar variables */
  category?: 'participante' | 'curso' | 'institucion' | 'media' | 'otro';
  /** Descripción corta para mostrar en tooltip */
  description?: string;
}

// Configuración de página
export interface PageConfig {
  width: number;  // en mm
  height: number; // en mm
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundFit?: 'cover' | 'contain' | 'fill';
}

// Template/Layout completo
export interface CertificateTemplate {
  id: number;
  name: string;
  claveConcepto: string;
  conceptId?: number;
  conceptName?: string;
  conceptClave?: string;
  conceptCosto?: number;
  description?: string;
  category?: string;
  pageConfig: PageConfig;
  elements: CanvasElement[];
  variables: TemplateVariable[];
  thumbnail?: string;
  /** 
   * Conteo de certificados que han sido oficialmente 'Entregados'.
   * No debe contar borradores ni pendientes de aprobación.
   */
  usageCount?: number;
  created_at?: string;
  updated_at?: string;
}

// Datos para generar un certificado desde un template
export interface CertificateData {
  templateId: number;
  variables: { [key: string]: any };
}

// Certificado generado
// Concept Interface (Merged to reduce files)
export interface Concept {
  id: number;
  concepto: string;
  clave: string;
  costo: number;
  deprecated: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GeneratedCertificate {
  id: number;
  templateId: number;
  templateName: string;
  recipientName?: string;
  data: { [key: string]: any };
  pdfUrl?: string;
  // Estado del proceso de certificación
  status: 'Pendiente' | 'Aprobado' | 'Impreso' | 'Entregado';
  generatedAt: string;
  deliveredAt?: string; // Fecha de entrega real
}
