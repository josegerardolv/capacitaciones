import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { ModalComponent, ModalConfig } from '../../../../../shared/components/modals/modal.component';
import { environment } from '../../../../../../environments/environment';
import { PDFGeneratorService } from '../../../../../core/services/pdf-generator.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-template-preview-modal',
    standalone: true,
    imports: [CommonModule, UniversalIconComponent, InstitutionalButtonComponent, ModalComponent],
    templateUrl: './template-preview-modal.component.html'
})
export class TemplatePreviewModalComponent {
    @Input() isOpen = false;
    @Input() template: any = null;
    @Output() close = new EventEmitter<void>();

    modalConfig: ModalConfig = {
        title: 'Vista Previa del Template',
        showCloseButton: true,
        size: 'xl',
        showHeader: true
    };

    pdfUrl: SafeResourceUrl | null = null;
    isGenerating = false;

    constructor(
        private pdfGenerator: PDFGeneratorService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['template'] && this.template) {
            this.generatePreview();
        }
    }

    private async generatePreview() {
        this.isGenerating = true;
        this.pdfUrl = null;

        try {
            let design = null;

            // En caso que el objeto venga anidado desde un get (ej: documentCourses[].templateDocument)
            const sourceTemplate = this.template.templateDocument || this.template;

            if (sourceTemplate.fields) {
                if (Array.isArray(sourceTemplate.fields) && sourceTemplate.fields.length > 0) {
                    design = JSON.parse(sourceTemplate.fields[0]);
                } else if (typeof sourceTemplate.fields === 'string') {
                    design = JSON.parse(sourceTemplate.fields);
                }
            }

            if (!design || !design.pageConfig) {
                this.isGenerating = false;
                return;
            }

            // Normalizar urls de imágenes para el PDF Generator
            if (design.pageConfig && design.pageConfig.backgroundImage && design.pageConfig.backgroundImage.startsWith('/uploads/')) {
                design.pageConfig.backgroundImage = `${environment.apiUrl}${design.pageConfig.backgroundImage}`;
            }

            if (design.elements) {
                design.elements.forEach((el: any) => {
                    if (el.type === 'image' && el.imageConfig && el.imageConfig.src && el.imageConfig.src.startsWith('/uploads/')) {
                        el.imageConfig.src = `${environment.apiUrl}${el.imageConfig.src}`;
                    }
                });
            }

            // Preparar objeto compatible con CertificateTemplate
            const certTemplate = {
                id: sourceTemplate.id || 0,
                name: sourceTemplate.name || 'Preview',
                pageConfig: design.pageConfig,
                elements: design.elements || [],
                variables: design.variables || []
            };

            const previewVariables = this.pdfGenerator.getPreviewVariables(certTemplate.variables);

            const result = await this.pdfGenerator.generateFromTemplate(
                certTemplate as any,
                previewVariables,
                { action: 'blob' }
            );

            if (result.success && result.blob) {
                const url = URL.createObjectURL(result.blob);
                this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}#toolbar=0&navpanes=0&view=FitH`);
            }
        } catch (e) {
            console.error('Error al generar vista previa del template:', e);
        } finally {
            this.isGenerating = false;
        }
    }

    onClose() {
        this.close.emit();
    }
}
