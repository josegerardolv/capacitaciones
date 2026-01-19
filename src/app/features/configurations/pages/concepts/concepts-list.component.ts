import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

import { Concept } from '../../../../core/models/template.model';
import { TemplateService } from '../../templates/services/template.service';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { InstitutionalCardComponent } from '../../../../shared/components/institutional-card/institutional-card.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component';
import { ModalFormComponent } from '../../../../shared/components/forms/modal-form.component';
import { InputComponent } from '../../../../shared/components/inputs/input.component';
import { AlertModalComponent, AlertConfig } from '../../../../shared/components/modals/alert-modal.component';
import { ConfirmationModalComponent, ConfirmationConfig } from '../../../../shared/components/modals/confirmation-modal.component';
import { TooltipDirective } from '../../../../shared/components/tooltip/tooltip.directive';

@Component({
    selector: 'app-concepts-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        PageHeaderComponent,
        InstitutionalCardComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalButtonComponent,
        ModalFormComponent,
        InputComponent,
        AlertModalComponent,
        ConfirmationModalComponent,
        TooltipDirective
    ],
    templateUrl: './concepts-list.component.html'
})
export class ConceptsListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('costoTemplate', { static: true }) costoTemplate!: TemplateRef<any>;

    concepts: Concept[] = [];

    // Table Config
    tableConfig: TableConfig = {
        loading: true,
        striped: true,
        hoverable: true,
        localSort: true
    };
    tableColumns: TableColumn[] = [];
    paginationConfig: PaginationConfig = {
        pageSize: 10,
        totalItems: 0,
        currentPage: 1,
        pageSizeOptions: [10, 20, 50],
        showInfo: true
    };

    // Form Config
    form!: FormGroup;
    isModalOpen = false;
    isSaving = false;
    editingId: number | null = null;

    // Alerts & Confirmations
    isAlertOpen = false;
    alertConfig: AlertConfig = { title: '', message: '', type: 'info' };

    isConfirmOpen = false;
    confirmConfig: ConfirmationConfig = {
        title: '', message: '', type: 'warning', confirmText: 'Sí', cancelText: 'No'
    };
    private pendingAction: (() => void) | null = null;

    actionButtonConfig = {
        text: 'Nuevo Concepto',
        icon: 'add',
        onClick: () => this.openForm()
    };

    constructor(
        private templateService: TemplateService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.initColumns();
        this.loadConcepts();
    }

    initForm() {
        this.form = this.fb.group({
            clave: ['', [Validators.required]],
            concepto: ['', [Validators.required]],
            costo: [0, [Validators.required, Validators.min(0)]]
        });
    }

    get claveControl(): FormControl { return this.form.get('clave') as FormControl; }
    get conceptoControl(): FormControl { return this.form.get('concepto') as FormControl; }
    get costoControl(): FormControl { return this.form.get('costo') as FormControl; }

    initColumns() {
        this.tableColumns = [
            { key: 'clave', label: 'Clave', sortable: true, minWidth: '120px' },
            { key: 'concepto', label: 'Concepto', sortable: true, minWidth: '350px' },
            { key: 'costo', label: 'Costo', sortable: true, minWidth: '100px', template: this.costoTemplate, align: 'right' },
            { key: 'actions', label: 'Acciones', align: 'center', minWidth: '120px', template: this.actionsTemplate }
        ];
    }

    loadConcepts() {
        this.tableConfig.loading = true;
        this.templateService.getConcepts().subscribe({
            next: (data) => {
                this.concepts = data;
                this.paginationConfig.totalItems = data.length;
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.tableConfig.loading = false;
                this.showAlert('Error', 'No se pudieron cargar los conceptos', 'danger');
            }
        });
    }

    onPageChange(event: PageChangeEvent) {
        this.paginationConfig.currentPage = event.page;
        this.paginationConfig.pageSize = event.pageSize;
        // Client-side pagination logic could go here if needed, 
        // but institutional-table handles local data display usually.
    }

    // CRUD Actions
    openForm(concept?: Concept) {
        this.initForm();
        if (concept) {
            this.editingId = concept.id;
            this.form.patchValue({
                clave: concept.clave,
                concepto: concept.concepto,
                costo: concept.costo
            });
        } else {
            this.editingId = null;
        }
        this.isModalOpen = true;
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData = this.form.value;

        const request$ = this.editingId
            ? this.templateService.updateConcept(this.editingId, formData)
            : this.templateService.createConcept(formData);

        request$.subscribe({
            next: () => {
                this.isSaving = false;
                this.isModalOpen = false;
                this.loadConcepts();
                this.showAlert('Éxito', `Concepto ${this.editingId ? 'actualizado' : 'creado'} correctamente`, 'success');
            },
            error: () => {
                this.isSaving = false;
                this.showAlert('Error', 'Ocurrió un error al guardar', 'danger');
            }
        });
    }

    deleteConcept(concept: Concept) {
        this.confirmConfig = {
            title: 'Eliminar Concepto',
            message: `¿Estás seguro de eliminar el concepto "${concept.clave}"?`,
            type: 'danger',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        };
        this.pendingAction = () => {
            this.templateService.deleteConcept(concept.id).subscribe({
                next: () => {
                    this.loadConcepts();
                    this.showAlert('Eliminado', 'Concepto eliminado correctamente', 'success');
                },
                error: () => this.showAlert('Error', 'No se pudo eliminar el concepto', 'danger')
            });
        };
        this.isConfirmOpen = true;
    }

    // Utils
    showAlert(title: string, message: string, type: 'success' | 'info' | 'warning' | 'danger') {
        this.alertConfig = { title, message, type };
        this.isAlertOpen = true;
    }

    onConfirmYes() {
        if (this.pendingAction) this.pendingAction();
        this.isConfirmOpen = false;
    }
}
