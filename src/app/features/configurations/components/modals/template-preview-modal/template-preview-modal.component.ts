import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { ModalComponent, ModalConfig } from '../../../../../shared/components/modals/modal.component';

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
        size: 'md',
        showHeader: true
    };

    onClose() {
        this.close.emit();
    }
}
