import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { InputEnhancedComponent } from '@/app/shared/components/inputs/input-enhanced.component';
import { SelectComponent, SelectOption } from '@/app/shared/components/inputs/select.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-person-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InstitutionalButtonComponent, InputEnhancedComponent, SelectComponent],
    templateUrl: './person-form.component.html'
})
export class PersonFormComponent implements OnInit {
    // fieldsConfig expected shape: { [fieldName: string]: { visible?: boolean; required?: boolean, label?: string } }
    @Input() fieldsConfig: Record<string, { visible?: boolean; required?: boolean, label?: string }> | null = null;
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



    getControl(key: string): FormControl {
        return this.form.get(key) as FormControl;
    }

    constructor(
        private fb: FormBuilder,
        private notificationService: NotificationService
    ) {
        this.form = this.fb.group({
            name: ['', Validators.required],
            paternal_lastName: [''],
            maternal_lastName: [''],
            license: [''],
            curp: ['', [Validators.required, Validators.pattern(/^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/), Validators.minLength(18), Validators.maxLength(18)]],
            address: ['', Validators.required],
            sex: ['', Validators.required],
            nuc: [''],
            phone: ['', [Validators.pattern(/^\d{10}$/)]],
            email: ['', [Validators.email]]
        });
    }

    ngOnInit(): void {
        if (this.initialData) {
            this.form.patchValue(this.initialData);
        }
        this.applyFieldsConfig();
        this.setupCurpListener();
    }

    private setupCurpListener(): void {
        const curpControl = this.form.get('curp');
        if (!curpControl) return;

        // escucha cambios en el campo curp
        curpControl.valueChanges.subscribe((value: string) => {
            this.extractAndSetSex(value);
        });

        // inicializa el campo sex con el valor extraído de curp
        if (curpControl.value) {
            this.extractAndSetSex(curpControl.value);
        }
    }

    private extractAndSetSex(curp: string): void {
        if (!curp || curp.length < 11) return;

        const sexChar = curp.charAt(10).toUpperCase();
        let mappedSex = '';

        // Mapeo según los valores esperados por el SelectComponent
        if (sexChar === 'H') mappedSex = 'H';
        else if (sexChar === 'M') mappedSex = 'M';

        if (mappedSex) {
            const currentSex = this.form.get('sex')?.value;
            if (currentSex !== mappedSex) {
                this.form.patchValue({ sex: mappedSex });
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['fieldsConfig'] && !changes['fieldsConfig'].firstChange) {
            this.applyFieldsConfig();
        }
        if (changes['initialData'] && changes['initialData'].currentValue) {
            this.form.reset();
            this.form.patchValue(changes['initialData'].currentValue);
        }
    }

    private applyFieldsConfig(): void {
        if (!this.fieldsConfig) return;

        Object.keys(this.form.controls).forEach(key => {
            // name, paternal_lastName and maternal_lastName always visible by default
            const cfg = this.fieldsConfig ? this.fieldsConfig[key] : undefined;
            const control = this.form.get(key);
            if (!control) return;

            // REGLA CRÍTICA: Si el campo NO es visible, removemos todos los validadores 
            // (a menos que sea un campo core que siempre es visible)
            const isCoreAlwaysVisible = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'phone'].includes(key);
            if (cfg && cfg.visible === false && !isCoreAlwaysVisible) {
                control.clearValidators();
                control.updateValueAndValidity({ emitEvent: false });
                return;
            }

            // Build validators keeping existing non-required validators
            const validators: any[] = [];
            // ... (rest of the logic for visible fields)
            if (key === 'curp') {
                validators.push(Validators.pattern(/^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/));
                validators.push(Validators.minLength(18));
                validators.push(Validators.maxLength(18));
            }
            if (key === 'phone') validators.push(Validators.pattern(/^\d{10}$/));
            if (key === 'email') validators.push(Validators.email);

            if (cfg && cfg.required) {
                validators.unshift(Validators.required);
            } else {
                if ((key === 'name') && !(cfg && cfg.required === false)) {
                    validators.unshift(Validators.required);
                }
            }

            control.setValidators(validators);
            control.updateValueAndValidity({ emitEvent: false });
        });
    }

    isVisible(field: string): boolean {
        // CAMPOS QUE SIEMPRE SE MUESTRAN (Configuración del Sistema)
        const coreFields = ['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'phone'];
        if (coreFields.includes(field)) return true;

        if (!this.fieldsConfig) return false;

        const cfg = this.fieldsConfig[field];
        return cfg?.visible === true;
    }

    isRequired(field: string): boolean {
        // CAMPOS SIEMPRE OBLIGATORIOS (Configuración fija)
        const mandatoryCore = ['name', 'curp', 'email'];
        if (mandatoryCore.includes(field)) return true;

        // CAMPOS SIEMPRE OPCIONALES (Apellidos)
        if (field === 'paternal_lastName' || field === 'maternal_lastName') return false;

        if (!this.fieldsConfig) return false;

        const cfg = this.fieldsConfig[field];

        // Si el campo no es visible, nunca puede ser requerido para el usuario
        if (cfg?.visible === false && !['name', 'paternal_lastName', 'maternal_lastName', 'curp', 'email', 'phone'].includes(field)) {
            return false;
        }

        return cfg?.required === true;
    }

    onSubmit() {
        if (this.form.valid) {
            this.saved.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
            this.notificationService.showWarning('Formulario Incompleto', 'Por favor, complete todos los campos marcados como obligatorios.');
        }
    }

    private getFieldLabel(key: string): string {
        if (this.fieldsConfig && this.fieldsConfig[key] && this.fieldsConfig[key]['label']) {
            return this.fieldsConfig[key]['label'];
        }

        const labels: Record<string, string> = {
            'name': 'Nombre',
            'paternal_lastName': 'Primer Apellido',
            'maternal_lastName': 'Segundo Apellido',
            'curp': 'CURP',
            'address': 'Dirección',
            'sex': 'Sexo',
            'nuc': 'NUC',
            'phone': 'Teléfono',
            'email': 'Correo electrónico',
            'license': 'Licencia'
        };
        return labels[key] || key;
    }

    onCancel() {
        this.close.emit();
    }
}
