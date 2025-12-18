import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';

@Component({
    selector: 'app-driver-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent],
    templateUrl: './driver-form.component.html'
})
export class DriverFormComponent implements OnInit {
    @Input() initialData: any = null; // Para edición futura
    @Input() submitLabel: string = 'Guardar'; // Texto del botón de guardado
    @Input() showCancel: boolean = true; // Mostrar/Ocultar botón cancelar
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<any>();

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            license: [''],
            curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/)]],
            address: ['', Validators.required],
            sex: ['', Validators.required],
            nuc: [''],
            phone: ['', [Validators.pattern(/^\d{10}$/)]],
            email: ['', [Validators.email]],
            requestTarjeton: [false]
        });
    }

    ngOnInit(): void {
        if (this.initialData) {
            this.form.patchValue(this.initialData);
        }
    }

    onSubmit() {
        if (this.form.valid) {
            this.saved.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    onCancel() {
        this.close.emit();
    }
}
