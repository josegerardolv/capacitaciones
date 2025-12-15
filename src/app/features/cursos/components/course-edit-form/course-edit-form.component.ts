import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { CoursesService } from '../../services/courses.service';
import { Course } from '../../../../core/models/course.model';

@Component({
    selector: 'app-course-edit-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputComponent, InstitutionalButtonComponent],
    templateUrl: './course-edit-form.component.html'
})
export class CourseEditFormComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() course: Course | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    editForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private coursesService: CoursesService
    ) {
        this.editForm = this.fb.group({
            code: ['', [Validators.required]],
            description: ['', [Validators.required]],
            duration: ['', [Validators.required]]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['course'] && this.course) {
            this.editForm.patchValue({
                code: this.course.code,
                description: this.course.description,
                duration: this.course.duration
            });
        }
    }

    getControl(name: string): FormControl {
        return this.editForm.get(name) as FormControl;
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('institutional-modal-overlay')) {
            this.closeModal();
        }
    }

    closeModal() {
        this.editForm.reset();
        this.close.emit();
    }

    save() {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const formValue = this.editForm.value;

        // Construct payload
        const payload = {
            id: this.course?.id,
            ...formValue
        };

        console.log('Updating Course:', payload);

        // Simulate API delay
        setTimeout(() => {
            this.isLoading = false;
            this.saved.emit();
            this.closeModal();
        }, 1000);
    }
}
