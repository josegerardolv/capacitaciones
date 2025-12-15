import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { CoursesService } from '../../services/courses.service';

@Component({
    selector: 'app-course-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, InstitutionalButtonComponent],
    templateUrl: './course-form.component.html'
})
export class CourseFormComponent {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    courseForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private coursesService: CoursesService
    ) {
        this.courseForm = this.fb.group({
            code: ['', [Validators.required]],
            description: ['', [Validators.required]],
            duration: ['', [Validators.required]]
        });
    }

    getControl(name: string): FormControl {
        return this.courseForm.get(name) as FormControl;
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('institutional-modal-overlay')) {
            this.closeModal();
        }
    }

    closeModal() {
        this.courseForm.reset();
        this.close.emit();
    }

    save() {
        if (this.courseForm.invalid) {
            this.courseForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formValue = this.courseForm.value;

        console.log('Saving Course:', formValue);

        // Simulate API delay
        setTimeout(() => {
            this.isLoading = false;
            this.saved.emit();
            this.closeModal();
        }, 1000);
    }
}
