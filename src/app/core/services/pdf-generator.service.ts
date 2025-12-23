import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { 
    CertificateTemplate, 
    CanvasElement, 
    PageConfig,
    TemplateVariable 
} from '../models/template.model';

/**
 * Configuración de entrada para la generación de PDF
 */
export interface PDFGeneratorInput {
    /** Configuración de la página (tamaño, orientación, márgenes) */
    pageConfig: PageConfig;
    /** Lista de elementos del template */
    elements: CanvasElement[];
    /** Imagen de fondo (base64 o URL) */
    backgroundImage?: string;
    /** Variables con sus valores para sustitución */
    variables?: Record<string, string>;
    /** DPI para conversión (default: 96) */
    dpi?: number;
}

/**
 * Opciones de salida del PDF
 */
export interface PDFOutputOptions {
    /** Nombre del archivo (sin extensión) */
    filename?: string;
    /** Acción: 'blob' retorna Blob, 'download' descarga, 'preview' abre en nueva pestaña */
    action?: 'blob' | 'download' | 'preview';
    /** Calidad de imagen (0-1, default: 0.92) */
    imageQuality?: number;
}

/**
 * Resultado de la generación de PDF
 */
export interface PDFGeneratorResult {
    success: boolean;
    blob?: Blob;
    dataUrl?: string;
    error?: string;
}

/**
 * Servicio reutilizable para generación de PDFs
 * 
 * Este servicio está diseñado para ser utilizado en:
 * - Previsualización en el editor de templates
 * - Generación de certificados/tarjetones en producción
 * - Generación masiva de documentos
 * 
 * @example
 * ```typescript
 * const result = await this.pdfGenerator.generateFromCanvas(fabricCanvas, {
 *   pageConfig: { width: 210, height: 297, orientation: 'landscape', margins: {...} },
 *   elements: [...],
 *   variables: { nombre: 'Juan Pérez', fecha: '2025-01-01' }
 * });
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class PDFGeneratorService {
    private readonly DEFAULT_DPI = 96;
    private readonly MM_TO_INCH = 25.4;

    constructor() {}

    /**
     * Genera un PDF directamente desde un canvas de Fabric.js
     * Este es el método principal para el editor de templates
     */
    async generateFromFabricCanvas(
        canvas: any, // fabric.Canvas
        input: PDFGeneratorInput,
        options: PDFOutputOptions = {}
    ): Promise<PDFGeneratorResult> {
        try {
            const { pageConfig, variables = {} } = input;
            const dpi = input.dpi || this.DEFAULT_DPI;

            // Calcular dimensiones en mm
            let widthMm = pageConfig.width;
            let heightMm = pageConfig.height;

            // Aplicar orientación
            if (pageConfig.orientation === 'landscape' && widthMm < heightMm) {
                [widthMm, heightMm] = [heightMm, widthMm];
            } else if (pageConfig.orientation === 'portrait' && widthMm > heightMm) {
                [widthMm, heightMm] = [heightMm, widthMm];
            }

            // Crear PDF con dimensiones correctas
            const pdf = new jsPDF({
                orientation: pageConfig.orientation,
                unit: 'mm',
                format: [widthMm, heightMm]
            });

            // Obtener imagen del canvas
            const canvasDataUrl = canvas.toDataURL({
                format: 'png',
                quality: options.imageQuality || 0.92,
                multiplier: 2 // Alta resolución para impresión
            });

            // Agregar imagen al PDF (cubre toda la página)
            pdf.addImage(canvasDataUrl, 'PNG', 0, 0, widthMm, heightMm);

            // Generar resultado según la acción
            return this.processOutput(pdf, options);
        } catch (error: any) {
            console.error('Error generating PDF from canvas:', error);
            return {
                success: false,
                error: error.message || 'Error al generar el PDF'
            };
        }
    }

    /**
     * Genera un PDF desde un template y datos de variables
     * Este método es para producción/generación masiva
     */
    async generateFromTemplate(
        template: CertificateTemplate,
        variableValues: Record<string, string>,
        options: PDFOutputOptions = {}
    ): Promise<PDFGeneratorResult> {
        try {
            const { pageConfig, elements } = template;
            
            // Calcular dimensiones
            let widthMm = pageConfig.width;
            let heightMm = pageConfig.height;

            if (pageConfig.orientation === 'landscape' && widthMm < heightMm) {
                [widthMm, heightMm] = [heightMm, widthMm];
            } else if (pageConfig.orientation === 'portrait' && widthMm > heightMm) {
                [widthMm, heightMm] = [heightMm, widthMm];
            }

            // Crear PDF
            const pdf = new jsPDF({
                orientation: pageConfig.orientation,
                unit: 'mm',
                format: [widthMm, heightMm]
            });

            // Factor de conversión px -> mm
            const pxToMm = (px: number) => (px / this.DEFAULT_DPI) * this.MM_TO_INCH;

            // Agregar fondo si existe
            if (pageConfig.backgroundImage) {
                try {
                    pdf.addImage(pageConfig.backgroundImage, 'PNG', 0, 0, widthMm, heightMm);
                } catch (e) {
                    console.warn('No se pudo agregar imagen de fondo:', e);
                }
            }

            // Ordenar elementos por zIndex
            const sortedElements = [...elements].sort((a, b) => 
                (a.transform.zIndex || 0) - (b.transform.zIndex || 0)
            );

            // Renderizar cada elemento
            for (const element of sortedElements) {
                if (element.visible === false) continue;

                const x = pxToMm(element.transform.x);
                const y = pxToMm(element.transform.y);
                const width = pxToMm(element.transform.width);
                const height = pxToMm(element.transform.height);

                switch (element.type) {
                    case 'text':
                        await this.renderTextElement(pdf, element, variableValues, x, y, width);
                        break;
                    case 'image':
                        await this.renderImageElement(pdf, element, variableValues, x, y, width, height);
                        break;
                    case 'shape':
                        this.renderShapeElement(pdf, element, x, y, width, height);
                        break;
                    case 'qr':
                        await this.renderQRElement(pdf, element, variableValues, x, y, width, height);
                        break;
                }
            }

            return this.processOutput(pdf, options);
        } catch (error: any) {
            console.error('Error generating PDF from template:', error);
            return {
                success: false,
                error: error.message || 'Error al generar el PDF'
            };
        }
    }

    /**
     * Procesa la salida del PDF según las opciones
     */
    private processOutput(pdf: jsPDF, options: PDFOutputOptions): PDFGeneratorResult {
        const { filename = 'documento', action = 'blob' } = options;

        const blob = pdf.output('blob');
        const dataUrl = pdf.output('dataurlstring');

        switch (action) {
            case 'download':
                pdf.save(`${filename}.pdf`);
                return { success: true, blob, dataUrl };
            
            case 'preview':
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                return { success: true, blob, dataUrl };
            
            case 'blob':
            default:
                return { success: true, blob, dataUrl };
        }
    }

    /**
     * Renderiza un elemento de texto
     */
    private async renderTextElement(
        pdf: jsPDF,
        element: CanvasElement,
        variables: Record<string, string>,
        x: number,
        y: number,
        width: number
    ): Promise<void> {
        const config = element.textConfig;
        if (!config) return;

        let text = config.content || '';

        // Sustituir variables dinámicas
        if (config.isDynamic && config.variableName) {
            text = variables[config.variableName] || text;
        }

        // Sustituir todas las variables en formato {{variable}}
        text = this.substituteVariables(text, variables);

        // Configurar fuente
        const fontSize = config.fontSize || 12;
        const fontFamily = this.mapFontFamily(config.fontFamily || 'Helvetica');
        const fontStyle = this.mapFontStyle(config.fontWeight, config.fontStyle);

        pdf.setFont(fontFamily, fontStyle);
        pdf.setFontSize(fontSize * 0.75); // Ajuste para mm
        pdf.setTextColor(config.color || '#000000');

        // Alineación
        const align = config.textAlign || 'left';
        let textX = x;
        if (align === 'center') textX = x + width / 2;
        if (align === 'right') textX = x + width;

        // Renderizar texto con soporte multilínea
        const lines = pdf.splitTextToSize(text, width);
        pdf.text(lines, textX, y + (fontSize * 0.35), { align: align as any });
    }

    /**
     * Renderiza un elemento de imagen
     */
    private async renderImageElement(
        pdf: jsPDF,
        element: CanvasElement,
        variables: Record<string, string>,
        x: number,
        y: number,
        width: number,
        height: number
    ): Promise<void> {
        const config = element.imageConfig;
        if (!config) return;

        let imageSrc = config.src;

        // Sustituir variable si es dinámica
        if (config.isDynamic && config.variableName) {
            imageSrc = variables[config.variableName] || imageSrc;
        }

        if (!imageSrc) return;

        try {
            pdf.addImage(imageSrc, 'PNG', x, y, width, height);
        } catch (e) {
            console.warn('No se pudo agregar imagen:', e);
        }
    }

    /**
     * Renderiza un elemento de forma
     */
    private renderShapeElement(
        pdf: jsPDF,
        element: CanvasElement,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        const config = element.shapeConfig;
        if (!config) return;

        // Configurar colores
        if (config.fill) {
            pdf.setFillColor(config.fill);
        }
        if (config.stroke) {
            pdf.setDrawColor(config.stroke);
        }
        if (config.strokeWidth) {
            pdf.setLineWidth(config.strokeWidth * 0.264583); // px to mm
        }

        const fillStyle = config.fill && config.stroke ? 'FD' : config.fill ? 'F' : 'S';

        switch (config.type) {
            case 'rectangle':
                pdf.rect(x, y, width, height, fillStyle);
                break;
            case 'circle':
                const radius = Math.min(width, height) / 2;
                pdf.circle(x + radius, y + radius, radius, fillStyle);
                break;
            case 'ellipse':
                pdf.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, fillStyle);
                break;
            case 'line':
                pdf.line(x, y, x + width, y + height);
                break;
        }
    }

    /**
     * Renderiza un código QR
     */
    private async renderQRElement(
        pdf: jsPDF,
        element: CanvasElement,
        variables: Record<string, string>,
        x: number,
        y: number,
        width: number,
        height: number
    ): Promise<void> {
        const config = element.qrConfig;
        if (!config) return;

        let content = config.content;

        // Sustituir variable si es dinámica
        if (config.isDynamic && config.variableName) {
            content = variables[config.variableName] || content;
        }

        content = this.substituteVariables(content, variables);

        if (!content) return;

        // Generar QR como imagen
        try {
            const QRCode = (window as any).QRCode;
            if (QRCode) {
                const qrDataUrl = await QRCode.toDataURL(content, {
                    width: 300,
                    margin: 1,
                    color: { dark: '#000000', light: '#ffffff' }
                });
                pdf.addImage(qrDataUrl, 'PNG', x, y, width, height);
            }
        } catch (e) {
            console.warn('No se pudo generar código QR:', e);
        }
    }

    /**
     * Sustituye variables en formato {{variable}} en un texto
     */
    private substituteVariables(text: string, variables: Record<string, string>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return variables[varName] !== undefined ? variables[varName] : match;
        });
    }

    /**
     * Mapea nombres de fuentes a las disponibles en jsPDF
     */
    private mapFontFamily(fontFamily: string): string {
        const fontMap: Record<string, string> = {
            'Montserrat': 'helvetica',
            'Arial': 'helvetica',
            'Times New Roman': 'times',
            'Georgia': 'times',
            'Verdana': 'helvetica',
            'Courier New': 'courier',
            'Palatino Linotype': 'times',
            'Trebuchet MS': 'helvetica'
        };
        return fontMap[fontFamily] || 'helvetica';
    }

    /**
     * Mapea estilos de fuente a los de jsPDF
     */
    private mapFontStyle(fontWeight?: string, fontStyle?: string): string {
        const isBold = fontWeight === 'bold' || fontWeight === '700';
        const isItalic = fontStyle === 'italic';

        if (isBold && isItalic) return 'bolditalic';
        if (isBold) return 'bold';
        if (isItalic) return 'italic';
        return 'normal';
    }

    /**
     * Genera datos de ejemplo para previsualización
     */
    getPreviewVariables(variables: TemplateVariable[]): Record<string, string> {
        const previewData: Record<string, string> = {};
        
        for (const variable of variables) {
            switch (variable.type) {
                case 'text':
                    previewData[variable.name] = variable.defaultValue || `[${variable.label}]`;
                    break;
                case 'date':
                    previewData[variable.name] = variable.defaultValue || new Date().toLocaleDateString('es-MX');
                    break;
                case 'number':
                    previewData[variable.name] = variable.defaultValue || '12345';
                    break;
                case 'image':
                    previewData[variable.name] = variable.defaultValue || '';
                    break;
            }
        }

        // Variables comunes para previsualización
        const commonDefaults: Record<string, string> = {
            nombre: 'Juan Pérez García',
            nombre_completo: 'Juan Pérez García',
            curso: 'Capacitación en Angular',
            fecha: new Date().toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            fecha_emision: new Date().toLocaleDateString('es-MX'),
            folio: 'CERT-2025-00001',
            vigencia: '2 años',
            instructor: 'Lic. María López',
            duracion: '40 horas',
            calificacion: '95',
            institucion: 'Secretaría de Movilidad',
            qr_validacion_api: 'https://validacion.oaxaca.gob.mx/verificar/CERT-2025-00001',
            imagen_api: 'https://via.placeholder.com/150'
        };

        return { ...commonDefaults, ...previewData };
    }
}
