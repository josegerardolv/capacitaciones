import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { GalleryModalComponent, GalleryItem } from '../../../../../shared/components/modals/gallery-modal.component';
import { AlertModalComponent, AlertConfig } from '../../../../../shared/components/modals/alert-modal.component';
import * as fabric from 'fabric';

@Component({
    selector: 'app-template-preview-modal',
    standalone: true,
    imports: [CommonModule, GalleryModalComponent, AlertModalComponent],
    templateUrl: './template-preview-modal.component.html'
})
export class TemplatePreviewModalComponent implements OnChanges, AfterViewInit, OnDestroy {
    @Input() isOpen = false;
    @Input() template: any = null;
    @Output() close = new EventEmitter<void>();
    @ViewChild('previewCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private canvas?: fabric.StaticCanvas;
    isGenerating = false;
    galleryItems: GalleryItem[] = [];

    showAlert = false;
    alertConfig: AlertConfig = {
        title: 'Diseño no encontrado',
        message: 'Este formato documental aún no tiene un diseño visual configurado. Por favor, edita la plantilla primero.',
        type: 'info',
        showIcon: false,
        actions: [{ label: 'Entendido', variant: 'primary' }]
    };

    // Dimensiones originales
    private originalWidth = 1122; // A4 landscape por defecto
    private originalHeight = 794;

    constructor() { }

    ngAfterViewInit() {
        if (this.isOpen && this.template) {
            this.initCanvas();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && this.isOpen) {
            this.galleryItems = [];
            this.showAlert = false;
            setTimeout(() => this.initCanvas(), 100);
        } else if (changes['isOpen'] && !this.isOpen) {
            this.destroyCanvas();
            this.galleryItems = [];
            this.showAlert = false;
        }

        if (changes['template'] && this.template && this.canvas) {
            this.generatePreview();
        }
    }

    ngOnDestroy() {
        this.destroyCanvas();
    }

    private destroyCanvas() {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = undefined;
        }
    }

    private initCanvas() {
        if (!this.canvasRef || this.canvas) return;

        this.canvas = new fabric.StaticCanvas(this.canvasRef.nativeElement, {
            backgroundColor: '#ffffff',
            selection: false,
            renderOnAddRemove: false
        });

        if (this.template) {
            this.generatePreview();
        }
    }

    private async generatePreview() {
        this.isGenerating = true;
        if (!this.canvas) return;

        this.canvas.clear();

        try {
            let design = null;
            const sourceTemplate = this.template.templateDocument || this.template;

            if (sourceTemplate.fields) {
                if (Array.isArray(sourceTemplate.fields) && sourceTemplate.fields.length > 0) {
                    design = JSON.parse(sourceTemplate.fields[0]);
                } else if (typeof sourceTemplate.fields === 'string') {
                    design = JSON.parse(sourceTemplate.fields);
                }
            } else if (this.template.elements || this.template.pageConfig) {
                design = this.template; // Ya está parseado
            }

            if (!design || !design.pageConfig) {
                this.isGenerating = false;
                this.showAlert = true;
                return;
            }

            // Dimensiones
            this.originalWidth = this.mmToPx(design.pageConfig.width || 297);
            this.originalHeight = this.mmToPx(design.pageConfig.height || 210);

            this.canvas.setWidth(this.originalWidth);
            this.canvas.setHeight(this.originalHeight);

            // Fondo de la página
            this.canvas.backgroundColor = design.pageConfig.backgroundColor || '#ffffff';

            let backgroundImg = design.pageConfig.backgroundImage;
            if (backgroundImg) {
                if (backgroundImg.startsWith('/uploads/')) {
                    backgroundImg = `${environment.apiUrl}${backgroundImg}`;
                }

                await new Promise<void>((resolve) => {
                    fabric.FabricImage.fromURL(backgroundImg, { crossOrigin: 'anonymous' }).then((img) => {
                        const fit = design.pageConfig.backgroundFit || 'cover';
                        const imgWidth = img.width || 1;
                        const imgHeight = img.height || 1;

                        const scaleX = this.originalWidth / imgWidth;
                        const scaleY = this.originalHeight / imgHeight;

                        if (fit === 'cover') {
                            const scale = Math.max(scaleX, scaleY);
                            img.scale(scale);
                            img.left = (this.originalWidth - imgWidth * scale) / 2;
                            img.top = (this.originalHeight - imgHeight * scale) / 2;
                        } else if (fit === 'contain') {
                            const scale = Math.min(scaleX, scaleY);
                            img.scale(scale);
                            img.left = (this.originalWidth - imgWidth * scale) / 2;
                            img.top = (this.originalHeight - imgHeight * scale) / 2;
                        } else if (fit === 'fill') {
                            img.scaleX = scaleX;
                            img.scaleY = scaleY;
                            img.left = 0;
                            img.top = 0;
                        }

                        if (this.canvas) {
                            this.canvas.backgroundImage = img;
                        }
                        resolve();
                    }).catch(() => resolve());
                });
            }

            if (design.elements && design.elements.length > 0) {
                await this.renderElements(design.elements);
            }

            this.canvas.renderAll();

            // Exportar a imagen de alta resolución para Gallery Modal
            const dataUrl = this.canvas.toDataURL({ format: 'png', multiplier: 1.5 });
            this.galleryItems = [{
                id: 'preview',
                src: dataUrl,
                title: this.template.name,
                description: this.template.description || 'Vista Previa de Formato'
            }];

        } catch (e) {
            console.error('Error visualizando template (Fabric):', e);
        } finally {
            this.isGenerating = false;
        }
    }

    private async renderElements(elements: any[]): Promise<void> {
        if (!this.canvas) return;

        // Clasificamos y convertimos cada elemento a su respectivo Fabric object
        for (const el of elements) {
            if (el.visible === false) continue;

            let obj: fabric.FabricObject | null = null;

            switch (el.type) {
                case 'text':
                    obj = this.createTextObject(el);
                    break;
                case 'shape':
                    obj = this.createShapeObject(el);
                    break;
                case 'image':
                    obj = await this.createImageObject(el);
                    break;
                case 'qr':
                    obj = await this.createQRObject(el);
                    break;
            }

            if (obj && this.canvas) {
                this.canvas.add(obj);
            }
        }
    }

    private createTextObject(element: any): fabric.Textbox {
        const config = element.textConfig || {};
        const content = config.isDynamic && config.variableName ? `{{${config.variableName}}}` : (config.content || 'Texto');

        const textbox = new fabric.Textbox(content, {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            fontSize: config.fontSize || 16,
            fontFamily: config.fontFamily || 'Montserrat',
            fontWeight: config.fontWeight || 'normal',
            fontStyle: config.fontStyle || 'normal',
            lineHeight: config.lineHeight || 1.2,
            charSpacing: config.letterSpacing || 0,
            fill: config.color || '#000000',
            textAlign: config.textAlign || 'left',
            selectable: false,
            evented: false,
        });

        if (element.visualStyle?.opacity != null) {
            textbox.opacity = element.visualStyle.opacity / 100;
        }

        return textbox;
    }

    private createShapeObject(element: any): fabric.FabricObject {
        const config = element.shapeConfig || {};
        const baseConfig = {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            height: element.transform.height,
            fill: config.fill || '#E5E7EB',
            stroke: config.stroke || '#6B7280',
            strokeWidth: config.strokeWidth || 2,
            selectable: false,
            evented: false,
        };

        let shape: fabric.FabricObject;

        switch (config.type) {
            case 'circle': {
                const radius = Math.min(element.transform.width, element.transform.height) / 2;
                shape = new fabric.Circle({
                    ...baseConfig,
                    radius
                });
                shape.scaleX = element.transform.width / (2 * radius);
                shape.scaleY = element.transform.height / (2 * radius);
                break;
            }
            case 'ellipse':
                shape = new fabric.Ellipse({
                    ...baseConfig,
                    rx: element.transform.width / 2,
                    ry: element.transform.height / 2,
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle(baseConfig);
                break;
            case 'line': {
                const lineLength = Math.max(element.transform.width, 1);
                shape = new fabric.Line([0, 0, lineLength, 0], {
                    left: element.transform.x,
                    top: element.transform.y,
                    stroke: config.stroke || '#6B7280',
                    strokeWidth: config.strokeWidth || 2,
                    selectable: false,
                    evented: false
                });
                shape.scaleX = element.transform.width / lineLength;
                break;
            }
            default: // rectangle y fallback
                shape = new fabric.Rect(baseConfig);
                if (config.borderRadius && shape instanceof fabric.Rect) {
                    shape.set('rx', config.borderRadius);
                    shape.set('ry', config.borderRadius);
                }
                break;
        }

        if (element.visualStyle?.opacity != null) {
            shape.opacity = element.visualStyle.opacity / 100;
        }

        if (config.strokeDashArray && config.strokeDashArray !== 'solid') {
            const dashPatterns: any = { dashed: [10, 5], dotted: [2, 4], dashdot: [10, 5, 2, 5] };
            shape.set('strokeDashArray', dashPatterns[config.strokeDashArray] || null);
        }

        return shape;
    }

    private async createImageObject(element: any): Promise<fabric.FabricObject | null> {
        return new Promise((resolve) => {
            const isDynamic = element.imageConfig?.isDynamic || false;
            let src = element.imageConfig?.src;

            // Mostrar el nombre de variable directo en SVG si es dinámico, igual que en Editor
            if (!src || isDynamic) {
                const text = isDynamic ? `{ {${element.imageConfig?.variableName || 'imagen'} } } ` : 'Imagen vacía';
                const svgContent = `< svg xmlns = "http://www.w3.org/2000/svg" width = "${element.transform.width}" height = "${element.transform.height}" > <rect width="100%" height = "100%" fill = "#E5E7EB" /> <text x="50%" y = "50%" dominant - baseline="middle" text - anchor="middle" font - family="sans-serif" font - size="20" fill = "#6B7280" > ${text} </text></svg > `;
                const placeholderDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

                fabric.FabricImage.fromURL(placeholderDataUrl).then((img) => {
                    img.set({
                        left: element.transform.x,
                        top: element.transform.y,
                        selectable: false,
                        evented: false
                    });

                    if (element.visualStyle?.opacity != null) {
                        img.opacity = element.visualStyle.opacity / 100;
                    }
                    resolve(img);
                }).catch(() => resolve(null));
                return;
            }

            if (src && src.startsWith('/uploads/')) {
                src = `${environment.apiUrl}${src} `;
            }

            fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
                const savedW = element.transform.width;
                const savedH = element.transform.height;

                img.set({
                    left: element.transform.x,
                    top: element.transform.y,
                    scaleX: savedW / (img.width || 1),
                    scaleY: savedH / (img.height || 1),
                    selectable: false,
                    evented: false
                });

                if (element.visualStyle?.opacity != null) {
                    img.opacity = element.visualStyle.opacity / 100;
                }

                resolve(img);
            }).catch(() => resolve(null));
        });
    }

    private async createQRObject(element: any): Promise<fabric.FabricObject | null> {
        return new Promise((resolve) => {
            const svgContent = `< svg xmlns = "http://www.w3.org/2000/svg" width = "${element.transform.width}" height = "${element.transform.height}" > <rect width="100%" height = "100%" fill = "#E5E7EB" /> <text x="50%" y = "50%" dominant - baseline="middle" text - anchor="middle" font - family="sans-serif" font - size="20" font - weight="bold" fill = "#6B7280" > QR < /text></svg > `;
            const placeholderDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

            fabric.FabricImage.fromURL(placeholderDataUrl).then((img) => {
                img.set({
                    left: element.transform.x,
                    top: element.transform.y,
                    selectable: false,
                    evented: false
                });

                if (element.visualStyle?.opacity != null) {
                    img.opacity = element.visualStyle.opacity / 100;
                }
                resolve(img);
            }).catch(() => resolve(null));
        });
    }

    private mmToPx(mm: number): number {
        return Math.floor((mm * 96) / 25.4);
    }

    onClose() {
        this.close.emit();
    }
}
