import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { isValidFileType, isFileSizeOk, formatFileSize } from '../utils/file-validators';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule, InstitutionalButtonComponent],
  template: `
    <div class="border-2 border-dashed rounded-xl p-6 text-center" 
         (dragover)="$event.preventDefault()" 
         (drop)="onDrop($event)">
      <input #inputFile type="file" class="hidden" (change)="onInputChange($event)" [attr.multiple]="multiple ? true : null" [attr.accept]="accept">

      <div class="space-y-4">
        <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>

        <div>
          <app-institutional-button
            [config]="{
              variant: 'primary'
            }"
            (clicked)="inputFile.click()">
            Seleccionar Archivos
          </app-institutional-button>
          <p class="text-gray-500 mt-2 text-sm">O arrastra y suelta archivos aquí</p>
        </div>

        <div class="text-xs text-gray-400">
          <p *ngIf="accept">Formatos aceptados: {{ accept }}</p>
          <p *ngIf="maxSizeMB">Tamaño máximo: {{ maxSizeMB }} MB por archivo</p>
        </div>
      </div>
    </div>
  `
})
export class FileDropzoneComponent {
  @Input() accept: string | null = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar';
  @Input() multiple = true;
  @Input() maxSizeMB = 10; // tamaño máximo por archivo en MB

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() validationError = new EventEmitter<string>();

  @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      this.handleFiles(Array.from(files));
    }
  }

  onInputChange(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length) {
      this.handleFiles(Array.from(files));
      // reset to allow selecting same file again
      this.inputFile.nativeElement.value = '';
    }
  }

  private handleFiles(files: File[]): void {
    const valid: File[] = [];
    for (const f of files) {
      if (this.accept && !isValidFileType(f, this.accept)) {
        this.validationError.emit(`Formato no permitido: ${f.name}`);
        continue;
      }

      if (!isFileSizeOk(f, this.maxSizeMB)) {
        this.validationError.emit(`Archivo demasiado grande: ${f.name} (${formatFileSize(f.size)})`);
        continue;
      }

      valid.push(f);
    }

    if (valid.length) {
      this.filesSelected.emit(valid);
    }
  }
}
