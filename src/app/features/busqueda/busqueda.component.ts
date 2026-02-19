import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { InstitutionalCardComponent } from '@/app/shared/components/institutional-card/institutional-card.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '@/app/shared/components/institutional-table/institutional-table.component';
import { TablePaginationComponent, PaginationConfig, PageChangeEvent } from '@/app/shared/components/table-pagination/table-pagination.component';
import { InstitutionalButtonComponent } from '@/app/shared/components/buttons/institutional-button.component';
import { InstitutionalBadgeComponent, BadgeConfig } from '@/app/shared/components/badge/institutional-badge.component';
import { InputEnhancedComponent } from '@/app/shared/components/inputs/input-enhanced.component';
import { SelectComponent, SelectOption } from '@/app/shared/components/inputs/select.component';
import { BreadcrumbComponent } from '@/app/shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '@/app/shared/components/breadcrumb/breadcrumb.model';
import { UniversalIconComponent } from '@/app/shared/components/universal-icon/universal-icon.component';
import { TooltipDirective } from '@/app/shared/components/tooltip/tooltip.directive';
import { BusquedaService, PersonData } from './services/busqueda.service';

export interface PersonaInfo {
  id: number;
  nombre: string;
  licencia: string;
  fotoUrl?: string;
  fechaRegistro: string;
  estatus: 'Aprobado' | 'No Aprobado' | 'En Curso' | 'Pendiente';
}

export interface UltimoCurso {
  fechaGrupo: string;
  grupo: string;
  curso: string;
  folioConstancia: string;
}

export interface CursoHistorial {
  id: number;
  curso: string;
  grupo: string;
  fecha: string;
  estatus: 'Aprobado' | 'No Aprobado' | 'En Curso' | 'Pendiente';
  constanciaUrl?: string;
}

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, InstitutionalCardComponent, InstitutionalTableComponent,
    TablePaginationComponent, InstitutionalButtonComponent, InstitutionalBadgeComponent,
    InputEnhancedComponent, SelectComponent, BreadcrumbComponent, UniversalIconComponent,
    TooltipDirective
  ],
  templateUrl: './busqueda.component.html'
})
export class BusquedaComponent implements OnInit {
  @ViewChild('estatusTemplate', { static: true }) estatusTemplate!: TemplateRef<any>;
  @ViewChild('constanciaTemplate', { static: true }) constanciaTemplate!: TemplateRef<any>;

  searchForm!: FormGroup;

  searchTypeOptions: SelectOption[] = [
    { value: 'nombre', label: 'Buscar por Nombre' },
    { value: 'nuc', label: 'Buscar por NUC' },
    { value: 'licencia', label: 'Buscar por Licencia' }
  ];

  isSearching = false;
  hasSearched = false;

  searchResults: PersonData[] = [];

  private lastSearchType: 'nombre' | 'licencia' | 'nuc' = 'nombre';
  private lastSearchValue: string = '';

  personaEncontrada: PersonaInfo | null = null;
  ultimoCurso: UltimoCurso | null = null;
  cursosHistorial: CursoHistorial[] = [];

  tableColumns: TableColumn[] = [];
  tableConfig: TableConfig = {
    striped: false,
    hoverable: true,
    localSort: true,
    loading: false
  };

  paginationConfig: PaginationConfig = {
    pageSize: 10,
    totalItems: 0,
    currentPage: 1,
    pageSizeOptions: [5, 10, 20],
    showInfo: true
  };

  searchResultsPaginationConfig: PaginationConfig = {
    pageSize: 5,
    totalItems: 0,
    currentPage: 1,
    pageSizeOptions: [5, 10, 20],
    showInfo: true
  };

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Búsqueda' }
  ];

  constructor(
    private fb: FormBuilder,
    private busquedaService: BusquedaService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initTableColumns();
  }

  getControl(name: string): FormControl {
    return this.searchForm.get(name) as FormControl;
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      tipoSearch: ['nombre'],
      searchValue: ['']
    });
  }

  private initTableColumns(): void {
    this.tableColumns = [
      { key: 'curso', label: 'Curso', sortable: true, minWidth: '150px' },
      { key: 'grupo', label: 'Grupo', sortable: true, minWidth: '80px', align: 'center' },
      { key: 'fecha', label: 'Fecha', sortable: true, minWidth: '100px', align: 'center' },
      {
        key: 'estatus',
        label: 'Estatus',
        sortable: true,
        minWidth: '120px',
        align: 'center',
        template: this.estatusTemplate
      },
      {
        key: 'constancia',
        label: 'Constancias',
        minWidth: '120px',
        align: 'center',
        template: this.constanciaTemplate
      }
    ];
  }

  onSearch(): void {
    const { tipoSearch, searchValue } = this.searchForm.value;

    if (!searchValue?.trim()) {
      return;
    }

    this.isSearching = true;
    this.hasSearched = false;
    this.clearResults();

    this.lastSearchType = tipoSearch;
    this.lastSearchValue = searchValue;

    this.busquedaService.searchPerson(
      tipoSearch,
      searchValue,
      this.searchResultsPaginationConfig.currentPage,
      this.searchResultsPaginationConfig.pageSize
    ).subscribe({
        next: (response) => {
          this.isSearching = false;
          this.hasSearched = true;

          if (response.data.length === 0 && response.meta.total === 0) {
            this.searchResults = [];
          } else if (response.meta.total === 1) {
            this.searchResults = [];
            this.mapPersonData(response.data[0]);
          } else {
            this.searchResults = response.data;
            this.searchResultsPaginationConfig.totalItems = response.meta.total;
          }
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.clearResults();
          this.isSearching = false;
          this.hasSearched = true;
        }
      });
  }


  onSelectPerson(person: PersonData): void {
    this.searchResults = [];
    this.mapPersonData(person);
  }


  getFullName(person: PersonData): string {
    return `${person.name} ${person.paternal_lastName} ${person.maternal_lastName}`.trim();
  }


  getNuc(person: PersonData): string {
    return person.nuc || '—';
  }

  private mapPersonData(person: PersonData): void {
    this.personaEncontrada = {
      id: person.id,
      nombre: `${person.name} ${person.paternal_lastName} ${person.maternal_lastName}`,
      licencia: person.license,
      fechaRegistro: new Date(person.createdAt).toLocaleDateString('es-MX'),
      estatus: this.getPersonStatus(person)
    };

    const sortedEnrollments = [...person.enrollments].sort((a, b) =>
      new Date(b.group.groupStartDate).getTime() - new Date(a.group.groupStartDate).getTime()
    );

    if (sortedEnrollments.length > 0) {
      const lastEnrollment = sortedEnrollments[0];
      this.ultimoCurso = {
        fechaGrupo: new Date(lastEnrollment.group.groupStartDate).toLocaleDateString('es-MX'),
        grupo: lastEnrollment.group.name,
        curso: lastEnrollment.group.course?.name || 'Sin curso',
        folioConstancia: ''
      };
    } else {
      this.ultimoCurso = null;
    }

    this.cursosHistorial = sortedEnrollments.map(enrollment => ({
      id: enrollment.id,
      curso: enrollment.group.course?.name || 'Sin curso',
      grupo: enrollment.group.name,
      fecha: new Date(enrollment.group.groupStartDate).toLocaleDateString('es-MX'),
      estatus: this.getEnrollmentStatus(enrollment),
      constanciaUrl: enrollment.isAcepted ? '#' : undefined
    }));

    this.paginationConfig.totalItems = this.cursosHistorial.length;
  }

  private getPersonStatus(person: PersonData): PersonaInfo['estatus'] {
    if (person.enrollments.length === 0) return 'Pendiente';

    const hasApproved = person.enrollments.some(e => e.isAcepted);
    const hasRejected = person.enrollments.some(e => e.dateReject);
    const hasPending = person.enrollments.some(e => !e.isAcepted && !e.dateReject);

    if (hasApproved) return 'Aprobado';
    if (hasRejected) return 'No Aprobado';
    if (hasPending) return 'En Curso';
    return 'Pendiente';
  }

  private getEnrollmentStatus(enrollment: any): CursoHistorial['estatus'] {
    if (enrollment.isAcepted) return 'Aprobado';
    if (enrollment.dateReject) return 'No Aprobado';
    return 'En Curso';
  }

  onSearchResultsPageChange(event: PageChangeEvent): void {
    this.searchResultsPaginationConfig.currentPage = event.page;
    this.searchResultsPaginationConfig.pageSize = event.pageSize;
    this.fetchSearchResultsPage();
  }

  private fetchSearchResultsPage(): void {
    this.isSearching = true;
    this.busquedaService.searchPerson(
      this.lastSearchType,
      this.lastSearchValue,
      this.searchResultsPaginationConfig.currentPage,
      this.searchResultsPaginationConfig.pageSize
    ).subscribe({
      next: (response) => {
        this.isSearching = false;
        this.searchResults = response.data;
        this.searchResultsPaginationConfig.totalItems = response.meta.total;
      },
      error: (error) => {
        console.error('Error al paginar resultados:', error);
        this.isSearching = false;
      }
    });
  }

  private clearResults(): void {
    this.searchResults = [];
    this.personaEncontrada = null;
    this.ultimoCurso = null;
    this.cursosHistorial = [];
    this.paginationConfig.totalItems = 0;
    this.searchResultsPaginationConfig.currentPage = 1;
    this.searchResultsPaginationConfig.totalItems = 0;
  }

  onClearSearch(): void {
    this.searchForm.patchValue({ searchValue: '' });
    this.clearResults();
    this.hasSearched = false;
  }

  onPageChange(event: PageChangeEvent): void {
    this.paginationConfig.currentPage = event.page;
    this.paginationConfig.pageSize = event.pageSize;
  }

  viewConstancia(item: CursoHistorial): void {
    if (item.constanciaUrl) {
      window.open(item.constanciaUrl, '_blank');
    }
  }

  getEstatusBadgeConfig(estatus: string): BadgeConfig {
    const configs: Record<string, BadgeConfig> = {
      'Aprobado': { variant: 'success', size: 'small' },
      'No Aprobado': { variant: 'danger', size: 'small' },
      'En Curso': { variant: 'info', size: 'small' },
      'Pendiente': { variant: 'warning', size: 'small' }
    };
    return configs[estatus] || { variant: 'secondary', size: 'small' };
  }

  getSearchPlaceholder(): string {
    const tipo = this.searchForm.get('tipoSearch')?.value;
    const placeholders: Record<string, string> = {
      'nombre': 'Ingresa el nombre completo',
      'licencia': 'Ingresa el número de licencia',
      'nuc': 'Ingresa el NUC'
    };
    return placeholders[tipo] || 'Ingresa el valor a buscar';
  }
}