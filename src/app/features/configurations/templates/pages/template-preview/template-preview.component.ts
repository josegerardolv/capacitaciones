import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateService } from '../../services/template.service';
import { CertificateTemplate } from '../../../../../core/models/template.model';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';

@Component({
    selector: 'app-template-preview',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">{{ template?.name }}</h2>
                        <p class="text-gray-600 mt-1">{{ template?.description }}</p>
                    </div>
                    <div class="flex space-x-3">
                        <button (click)="goBack()" 
                            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Volver
                        </button>
                        <button (click)="editTemplate()" 
                            class="px-4 py-2 text-white bg-[#8B1538] rounded-lg hover:bg-[#6B1028]">
                            Editar Diseño
                        </button>
                    </div>
                </div>
            </div>

            <!-- Preview -->
            <div class="bg-white rounded-lg shadow-sm p-8">
                <div class="text-center text-gray-500">
                    <div class="mb-4">
                        <span class="material-symbols-outlined" style="font-size: 64px;">preview</span>
                    </div>
                    <p class="text-lg">Vista previa del template</p>
                    <p class="text-sm mt-2">Esta función estará disponible próximamente</p>
                    <div class="mt-4 text-sm text-gray-600">
                        <p>Elementos: {{ template?.elements?.length || 0 }}</p>
                        <p>Variables: {{ template?.variables?.length || 0 }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
})
export class TemplatePreviewComponent implements OnInit {
    templateId: number | null = null;
    template: CertificateTemplate | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private templateService: TemplateService
    ) { }

    ngOnInit(): void {
        this.templateId = +this.route.snapshot.params['id'];
        this.loadTemplate();
    }

    loadTemplate() {
        if (this.templateId) {
            this.templateService.getTemplate(this.templateId).subscribe(template => {
                this.template = template || null;
            });
        }
    }

    goBack() {
        this.router.navigate(['/config/templates']);
    }

    editTemplate() {
        this.router.navigate(['/config/templates/editor', this.templateId]);
    }
}
