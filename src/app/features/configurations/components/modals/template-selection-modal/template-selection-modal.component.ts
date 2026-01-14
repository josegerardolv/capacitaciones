import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversalIconComponent } from '../../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalButtonComponent } from '../../../../../shared/components/buttons/institutional-button.component';
import { TemplateService } from '../../../../templates/services/template.service';
import { CertificateTemplate } from '../../../../../core/models/template.model';

@Component({
  selector: 'app-template-selection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, UniversalIconComponent, InstitutionalButtonComponent],
  templateUrl: './template-selection-modal.component.html',
  styles: [`
    .modal-overlay {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
    }
    .scrollbar-custom::-webkit-scrollbar {
        width: 6px;
    }
    .scrollbar-custom::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    .scrollbar-custom::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px; 
    }
    .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background: #999; 
    }
  `]
})
export class TemplateSelectionModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() preselectedTemplateIds: number[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<CertificateTemplate[]>(); // Emits selected templates

  templates: CertificateTemplate[] = []; // ID, name, description
  selectedTemplates: Set<number> = new Set();
  loading = false;

  // Pagination/Filter mockup logic if needed, for now simple list
  pageSize = 10;

  constructor(private templateService: TemplateService) { }

  ngOnInit(): void {
    // In a real scenario, use templateService.getTemplates()
    // Mocking for now as I need to check TemplateService structure
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    this.templateService.getTemplates().subscribe({
      next: (data: CertificateTemplate[]) => {
        this.templates = data;
        // Restore selection
        if (this.preselectedTemplateIds) {
          this.preselectedTemplateIds.forEach(id => this.selectedTemplates.add(id));
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading templates', err);
        this.loading = false;
      }
    });
  }

  toggleSelection(templateId: number) {
    if (this.selectedTemplates.has(templateId)) {
      this.selectedTemplates.delete(templateId);
    } else {
      this.selectedTemplates.add(templateId);
    }
  }

  isSelected(templateId: number): boolean {
    return this.selectedTemplates.has(templateId);
  }

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    const selected = this.templates.filter(t => this.selectedTemplates.has(t.id));
    this.confirm.emit(selected);
  }
}
