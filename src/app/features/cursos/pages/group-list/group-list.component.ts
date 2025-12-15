import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UniversalIconComponent } from '../../../../shared/components/universal-icon/universal-icon.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../../../shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '../../../../shared/components/table-pagination/table-pagination.component';
import { InstitutionalButtonComponent } from '../../../../shared/components/buttons/institutional-button.component'; // Import button
import { Group } from '../../../../core/models/group.model';
import { GroupsService } from '../../services/groups.service';

@Component({
    selector: 'app-group-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        UniversalIconComponent,
        InstitutionalTableComponent,
        TablePaginationComponent,
        InstitutionalButtonComponent
    ],
    templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
    @ViewChild('actionsTemplate', { static: true }) actionsTemplate!: TemplateRef<any>;
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('requestsTemplate', { static: true }) requestsTemplate!: TemplateRef<any>;
    @ViewChild('urlTemplate', { static: true }) urlTemplate!: TemplateRef<any>;
    @ViewChild('selectTemplate', { static: true }) selectTemplate!: TemplateRef<any>;

    groups: Group[] = [];

    tableConfig: TableConfig = {
        loading: true,
        striped: false,
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

    // Selection state
    allSelected = false;

    constructor(private groupsService: GroupsService) { }

    ngOnInit(): void {
        this.initColumns();
        this.loadGroups();
    }

    initColumns() {
        this.tableColumns = [
            //   { 
            //     key: 'select', 
            //     label: '', 
            //     sortable: false, 
            //     width: '40px',
            //     template: this.selectTemplate 
            //   },
            { key: 'name', label: 'Nombre', sortable: true, minWidth: '80px' },
            { key: 'description', label: 'Descripción', sortable: true, minWidth: '200px' },
            { key: 'location', label: 'Ubicación', sortable: true, minWidth: '150px' },
            { key: 'dateTime', label: 'Fecha y hora', sortable: true, minWidth: '150px' },
            { key: 'quantity', label: 'Cantidad', sortable: true, minWidth: '100px', align: 'center' },
            // { key: 'autoRegisterLimit', label: 'Limite de autoregistro', sortable: true, minWidth: '100px', align: 'center' }, // Shortened for UI fit
            {
                key: 'url', label: 'URL', sortable: false, minWidth: '150px',
                template: this.urlTemplate
            },
            {
                key: 'requests',
                label: 'Solicitudes',
                sortable: false,
                align: 'center',
                minWidth: '120px',
                template: this.requestsTemplate
            },
            {
                key: 'status',
                label: 'Estatus',
                sortable: true,
                align: 'center',
                minWidth: '100px',
                template: this.statusTemplate
            },
            {
                key: 'actions',
                label: 'Acciones',
                align: 'center',
                minWidth: '140px',
                template: this.actionsTemplate
            }
        ];
    }

    loadGroups() {
        this.tableConfig.loading = true;
        this.groupsService.getGroups().subscribe({
            next: (data) => {
                this.groups = data;
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

    deleteGroup(id: number) {
        if (confirm('¿Estás seguro de eliminar este grupo?')) {
            this.groupsService.deleteGroup(id).subscribe(() => this.loadGroups());
        }
    }

    // Placeholder actions
    exportData() { console.log('Exporting data...'); }
    generateUrl() { console.log('Generating URL...'); }
    openNewGroupForm() { console.log('Open New Group Form'); }
    openEditGroupForm(group: Group) { console.log('Edit Group', group); }

    toggleSelectAll() {
        this.allSelected = !this.allSelected;
        this.groups.forEach(g => g.selected = this.allSelected);
    }
}
