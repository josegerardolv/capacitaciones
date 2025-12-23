import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFormComponent, SearchField, SearchFilters } from '../../components/search-form/search-form.component';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '@/app/shared/components';
import { BadgeGroupComponent, BadgeItem } from '@/app/shared/components';
import { ButtonGroupComponent } from '@/app/shared/components/buttons';

//Interfaz que representa un curso tomado por un conductor
//Contiene información completa del conductor y del curso

interface UltimoCurso{
  id: number;
  nombre: string;
  licencia: string;
  foto: string;
  fechaRegistro: string;
  estatus: string;
  fechaGrupo: string;
  grupo: string;
  curso: string;
  folioConstancia: string;
  curp: string;
  nuc: string;
  direccion?: string;
  sexo?: 'H' | 'M';
  telefono?: string;
  correo?: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SearchFormComponent, InstitutionalTableComponent, BadgeGroupComponent, ButtonGroupComponent],
  templateUrl: './search.component.html',
  styles: []
})
export class SearchComponent implements AfterViewInit{
  // Referencias a templates personalizados para columnas custom de la tabla en donde se requiere el button grouo y los badges
  @ViewChild('estatusTemplate', { static: false }) estatusTemplate!: TemplateRef<any>;
  @ViewChild('constanciasTemplate', { static: false }) constanciasTemplate!: TemplateRef<any>;
  

  // Se configuran los campos de busqueda y los elementos que contendrá el dropdown
  searchFields: SearchField[] = [
    {
      key: 'tipoBusqueda',
      label: 'Seleccione el tipo de búsqueda que quiere realizar',
      type: 'select',
      placeholder: 'Selecciona una opción',
      icon: 'search',
      options: [
        { value: 'nombre', label: 'Por Nombre' },
        { value: 'licencia', label: 'Por Licencia' }
      ]
    }
  ];

  quickFilters = [];

  resultCount = 0;
  hasSearched = false;

//Datos estáticos de ejemplo
//Contiene todos los cursos de todos los conductores

  private todosLosCursos: UltimoCurso[] = [
    { id: 1, nombre: 'Juan Perez', curp: 'JLAL440721HGRKWY41', nuc: '01-191', licencia: 'LIC-001234', foto: ' ', fechaRegistro: '2024-01-15', estatus: 'Aprobado', fechaGrupo: '2024-12-13', grupo: 'A05', curso: 'Manejo Preventivo', folioConstancia: 'v2023-0641', direccion: 'Ignacio Allende, Centro', sexo: 'H', telefono: '9513154357', correo: 'juan.perez@example.com' },
    { id: 2, nombre: 'Juan Perez', curp: 'JLAL440721HGRKWY41', nuc: '01-191', licencia: 'LIC-001234', foto: ' ', fechaRegistro: '2023-06-10', estatus: 'Aprobado', fechaGrupo: '2023-08-20', grupo: 'B03', curso: 'Manejo Defensivo', folioConstancia: 'v2022-0512', direccion: 'Ignacio Allende, Centro', sexo: 'H', telefono: '9513154357', correo: 'juan.perez@example.com' },
    { id: 3, nombre: 'Juan Perez', curp: 'JLAL440721HGRKWY41', nuc: '01-191', licencia: 'LIC-001234', foto: ' ', fechaRegistro: '2022-03-05', estatus: 'Aprobado', fechaGrupo: '2022-05-15', grupo: 'C01', curso: 'Primeros Auxilios', folioConstancia: 'v2021-0301', direccion: 'Ignacio Allende, Centro', sexo: 'H', telefono: '9513154357', correo: 'juan.perez@example.com' },
    
    { id: 4, nombre: 'Miguel Costilla', curp: 'MICO440721HGRKWY42', nuc: '02-192', licencia: 'LIC-005678', foto: ' ', fechaRegistro: '2024-02-20', estatus: 'No Aprobado', fechaGrupo: '2024-11-15', grupo: 'B12', curso: 'Manejo Defensivo', folioConstancia: 'v2023-0642', direccion: 'Reforma, Centro', sexo: 'H', telefono: '9514123678', correo: 'miguel.costilla@example.com' },
    { id: 5, nombre: 'Miguel Costilla', curp: 'MICO440721HGRKWY42', nuc: '02-192', licencia: 'LIC-005678', foto: ' ', fechaRegistro: '2023-05-12', estatus: 'Aprobado', fechaGrupo: '2023-07-22', grupo: 'A08', curso: 'Seguridad Vial', folioConstancia: 'v2022-0523', direccion: 'Reforma, Centro', sexo: 'H', telefono: '9514123678', correo: 'miguel.costilla@example.com' },
    
    { id: 6, nombre: 'Gerardo Gonzalez', curp: 'GEGO440721HGRKWY43', nuc: '03-193', licencia: 'LIC-009012', foto: ' ', fechaRegistro: '2024-03-10', estatus: 'Aprobado', fechaGrupo: '2024-10-05', grupo: 'C07', curso: 'Señales de Transito', folioConstancia: 'v2023-0643', direccion: 'Cosijoeza, Centro', sexo: 'H', telefono: '9517894561', correo: 'gerardo.gonzalez@example.com' },
    { id: 7, nombre: 'Gerardo Gonzalez', curp: 'GEGO440721HGRKWY43', nuc: '03-193', licencia: 'LIC-009012', foto: ' ', fechaRegistro: '2023-01-18', estatus: 'Aprobado', fechaGrupo: '2023-03-25', grupo: 'D05', curso: 'Manejo Preventivo', folioConstancia: 'v2022-0234', direccion: 'Cosijoeza, Centro', sexo: 'H', telefono: '9517894561', correo: 'gerardo.gonzalez@example.com' },
    
    { id: 8, nombre: 'Maria Lopez', curp: 'MALO440721HGRKWY44', nuc: '04-194', licencia: 'LIC-003456', foto: ' ', fechaRegistro: '2024-01-25', estatus: 'Pendiente', fechaGrupo: '2024-09-18', grupo: 'D03', curso: 'Manejo Preventivo', folioConstancia: 'v2023-0644', direccion: 'Moctezuma, Xoxocotlan', sexo: 'M', telefono: '9516547890', correo: 'maria.lopez@example.com' },
    
    { id: 9, nombre: 'Carlos Ramirez', curp: 'CARA440721HGRKWY45', nuc: '05-195', licencia: 'LIC-007890', foto: ' ', fechaRegistro: '2024-02-14', estatus: 'Aprobado', fechaGrupo: '2024-08-22', grupo: 'E09', curso: 'Seguridad Vial', folioConstancia: 'v2023-0645', direccion: 'Vicente Guerrero, Centro', sexo: 'H', telefono: '9511234567', correo: 'carlos.ramirez@example.com' },
    { id: 10, nombre: 'Carlos Ramirez', curp: 'CARA440721HGRKWY45', nuc: '05-195', licencia: 'LIC-007890', foto: ' ', fechaRegistro: '2023-09-05', estatus: 'Aprobado', fechaGrupo: '2023-11-10', grupo: 'F02', curso: 'Manejo Defensivo', folioConstancia: 'v2022-0789', direccion: 'Vicente Guerrero, Centro', sexo: 'H', telefono: '9511234567', correo: 'carlos.ramirez@example.com' }
  ];

  ultimosCursos: UltimoCurso[] = []; // Curso más reciente del conductor
  cursosAnteriores: UltimoCurso[] = []; // Todos los demás cursos que el conductor ha tomado

// Configuración de la tabla "Ultimo Curso Tomado"
  tableConfig: TableConfig = {
    loading: false,
    striped: true,
    hoverable: true,
  };

// Configuración de la tabla "Cursos Tomados Anteriormente"
  tableConfigAnteriores: TableConfig = {
    loading: false,
    striped: true,
    hoverable: true
  };

//Definición de columnas para la tabla "Último Curso Tomado"
//Muestra información completa del curso más reciente del conductor
  tableColumns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', sortable: false, align: 'center' },
    { key: 'licencia', label: 'Licencia', sortable: false, align: 'center' },
    { key: 'foto', label: 'Foto del Conductor', align: 'center' },
    { key: 'fechaRegistro', label: 'Fecha de registro al grupo', sortable: false, type: 'date', align: 'center' },
    { key: 'estatus', label: 'Estatus', sortable: false, align: 'center' },
    { key: 'fechaGrupo', label: 'Fecha del grupo', sortable: false, type: 'date', align: 'center' },
    { key: 'grupo', label: 'Grupo', sortable: false, align: 'center' },
    { key: 'curso', label: 'Curso', sortable: false, align: 'center' },
    { key: 'folioConstancia', label: 'Folio de constancia', sortable: false, align: 'center' }
  ];

//Definición de columnas para la tabla "Cursos Tomados Anteriormente"
//Incluye columnas custom para badges de estatus y botón de constancia
  tableColumnsAnteriores: TableColumn[] = [
    { key: 'curso', label: 'Curso', sortable: false, align: 'center' },
    { key: 'fechaRegistro', label: 'Fecha de registro', sortable: false, type: 'date', align: 'center' },
    { key: 'grupo', label: 'Grupo', sortable: false, align: 'center' },
    { key: 'estatus', label: 'Estatus', sortable: false, align: 'center' , type: 'custom' },
    { key: 'constancia', label: 'Constancias', sortable: false, align: 'center', type: 'custom' }
  ];


// Asigna los templates personalizados a las columnas correspondientes
  ngAfterViewInit() {
    //Template del badge para la columna de estatus
    const estatusColumn = this.tableColumnsAnteriores.find(col => col.key === 'estatus');
    if (estatusColumn && this.estatusTemplate) {
      estatusColumn.template = this.estatusTemplate;
    }

    //Template del botón "view" para las constancias
    const constanciasColumn = this.tableColumnsAnteriores.find(col => col.key === 'constancia');
    if (constanciasColumn && this.constanciasTemplate) {
      constanciasColumn.template = this.constanciasTemplate;
    }
  }

//Maneja el evento de clic en el botón "Ver Constancia"
  onVerConstancia(item: UltimoCurso, event: { buttonId: string; event: Event }) {
    console.log('Ver constancia:', item);
    console.log('Folio:', item.folioConstancia);
  }

//Maneja el evento de búsqueda
  onSearch(filters: SearchFilters) {
    console.log('Búsqueda ejecutada:', filters);
    this.hasSearched = true;
    this.filtrarTabla(filters);
  }

//Maneja los cambios en tiempo real de los filtros
  onFilterChange(filters: SearchFilters) {
    console.log('Filtros cambiados:', filters);
    if (filters['mainSearch'] || filters['tipoBusqueda']) {
      this.hasSearched = true;
      this.filtrarTabla(filters);
    }
  }

// Retorna la configuración del badge según el estatus del curso
// Mapea: Aprobado → verde, No Aprobado → rojo, Pendiente → amarillo
  getEstatusBadge(estatus: string): BadgeItem {
    const estatusMap: { [key: string]: BadgeItem } = {
      'Aprobado': {
        id: 'aprobado',
        content: 'Aprobado',
        variant: 'success',
        size: 'small'
      },
      'No Aprobado': {
        id: 'no-aprobado',
        content: 'No Aprobado',
        variant: 'danger',
        size: 'small'
      },
      'Pendiente': {
        id: 'pendiente',
        content: 'Pendiente',
        variant: 'warning',
        size: 'small'
      }
    };

    return estatusMap[estatus] || {
      id: 'desconocido',
      content: estatus,
      variant: 'light',
      size: 'small'
    };
  }


// Filtra los cursos según el término de búsqueda y tipo seleccionado
// Separa los resultados en curso más reciente y cursos anteriores
  private filtrarTabla(filters: SearchFilters) {
    // Limpiar resultados si no hay término de búsqueda
    if (!filters['mainSearch'] || filters['mainSearch'].trim() === '') {
      this.ultimosCursos = [];
      this.cursosAnteriores = [];
      this.resultCount = 0;
      this.hasSearched = false;
      return;
    }

    let resultados = [...this.todosLosCursos];
    const searchTerm = filters['mainSearch'].toLowerCase().trim();
    const tipoBusqueda = filters['tipoBusqueda'];
    
    if (tipoBusqueda === 'nombre') {
      resultados = resultados.filter(curso => 
        curso.nombre.toLowerCase().includes(searchTerm)
      );
    } else if (tipoBusqueda === 'licencia') {
      resultados = resultados.filter(curso => 
        curso.licencia.toLowerCase().includes(searchTerm)
      );
    } else {
      // Si no hay tipo seleccionado, buscar en nombre y licencia
      resultados = resultados.filter(curso => 
        curso.nombre.toLowerCase().includes(searchTerm) ||
        curso.licencia.toLowerCase().includes(searchTerm)
      );
    }

    // Separar cursos por conductor: más reciente vs anteriores
    const { cursosRecientes, cursosAnteriores } = this.separarCursosPorConductor(resultados);
    this.ultimosCursos = cursosRecientes;
    this.cursosAnteriores = cursosAnteriores;
    this.resultCount = cursosRecientes.length;
  }

// Separa los cursos de cada conductor en:
// - Curso más reciente (para tabla principal)
// - Cursos anteriores (para tabla de historial)

  private separarCursosPorConductor(cursos: UltimoCurso[]): { cursosRecientes: UltimoCurso[], cursosAnteriores: UltimoCurso[] } {
    const conductoresMap = new Map<string, UltimoCurso[]>();
    cursos.forEach(curso => {
      const key = curso.curp;
      if (!conductoresMap.has(key)) {
        conductoresMap.set(key, []);
      }
      conductoresMap.get(key)!.push(curso);
    });

    const cursosRecientes: UltimoCurso[] = [];
    const cursosAnteriores: UltimoCurso[] = [];

    conductoresMap.forEach((cursosConductor) => {
      const cursosOrdenados = cursosConductor.sort((a, b) => {
        const fechaA = new Date(a.fechaRegistro);
        const fechaB = new Date(b.fechaRegistro);
        return fechaB.getTime() - fechaA.getTime();
      });
      if (cursosOrdenados.length > 0) {
        cursosRecientes.push(cursosOrdenados[0]);
        if (cursosOrdenados.length > 1) {
          cursosAnteriores.push(...cursosOrdenados.slice(1));
        }
      }
    });

    return { cursosRecientes, cursosAnteriores };
  }
}