import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../../../core/models/group.model';

@Component({
    selector: 'app-group-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, InstitutionalButtonComponent],
    templateUrl: './group-form.component.html'
})
export class GroupFormComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() group: Group | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    groupForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private groupsService: GroupsService
    ) {
        this.groupForm = this.fb.group({
            name: ['', [Validators.required]],
            duration: ['', [Validators.required]],
            location: [''],
            dateTime: ['', [Validators.required]],
            quantity: ['', [Validators.required, Validators.min(1)]],
            autoRegisterLimit: ['', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['group'] && this.group) {
            // Modo Edición: Llenamos el formulario con los datos existentes
            // Es necesario convertir la fecha para que el input type="datetime-local" la reconozca
            this.groupForm.patchValue({
                ...this.group,
                dateTime: this.formatDateForInput(this.group.dateTime)
            });
        } else if (changes['isOpen'] && this.isOpen && !this.group) {
            // Modo Creación: Limpiamos el formulario para asegurar que esté vacío
            this.groupForm.reset();
        }
    }

    private formatDateForInput(dateStr: string): string {
        // Transformamos el formato de visualización "dd/mm/yyyy, HH:mm"
        // al formato requerido por el input nativo: "yyyy-MM-ddTHH:mm"
        if (!dateStr) return '';
        try {
            const [datePart, timePart] = dateStr.split(', ');
            const [day, month, year] = datePart.split('/');
            return `${year}-${month}-${day}T${timePart}`;
        } catch (e) {
            console.error('Error al procesar la fecha:', dateStr);
            return '';
        }
    }

    getControl(name: string): FormControl {
        return this.groupForm.get(name) as FormControl;
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('institutional-modal-overlay')) {
            this.closeModal();
        }
    }

    closeModal() {
        this.groupForm.reset();
        this.close.emit();
    }

    save() {
        if (this.groupForm.invalid) {
            this.groupForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formValue = this.groupForm.value;

        console.log('Saving Group:', formValue);

        // Simulamos un delay de red para efecto visual
        setTimeout(() => {
            this.isLoading = false;
            // Emitimos el evento de guardado para que la lista se actualice
            this.saved.emit();
            this.closeModal();
            // TODO: Reemplazar con llamada real al servicio:
            // this.groupsService.createGroup(formValue).subscribe(...)
        }, 1000);
    }
}
