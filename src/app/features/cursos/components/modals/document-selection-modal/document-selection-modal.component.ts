import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent, ModalConfig } from '../../../../../shared/components/modals/modal.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { CourseType } from '../../../../../core/models/group.model';

export interface DocumentOption {
    id: string;
    name: string;
    description: string;
    cost?: number; // agregar costo
    selected: boolean;
    disabled?: boolean;
}

@Component({
    selector: 'app-document-selection-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, InstitutionalButtonComponent],
    templateUrl: './document-selection-modal.component.html'
})
export class DocumentSelectionModalComponent {
    @Input() isOpen = false;
    @Input() courseType: CourseType = 'LICENCIA'; // Lógica predeterminada
    @Input() customDocuments: any[] | null = null; // Aceptando DocumentConfig

    // Estado interno de documentos
    documents: DocumentOption[] = [];

    @Output() modalClose = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<DocumentOption[]>();

    modalConfig: ModalConfig = {
        title: 'Constancias',
        size: 'lg',
        showCloseButton: true,
        padding: true
    };

    ngOnChanges(): void {
        if (this.isOpen) {
            this.initializeDocuments();
        }
    }

    initializeDocuments() {
        if (this.customDocuments && this.customDocuments.length > 0) {
            // Usar configuración personalizada
            this.documents = this.customDocuments.map(doc => ({
                id: doc.id,
                name: doc.name,
                description: doc.description || doc.name, // Usar descripción si existe, sino nombre
                cost: doc.cost, // Map cost
                selected: doc.isMandatory || !doc.cost ? true : false, // Si es obligatorio o GRATIS (!cost), pre-seleccionar
                disabled: doc.isMandatory || !doc.cost || false // Si es obligatorio O gratis, bloquear
            }));
            return;
        }

        // Documentos base
        this.documents = [
            {
                id: 'constancia',
                name: 'Constancia Básica',
                description: 'Constancia de acreditación de capacitación',
                cost: 0,
                selected: true,
                disabled: false
            }
        ];

        // Documentos condicionales basados en Tipo de Curso
        if (this.courseType === 'LICENCIA') {
            this.documents.push({
                id: 'tarjeton',
                name: 'Tarjetón',
                description: 'Tarjetón del conductor',
                cost: 253, // Costo aproximado por defecto
                selected: false,
                disabled: false
            });
        }

        // ¿Agregar Reconocimiento para todos?
        this.documents.push({
            id: 'reconocimiento',
            name: 'Reconocimiento',
            description: 'Reconocimiento por buen desempeño',
            cost: 0,
            selected: true,
            disabled: false
        });
    }

    onClose() {
        this.modalClose.emit();
    }

    onConfirm() {
        const selectedDocs = this.documents.filter(d => d.selected);
        this.confirm.emit(selectedDocs);
    }
}
