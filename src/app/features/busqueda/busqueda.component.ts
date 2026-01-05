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

// Interfaces para datos de la búsqueda
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
    CommonModule,
    ReactiveFormsModule,
    InstitutionalCardComponent,
    InstitutionalTableComponent,
    TablePaginationComponent,
    InstitutionalButtonComponent,
    InstitutionalBadgeComponent,
    InputEnhancedComponent,
    SelectComponent,
    BreadcrumbComponent,
    UniversalIconComponent,
    TooltipDirective
  ],
  templateUrl: './busqueda.component.html'
})
export class BusquedaComponent implements OnInit {
  @ViewChild('estatusTemplate', { static: true }) estatusTemplate!: TemplateRef<any>;
  @ViewChild('constanciaTemplate', { static: true }) constanciaTemplate!: TemplateRef<any>;

  // Formulario de búsqueda
  searchForm!: FormGroup;

  // Opciones del select de tipo de búsqueda
  searchTypeOptions: SelectOption[] = [
    { value: 'nombre', label: 'Buscar por Nombre' },
    { value: 'curp', label: 'Buscar por CURP' },
    { value: 'licencia', label: 'Buscar por Licencia' }
  ];

  // Estado de la búsqueda
  isSearching = false;
  hasSearched = false;
  personaEncontrada: PersonaInfo | null = null;
  ultimoCurso: UltimoCurso | null = null;
  cursosHistorial: CursoHistorial[] = [];

  // Configuración de la tabla
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

  // Breadcrumb
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Búsqueda' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initTableColumns();
  }

  // Helper para obtener controles tipados
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

    // Simulación de búsqueda (aquí iría la llamada al servicio real)
    setTimeout(() => {
      this.simulateSearch(tipoSearch, searchValue);
      this.isSearching = false;
      this.hasSearched = true;
    }, 800);
  }

  private simulateSearch(tipo: string, valor: string): void {
    // Datos de ejemplo para demostración
    this.personaEncontrada = {
      id: 1,
      nombre: 'Juan Jose Morales',
      licencia: 'VXCE910803MCCRCK34',
      fechaRegistro: '26/11/2025',
      estatus: 'Aprobado'
    };

    this.ultimoCurso = {
      fechaGrupo: '13/12/2025',
      grupo: 'A05',
      curso: 'Manejo Preventivo',
      folioConstancia: 'v2023-0641'
    };

    this.cursosHistorial = [
      { id: 1, curso: 'Manejo preventivo', grupo: 'A05', fecha: '12/12/24', estatus: 'Aprobado', constanciaUrl: '#' },
      { id: 2, curso: 'Reglas y normas', grupo: 'A06', fecha: '24/10/25', estatus: 'No Aprobado', constanciaUrl: '#' },
      { id: 3, curso: 'Manejo de extintores', grupo: 'B13', fecha: '18/11/25', estatus: 'Aprobado', constanciaUrl: '#' }
    ];

    this.paginationConfig.totalItems = this.cursosHistorial.length;
  }

  onClearSearch(): void {
    this.searchForm.patchValue({ searchValue: '' });
    this.personaEncontrada = null;
    this.ultimoCurso = null;
    this.cursosHistorial = [];
    this.hasSearched = false;
  }

  onPageChange(event: PageChangeEvent): void {
    this.paginationConfig.currentPage = event.page;
    this.paginationConfig.pageSize = event.pageSize;
  }

  viewConstancia(item: CursoHistorial): void {
    // Abrir constancia en nueva pestaña o modal
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
    return tipo === 'licencia' 
      ? 'Ingresa el número de licencia' 
      : 'Ingresa el nombre completo';
  }
}
