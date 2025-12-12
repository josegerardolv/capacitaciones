import { Component, Input, OnInit, Optional, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl } from '@angular/forms';

import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent],
  template: `
    <div class="mt-2">
      <label *ngIf="label" class="form-label">{{ label }}</label>

      <div class="bg-white border border-dashed rounded p-3 flex items-center gap-3 cursor-pointer hover:shadow transition-all"
           [class.border-institucional-primario]="isDragOver"
           (click)="triggerFileInput()"
           (drop)="onDrop($event)"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave()">

        <div class="text-2xl text-institucional-primario">📁</div>

        <div class="flex-1">
          <div *ngIf="!fileName" class="text-sm text-gray-500">Seleccionar archivo o arrastra aquí</div>
          <div *ngIf="fileName" class="text-sm font-medium text-gray-800">{{ fileName }}</div>
          <img *ngIf="previewUrl" [src]="previewUrl" class="mt-2 w-24 h-24 object-cover rounded border" alt="Vista previa" />
          <div *ngIf="hint" class="text-xs text-gray-400 mt-1">{{ hint }}</div>
        </div>

        <div class="flex flex-col gap-2 items-end">
          <app-institutional-button
            [config]="{
              variant: 'primary',
              size: 'small'
            }"
            (clicked)="triggerFileInput(); $event.stopPropagation()">
            Seleccionar
          </app-institutional-button>
          <app-institutional-button
            *ngIf="fileName"
            [config]="{
              variant: 'secondary',
              size: 'small'
            }"
            (clicked)="clear(); $event.stopPropagation()">
            Quitar
          </app-institutional-button>
        </div>

        <input #fileInput type="file" class="hidden" [attr.accept]="accept" (change)="onChange($event)" />
      </div>
    </div>
  `
})
export class FileInputComponent implements OnInit {
  @Input() controlName?: string;
  @Input() label?: string = 'Archivo';
  @Input() accept?: string | null = null;
  @Input() hint?: string | null = 'Formatos soportados: todos los tipos';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  control?: FormControl | null = null;
  isDragOver = false;
  previewUrl: string | null = null;
  private _lastFileName: string | null = null;

  constructor(@Optional() private controlContainer: ControlContainer) {}

  ngOnInit(): void {
    if (this.controlName && this.controlContainer && this.controlContainer.control) {
      const c = this.controlContainer.control.get(this.controlName as string);
      if (c instanceof FormControl) this.control = c as FormControl;
    }
    // if no control, keep local state only
  }

  get fileName(): string | null {
    if (this._lastFileName) return this._lastFileName;
    const val: any = this.control?.value;
    if (val instanceof File) return val.name;
    if (typeof val === 'string' && val.length) return val.split('\\').pop() || val;
    return null;
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  onChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input) return;
    const file = input.files && input.files.length ? input.files[0] : null;
    this._lastFileName = file ? file.name : null;
    if (this.control) {
      this.control.setValue(file);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    if (file) this.generatePreview(file);
  }

  clear(): void {
    this._lastFileName = null;
    this.previewUrl = null;
    if (this.control) {
      this.control.setValue(null);
      this.control.markAsDirty();
      this.control.markAsTouched();
    }
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  generatePreview(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this._lastFileName = file.name;
      if (this.control) {
        this.control.setValue(file);
        this.control.markAsDirty();
        this.control.markAsTouched();
      }
      this.generatePreview(file);
      if (this.fileInput) {
        const dt = new DataTransfer();
        dt.items.add(file);
        this.fileInput.nativeElement.files = dt.files;
      }
    }
  }
}
