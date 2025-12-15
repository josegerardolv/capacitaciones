import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../../../core/models/course.model';
import { CoursesService } from '../../services/courses.service';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { CourseFormComponent } from '../../components/course-form/course-form.component';
import { CourseEditFormComponent } from '../../components/course-edit-form/course-edit-form.component';

@Component({
    selector: 'app-course-list',
    standalone: true,
    imports: [CommonModule, RouterModule, UniversalIconComponent, InstitutionalTableComponent, TablePaginationComponent, CourseFormComponent, CourseEditFormComponent],
    templateUrl: './course-list.component.html'
})
export class CourseListComponent implements OnInit {
    // ... existing ViewChild ...
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;

    courses: Course[] = [];

    // Modals State
    showForm = false; // New Course
    showEditForm = false; // Edit Course
    selectedCourseToEdit: Course | null = null;

    // ... existing config ...
    tableConfig: TableConfig = {
        loading: true,
        striped: false,
        hoverable: true,
        localSort: true
    };

    // ... existing properties ...
    tableColumns: TableColumn[] = [];
    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    constructor(private coursesService: CoursesService) { }

    ngOnInit(): void {
        this.initColumns();
        this.loadCourses();
    }

    initColumns() {
        this.tableColumns = [
            { key: 'code', label: 'Nombre', sortable: true, minWidth: '120px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '250px' },
            { key: 'duration', label: 'Duración', sortable: true, minWidth: '100px' },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    loadCourses() {
        this.tableConfig.loading = true;
        this.coursesService.getCourses().subscribe({
            next: (data) => {
                this.courses = data;
                this.paginationConfig.totalItems = data.length;
                this.tableConfig.loading = false;
            },
            error: () => {
                this.tableConfig.loading = false;
            }
        });
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
    }

    deleteCourse(id: number) {
        if (confirm('¿Estás seguro de eliminar este curso?')) {
            this.coursesService.deleteCourse(id).subscribe(() => {
                this.loadCourses();
            });
        }
    }

    // New Course Modal Handlers
    openForm() {
        this.showForm = true;
    }

    closeForm() {
        this.showForm = false;
    }

    onFormSaved() {
        this.showForm = false;
        this.loadCourses();
    }

    // Edit Course Modal Handlers
    openEditForm(course: Course) {
        this.selectedCourseToEdit = course;
        this.showEditForm = true;
    }

    closeEditForm() {
        this.showEditForm = false;
        this.selectedCourseToEdit = null;
    }

    onEditSaved() {
        this.showEditForm = false;
        this.selectedCourseToEdit = null;
        this.loadCourses();
    }
}
