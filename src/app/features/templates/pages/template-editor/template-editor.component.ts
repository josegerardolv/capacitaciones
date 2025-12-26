import { 
    Component, 
    OnInit, 
    ViewChild, 
    ElementRef, 
    AfterViewInit, 
    OnDestroy,
    HostListener,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TemplateService } from '../../services/template.service';
import { CertificateTemplate } from '../../../../core/models/template.model';
import { CanvasElement, ElementType, TemplateVariable, PageConfig } from '../../../../core/models/template.model';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { PDFGeneratorService, PDFGeneratorInput } from '../../../../core/services/pdf-generator.service';
import { InputEnhancedComponent } from '../../../../shared/components/inputs/input-enhanced.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/inputs/select.component';
import * as fabric from 'fabric';

// Tipos para propiedades personalizadas de Fabric
interface CustomFabricObject extends fabric.FabricObject {
    elementId?: string;
    elementType?: ElementType;
    elementName?: string;
    variableName?: string;
    isDynamic?: boolean;
    // Image specific
    imageFit?: 'contain' | 'cover' | 'fill';
    // QR specific
    qrContent?: string;
    qrSize?: number;
}

@Component({
    selector: 'app-template-editor',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InstitutionalButtonComponent,
        InputEnhancedComponent,
        SelectComponent
    ],
    templateUrl: './template-editor.component.html',
    styleUrls: ['./template-editor.component.css']
})
export class TemplateEditorComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('fabricCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasScrollContainer', { static: false }) canvasScrollRef!: ElementRef<HTMLDivElement>;
    
    // Document / Template state
    documentId: number | null = null;
    // Usamos directamente plantillas (templates)
    template: CertificateTemplate | null = null;
    
    // Fabric.js canvas
    private canvas!: fabric.Canvas;
    private isCanvasInitialized = false;
    
    // Canvas dimensions (modifiable for page configuration)
    canvasWidth = 1122;
    canvasHeight = 794;
    readonly displayDpi = 96; // DPI for mm to px conversion
    
    // Margin guides
    private marginGuides: fabric.FabricObject[] = [];
    
    // Grid
    private gridLines: fabric.FabricObject[] = [];
    showGrid = false;
    gridSize = 20; // pixels
    snapToGrid = false; // snap elements to grid when moving
    
    // Pan mode (navigation) - moves the scroll container, not the canvas content
    isPanMode = false;
    private isPanning = false;
    private lastPanPoint = { x: 0, y: 0 }; // client coordinates for scroll panning
    
    // Smart alignment guides
    private alignmentGuides: fabric.Line[] = [];
    showSmartGuides = true;
    snapThreshold = 8; // pixels for snapping
    
    // Standard page sizes (in mm)
    readonly standardPageSizes: Record<string, { width: number; height: number }> = {
        'A4': { width: 210, height: 297 },
        'Letter': { width: 216, height: 279 },
        'Legal': { width: 216, height: 356 },
        'A5': { width: 148, height: 210 },
        'A3': { width: 297, height: 420 }
    };
    
    // Background
    backgroundImageSrc: string = '';
    backgroundFit: 'cover' | 'contain' | 'fill' = 'cover';
    
    // UI state
    showToolPanel = true;
    showPropertiesPanel = true;
    isSaving = false;
    activeTab: 'page' | 'elements' | 'variables' | 'layers' = 'elements';
    
    // Variables search and filter
    variableSearchTerm = '';
    selectedVariableCategory: 'all' | 'participante' | 'curso' | 'institucion' | 'media' | 'otro' = 'all';
    filteredVariables: TemplateVariable[] = [];
    
    // PDF Preview
    showPDFPreview = false;
    isGeneratingPDF = false;
    pdfPreviewUrl: SafeResourceUrl | null = null;
    private pdfBlob: Blob | null = null;
    
    // Selection
    selectedObject: CustomFabricObject | null = null;
    private _pageSettingsSub?: Subscription;

    // Contadores para nombres consecutivos de elementos
    private elementCounters: Record<string, number> = {
        texto: 0,
        titulo: 0,
        imagen: 0,
        qr: 0,
        rectangulo: 0,
        circulo: 0,
        elipse: 0,
        triangulo: 0,
        linea: 0,
        flecha: 0,
        rombo: 0,
        estrella: 0,
        pentagono: 0,
        hexagono: 0
    };
    
    // Panel resizing
    leftPanelWidth = 300;
    rightPanelWidth = 320;
    private isResizingSidebar = false;
    private resizingSide: 'left' | 'right' | null = null;
    private sidebarStartX = 0;
    private sidebarStartWidth = 0;
    
    // Zoom
    zoomLevel = 100;
    readonly zoomLevels = [25, 50, 75, 100, 125, 150, 200];
    
    // History (undo/redo)
    private history: string[] = [];
    private historyIndex = -1;
    private isHistoryAction = false;
    
    // Clipboard
    private clipboard: fabric.FabricObject | null = null;
    
    // Color palettes (institutional colors)
    readonly institutionalColors = [
        '#8B1538', '#6B1028', '#A61E42', // Guinda
        '#D63384', '#B02A57', '#E85AA0', // Rosa
        '#722F37', '#5A252A', '#8F3C45', // Vino
        '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'
    ];
    
    // Font families
    readonly fontFamilies = [
        'Montserrat',
        'Arial',
        'Times New Roman',
        'Georgia',
        'Verdana',
        'Courier New',
        'Palatino Linotype',
        'Trebuchet MS'
    ];
    
    // Font sizes
    readonly fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

    // Select options for enhanced components
    readonly pageSizeOptions: SelectOption[] = [
        { value: 'A4', label: 'A4 (210 × 297 mm)' },
        { value: 'Letter', label: 'Carta (216 × 279 mm)' },
        { value: 'Legal', label: 'Oficio (216 × 356 mm)' },
        { value: 'A5', label: 'A5 (148 × 210 mm)' },
        { value: 'A3', label: 'A3 (297 × 420 mm)' },
        { value: 'Custom', label: 'Personalizado' }
    ];

    readonly gridSizeOptions: SelectOption[] = [
        { value: 10, label: '10 px' },
        { value: 20, label: '20 px' },
        { value: 25, label: '25 px' },
        { value: 50, label: '50 px' },
        { value: 100, label: '100 px' }
    ];

    readonly fontFamilyOptions: SelectOption[] = this.fontFamilies.map(f => ({ value: f, label: f }));
    readonly fontSizeOptions: SelectOption[] = this.fontSizes.map(s => ({ value: s, label: `${s}px` }));
    
    // FormControl for grid size (used with app-select outside of form groups)
    gridSizeControl = new FormControl(20);
    
    // Forms
    documentForm: FormGroup;
    elementPropertiesForm: FormGroup;
    pageSettingsForm: FormGroup;
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private templateService: TemplateService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private pdfGenerator: PDFGeneratorService,
        private sanitizer: DomSanitizer
    ) {
        this.documentForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
        
        this.elementPropertiesForm = this.fb.group({
            // Common properties
            name: [''],
            x: [0],
            y: [0],
            width: [0],
            height: [0],
            rotation: [0],
            opacity: [100],
            locked: [false],
            
            // Text properties
            content: [''],
            fontSize: [16],
            fontFamily: ['Montserrat'],
            fontWeight: ['normal'],
            fontStyle: ['normal'],
            textDecoration: [''],
            color: ['#000000'],
            textAlign: ['left'],
            lineHeight: [1.2],
            charSpacing: [0],
            
            // Shape properties
            fill: ['#E5E7EB'],
            stroke: ['#6B7280'],
            strokeWidth: [2],
            strokeDashArray: ['solid'], // solid, dashed, dotted, dashdot
            borderRadius: [0],
            
            // Transform properties
            flipX: [false],
            flipY: [false],
            
            // Image properties
            imageSrc: [''],
            imageFit: ['contain'],
            
            // QR properties
            qrContent: [''],
            qrSize: [150],
            
            // Variable binding
            isDynamic: [false],
            variableName: ['']
        });
        
        // Page settings form
        this.pageSettingsForm = this.fb.group({
            pageSize: ['A4'],
            orientation: ['landscape'],
            customWidthMm: [210],
            customHeightMm: [297],
            marginTopMm: [10],
            marginBottomMm: [10],
            marginLeftMm: [10],
            marginRightMm: [10],
            showMarginGuides: [true]
        });
    }

    ngOnInit(): void {
        this.documentId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
        if (this.documentId) {
            this.loadDocument(this.documentId);
        }
    }
    
    ngAfterViewInit(): void {
        setTimeout(() => this.initFabricCanvas(), 0);

        // Actualizar guías de margen cuando cambien las configuraciones de página
        this._pageSettingsSub = this.pageSettingsForm.valueChanges.subscribe(() => {
            const show = !!this.pageSettingsForm.get('showMarginGuides')?.value;
            if (show) {
                // Si el canvas aún no está inicializado, drawMarginGuides manejará el caso
                if (this.canvas) this.drawMarginGuides();
            } else {
                if (this.canvas) this.removeMarginGuides();
            }
        });
    }
    
    ngOnDestroy(): void {
        if (this.canvas) {
            this.canvas.dispose();
        }
        this._pageSettingsSub?.unsubscribe();
    }
    
    // ===== KEYBOARD SHORTCUTS =====
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        // Avoid if typing in input/textarea
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }
        
        const isCtrl = event.ctrlKey || event.metaKey;
        
        // Delete
        if (event.key === 'Delete' || event.key === 'Backspace') {
            event.preventDefault();
            this.deleteSelected();
        }
        
        // Escape - deselect
        if (event.key === 'Escape') {
            this.canvas?.discardActiveObject();
            this.canvas?.renderAll();
            this.selectedObject = null;
            this.cdr.detectChanges();
        }
        
        // Ctrl+C - Copy
        if (isCtrl && event.key === 'c') {
            event.preventDefault();
            this.copySelected();
        }
        
        // Ctrl+V - Paste
        if (isCtrl && event.key === 'v') {
            event.preventDefault();
            this.paste();
        }
        
        // Ctrl+X - Cut
        if (isCtrl && event.key === 'x') {
            event.preventDefault();
            this.cutSelected();
        }
        
        // Ctrl+D - Duplicate
        if (isCtrl && event.key === 'd') {
            event.preventDefault();
            this.duplicateSelected();
        }
        
        // Ctrl+Z - Undo
        if (isCtrl && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.undo();
        }
        
        // Ctrl+Shift+Z or Ctrl+Y - Redo
        if ((isCtrl && event.shiftKey && event.key === 'z') || (isCtrl && event.key === 'y')) {
            event.preventDefault();
            this.redo();
        }
        
        // Arrow keys - nudge
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            const activeObject = this.canvas?.getActiveObject();
            if (activeObject) {
                event.preventDefault();
                const nudge = event.shiftKey ? 10 : 1;
                switch (event.key) {
                    case 'ArrowUp': activeObject.top! -= nudge; break;
                    case 'ArrowDown': activeObject.top! += nudge; break;
                    case 'ArrowLeft': activeObject.left! -= nudge; break;
                    case 'ArrowRight': activeObject.left! += nudge; break;
                }
                activeObject.setCoords();
                this.canvas.renderAll();
                this.updatePropertiesFromObject(activeObject as CustomFabricObject);
                this.saveHistory();
            }
        }
    }

    // ===== CANVAS INITIALIZATION =====
    private initFabricCanvas(): void {
        if (!this.canvasRef?.nativeElement) return;
        
        this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
            width: this.canvasWidth,
            height: this.canvasHeight,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true,
            stopContextMenu: true,
            uniformScaling: false
        });
        
        // Configure selection style
        fabric.FabricObject.prototype.set({
            transparentCorners: false,
            cornerColor: '#8B1538',
            cornerStrokeColor: '#ffffff',
            borderColor: '#8B1538',
            cornerSize: 10,
            cornerStyle: 'circle',
            borderScaleFactor: 2,
            padding: 5,
            snapAngle: 15,
            snapThreshold: 10
        });
        
        // Note: Rotation control offset is set per-object in Fabric.js 6.x
        // Setup event listeners
        this.setupCanvasEvents();
        
        this.isCanvasInitialized = true;
        
        // Apply initial page settings and draw margin guides
        this.applyPageSettings();
        
        this.saveHistory();
    }
    
    private setupCanvasEvents(): void {
        // Selection events - wrapped in NgZone.run() for Angular change detection
        this.canvas.on('selection:created', (e) => {
            this.ngZone.run(() => {
                this.onObjectSelected(e.selected?.[0] as CustomFabricObject);
            });
        });
        
        this.canvas.on('selection:updated', (e) => {
            this.ngZone.run(() => {
                this.onObjectSelected(e.selected?.[0] as CustomFabricObject);
            });
        });
        
        this.canvas.on('selection:cleared', () => {
            this.ngZone.run(() => {
                this.selectedObject = null;
                // Hide panel when nothing is selected
                this.showPropertiesPanel = false;
                this.cdr.detectChanges();
            });
        });
        
        // Modification events - wrapped in NgZone for Angular change detection
        this.canvas.on('object:modified', (e) => {
            this.ngZone.run(() => {
                // Enforce margin boundaries after modification
                this.enforceMarginBoundaries(e.target as CustomFabricObject);
                this.updatePropertiesFromObject(e.target as CustomFabricObject);
                this.clearAlignmentGuides();
                this.saveHistory();
            });
        });
        
        this.canvas.on('object:moving', (e) => {
            this.ngZone.run(() => {
                const obj = e.target as CustomFabricObject;
                
                // Snap to grid if enabled
                if (this.snapToGrid && this.showGrid) {
                    this.snapObjectToGrid(obj);
                }
                
                // Show smart alignment guides
                if (this.showSmartGuides) {
                    this.showAlignmentGuides(obj);
                }
                
                // Constrain to margin boundaries during move
                this.constrainToMargins(obj);
                
                this.updatePropertiesFromObject(obj);
            });
        });
        
        this.canvas.on('object:scaling', (e) => {
            this.ngZone.run(() => {
                this.updatePropertiesFromObject(e.target as CustomFabricObject);
            });
        });
        
        this.canvas.on('object:rotating', (e) => {
            this.ngZone.run(() => {
                this.updatePropertiesFromObject(e.target as CustomFabricObject);
            });
        });
        
        // Pan mode events - moves the scroll container, not the canvas viewport
        this.canvas.on('mouse:down', (opt) => {
            if (this.isPanMode) {
                this.isPanning = true;
                this.canvas.selection = false;
                // Use raw client coordinates for scroll-based panning
                const evt = opt.e as MouseEvent;
                this.lastPanPoint = { x: evt.clientX, y: evt.clientY };
                this.canvas.defaultCursor = 'grabbing';
                this.canvas.renderAll();
            }
        });
        
        this.canvas.on('mouse:move', (opt) => {
            if (this.isPanMode && this.isPanning && this.canvasScrollRef?.nativeElement) {
                const evt = opt.e as MouseEvent;
                const container = this.canvasScrollRef.nativeElement;
                
                // Calculate delta and scroll the container
                const deltaX = this.lastPanPoint.x - evt.clientX;
                const deltaY = this.lastPanPoint.y - evt.clientY;
                
                container.scrollLeft += deltaX;
                container.scrollTop += deltaY;
                
                this.lastPanPoint = { x: evt.clientX, y: evt.clientY };
            }
        });
        
        this.canvas.on('mouse:up', () => {
            if (this.isPanMode) {
                this.isPanning = false;
                this.canvas.selection = true;
                this.canvas.defaultCursor = 'grab';
            }
            // Clear alignment guides when mouse is released
            this.clearAlignmentGuides();
        });
        
        // Text editing
        this.canvas.on('text:editing:entered', () => {
            // Text is being edited inline
        });
        
        this.canvas.on('text:editing:exited', () => {
            this.ngZone.run(() => {
                this.saveHistory();
            });
        });
        
        this.canvas.on('text:changed', () => {
            this.ngZone.run(() => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'textbox') {
                    this.elementPropertiesForm.patchValue({
                        content: (activeObject as fabric.Textbox).text
                    }, { emitEvent: false });
                }
            });
        });
    }
    
    private onObjectSelected(obj: CustomFabricObject | undefined): void {
        if (!obj) return;
        
        this.selectedObject = obj;
        this.showPropertiesPanel = true;
        this.updatePropertiesFromObject(obj);
        this.cdr.detectChanges();
    }

    // ===== DOCUMENT LOADING =====
    loadDocument(id: number): void {
        this.templateService.getTemplate(id).subscribe(tpl => {
            if (tpl) {
                this.template = tpl;

                this.documentForm.patchValue({
                    name: tpl.name,
                    description: tpl.description
                });

                // Wait for canvas initialization
                const waitForCanvas = setInterval(() => {
                    if (this.isCanvasInitialized) {
                        clearInterval(waitForCanvas);
                        this.loadTemplateToCanvas();
                    }
                }, 100);
            }
        });
    }
    
    private loadTemplateToCanvas(): void {
        if (!this.template || !this.canvas) return;
        
        // Set background color
        this.canvas.backgroundColor = this.template.pageConfig.backgroundColor || '#ffffff';
        
        // Load background image if exists
        if (this.template.pageConfig.backgroundImage) {
            this.loadBackgroundImage(this.template.pageConfig.backgroundImage, this.template.pageConfig.backgroundFit);
        }
        
        // Load elements
        this.template.elements.forEach(element => {
            this.createFabricObject(element);
        });

        // Initialize filtered variables for search
        this.initFilteredVariables();
        
        this.canvas.renderAll();
        this.saveHistory();
    }
    
    private createFabricObject(element: CanvasElement): void {
        let obj: CustomFabricObject | null = null;
        
        switch (element.type) {
            case 'text':
                obj = this.createTextObject(element);
                break;
            case 'image':
                this.createImageObject(element);
                return; // async
            case 'shape':
                obj = this.createShapeObject(element);
                break;
            case 'qr':
                this.createQRObject(element);
                return; // async
        }
        
        if (obj) {
            obj.elementId = element.id;
            obj.elementType = element.type;
            obj.elementName = element.name;
            this.canvas.add(obj);
        }
    }
    
    private createTextObject(element: CanvasElement): CustomFabricObject {
        const config = element.textConfig;
        const textbox = new fabric.Textbox(config?.content || 'Texto', {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            fontSize: config?.fontSize || 16,
            fontFamily: config?.fontFamily || 'Montserrat',
            fontWeight: config?.fontWeight || 'normal',
            fontStyle: config?.fontStyle as '' | 'italic' | 'normal' | 'oblique' || 'normal',
            fill: config?.color || '#000000',
            textAlign: config?.textAlign || 'left',
            lineHeight: config?.lineHeight || 1.2,
            charSpacing: config?.letterSpacing || 0
        }) as CustomFabricObject;
        
        textbox.elementId = element.id;
        textbox.elementType = 'text';
        textbox.elementName = element.name;
        textbox.isDynamic = config?.isDynamic;
        textbox.variableName = config?.variableName;
        
        return textbox;
    }
    
    private createShapeObject(element: CanvasElement): CustomFabricObject | null {
        const config = element.shapeConfig;
        let shape: CustomFabricObject;
        
        const baseConfig = {
            left: element.transform.x,
            top: element.transform.y,
            width: element.transform.width,
            height: element.transform.height,
            fill: config?.fill || '#E5E7EB',
            stroke: config?.stroke || '#6B7280',
            strokeWidth: config?.strokeWidth || 2
        };
        
        switch (config?.type) {
            case 'rectangle':
                shape = new fabric.Rect(baseConfig) as CustomFabricObject;
                break;
            case 'circle':
                const radius = Math.min(element.transform.width, element.transform.height) / 2;
                shape = new fabric.Circle({
                    ...baseConfig,
                    radius
                }) as CustomFabricObject;
                break;
            case 'ellipse':
                shape = new fabric.Ellipse({
                    ...baseConfig,
                    rx: element.transform.width / 2,
                    ry: element.transform.height / 2
                }) as CustomFabricObject;
                break;
            case 'triangle':
                shape = new fabric.Triangle(baseConfig) as CustomFabricObject;
                break;
            case 'line':
                shape = new fabric.Line([0, 0, element.transform.width, 0], {
                    left: element.transform.x,
                    top: element.transform.y,
                    stroke: config?.stroke || '#6B7280',
                    strokeWidth: config?.strokeWidth || 2
                }) as CustomFabricObject;
                break;
            default:
                shape = new fabric.Rect(baseConfig) as CustomFabricObject;
        }
        
        shape.elementId = element.id;
        shape.elementType = 'shape';
        shape.elementName = element.name;
        
        return shape;
    }
    
    /**
     * Carga un elemento de imagen desde un template existente.
     * Si no tiene src, crea un placeholder visual.
     */
    private createImageObject(element: CanvasElement): void {
        const src = element.imageConfig?.src;
        const isDynamic = element.imageConfig?.isDynamic || false;
        const variableName = element.imageConfig?.variableName || '';
        
        if (!src || isDynamic) {
            // Crear placeholder visual usando el helper
            const placeholderDataUrl = this.generateImagePlaceholder(
                element.transform.width || 200,
                element.transform.height || 132
            );
            
            fabric.FabricImage.fromURL(placeholderDataUrl).then((img) => {
                img.set({
                    left: element.transform.x,
                    top: element.transform.y
                });
                
                const scaleX = (element.transform.width || 200) / (img.width || 1);
                const scaleY = (element.transform.height || 132) / (img.height || 1);
                img.scaleX = scaleX;
                img.scaleY = scaleY;
                
                const customImg = img as CustomFabricObject;
                customImg.elementId = element.id;
                customImg.elementType = 'image';
                customImg.elementName = element.name || 'Imagen';
                customImg.isDynamic = isDynamic;
                customImg.variableName = variableName;
                
                this.canvas.add(customImg);
                this.canvas.renderAll();
            });
            return;
        }
        
        fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
            img.set({
                left: element.transform.x,
                top: element.transform.y
            });
            
            const scaleX = element.transform.width / (img.width || 1);
            const scaleY = element.transform.height / (img.height || 1);
            img.scaleX = scaleX;
            img.scaleY = scaleY;
            
            const customImg = img as CustomFabricObject;
            customImg.elementId = element.id;
            customImg.elementType = 'image';
            customImg.elementName = element.name;
            customImg.isDynamic = false;
            
            this.canvas.add(customImg);
            this.canvas.renderAll();
        }).catch(() => {
            // Fallback a placeholder si falla la carga
            const placeholderDataUrl = this.generateImagePlaceholder(
                element.transform.width || 200,
                element.transform.height || 132
            );
            
            fabric.FabricImage.fromURL(placeholderDataUrl).then((img) => {
                img.set({
                    left: element.transform.x,
                    top: element.transform.y
                });
                
                const customImg = img as CustomFabricObject;
                customImg.elementId = element.id;
                customImg.elementType = 'image';
                customImg.elementName = element.name || 'Imagen';
                
                this.canvas.add(customImg);
                this.canvas.renderAll();
            });
        });
    }
    
    private createQRObject(element: CanvasElement): void {
        const content = element.qrConfig?.content || 'https://example.com';
        const size = element.qrConfig?.size || 150;
        
        // Generate QR using qrcode library
        import('qrcode').then(QRCode => {
            QRCode.toDataURL(content, { 
                width: size,
                margin: 1,
                errorCorrectionLevel: element.qrConfig?.errorCorrectionLevel || 'M'
            }).then((url: string) => {
                fabric.FabricImage.fromURL(url).then((img) => {
                    img.set({
                        left: element.transform.x,
                        top: element.transform.y
                    });
                    
                    const customImg = img as CustomFabricObject;
                    customImg.elementId = element.id;
                    customImg.elementType = 'qr';
                    customImg.elementName = element.name || 'Código QR';
                    customImg.isDynamic = element.qrConfig?.isDynamic;
                    customImg.variableName = element.qrConfig?.variableName;
                    
                    this.canvas.add(customImg);
                    this.canvas.renderAll();
                });
            });
        });
    }

    // ===== BACKGROUND IMAGE =====
    loadBackgroundImage(src: string, fit?: 'cover' | 'contain' | 'fill'): void {
        this.backgroundImageSrc = src;
        this.backgroundFit = fit || 'cover';
        
        fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' }).then((img) => {
            this.applyBackgroundFit(img, this.backgroundFit);
        });
    }
    
    private applyBackgroundFit(img: fabric.FabricImage, fit: 'cover' | 'contain' | 'fill'): void {
        const imgWidth = img.width || 1;
        const imgHeight = img.height || 1;
        
        let scaleX = this.canvasWidth / imgWidth;
        let scaleY = this.canvasHeight / imgHeight;
        
        switch (fit) {
            case 'cover':
                const coverScale = Math.max(scaleX, scaleY);
                img.scaleX = coverScale;
                img.scaleY = coverScale;
                img.left = (this.canvasWidth - imgWidth * coverScale) / 2;
                img.top = (this.canvasHeight - imgHeight * coverScale) / 2;
                break;
            case 'contain':
                const containScale = Math.min(scaleX, scaleY);
                img.scaleX = containScale;
                img.scaleY = containScale;
                img.left = (this.canvasWidth - imgWidth * containScale) / 2;
                img.top = (this.canvasHeight - imgHeight * containScale) / 2;
                break;
            case 'fill':
                img.scaleX = scaleX;
                img.scaleY = scaleY;
                img.left = 0;
                img.top = 0;
                break;
        }
        
        this.canvas.backgroundImage = img;
        this.canvas.renderAll();
    }
    
    onBackgroundImageChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                this.loadBackgroundImage(result, this.backgroundFit);
                
                if (this.template) {
                    this.template.pageConfig.backgroundImage = result;
                }
                this.saveHistory();
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    updateBackgroundFit(fit: 'cover' | 'contain' | 'fill'): void {
        this.backgroundFit = fit;
        if (this.canvas.backgroundImage) {
            this.applyBackgroundFit(this.canvas.backgroundImage as fabric.FabricImage, fit);
        }
        if (this.template) {
            this.template.pageConfig.backgroundFit = fit;
        }
        this.saveHistory();
    }
    
    removeBackgroundImage(): void {
        this.canvas.backgroundImage = undefined;
        this.backgroundImageSrc = '';
        if (this.template) {
            this.template.pageConfig.backgroundImage = undefined;
            this.template.pageConfig.backgroundFit = undefined;
        }
        this.canvas.renderAll();
        this.saveHistory();
    }

    // ===== ADD ELEMENTS =====
    addTextElement(): void {
        const textbox = new fabric.Textbox('Texto de ejemplo', {
            left: 100,
            top: 100,
            width: 250,
            fontSize: 24,
            fontFamily: 'Montserrat',
            fill: '#000000',
            textAlign: 'left'
        }) as CustomFabricObject;
        
        textbox.elementId = `text-${Date.now()}`;
        textbox.elementType = 'text';
        this.elementCounters['texto']++;
        textbox.elementName = `Texto${this.elementCounters['texto']}`;
        
        this.canvas.add(textbox);
        this.canvas.setActiveObject(textbox);
        this.canvas.renderAll();
        this.saveHistory();
    }
    
    addHeadingElement(): void {
        const textbox = new fabric.Textbox('TÍTULO', {
            left: 100,
            top: 100,
            width: 400,
            fontSize: 48,
            fontFamily: 'Montserrat',
            fontWeight: 'bold',
            fill: '#8B1538',
            textAlign: 'center'
        }) as CustomFabricObject;
        
        textbox.elementId = `heading-${Date.now()}`;
        textbox.elementType = 'text';
        this.elementCounters['titulo']++;
        textbox.elementName = `Titulo${this.elementCounters['titulo']}`;
        
        this.canvas.add(textbox);
        this.canvas.setActiveObject(textbox);
        this.canvas.renderAll();
        this.saveHistory();
    }
    




    /**
     * Helper: crea y añade una imagen al canvas a partir de un dataUrl.
     * Opciones: controlan prefijos de nombre/id, contador y escalado.
     */
    private createImageElementFromDataUrl(dataUrl: string, opts?: {
        counterKey?: string,
        namePrefix?: string,
        elementIdPrefix?: string,
        isDynamic?: boolean,
        variableName?: string,
        maxSize?: number
    }): void {
        const counterKey = opts?.counterKey || 'imagen';
        const namePrefix = opts?.namePrefix || 'Imagen';
        const idPrefix = opts?.elementIdPrefix || 'image';
        const isDynamic = !!opts?.isDynamic;

        fabric.FabricImage.fromURL(dataUrl).then((img) => {
            // Optionally scale to a max size
            if (opts?.maxSize && img.width && img.height) {
                const maxSize = opts.maxSize;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                img.scaleX = scale;
                img.scaleY = scale;
            }

            img.left = 100;
            img.top = 100;

            const customImg = img as CustomFabricObject;
            customImg.elementId = `${idPrefix}-${Date.now()}`;
            customImg.elementType = 'image';

            // Name and counter
            this.elementCounters[counterKey] = (this.elementCounters[counterKey] || 0) + 1;
            customImg.elementName = `${namePrefix}${this.elementCounters[counterKey]}`;

            if (isDynamic) {
                customImg.isDynamic = true;
                if (opts?.variableName) customImg.variableName = opts.variableName;
            }

            this.canvas.add(customImg);
            this.canvas.setActiveObject(customImg);
            this.canvas.renderAll();
            this.saveHistory();
        });
    }
    
    addShapeElement(type: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'diamond' | 'star' | 'pentagon' | 'hexagon'): void {
        let shape: CustomFabricObject;
        
        const baseConfig = {
            left: 150,
            top: 150,
            fill: '#E5E7EB',
            stroke: '#8B1538',
            strokeWidth: 2
        };
        
        switch (type) {
            case 'rectangle':
                shape = new fabric.Rect({
                    ...baseConfig,
                    width: 200,
                    height: 100,
                    rx: 0,
                    ry: 0
                }) as CustomFabricObject;
                break;
            case 'circle':
                shape = new fabric.Circle({
                    ...baseConfig,
                    radius: 60
                }) as CustomFabricObject;
                break;
            case 'ellipse':
                shape = new fabric.Ellipse({
                    ...baseConfig,
                    rx: 100,
                    ry: 60
                }) as CustomFabricObject;
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    ...baseConfig,
                    width: 120,
                    height: 100
                }) as CustomFabricObject;
                break;
            case 'line':
                shape = new fabric.Line([0, 0, 200, 0], {
                    left: 150,
                    top: 150,
                    stroke: '#8B1538',
                    strokeWidth: 3
                }) as CustomFabricObject;
                break;
            case 'arrow':
                shape = this.createArrowShape(baseConfig);
                break;
            case 'diamond':
                shape = this.createPolygonShape('diamond', baseConfig);
                break;
            case 'star':
                shape = this.createStarShape(baseConfig);
                break;
            case 'pentagon':
                shape = this.createPolygonShape('pentagon', baseConfig);
                break;
            case 'hexagon':
                shape = this.createPolygonShape('hexagon', baseConfig);
                break;
            default:
                return;
        }
        
        shape.elementId = `shape-${Date.now()}`;
        shape.elementType = 'shape';
        shape.elementName = this.getShapeName(type);
        
        this.canvas.add(shape);
        this.canvas.setActiveObject(shape);
        this.canvas.renderAll();
        this.saveHistory();
    }
    
    private getShapeName(type: string): string {
        const counterKeys: Record<string, string> = {
            'rectangle': 'rectangulo',
            'circle': 'circulo',
            'ellipse': 'elipse',
            'triangle': 'triangulo',
            'line': 'linea',
            'arrow': 'flecha',
            'diamond': 'rombo',
            'star': 'estrella',
            'pentagon': 'pentagono',
            'hexagon': 'hexagono'
        };
        const names: Record<string, string> = {
            'rectangle': 'Rectángulo',
            'circle': 'Círculo',
            'ellipse': 'Elipse',
            'triangle': 'Triángulo',
            'line': 'Línea',
            'arrow': 'Flecha',
            'diamond': 'Rombo',
            'star': 'Estrella',
            'pentagon': 'Pentágono',
            'hexagon': 'Hexágono'
        };
        const key = counterKeys[type] || 'rectangulo';
        this.elementCounters[key]++;
        return `${names[type] || 'Forma'}${this.elementCounters[key]}`;
    }

    /**
     * Crea una flecha delgada compuesta por una línea y una cabeza (triángulo).
     * Se comporta visualmente como una línea con punta de flecha.
     */
    private createArrowShape(baseConfig: any): CustomFabricObject {
        // Dimensiones por defecto
        const length = 220;
        const strokeColor = baseConfig.stroke || '#8B1538';
        const strokeWidth = 2;

        // Línea principal (delgada)
        const line = new fabric.Line([0, 0, length, 0], {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            strokeLineCap: 'round',
            selectable: true,
            originX: 'left',
            originY: 'center'
        });

        // Cabeza de flecha (triángulo) apuntando a la derecha
        const head = new fabric.Triangle({
            width: 14,
            height: 20,
            fill: strokeColor,
            left: length,
            top: 0,
            originX: 'center',
            originY: 'center',
            angle: 90,
            selectable: false
        });

        // Agrupar para comportarse como un solo objeto
        const group = new fabric.Group([line, head], {
            left: baseConfig.left ?? 150,
            top: baseConfig.top ?? 150,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true
        }) as unknown as CustomFabricObject;

        // Mantener metadatos visuales para consistencia
        (group as any).stroke = strokeColor;
        (group as any).strokeWidth = strokeWidth;
        (group as any).fill = '';

        return group;
    }

    /**
     * Crea una estrella de 5 puntas
     */
    private createStarShape(baseConfig: any): CustomFabricObject {
        const points: { x: number; y: number }[] = [];
        const outerRadius = 60;
        const innerRadius = 25;
        const numPoints = 5;
        
        for (let i = 0; i < numPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / numPoints) * i - Math.PI / 2;
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        
        return new fabric.Polygon(points, {
            ...baseConfig,
            originX: 'center',
            originY: 'center'
        }) as CustomFabricObject;
    }

    /**
     * Crea polígonos regulares (rombo, pentágono, hexágono)
     */
    private createPolygonShape(type: 'diamond' | 'pentagon' | 'hexagon', baseConfig: any): CustomFabricObject {
        let points: { x: number; y: number }[] = [];
        
        switch (type) {
            case 'diamond':
                points = [
                    { x: 50, y: 0 },
                    { x: 100, y: 60 },
                    { x: 50, y: 120 },
                    { x: 0, y: 60 }
                ];
                break;
            case 'pentagon':
                points = this.createRegularPolygonPoints(5, 60);
                break;
            case 'hexagon':
                points = this.createRegularPolygonPoints(6, 60);
                break;
        }
        
        return new fabric.Polygon(points, {
            ...baseConfig,
            originX: 'center',
            originY: 'center'
        }) as CustomFabricObject;
    }

    /**
     * Genera los puntos para un polígono regular
     */
    private createRegularPolygonPoints(sides: number, radius: number): { x: number; y: number }[] {
        const points: { x: number; y: number }[] = [];
        const angleStep = (2 * Math.PI) / sides;
        const startAngle = -Math.PI / 2; // Empezar desde arriba
        
        for (let i = 0; i < sides; i++) {
            const angle = startAngle + i * angleStep;
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        }
        
        return points;
    }
    
    addQRElement(): void {
        const qrContent = 'https://oaxaca.gob.mx';
        const size = 150;
        
        import('qrcode').then(QRCode => {
            QRCode.toDataURL(qrContent, { 
                width: size,
                margin: 1,
                errorCorrectionLevel: 'M'
            }).then((url: string) => {
                fabric.FabricImage.fromURL(url).then((img) => {
                    img.set({
                        left: 100,
                        top: 100
                    });
                    
                    const customImg = img as CustomFabricObject;
                    customImg.elementId = `qr-${Date.now()}`;
                    customImg.elementType = 'qr';
                    this.elementCounters['qr']++;
                    customImg.elementName = `CodigoQR${this.elementCounters['qr']}`;
                    
                    this.canvas.add(customImg);
                    this.canvas.setActiveObject(customImg);
                    this.canvas.renderAll();
                    this.saveHistory();
                });
            });
        });
    }

    /**
     * Agrega un elemento de imagen al canvas con placeholder por defecto.
     * Desde el panel de propiedades se puede:
     * - Subir una imagen (modo estático)
     * - Asignar una variable de imagen (modo dinámico)
     * Solo puede usarse UNA de las dos opciones a la vez.
     */
    addImage(): void {
        const placeholder = this.generateImagePlaceholder();
        this.createImageElementFromDataUrl(placeholder, {
            counterKey: 'imagen',
            namePrefix: 'Imagen',
            elementIdPrefix: 'image',
            isDynamic: false
        });
    }

    /**
     * Genera un placeholder visual para imágenes (canvas temporal).
     */
    private generateImagePlaceholder(width = 200, height = 132): string {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Fondo
            ctx.fillStyle = '#F3F4F6';
            ctx.fillRect(0, 0, width, height);
            
            // Borde
            ctx.strokeStyle = '#D1D5DB';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, width - 2, height - 2);
            
            // Icono
            ctx.fillStyle = '#6B7280';
            ctx.font = '40px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🖼️', width / 2, height / 2 - 10);
            
            // Etiqueta
            ctx.font = 'bold 14px Montserrat, sans-serif';
            ctx.fillText('Imagen', width / 2, height / 2 + 30);
        }
        
        return canvas.toDataURL('image/png');
    }

    // ===== ELEMENT ACTIONS =====
    deleteSelected(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.remove(activeObject);
            this.selectedObject = null;
            this.canvas.renderAll();
            this.saveHistory();
        }
    }
    
    duplicateSelected(): void {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        
        activeObject.clone().then((cloned: fabric.FabricObject) => {
            cloned.left = (cloned.left || 0) + 20;
            cloned.top = (cloned.top || 0) + 20;
            
            const customCloned = cloned as CustomFabricObject;
            customCloned.elementId = `${(activeObject as CustomFabricObject).elementType}-${Date.now()}`;
            customCloned.elementType = (activeObject as CustomFabricObject).elementType;
            customCloned.elementName = (activeObject as CustomFabricObject).elementName;
            
            this.canvas.add(customCloned);
            this.canvas.setActiveObject(customCloned);
            this.canvas.renderAll();
            this.saveHistory();
        });
    }
    
    copySelected(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.clone().then((cloned: fabric.FabricObject) => {
                this.clipboard = cloned;
            });
        }
    }
    
    cutSelected(): void {
        this.copySelected();
        this.deleteSelected();
    }
    
    paste(): void {
        if (!this.clipboard) return;
        
        this.clipboard.clone().then((cloned: fabric.FabricObject) => {
            cloned.left = (cloned.left || 0) + 20;
            cloned.top = (cloned.top || 0) + 20;
            
            const customCloned = cloned as CustomFabricObject;
            customCloned.elementId = `element-${Date.now()}`;
            
            this.canvas.add(customCloned);
            this.canvas.setActiveObject(customCloned);
            this.canvas.renderAll();
            this.saveHistory();
        });
    }
    
    lockSelected(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            const isLocked = !activeObject.lockMovementX;
            activeObject.lockMovementX = isLocked;
            activeObject.lockMovementY = isLocked;
            activeObject.lockScalingX = isLocked;
            activeObject.lockScalingY = isLocked;
            activeObject.lockRotation = isLocked;
            activeObject.selectable = !isLocked;
            activeObject.hasControls = !isLocked;
            
            this.elementPropertiesForm.patchValue({ locked: isLocked }, { emitEvent: false });
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    // ===== ALIGNMENT =====
    alignSelected(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        
        const objWidth = activeObject.getScaledWidth();
        const objHeight = activeObject.getScaledHeight();
        
        // Obtener límites de los márgenes
        const bounds = this.getMarginBoundaries();
        const printableWidth = bounds.right - bounds.left;
        const printableHeight = bounds.bottom - bounds.top;
        
        switch (alignment) {
            case 'left':
                activeObject.left = bounds.left;
                break;
            case 'center':
                activeObject.left = bounds.left + (printableWidth - objWidth) / 2;
                break;
            case 'right':
                activeObject.left = bounds.right - objWidth;
                break;
            case 'top':
                activeObject.top = bounds.top;
                break;
            case 'middle':
                activeObject.top = bounds.top + (printableHeight - objHeight) / 2;
                break;
            case 'bottom':
                activeObject.top = bounds.bottom - objHeight;
                break;
        }
        
        activeObject.setCoords();
        this.canvas.renderAll();
        this.updatePropertiesFromObject(activeObject as CustomFabricObject);
        this.saveHistory();
    }

    // ===== LAYER ORDERING =====
    bringToFront(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.bringObjectToFront(activeObject);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }
    
    sendToBack(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.sendObjectToBack(activeObject);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }
    
    bringForward(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.bringObjectForward(activeObject);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }
    
    sendBackward(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.sendObjectBackwards(activeObject);
            this.canvas.renderAll();
            this.saveHistory();
        }
    }

    // ===== TEXT FORMATTING =====
    toggleBold(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            const currentWeight = textbox.fontWeight;
            const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
            
            // Exit editing mode if active
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('fontWeight', newWeight);
            textbox.dirty = true;
            textbox.initDimensions();
            textbox.setCoords();
            
            this.elementPropertiesForm.patchValue({ fontWeight: newWeight }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    toggleItalic(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            const currentStyle = textbox.fontStyle;
            const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
            
            // Exit editing mode if active
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('fontStyle', newStyle);
            textbox.dirty = true;
            textbox.initDimensions();
            textbox.setCoords();
            
            this.elementPropertiesForm.patchValue({ fontStyle: newStyle }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    toggleUnderline(): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            const newUnderline = !textbox.underline;
            
            // Exit editing mode if active
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('underline', newUnderline);
            textbox.dirty = true;
            textbox.initDimensions();
            textbox.setCoords();
            
            this.elementPropertiesForm.patchValue({ 
                textDecoration: newUnderline ? 'underline' : '' 
            }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    setTextAlign(align: 'left' | 'center' | 'right' | 'justify'): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            
            // Store current state
            const currentText = textbox.text || '';
            const wasEditing = textbox.isEditing;
            
            // Exit editing mode if active
            if (wasEditing) {
                textbox.exitEditing();
            }
            
            // Apply new alignment
            textbox.set('textAlign', align);
            
            // Force text re-render by setting dirty flag
            textbox.dirty = true;
            
            // Trigger internal layout recalculation
            textbox.initDimensions();
            textbox.setCoords();
            
            // Update form
            this.elementPropertiesForm.patchValue({ textAlign: align }, { emitEvent: false });
            
            // Force canvas re-render
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    setFontSize(size: number): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('fontSize', size);
            textbox.dirty = true;
            textbox.initDimensions();
            textbox.setCoords();
            
            this.elementPropertiesForm.patchValue({ fontSize: size }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    setFontFamily(family: string): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('fontFamily', family);
            textbox.dirty = true;
            textbox.initDimensions();
            textbox.setCoords();
            
            this.elementPropertiesForm.patchValue({ fontFamily: family }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }
    
    setTextColor(color: string): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            
            if (textbox.isEditing) {
                textbox.exitEditing();
            }
            
            textbox.set('fill', color);
            textbox.dirty = true;
            
            this.elementPropertiesForm.patchValue({ color }, { emitEvent: false });
            this.canvas.requestRenderAll();
            this.saveHistory();
        }
    }

    // ===== VARIABLES =====
    get availableVariables(): TemplateVariable[] {
        return this.template?.variables || [];
    }

    /** Initialize filtered variables when template loads */
    private initFilteredVariables(): void {
        this.filteredVariables = [...this.availableVariables];
    }

    /** Filter variables by search term and category */
    filterVariables(): void {
        let filtered = [...this.availableVariables];

        // Filter by category
        if (this.selectedVariableCategory !== 'all') {
            filtered = filtered.filter(v => v.category === this.selectedVariableCategory);
        }

        // Filter by search term
        if (this.variableSearchTerm.trim()) {
            const term = this.variableSearchTerm.toLowerCase().trim();
            filtered = filtered.filter(v =>
                v.label.toLowerCase().includes(term) ||
                v.name.toLowerCase().includes(term) ||
                (v.description && v.description.toLowerCase().includes(term))
            );
        }

        this.filteredVariables = filtered;
    }

    /** Filter by category button click */
    filterByCategory(category: 'all' | 'participante' | 'curso' | 'institucion' | 'media' | 'otro'): void {
        this.selectedVariableCategory = category;
        this.filterVariables();
    }

    /** Clear variable search */
    clearVariableSearch(): void {
        this.variableSearchTerm = '';
        this.filterVariables();
    }

    /** Check if a variable can be inserted based on selection */
    canInsertVariable(variable: TemplateVariable): boolean {
        const activeObject = this.canvas?.getActiveObject() as CustomFabricObject;
        if (!activeObject) return false;

        // Text variables can be inserted into text elements
        if (variable.type === 'text' || variable.type === 'date' || variable.type === 'number') {
            return activeObject.type === 'textbox';
        }

        // Image variables can be inserted into image placeholders
        if (variable.type === 'image') {
            // Only allow inserting image variable if the image does not already have an uploaded src
            const hasImageSrc = !!this.elementPropertiesForm.get('imageSrc')?.value;
            return activeObject.elementType === 'image' && !hasImageSrc;
        }

        // QR variables can be inserted into QR elements
        if (variable.type === 'qr') {
            return activeObject.elementType === 'qr';
        }

        return false;
    }
    
    insertVariable(variable: TemplateVariable): void {
        const activeObject = this.canvas.getActiveObject() as CustomFabricObject;
        if (!activeObject) return;

        // Handle text/date/number variables -> insert into textbox
        if ((variable.type === 'text' || variable.type === 'date' || variable.type === 'number') && activeObject.type === 'textbox') {
            const textbox = activeObject as fabric.Textbox;
            const varTag = `{{${variable.name}}}`;
            
            const currentText = textbox.text || '';
            if (currentText === 'Texto de ejemplo' || currentText.trim() === '') {
                textbox.text = varTag;
            } else {
                textbox.text = currentText + ' ' + varTag;
            }
            
            activeObject.isDynamic = true;
            activeObject.variableName = variable.name;
            
            this.elementPropertiesForm.patchValue({
                content: textbox.text,
                isDynamic: true,
                variableName: variable.name
            }, { emitEvent: false });
        }

        // Handle image variables -> mark image as dynamic
        if (variable.type === 'image' && activeObject.elementType === 'image') {
            activeObject.isDynamic = true;
            activeObject.variableName = variable.name;
            activeObject.elementName = variable.label;
            // Clear any uploaded image and mark as dynamic (variable)
            this.elementPropertiesForm.patchValue({
                isDynamic: true,
                variableName: variable.name,
                name: variable.label,
                imageSrc: ''
            }, { emitEvent: false });
        }

        // Handle QR variables -> mark QR as dynamic
        if (variable.type === 'qr' && activeObject.elementType === 'qr') {
            activeObject.isDynamic = true;
            activeObject.variableName = variable.name;
            activeObject.elementName = variable.label;
            
            this.elementPropertiesForm.patchValue({
                isDynamic: true,
                variableName: variable.name,
                name: variable.label,
                qrContent: `{{${variable.name}}}`
            }, { emitEvent: false });
        }
        
        this.canvas.renderAll();
        this.saveHistory();
    }

    // ===== PROPERTIES SYNC =====
    private updatePropertiesFromObject(obj: CustomFabricObject): void {
        if (!obj) return;
        
        // Get margin boundaries to constrain displayed values
        const bounds = this.getMarginBoundaries();
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        
        // Constrain displayed position to margin boundaries
        let displayX = Math.round(obj.left || 0);
        let displayY = Math.round(obj.top || 0);
        
        // Only constrain if not a margin guide
        if (!(obj as any).isMarginGuide) {
            displayX = Math.max(bounds.left, Math.min(bounds.right - objWidth, displayX));
            displayY = Math.max(bounds.top, Math.min(bounds.bottom - objHeight, displayY));
        }
        
        const values: any = {
            name: obj.elementName || '',
            x: displayX,
            y: displayY,
            width: Math.round(objWidth),
            height: Math.round(objHeight),
            rotation: Math.round(obj.angle || 0),
            opacity: Math.round((obj.opacity || 1) * 100),
            locked: obj.lockMovementX || false,
            isDynamic: obj.isDynamic || false,
            variableName: obj.variableName || ''
        };
        
        // Text specific
        if (obj.type === 'textbox') {
            const textbox = obj as fabric.Textbox;
            values.content = textbox.text || '';
            values.fontSize = textbox.fontSize || 16;
            values.fontFamily = textbox.fontFamily || 'Montserrat';
            values.fontWeight = textbox.fontWeight || 'normal';
            values.fontStyle = textbox.fontStyle || 'normal';
            values.textDecoration = textbox.underline ? 'underline' : '';
            values.color = textbox.fill as string || '#000000';
            values.textAlign = textbox.textAlign || 'left';
            values.lineHeight = textbox.lineHeight || 1.2;
            values.charSpacing = textbox.charSpacing || 0;
        }
        
        // Shape specific
        if (['rect', 'circle', 'ellipse', 'triangle', 'line', 'polygon'].includes(obj.type || '') || obj.elementType === 'shape') {
            values.fill = obj.fill as string || '#E5E7EB';
            values.stroke = obj.stroke as string || '#6B7280';
            values.strokeWidth = obj.strokeWidth || 2;
            values.strokeDashArray = (obj as any).strokeDashType || 'solid';
            values.flipX = obj.flipX || false;
            values.flipY = obj.flipY || false;
            if (obj.type === 'rect') {
                values.borderRadius = (obj as fabric.Rect).rx || 0;
            }
        }

        // Image specific
        if (obj.elementType === 'image' || obj.type === 'image') {
            const imgObj = obj as fabric.FabricImage;
            values.imageSrc = imgObj.getSrc?.() || '';
            values.imageFit = 'contain'; // Default, could be stored in custom property
        }

        // QR specific
        if (obj.elementType === 'qr') {
            values.qrContent = obj.variableName ? `{{${obj.variableName}}}` : 'https://example.com';
            values.qrSize = Math.round(obj.getScaledWidth());
            values.isDynamic = obj.isDynamic || false;
            values.variableName = obj.variableName || '';
        }
        
        this.elementPropertiesForm.patchValue(values, { emitEvent: false });
    }
    
    onPropertyChange(property: string, value: any): void {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;
        
        switch (property) {
            case 'x':
                // Validate and clamp to margin boundaries
                const bounds = this.getMarginBoundaries();
                const objWidth = activeObject.getScaledWidth();
                const clampedX = Math.max(bounds.left, Math.min(bounds.right - objWidth, value));
                activeObject.left = clampedX;
                activeObject.setCoords();
                // Update form with clamped value if different
                if (clampedX !== value) {
                    this.elementPropertiesForm.patchValue({ x: Math.round(clampedX) }, { emitEvent: false });
                }
                break;
            case 'y':
                // Validate and clamp to margin boundaries
                const boundsY = this.getMarginBoundaries();
                const objHeight = activeObject.getScaledHeight();
                const clampedY = Math.max(boundsY.top, Math.min(boundsY.bottom - objHeight, value));
                activeObject.top = clampedY;
                activeObject.setCoords();
                // Update form with clamped value if different
                if (clampedY !== value) {
                    this.elementPropertiesForm.patchValue({ y: Math.round(clampedY) }, { emitEvent: false });
                }
                break;
            case 'width':
                const currentWidth = activeObject.getScaledWidth();
                activeObject.scaleX = (activeObject.scaleX || 1) * (value / currentWidth);
                activeObject.setCoords();
                this.enforceMarginBoundaries(activeObject as CustomFabricObject);
                break;
            case 'height':
                const currentHeight = activeObject.getScaledHeight();
                activeObject.scaleY = (activeObject.scaleY || 1) * (value / currentHeight);
                activeObject.setCoords();
                this.enforceMarginBoundaries(activeObject as CustomFabricObject);
                break;
            case 'rotation':
                activeObject.angle = value;
                activeObject.setCoords();
                this.enforceMarginBoundaries(activeObject as CustomFabricObject);
                break;
            case 'opacity':
                activeObject.opacity = value / 100;
                break;
            case 'name':
                // Eliminar espacios del nombre del elemento
                const sanitizedName = String(value).replace(/\s+/g, '');
                (activeObject as CustomFabricObject).elementName = sanitizedName;
                // Actualizar el formulario con el valor sanitizado
                this.elementPropertiesForm.patchValue({ name: sanitizedName }, { emitEvent: false });
                break;
            case 'content':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('text', value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'fontSize':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('fontSize', typeof value === 'string' ? parseInt(value, 10) : value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'fontFamily':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('fontFamily', value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'color':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('fill', value);
                    textbox.dirty = true;
                }
                break;
            case 'textAlign':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('textAlign', value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'lineHeight':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('lineHeight', value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'charSpacing':
                if (activeObject.type === 'textbox') {
                    const textbox = activeObject as fabric.Textbox;
                    if (textbox.isEditing) textbox.exitEditing();
                    textbox.set('charSpacing', value);
                    textbox.dirty = true;
                    textbox.initDimensions();
                }
                break;
            case 'fill':
                activeObject.set('fill', value);
                (activeObject as any).dirty = true;
                this.canvas.renderAll(); // Forzar la actualización del lienzo
                break;
            case 'stroke':
                // Si es un grupo (p. ej. flecha), aplicar color a línea y cabeza
                if (activeObject.type === 'group') {
                    try {
                        const objs = (activeObject as any).getObjects ? (activeObject as any).getObjects() : (activeObject as any)._objects;
                        (objs || []).forEach((o: any) => {
                            if (o.type === 'line' || o.type === 'polyline' || o.type === 'path') {
                                o.set('stroke', value);
                                o.set('dirty', true);
                            }
                            if (o.type === 'triangle' || o.type === 'polygon') {
                                // Para la cabeza, usamos fill para mantener aspecto sólido
                                o.set('fill', value);
                                o.set('dirty', true);
                            }
                        });
                    } catch (e) {
                        activeObject.set('stroke', value);
                    }
                } else {
                    activeObject.set('stroke', value);
                }
                (activeObject as any).dirty = true;
                this.canvas.renderAll(); // Forzar la actualización del lienzo
                break;
            case 'strokeWidth':
                // Si es un grupo (p. ej. nuestra flecha compuesta), aplicar a sus hijos relevantes
                if (activeObject.type === 'group') {
                    try {
                        const objs = (activeObject as any).getObjects ? (activeObject as any).getObjects() : (activeObject as any)._objects;
                        (objs || []).forEach((o: any) => {
                            if (o.type === 'line' || o.type === 'polyline' || o.type === 'path') {
                                o.set('strokeWidth', value);
                                o.set('dirty', true);
                            }
                            // Si la cabeza es un triángulo y queremos mantener proporción, no tocamos su fill
                        });
                    } catch (e) {
                        // fallback: set on group
                        activeObject.set('strokeWidth', value);
                    }
                } else {
                    activeObject.set('strokeWidth', value);
                }
                (activeObject as any).dirty = true;
                this.canvas.renderAll();
                break;
            case 'strokeDashArray':
                // Convertir el tipo de línea a array de dash
                const dashPatterns: Record<string, number[] | null> = {
                    'solid': null,
                    'dashed': [10, 5],
                    'dotted': [2, 4],
                    'dashdot': [10, 5, 2, 5]
                };
                const dashValue = dashPatterns[value] || null;
                if (activeObject.type === 'group') {
                    try {
                        const objs = (activeObject as any).getObjects ? (activeObject as any).getObjects() : (activeObject as any)._objects;
                        (objs || []).forEach((o: any) => {
                            if (o.type === 'line' || o.type === 'polyline' || o.type === 'path') {
                                o.set('strokeDashArray', dashValue);
                                o.set('dirty', true);
                            }
                        });
                    } catch (e) {
                        activeObject.set('strokeDashArray', dashValue);
                    }
                } else {
                    activeObject.set('strokeDashArray', dashValue);
                }
                (activeObject as any).strokeDashType = value; // Guardar el tipo para referencia
                (activeObject as any).dirty = true;
                // Reflejar el cambio también en el formulario para que los botones se actualicen
                this.elementPropertiesForm.patchValue({ strokeDashArray: value }, { emitEvent: false });
                this.canvas.renderAll();
                break;
            case 'borderRadius':
                if (activeObject.type === 'rect') {
                    (activeObject as fabric.Rect).set('rx', value);
                    (activeObject as fabric.Rect).set('ry', value);
                    (activeObject as any).dirty = true;
                }
                break;
            // Transform properties
            case 'flipX':
                activeObject.set('flipX', value);
                this.elementPropertiesForm.patchValue({ flipX: value }, { emitEvent: false });
                this.canvas.renderAll();
                break;
            case 'flipY':
                activeObject.set('flipY', value);
                this.elementPropertiesForm.patchValue({ flipY: value }, { emitEvent: false });
                this.canvas.renderAll();
                break;
            // Image properties
            case 'imageFit':
                // Store in custom property for future use
                (activeObject as CustomFabricObject).imageFit = value;
                this.elementPropertiesForm.patchValue({ imageFit: value }, { emitEvent: false });
                break;
            // QR properties
            case 'qrContent':
                // Store for regeneration
                (activeObject as CustomFabricObject).qrContent = value;
                break;
            case 'qrSize':
                // Will be applied on regenerate
                break;
            case 'isDynamic': {
                const oldObj = activeObject as CustomFabricObject;
                
                // Toggle dynamic mode for images
                if (oldObj.elementType === 'image') {
                    if (value) {
                        // Activar modo variable: reemplazar con placeholder y limpiar imageSrc
                        oldObj.isDynamic = true;
                        oldObj.variableName = '';

                        const dataUrl = this.generateImagePlaceholder(
                            Math.round(oldObj.getScaledWidth()) || 200,
                            Math.round(oldObj.getScaledHeight()) || 132
                        );
                        
                        fabric.FabricImage.fromURL(dataUrl).then((img) => {
                            img.set({
                                left: oldObj.left,
                                top: oldObj.top,
                                angle: oldObj.angle,
                                opacity: oldObj.opacity,
                                scaleX: oldObj.scaleX,
                                scaleY: oldObj.scaleY
                            });

                            const customImg = img as CustomFabricObject;
                            customImg.elementId = oldObj.elementId;
                            customImg.elementType = 'image';
                            customImg.elementName = oldObj.elementName;
                            customImg.isDynamic = true;

                            this.canvas.remove(oldObj);
                            this.canvas.add(customImg);
                            this.canvas.setActiveObject(customImg);
                            this.selectedObject = customImg;
                            this.elementPropertiesForm.patchValue({ isDynamic: true, variableName: '', imageSrc: '' }, { emitEvent: false });
                            this.canvas.renderAll();
                            this.saveHistory();
                        });
                    } else {
                        // Desactivar modo variable: limpiar binding, mantener placeholder
                        oldObj.isDynamic = false;
                        oldObj.variableName = '';
                        this.elementPropertiesForm.patchValue({ isDynamic: false, variableName: '' }, { emitEvent: false });
                        this.canvas.requestRenderAll();
                        this.saveHistory();
                    }
                } else {
                    // Comportamiento por defecto para otros elementos
                    (activeObject as CustomFabricObject).isDynamic = value;
                }
                break;
            }
            case 'variableName':
                (activeObject as CustomFabricObject).variableName = value;
                if (value) {
                    (activeObject as CustomFabricObject).isDynamic = true;
                    // If image element, clear uploaded src and set variable
                    if ((activeObject as CustomFabricObject).elementType === 'image') {
                        const variable = this.availableVariables.find(v => v.name === value);
                        (activeObject as CustomFabricObject).variableName = value;
                        (activeObject as CustomFabricObject).isDynamic = true;
                        if (variable) {
                            (activeObject as CustomFabricObject).elementName = variable.label;
                        }
                        this.elementPropertiesForm.patchValue({
                            isDynamic: true,
                            variableName: value,
                            name: variable ? variable.label : this.elementPropertiesForm.get('name')?.value,
                            imageSrc: ''
                        }, { emitEvent: false });
                    } else {
                        // default behavior for QR and other types
                        this.elementPropertiesForm.patchValue({ 
                            isDynamic: true,
                            qrContent: `{{${value}}}`
                        }, { emitEvent: false });
                    }
                } else {
                    // If clearing variable, ensure flags are reset
                    if ((activeObject as CustomFabricObject).elementType === 'image') {
                        (activeObject as CustomFabricObject).isDynamic = false;
                        (activeObject as CustomFabricObject).variableName = '';
                        this.elementPropertiesForm.patchValue({ isDynamic: false, variableName: '' }, { emitEvent: false });
                    }
                }
                break;
        }
        
        activeObject.setCoords();
        this.canvas.requestRenderAll();
        this.saveHistory();
    }

    // ===== ZOOM =====
    setZoom(level: number): void {
        this.zoomLevel = level;
        const zoom = level / 100;
        this.canvas.setZoom(zoom);
        
        // Adjust canvas size for viewport
        this.canvas.setWidth(this.canvasWidth * zoom);
        this.canvas.setHeight(this.canvasHeight * zoom);
        
        this.canvas.renderAll();

        // Recalcular guías de margen al cambiar zoom
        if (this.pageSettingsForm.get('showMarginGuides')?.value) {
            this.drawMarginGuides();
        }
    }
    
    zoomIn(): void {
        const currentIndex = this.zoomLevels.indexOf(this.zoomLevel);
        if (currentIndex < this.zoomLevels.length - 1) {
            this.setZoom(this.zoomLevels[currentIndex + 1]);
        }
    }
    
    zoomOut(): void {
        const currentIndex = this.zoomLevels.indexOf(this.zoomLevel);
        if (currentIndex > 0) {
            this.setZoom(this.zoomLevels[currentIndex - 1]);
        }
    }
    
    resetZoom(): void {
        this.setZoom(100);
    }

    // ===== HISTORY (UNDO/REDO) =====
    private saveHistory(): void {
        if (this.isHistoryAction) return;
        
        const json = JSON.stringify(this.canvas.toJSON());
        
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(json);
        this.historyIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo(): void {
        if (this.historyIndex > 0) {
            this.isHistoryAction = true;
            this.historyIndex--;
            this.canvas.loadFromJSON(JSON.parse(this.history[this.historyIndex])).then(() => {
                this.canvas.renderAll();
                this.isHistoryAction = false;
            });
        }
    }
    
    redo(): void {
        if (this.historyIndex < this.history.length - 1) {
            this.isHistoryAction = true;
            this.historyIndex++;
            this.canvas.loadFromJSON(JSON.parse(this.history[this.historyIndex])).then(() => {
                this.canvas.renderAll();
                this.isHistoryAction = false;
            });
        }
    }
    
    get canUndo(): boolean {
        return this.historyIndex > 0;
    }
    
    get canRedo(): boolean {
        return this.historyIndex < this.history.length - 1;
    }

    // ===== SIDEBAR RESIZE =====
    startSidebarResize(side: 'left' | 'right', event: PointerEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isResizingSidebar = true;
        this.resizingSide = side;
        this.sidebarStartX = event.clientX;
        this.sidebarStartWidth = side === 'left' ? this.leftPanelWidth : this.rightPanelWidth;
        
        document.addEventListener('pointermove', this.onSidebarPointerMove);
        document.addEventListener('pointerup', this.onSidebarPointerUp);
    }
    
    private onSidebarPointerMove = (event: PointerEvent): void => {
        if (!this.isResizingSidebar || !this.resizingSide) return;
        
        const minWidth = 200;
        const maxWidth = 450;
        
        if (this.resizingSide === 'left') {
            const dx = event.clientX - this.sidebarStartX;
            let newWidth = Math.round(this.sidebarStartWidth + dx);
            this.leftPanelWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        } else {
            const dx = this.sidebarStartX - event.clientX;
            let newWidth = Math.round(this.sidebarStartWidth + dx);
            this.rightPanelWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        }
        
        this.cdr.detectChanges();
    };
    
    private onSidebarPointerUp = (): void => {
        this.isResizingSidebar = false;
        this.resizingSide = null;
        document.removeEventListener('pointermove', this.onSidebarPointerMove);
        document.removeEventListener('pointerup', this.onSidebarPointerUp);
    };

    // ===== LAYERS =====
    get canvasObjects(): CustomFabricObject[] {
        if (!this.canvas) return [];
        // Filter out helper objects (margin guides, grid lines, alignment guides)
        return (this.canvas.getObjects() as CustomFabricObject[])
            .filter(obj => {
                const anyObj = obj as any;
                return !anyObj.isMarginGuide && 
                       !anyObj.isGridLine && 
                       !anyObj.isAlignmentGuide;
            })
            .slice()
            .reverse();
    }
    
    selectLayer(obj: CustomFabricObject): void {
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
    }
    
    toggleLayerVisibility(obj: CustomFabricObject): void {
        obj.visible = !obj.visible;
        this.canvas.renderAll();
        this.saveHistory();
    }

    // ===== SAVE =====
    saveTemplate(): void {
        if (this.documentForm.invalid || !this.template) {
            this.documentForm.markAllAsTouched();
            return;
        }
        
        this.isSaving = true;
        
        // Convert canvas objects back to CanvasElement format
        const elements: CanvasElement[] = this.canvasObjects.map(obj => this.fabricObjectToElement(obj)).filter(e => e !== null) as CanvasElement[];
        
        const updatedTemplatePayload = {
            name: this.documentForm.value.name,
            description: this.documentForm.value.description,
            pageConfig: {
                ...this.template!.pageConfig,
                backgroundImage: this.backgroundImageSrc || undefined,
                backgroundFit: this.backgroundFit
            },
            elements,
            variables: this.template!.variables || []
        };

        this.templateService.updateTemplate(this.template!.id, updatedTemplatePayload).subscribe({
            next: () => {
                this.isSaving = false;
                this.cancel();
            },
            error: () => {
                this.isSaving = false;
            }
        });
    }
    
    private fabricObjectToElement(obj: CustomFabricObject): CanvasElement | null {
        if (!obj.elementId) return null;
        
        const element: CanvasElement = {
            id: obj.elementId,
            type: obj.elementType || 'shape',
            name: obj.elementName || 'Elemento',
            transform: {
                x: obj.left || 0,
                y: obj.top || 0,
                width: obj.getScaledWidth(),
                height: obj.getScaledHeight(),
                rotation: obj.angle,
                zIndex: this.canvas.getObjects().indexOf(obj)
            },
            visible: obj.visible,
            locked: obj.lockMovementX
        };
        
        // Add type-specific config
        if (obj.type === 'textbox') {
            const textbox = obj as fabric.Textbox;
            element.textConfig = {
                content: textbox.text || '',
                fontSize: textbox.fontSize,
                fontFamily: textbox.fontFamily,
                fontWeight: textbox.fontWeight as string,
                fontStyle: textbox.fontStyle,
                color: textbox.fill as string,
                textAlign: textbox.textAlign as 'left' | 'center' | 'right',
                lineHeight: textbox.lineHeight,
                letterSpacing: textbox.charSpacing,
                isDynamic: obj.isDynamic,
                variableName: obj.variableName
            };
        }
        
        if (['rect', 'circle', 'ellipse', 'triangle', 'line'].includes(obj.type || '')) {
            element.shapeConfig = {
                type: this.getShapeType(obj.type || ''),
                fill: obj.fill as string,
                stroke: obj.stroke as string,
                strokeWidth: obj.strokeWidth
            };
        }
        
        if (obj.elementType === 'image') {
            element.imageConfig = {
                src: (obj as fabric.FabricImage).getSrc?.() || '',
                fit: 'contain'
            };
        }
        
        if (obj.elementType === 'qr') {
            element.qrConfig = {
                content: obj.variableName ? `{{${obj.variableName}}}` : 'https://example.com',
                isDynamic: obj.isDynamic,
                variableName: obj.variableName
            };
        }
        
        return element;
    }
    
    private getShapeType(fabricType: string): 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'line' | 'polygon' {
        const map: Record<string, 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'line'> = {
            'rect': 'rectangle',
            'circle': 'circle',
            'ellipse': 'ellipse',
            'triangle': 'triangle',
            'line': 'line'
        };
        return map[fabricType] || 'rectangle';
    }
    
    cancel(): void {
        this.router.navigate(['/documentos/templates']);
    }

    // ===== HELPERS =====
    getElementIcon(type: string | undefined): string {
        const icons: Record<string, string> = {
            'text': 'text_fields',
            'image': 'image',
            'shape': 'category',
            'qr': 'qr_code_2',
            'textbox': 'text_fields',
            'rect': 'rectangle',
            'circle': 'circle',
            'ellipse': 'radio_button_unchecked',
            'triangle': 'change_history',
            'line': 'horizontal_rule'
        };
        return icons[type || ''] || 'widgets';
    }
    
    isTextSelected(): boolean {
        return this.selectedObject?.type === 'textbox';
    }
    
    isShapeSelected(): boolean {
        const type = this.selectedObject?.type;
        const elementType = this.selectedObject?.elementType;
        return ['rect', 'circle', 'ellipse', 'triangle', 'line', 'polygon'].includes(type || '') || elementType === 'shape';
    }

    isImageSelected(): boolean {
        return this.selectedObject?.elementType === 'image' || this.selectedObject?.type === 'image';
    }

    isQRSelected(): boolean {
        return this.selectedObject?.elementType === 'qr';
    }

    // ===== IMAGE HANDLING =====
    onReplaceImage(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const activeObject = this.canvas.getActiveObject();
            
            if (activeObject && (activeObject as CustomFabricObject).elementType === 'image') {
                // Replace existing image
                fabric.FabricImage.fromURL(dataUrl).then((img) => {
                    const oldObj = activeObject as CustomFabricObject;
                    
                    // Preserve position and size
                    img.set({
                        left: oldObj.left,
                        top: oldObj.top,
                        scaleX: oldObj.scaleX,
                        scaleY: oldObj.scaleY,
                        angle: oldObj.angle,
                        opacity: oldObj.opacity
                    });
                    
                    const customImg = img as CustomFabricObject;
                    customImg.elementId = oldObj.elementId;
                    customImg.elementType = 'image';
                    customImg.elementName = oldObj.elementName;
                    
                    this.canvas.remove(activeObject);
                    this.canvas.add(customImg);
                    this.canvas.setActiveObject(customImg);
                    this.canvas.renderAll();
                    
                    this.selectedObject = customImg;
                    // When replacing with an uploaded image, clear any variable binding
                    customImg.isDynamic = false;
                    customImg.variableName = '';
                    this.elementPropertiesForm.patchValue({ imageSrc: dataUrl, isDynamic: false, variableName: '' }, { emitEvent: false });
                    this.saveHistory();
                });
            }
        };

        reader.readAsDataURL(file);
        input.value = ''; // Reset input
    }

    // ===== QR HANDLING =====
    regenerateQR(): void {
        const activeObject = this.canvas.getActiveObject() as CustomFabricObject;
        if (!activeObject || activeObject.elementType !== 'qr') return;

        const qrContent = this.elementPropertiesForm.get('qrContent')?.value || 'https://example.com';
        const qrSize = this.elementPropertiesForm.get('qrSize')?.value || 150;
        const isDynamic = this.elementPropertiesForm.get('isDynamic')?.value || false;
        const variableName = this.elementPropertiesForm.get('variableName')?.value || '';

        // Generate new QR code
        const displayContent = isDynamic && variableName ? `{{${variableName}}}` : qrContent;
        
        this.generateQRCode(displayContent, qrSize).then((dataUrl) => {
            fabric.FabricImage.fromURL(dataUrl).then((img) => {
                const oldObj = activeObject;
                
                img.set({
                    left: oldObj.left,
                    top: oldObj.top,
                    angle: oldObj.angle,
                    opacity: oldObj.opacity
                });
                
                // Scale to match qrSize
                const scale = qrSize / (img.width || qrSize);
                img.scaleX = scale;
                img.scaleY = scale;
                
                const customImg = img as CustomFabricObject;
                customImg.elementId = oldObj.elementId;
                customImg.elementType = 'qr';
                customImg.elementName = oldObj.elementName || 'Código QR';
                customImg.isDynamic = isDynamic;
                customImg.variableName = variableName;
                
                this.canvas.remove(activeObject);
                this.canvas.add(customImg);
                this.canvas.setActiveObject(customImg);
                this.canvas.renderAll();
                
                this.selectedObject = customImg;
                this.saveHistory();
            });
        });
    }

    private async generateQRCode(content: string, size: number): Promise<string> {
        // Use the QRCode library if available, otherwise create a placeholder
        try {
            const QRCode = (window as any).QRCode;
            if (QRCode) {
                return await QRCode.toDataURL(content, {
                    width: size,
                    margin: 1,
                    color: { dark: '#000000', light: '#ffffff' }
                });
            }
        } catch (e) {
            console.warn('QRCode library not available, using placeholder');
        }
        
        // Fallback: create a simple placeholder canvas
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR', size / 2, size / 2);
        return canvas.toDataURL();
    }

    // ==========================================
    // PAGE CONFIGURATION METHODS
    // ==========================================

    /** Converts millimeters to pixels using display DPI */
    mmToPx(mm: number): number {
        return Math.round((mm / 25.4) * this.displayDpi);
    }

    /** Converts pixels to millimeters */
    pxToMm(px: number): number {
        return Math.round((px / this.displayDpi) * 25.4);
    }

    /** Sets the page orientation */
    setOrientation(orientation: 'portrait' | 'landscape'): void {
        this.pageSettingsForm.patchValue({ orientation });
        this.applyPageSettings();
    }

    /** Applies page configuration to canvas */
    applyPageSettings(): void {
        if (!this.canvas) return;

        const settings = this.pageSettingsForm.value;
        let widthMm: number;
        let heightMm: number;

        if (settings.pageSize === 'Custom') {
            widthMm = settings.customWidthMm || 210;
            heightMm = settings.customHeightMm || 297;
        } else {
            const size = this.standardPageSizes[settings.pageSize];
            widthMm = size?.width || 210;
            heightMm = size?.height || 297;
        }

        // Apply orientation
        if (settings.orientation === 'landscape') {
            const temp = widthMm;
            widthMm = heightMm;
            heightMm = temp;
        }

        // Convert to pixels
        this.canvasWidth = this.mmToPx(widthMm);
        this.canvasHeight = this.mmToPx(heightMm);

        // Update canvas dimensions
        this.canvas.setDimensions({
            width: this.canvasWidth,
            height: this.canvasHeight
        });

        // Update background if exists
        if (this.backgroundImageSrc) {
            this.loadBackgroundImage(this.backgroundImageSrc, this.backgroundFit);
        }

        // Update margin guides - always redraw if enabled
        if (settings.showMarginGuides) {
            this.drawMarginGuides();
        } else {
            this.removeMarginGuides();
        }

        // Update grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }

        this.canvas.renderAll();
        this.cdr.detectChanges();
    }

    /** Toggles margin guides visibility */
    toggleMarginGuides(): void {
        const showGuides = this.pageSettingsForm.get('showMarginGuides')?.value;
        if (showGuides) {
            this.drawMarginGuides();
        } else {
            this.removeMarginGuides();
        }
    }

    /** Toggle called from header button: flips form value and applies guides */
    toggleMarginGuidesHeader(): void {
        const ctrl = this.pageSettingsForm.get('showMarginGuides');
        if (!ctrl) return;
        const current = !!ctrl.value;
        ctrl.setValue(!current);
        this.toggleMarginGuides();
    }

    /** Draws margin guides on canvas */
    drawMarginGuides(): void {
        this.removeMarginGuides();

        const settings = this.pageSettingsForm.value;
        const marginTop = this.mmToPx(settings.marginTopMm || 0);
        const marginBottom = this.mmToPx(settings.marginBottomMm || 0);
        const marginLeft = this.mmToPx(settings.marginLeftMm || 0);
        const marginRight = this.mmToPx(settings.marginRightMm || 0);

        const guideStyle = {
            stroke: '#D63384',
            strokeWidth: 1,
            strokeDashArray: [5, 3],
            selectable: false,
            evented: false,
            excludeFromExport: true,
            opacity: 0.7
        };

        // Considerar zoom actual y dimensiones reales del canvas
        const zoom = (this.canvas && this.canvas.getZoom) ? (this.canvas.getZoom() || 1) : 1;
        const canvasActualWidth = (this.canvas && this.canvas.getWidth) ? (this.canvas.getWidth() as number) : this.canvasWidth;
        const canvasActualHeight = (this.canvas && this.canvas.getHeight) ? (this.canvas.getHeight() as number) : this.canvasHeight;

        const topLine = new fabric.Line(
            [0, marginTop * zoom, canvasActualWidth, marginTop * zoom],
            { ...guideStyle }
        );

        const bottomLine = new fabric.Line(
            [0, canvasActualHeight - marginBottom * zoom, canvasActualWidth, canvasActualHeight - marginBottom * zoom],
            { ...guideStyle }
        );

        const leftLine = new fabric.Line(
            [marginLeft * zoom, 0, marginLeft * zoom, canvasActualHeight],
            { ...guideStyle }
        );

        const rightLine = new fabric.Line(
            [canvasActualWidth - marginRight * zoom, 0, canvasActualWidth - marginRight * zoom, canvasActualHeight],
            { ...guideStyle }
        );

        this.marginGuides = [topLine, bottomLine, leftLine, rightLine];
        this.marginGuides.forEach(guide => {
            (guide as fabric.Line).set({ selectable: false });
            (guide as any).isMarginGuide = true; // Marcar como guía de margen
            // Agregar cada guía al canvas para que sean visibles
            try {
                this.canvas.add(guide);
            } catch (e) {
                // si no hay canvas aún, ignorar silenciosamente
            }
        });

        this.canvas.renderAll();
    }

    /** Removes margin guides from canvas */
    removeMarginGuides(): void {
        this.marginGuides.forEach(guide => {
            this.canvas.remove(guide);
        });
        this.marginGuides = [];
        this.canvas.renderAll();
    }

    /** Gets printable area width */
    getPrintableWidth(): number {
        const settings = this.pageSettingsForm.value;
        const marginLeft = this.mmToPx(settings.marginLeftMm || 0);
        const marginRight = this.mmToPx(settings.marginRightMm || 0);
        return this.canvasWidth - marginLeft - marginRight;
    }

    /** Gets printable area height */
    getPrintableHeight(): number {
        const settings = this.pageSettingsForm.value;
        const marginTop = this.mmToPx(settings.marginTopMm || 0);
        const marginBottom = this.mmToPx(settings.marginBottomMm || 0);
        return this.canvasHeight - marginTop - marginBottom;
    }

    // ==========================================
    // PDF PREVIEW & GENERATION METHODS
    // ==========================================

    /**
     * Genera y muestra la previsualización del PDF
     */
    async previewPDF(): Promise<void> {
        if (!this.canvas || this.isGeneratingPDF) return;

        this.isGeneratingPDF = true;
        this.showPDFPreview = true;
        this.pdfPreviewUrl = null;
        this.cdr.detectChanges();

        try {
            // Ocultar temporalmente las guías de márgenes para el PDF
            const hadMarginGuides = this.marginGuides.length > 0;
            if (hadMarginGuides) {
                this.removeMarginGuides();
            }

            // Ocultar temporalmente la rejilla para el PDF
            const hadGrid = this.gridLines.length > 0;
            if (hadGrid) {
                this.removeGrid();
            }

            // Limpiar guías de alineación
            this.clearAlignmentGuides();

            // Deseleccionar objeto para que no aparezcan los handles en el PDF
            this.canvas.discardActiveObject();
            this.canvas.renderAll();

            // Obtener configuración de página actual
            const pageConfig = this.getCurrentPageConfig();

            // Generar datos de ejemplo para variables
            const previewVariables = this.pdfGenerator.getPreviewVariables(this.availableVariables);

            // Generar PDF desde el canvas
            const result = await this.pdfGenerator.generateFromFabricCanvas(
                this.canvas,
                {
                    pageConfig,
                    elements: [],
                    backgroundImage: this.backgroundImageSrc,
                    variables: previewVariables,
                    dpi: this.displayDpi
                },
                { action: 'blob' }
            );

            if (result.success && result.blob) {
                this.pdfBlob = result.blob;
                // Crear URL segura para el iframe
                const blobUrl = URL.createObjectURL(result.blob);
                this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
            } else {
                console.error('Error generating PDF:', result.error);
                this.closePDFPreview();
                // Mostrar error al usuario
                alert('Error al generar el PDF: ' + (result.error || 'Error desconocido'));
            }

            // Restaurar guías de márgenes si estaban visibles
            if (hadMarginGuides) {
                this.drawMarginGuides();
            }

            // Restaurar rejilla si estaba visible
            if (hadGrid) {
                this.drawGrid();
            }
        } catch (error) {
            console.error('Error in previewPDF:', error);
            this.closePDFPreview();
        } finally {
            this.isGeneratingPDF = false;
            this.cdr.detectChanges();
        }
    }

    /**
     * Cierra el modal de previsualización
     */
    closePDFPreview(): void {
        // Limpiar URL del blob para liberar memoria
        if (this.pdfPreviewUrl && typeof this.pdfPreviewUrl === 'string') {
            URL.revokeObjectURL(this.pdfPreviewUrl);
        }
        this.showPDFPreview = false;
        this.pdfPreviewUrl = null;
        this.pdfBlob = null;
        this.cdr.detectChanges();
    }

    /**
     * Descarga el PDF generado
     */
    downloadPDF(): void {
        if (!this.pdfBlob) {
            this.previewPDF().then(() => {
                if (this.pdfBlob) {
                    this.triggerDownload();
                }
            });
        } else {
            this.triggerDownload();
        }
    }

    /**
     * Trigger de descarga del PDF
     */
    private triggerDownload(): void {
        if (!this.pdfBlob) return;

        const url = URL.createObjectURL(this.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.documentForm.get('name')?.value || 'documento'}_preview.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Abre el diálogo de impresión
     */
    printPDF(): void {
        if (this.pdfPreviewUrl) {
            const iframe = document.querySelector('.pdf-iframe') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.print();
            }
        }
    }

    /**
     * Obtiene la configuración de página actual
     */
    private getCurrentPageConfig(): PageConfig {
        const settings = this.pageSettingsForm.value;
        let widthMm: number;
        let heightMm: number;

        if (settings.pageSize === 'Custom') {
            widthMm = settings.customWidthMm || 210;
            heightMm = settings.customHeightMm || 297;
        } else {
            const size = this.standardPageSizes[settings.pageSize];
            widthMm = size?.width || 210;
            heightMm = size?.height || 297;
        }

        return {
            width: widthMm,
            height: heightMm,
            orientation: settings.orientation || 'landscape',
            margins: {
                top: settings.marginTopMm || 0,
                right: settings.marginRightMm || 0,
                bottom: settings.marginBottomMm || 0,
                left: settings.marginLeftMm || 0
            },
            backgroundColor: '#ffffff',
            backgroundImage: this.backgroundImageSrc,
            backgroundFit: this.backgroundFit
        };
    }

    // ==========================================
    // PAN MODE (CANVAS NAVIGATION)
    // ==========================================

    /**
     * Toggles pan/navigation mode
     */
    togglePanMode(): void {
        this.isPanMode = !this.isPanMode;
        
        if (this.isPanMode) {
            this.canvas.defaultCursor = 'grab';
            this.canvas.hoverCursor = 'grab';
            this.canvas.discardActiveObject();
            this.canvas.renderAll();
        } else {
            this.canvas.defaultCursor = 'default';
            this.canvas.hoverCursor = 'move';
        }
        
        this.cdr.detectChanges();
    }

    /**
     * Resets scroll container to center the canvas
     */
    resetCanvasPosition(): void {
        if (this.canvasScrollRef?.nativeElement) {
            const container = this.canvasScrollRef.nativeElement;
            // Center the scroll
            const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            const scrollTop = (container.scrollHeight - container.clientHeight) / 2;
            container.scrollLeft = Math.max(0, scrollLeft);
            container.scrollTop = Math.max(0, scrollTop);
        }
    }

    // ==========================================
    // GRID FUNCTIONALITY
    // ==========================================

    /**
     * Toggles grid visibility
     */
    toggleGrid(): void {
        this.showGrid = !this.showGrid;
        
        if (this.showGrid) {
            this.drawGrid();
        } else {
            this.removeGrid();
        }
        
        this.cdr.detectChanges();
    }

    /**
     * Sets grid size and redraws
     */
    setGridSize(size: number): void {
        this.gridSize = size;
        if (this.showGrid) {
            this.drawGrid();
        }
    }

    /**
     * Handles grid size change from select component
     */
    onGridSizeChange(size: number): void {
        this.setGridSize(size);
    }

    /**
     * Draws the grid on canvas
     */
    private drawGrid(): void {
        this.removeGrid();
        
        const settings = this.pageSettingsForm.value;
        const marginTop = this.mmToPx(settings.marginTopMm || 0);
        const marginBottom = this.mmToPx(settings.marginBottomMm || 0);
        const marginLeft = this.mmToPx(settings.marginLeftMm || 0);
        const marginRight = this.mmToPx(settings.marginRightMm || 0);
        
        const startX = marginLeft;
        const startY = marginTop;
        const endX = this.canvasWidth - marginRight;
        const endY = this.canvasHeight - marginBottom;

        const gridStyle = {
            stroke: '#e5e7eb',
            strokeWidth: 0.5,
            selectable: false,
            evented: false,
            excludeFromExport: true,
            opacity: 0.8
        };

        // Vertical lines
        for (let x = startX; x <= endX; x += this.gridSize) {
            const line = new fabric.Line([x, startY, x, endY], gridStyle);
            (line as any).isGridLine = true;
            this.gridLines.push(line);
            this.canvas.add(line);
            this.canvas.sendObjectToBack(line);
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += this.gridSize) {
            const line = new fabric.Line([startX, y, endX, y], gridStyle);
            (line as any).isGridLine = true;
            this.gridLines.push(line);
            this.canvas.add(line);
            this.canvas.sendObjectToBack(line);
        }

        this.canvas.renderAll();
    }

    /**
     * Removes grid from canvas
     */
    private removeGrid(): void {
        this.gridLines.forEach(line => {
            this.canvas.remove(line);
        });
        this.gridLines = [];
        this.canvas.renderAll();
    }

    // ==========================================
    // SNAP TO GRID
    // ==========================================

    /**
     * Toggles snap to grid functionality
     */
    toggleSnapToGrid(): void {
        this.snapToGrid = !this.snapToGrid;
        this.cdr.detectChanges();
    }

    /**
     * Snaps an object to the nearest grid intersection
     */
    private snapObjectToGrid(obj: CustomFabricObject): void {
        if (!obj || !this.showGrid) return;

        const bounds = this.getMarginBoundaries();
        const left = obj.left || 0;
        const top = obj.top || 0;

        // Calculate nearest grid point relative to margin start
        const relativeX = left - bounds.left;
        const relativeY = top - bounds.top;

        const snappedRelativeX = Math.round(relativeX / this.gridSize) * this.gridSize;
        const snappedRelativeY = Math.round(relativeY / this.gridSize) * this.gridSize;

        obj.left = bounds.left + snappedRelativeX;
        obj.top = bounds.top + snappedRelativeY;

        obj.setCoords();
    }

    // ==========================================
    // MARGIN BOUNDARY ENFORCEMENT
    // ==========================================

    /**
     * Gets margin boundaries in pixels
     */
    private getMarginBoundaries(): { left: number; top: number; right: number; bottom: number } {
        const settings = this.pageSettingsForm.value;
        return {
            left: this.mmToPx(settings.marginLeftMm || 0),
            top: this.mmToPx(settings.marginTopMm || 0),
            right: this.canvasWidth - this.mmToPx(settings.marginRightMm || 0),
            bottom: this.canvasHeight - this.mmToPx(settings.marginBottomMm || 0)
        };
    }

    /**
     * Constrains object position to margin boundaries during movement
     */
    private constrainToMargins(obj: CustomFabricObject): void {
        if (!obj || (obj as any).isMarginGuide || (obj as any).isGridLine || (obj as any).isAlignmentGuide) {
            return;
        }

        const bounds = this.getMarginBoundaries();
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        
        let left = obj.left || 0;
        let top = obj.top || 0;

        // Constrain left
        if (left < bounds.left) {
            obj.left = bounds.left;
        }
        // Constrain right
        if (left + objWidth > bounds.right) {
            obj.left = bounds.right - objWidth;
        }
        // Constrain top
        if (top < bounds.top) {
            obj.top = bounds.top;
        }
        // Constrain bottom
        if (top + objHeight > bounds.bottom) {
            obj.top = bounds.bottom - objHeight;
        }

        obj.setCoords();
    }

    /**
     * Enforces margin boundaries after object modification (including scaling)
     */
    private enforceMarginBoundaries(obj: CustomFabricObject): void {
        if (!obj || (obj as any).isMarginGuide || (obj as any).isGridLine || (obj as any).isAlignmentGuide) {
            return;
        }

        const bounds = this.getMarginBoundaries();
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        
        let left = obj.left || 0;
        let top = obj.top || 0;
        let modified = false;

        // Check if object exceeds boundaries and adjust
        if (left < bounds.left) {
            obj.left = bounds.left;
            modified = true;
        }
        if (left + objWidth > bounds.right) {
            if (objWidth <= (bounds.right - bounds.left)) {
                obj.left = bounds.right - objWidth;
            } else {
                // Object is too wide, scale it down
                const maxWidth = bounds.right - bounds.left;
                const scale = maxWidth / objWidth;
                obj.scaleX = (obj.scaleX || 1) * scale;
                obj.left = bounds.left;
            }
            modified = true;
        }
        if (top < bounds.top) {
            obj.top = bounds.top;
            modified = true;
        }
        if (top + objHeight > bounds.bottom) {
            if (objHeight <= (bounds.bottom - bounds.top)) {
                obj.top = bounds.bottom - objHeight;
            } else {
                // Object is too tall, scale it down
                const maxHeight = bounds.bottom - bounds.top;
                const scale = maxHeight / objHeight;
                obj.scaleY = (obj.scaleY || 1) * scale;
                obj.top = bounds.top;
            }
            modified = true;
        }

        if (modified) {
            obj.setCoords();
            this.canvas.renderAll();
        }
    }

    // ==========================================
    // SMART ALIGNMENT GUIDES
    // ==========================================

    /**
     * Toggles smart alignment guides
     */
    toggleSmartGuides(): void {
        this.showSmartGuides = !this.showSmartGuides;
        if (!this.showSmartGuides) {
            this.clearAlignmentGuides();
        }
        this.cdr.detectChanges();
    }

    /**
     * Shows alignment guides when moving an object
     */
    private showAlignmentGuides(movingObj: CustomFabricObject): void {
        if (!movingObj || (movingObj as any).isMarginGuide || (movingObj as any).isGridLine) {
            return;
        }

        this.clearAlignmentGuides();

        const bounds = this.getMarginBoundaries();
        const objLeft = movingObj.left || 0;
        const objTop = movingObj.top || 0;
        const objWidth = movingObj.getScaledWidth();
        const objHeight = movingObj.getScaledHeight();
        const objCenterX = objLeft + objWidth / 2;
        const objCenterY = objTop + objHeight / 2;
        const objRight = objLeft + objWidth;
        const objBottom = objTop + objHeight;

        const guideStyle = {
            stroke: '#3b82f6',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
            excludeFromExport: true,
            opacity: 0.9
        };

        // Check alignment with canvas/margin center
        const canvasCenterX = (bounds.left + bounds.right) / 2;
        const canvasCenterY = (bounds.top + bounds.bottom) / 2;

        // Vertical center alignment
        if (Math.abs(objCenterX - canvasCenterX) < this.snapThreshold) {
            movingObj.left = canvasCenterX - objWidth / 2;
            const guide = new fabric.Line(
                [canvasCenterX, bounds.top, canvasCenterX, bounds.bottom],
                guideStyle
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Horizontal center alignment
        if (Math.abs(objCenterY - canvasCenterY) < this.snapThreshold) {
            movingObj.top = canvasCenterY - objHeight / 2;
            const guide = new fabric.Line(
                [bounds.left, canvasCenterY, bounds.right, canvasCenterY],
                guideStyle
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Check alignment with margin edges
        // Left margin
        if (Math.abs(objLeft - bounds.left) < this.snapThreshold) {
            movingObj.left = bounds.left;
            const guide = new fabric.Line(
                [bounds.left, bounds.top, bounds.left, bounds.bottom],
                { ...guideStyle, stroke: '#10b981' }
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Right margin
        if (Math.abs(objRight - bounds.right) < this.snapThreshold) {
            movingObj.left = bounds.right - objWidth;
            const guide = new fabric.Line(
                [bounds.right, bounds.top, bounds.right, bounds.bottom],
                { ...guideStyle, stroke: '#10b981' }
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Top margin
        if (Math.abs(objTop - bounds.top) < this.snapThreshold) {
            movingObj.top = bounds.top;
            const guide = new fabric.Line(
                [bounds.left, bounds.top, bounds.right, bounds.top],
                { ...guideStyle, stroke: '#10b981' }
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Bottom margin
        if (Math.abs(objBottom - bounds.bottom) < this.snapThreshold) {
            movingObj.top = bounds.bottom - objHeight;
            const guide = new fabric.Line(
                [bounds.left, bounds.bottom, bounds.right, bounds.bottom],
                { ...guideStyle, stroke: '#10b981' }
            );
            (guide as any).isAlignmentGuide = true;
            this.alignmentGuides.push(guide);
            this.canvas.add(guide);
        }

        // Check alignment with other objects
        const objects = this.canvas.getObjects().filter(obj => 
            obj !== movingObj && 
            !(obj as any).isMarginGuide && 
            !(obj as any).isGridLine && 
            !(obj as any).isAlignmentGuide
        );

        objects.forEach(other => {
            const otherLeft = other.left || 0;
            const otherTop = other.top || 0;
            const otherWidth = other.getScaledWidth();
            const otherHeight = other.getScaledHeight();
            const otherCenterX = otherLeft + otherWidth / 2;
            const otherCenterY = otherTop + otherHeight / 2;
            const otherRight = otherLeft + otherWidth;
            const otherBottom = otherTop + otherHeight;

            // Left edge alignment
            if (Math.abs(objLeft - otherLeft) < this.snapThreshold) {
                movingObj.left = otherLeft;
                this.addVerticalGuide(otherLeft, guideStyle);
            }

            // Right edge alignment
            if (Math.abs(objRight - otherRight) < this.snapThreshold) {
                movingObj.left = otherRight - objWidth;
                this.addVerticalGuide(otherRight, guideStyle);
            }

            // Center X alignment
            if (Math.abs(objCenterX - otherCenterX) < this.snapThreshold) {
                movingObj.left = otherCenterX - objWidth / 2;
                this.addVerticalGuide(otherCenterX, { ...guideStyle, strokeDashArray: [5, 5] });
            }

            // Top edge alignment
            if (Math.abs(objTop - otherTop) < this.snapThreshold) {
                movingObj.top = otherTop;
                this.addHorizontalGuide(otherTop, guideStyle);
            }

            // Bottom edge alignment
            if (Math.abs(objBottom - otherBottom) < this.snapThreshold) {
                movingObj.top = otherBottom - objHeight;
                this.addHorizontalGuide(otherBottom, guideStyle);
            }

            // Center Y alignment
            if (Math.abs(objCenterY - otherCenterY) < this.snapThreshold) {
                movingObj.top = otherCenterY - objHeight / 2;
                this.addHorizontalGuide(otherCenterY, { ...guideStyle, strokeDashArray: [5, 5] });
            }
        });

        movingObj.setCoords();
        this.canvas.renderAll();
    }

    private addVerticalGuide(x: number, style: any): void {
        const bounds = this.getMarginBoundaries();
        const guide = new fabric.Line([x, bounds.top, x, bounds.bottom], style);
        (guide as any).isAlignmentGuide = true;
        this.alignmentGuides.push(guide);
        this.canvas.add(guide);
    }

    private addHorizontalGuide(y: number, style: any): void {
        const bounds = this.getMarginBoundaries();
        const guide = new fabric.Line([bounds.left, y, bounds.right, y], style);
        (guide as any).isAlignmentGuide = true;
        this.alignmentGuides.push(guide);
        this.canvas.add(guide);
    }

    /**
     * Clears all alignment guides
     */
    private clearAlignmentGuides(): void {
        this.alignmentGuides.forEach(guide => {
            this.canvas.remove(guide);
        });
        this.alignmentGuides = [];
    }

    // ==========================================
    // DISTRIBUTION TOOLS
    // ==========================================

    /**
     * Distributes selected objects horizontally
     */
    distributeHorizontally(): void {
        const activeSelection = this.canvas.getActiveObject();
        if (!activeSelection || activeSelection.type !== 'activeSelection') {
            return;
        }

        const selection = activeSelection as fabric.ActiveSelection;
        const objects = selection.getObjects().slice();
        
        if (objects.length < 3) return;

        // Obtener límites de los márgenes
        const bounds = this.getMarginBoundaries();

        // Sort by left position
        objects.sort((a, b) => (a.left || 0) - (b.left || 0));

        // Usar el área imprimible (dentro de márgenes) para distribución
        const firstLeft = bounds.left;
        const lastRight = bounds.right - objects[objects.length - 1].getScaledWidth();
        const totalWidth = lastRight - firstLeft;

        // Calculate total object widths
        let totalObjWidth = 0;
        objects.forEach(obj => totalObjWidth += obj.getScaledWidth());

        // Calculate spacing
        const spacing = (totalWidth - totalObjWidth) / (objects.length - 1);

        // Distribute
        let currentX = firstLeft;
        objects.forEach((obj, index) => {
            obj.left = currentX;
            obj.setCoords();
            // Aplicar restricciones de margen
            this.enforceMarginBoundaries(obj as CustomFabricObject);
            currentX += obj.getScaledWidth() + spacing;
        });

        this.canvas.renderAll();
        this.saveHistory();
    }

    /**
     * Distributes selected objects vertically
     */
    distributeVertically(): void {
        const activeSelection = this.canvas.getActiveObject();
        if (!activeSelection || activeSelection.type !== 'activeSelection') {
            return;
        }

        const selection = activeSelection as fabric.ActiveSelection;
        const objects = selection.getObjects().slice();
        
        if (objects.length < 3) return;

        // Obtener límites de los márgenes
        const bounds = this.getMarginBoundaries();

        // Sort by top position
        objects.sort((a, b) => (a.top || 0) - (b.top || 0));

        // Usar el área imprimible (dentro de márgenes) para distribución
        const firstTop = bounds.top;
        const lastBottom = bounds.bottom - objects[objects.length - 1].getScaledHeight();
        const totalHeight = lastBottom - firstTop;

        // Calculate total object heights
        let totalObjHeight = 0;
        objects.forEach(obj => totalObjHeight += obj.getScaledHeight());

        // Calculate spacing
        const spacing = (totalHeight - totalObjHeight) / (objects.length - 1);

        // Distribute
        let currentY = firstTop;
        objects.forEach((obj, index) => {
            obj.top = currentY;
            obj.setCoords();
            // Aplicar restricciones de margen
            this.enforceMarginBoundaries(obj as CustomFabricObject);
            currentY += obj.getScaledHeight() + spacing;
        });

        this.canvas.renderAll();
        this.saveHistory();
    }
}
