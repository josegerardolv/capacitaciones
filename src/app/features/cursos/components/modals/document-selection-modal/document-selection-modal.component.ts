import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseType } from '../../../../../core/models/group.model';

export interface DocumentOption {
    id: string;
    name: string;
    description: string;
    selected: boolean;
    disabled?: boolean;
}

@Component({
    selector: 'app-document-selection-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './document-selection-modal.component.html'
})
export class DocumentSelectionModalComponent {
    @Input() isOpen = false;
    @Input() courseType: CourseType = 'LICENCIA'; // Default logic
    @Input() customDocuments: any[] | null = null; // Accepting DocumentConfig

    // Internal state of documents
    documents: DocumentOption[] = [];

    @Output() modalClose = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<DocumentOption[]>();

    ngOnChanges(): void {
        if (this.isOpen) {
            this.initializeDocuments();
        }
    }

    initializeDocuments() {
        if (this.customDocuments && this.customDocuments.length > 0) {
            // Use custom configuration
            this.documents = this.customDocuments.map(doc => ({
                id: doc.id,
                name: doc.name,
                description: doc.name, // Use name as description if not provided
                selected: false, // Default to unchecked
                disabled: false // doc.required?
            }));
            return;
        }

        // Base documents
        this.documents = [
            {
                id: 'constancia',
                name: 'Constancia Básica',
                description: 'Constancia de acreditación de capacitación',
                selected: true,
                disabled: false
            }
        ];

        // Conditional documents based on CourseType
        if (this.courseType === 'LICENCIA') {
            this.documents.push({
                id: 'tarjeton',
                name: 'Tarjetón',
                description: 'Tarjetón del conductor',
                selected: false,
                disabled: false
            });
        }

        // Add Reconocimiento for everyone?
        this.documents.push({
            id: 'reconocimiento',
            name: 'Reconocimiento',
            description: 'Reconocimiento por buen desempeño',
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
