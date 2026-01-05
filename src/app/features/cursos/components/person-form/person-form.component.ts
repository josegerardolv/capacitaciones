import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { InputEnhancedComponent } from '@/app/shared/components/inputs/input-enhanced.component';
import { SelectComponent, SelectOption } from '@/app/shared/components/inputs/select.component';

@Component({
    selector: 'app-person-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent, InputEnhancedComponent, SelectComponent],
    templateUrl: './person-form.component.html'
})
export class PersonFormComponent implements OnInit {
    // fieldsConfig expected shape: { [fieldName: string]: { visible?: boolean; required?: boolean } }
    @Input() fieldsConfig: Record<string, { visible?: boolean; required?: boolean }> | null = null;
    @Input() initialData: any = null; // Para edición futura
    @Input() submitLabel: string = 'Guardar'; // Texto del botón de guardado
    @Input() showCancel: boolean = true; // Mostrar/Ocultar botón cancelar
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<any>();

    form: FormGroup;

    sexOptions: SelectOption[] = [
        { value: 'H', label: 'Hombre' },
        { value: 'M', label: 'Mujer' }
    ];

    tarjetonOptions: SelectOption[] = [
        { value: false, label: 'No' },
        { value: true, label: 'Sí' }
    ];

    getControl(key: string): FormControl {
        return this.form.get(key) as FormControl;
    }

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            firstSurname: [''],
            secondSurname: [''],
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
        this.applyFieldsConfig();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fieldsConfig'] && !changes['fieldsConfig'].firstChange) {
            this.applyFieldsConfig();
        }
    }

    private applyFieldsConfig(): void {
        if (!this.fieldsConfig) return;

        Object.keys(this.form.controls).forEach(key => {
            // name, firstSurname and secondSurname always visible by default
            const cfg = this.fieldsConfig ? this.fieldsConfig[key] : undefined;

            // Validators: add/remove required based on config.required (if provided)
            const control = this.form.get(key);
            if (!control) return;

            // Build validators keeping existing non-required validators
            const currentValidators = control.validator ? [control.validator] : [];

            // We need to inspect existing validators to preserve pattern/email etc.
            // For simplicity, rebuild validators: if cfg.required true -> include Validators.required
            const validators: any[] = [];

            // Preserve known specific validators by key
            if (key === 'curp') validators.push(Validators.pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/));
            if (key === 'phone') validators.push(Validators.pattern(/^\d{10}$/));
            if (key === 'email') validators.push(Validators.email);

            if (cfg && cfg.required) {
                validators.unshift(Validators.required);
            } else {
                // keep previously required for 'name' if no config provided
                if ((key === 'name') && !(cfg && cfg.required === false)) {
                    validators.unshift(Validators.required);
                }
            }

            control.setValidators(validators);
            control.updateValueAndValidity({ emitEvent: false });
        });
    }

    isVisible(field: string): boolean {
        // name and surnames are always visible
        if (field === 'name' || field === 'firstSurname' || field === 'secondSurname') return true;
        if (!this.fieldsConfig) return true;
        const cfg = this.fieldsConfig[field];
        return cfg && cfg.visible === false ? false : true;
    }

    isRequired(field: string): boolean {
        if (!this.fieldsConfig) {
            return field === 'name' || field === 'curp' || field === 'address' || field === 'sex';
        }
        const cfg = this.fieldsConfig[field];
        if (cfg && typeof cfg.required !== 'undefined') return !!cfg.required;
        // default requireds
        return field === 'name' || field === 'curp' || field === 'address' || field === 'sex';
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
