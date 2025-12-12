# Sistema de Tablas Institucionales

Una colección completa de componentes de tabla reutilizables siguiendo los patrones de diseño institucional establecidos. Estos componentes están diseñados para ser flexibles, combinables y mantener consistencia visual en toda la aplicación.

## 🚀 Características Principales

- **Componentes modulares**: Cada funcionalidad es un componente independiente que puede combinarse según las necesidades
- **Diseño institucional**: Sigue los colores, tipografías y patrones establecidos
- **Totalmente responsive**: Adaptación automática a diferentes tamaños de pantalla
- **TypeScript completo**: Tipado fuerte para mejor desarrollo y mantenimiento
- **Accesibilidad**: Componentes accesibles por defecto
- **Rendimiento optimizado**: Uso de OnPush y trackBy para mejor performance

## 📦 Componentes Incluidos

### 1. InstitutionalTableComponent
Componente principal de tabla con todas las funcionalidades básicas.

```typescript
<app-institutional-table
  [data]="tableData"
  [columns]="tableColumns"
  [config]="tableConfig"
  [selectedItems]="selectedItems"
  [sortColumn]="sortColumn"
  [sortDirection]="sortDirection"
  (sort)="onSort($event)"
  (selectionChange)="onSelectionChange($event)"
  (rowClick)="onRowClick($event)">
  
  <!-- Template para acciones -->
  <ng-template #actions let-item="$implicit">
    <button (click)="editItem(item)">Editar</button>
  </ng-template>
</app-institutional-table>
```

### 2. TablePaginationComponent
Manejo completo de paginación con opciones de tamaño de página.

```typescript
<app-table-pagination
  [config]="paginationConfig"
  (pageChange)="onPageChange($event)">
</app-table-pagination>
```

### 3. TableFiltersComponent
Sistema avanzado de filtrado con múltiples tipos de filtros.

```typescript
<app-table-filters
  [filters]="filterConfigs"
  [globalSearchValue]="searchTerm"
  (filtersChange)="onFiltersChange($event)"
  (globalSearchChange)="onSearchChange($event)">
</app-table-filters>
```

### 4. TableBulkActionsComponent
Acciones en lote para elementos seleccionados.

```typescript
<app-table-bulk-actions
  [selectedItems]="selectedItems"
  [actions]="bulkActions"
  (actionExecute)="onBulkAction($event)"
  (selectionClear)="clearSelection()">
</app-table-bulk-actions>
```

### 5. TableExportComponent
Exportación de datos en múltiples formatos.

```typescript
<app-table-export
  [data]="tableData"
  [selectedItems]="selectedItems"
  [columns]="tableColumns"
  (export)="onExport($event)">
</app-table-export>
```

## 🎨 Variantes de Tabla

### Tamaños
- **default**: Espaciado estándar
- **compact**: Espaciado reducido para más densidad
- **dense**: Máxima densidad de información
- **spacious**: Espaciado amplio para mejor legibilidad

### Estilos
- **striped**: Filas alternadas con fondo
- **hoverable**: Efecto hover en filas
- **responsive**: Adaptación automática a pantallas pequeñas
- **fixedHeader**: Encabezado fijo al hacer scroll

## 📋 Configuración de Columnas

```typescript
interface TableColumn {
  key: string;                    // Clave de la propiedad en los datos
  label: string;                  // Texto del encabezado
  sortable?: boolean;             // Si la columna es ordenable
  width?: string;                 // Ancho específico (ej: "200px", "20%")
  align?: 'left' | 'center' | 'right'; // Alineación del contenido
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom'; // Tipo de dato
  template?: TemplateRef<any>;    // Template personalizado
}
```

### Ejemplo de configuración:
```typescript
const columns: TableColumn[] = [
  { 
    key: 'name', 
    label: 'Nombre', 
    sortable: true,
    width: '30%'
  },
  { 
    key: 'email', 
    label: 'Correo', 
    sortable: true,
    type: 'text'
  },
  { 
    key: 'active', 
    label: 'Activo', 
    type: 'boolean',
    align: 'center'
  },
  { 
    key: 'createdAt', 
    label: 'Fecha', 
    type: 'date',
    sortable: true
  },
  {
    key: 'actions',
    label: 'Acciones',
    template: this.actionsTemplate
  }
];
```

## 🔧 Configuración de Filtros

```typescript
interface FilterConfig {
  key: string;                    // Clave del campo a filtrar
  label: string;                  // Etiqueta del filtro
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'boolean';
  placeholder?: string;           // Texto de placeholder
  options?: { value: any; label: string }[]; // Opciones para select
  multiple?: boolean;             // Selección múltiple
  width?: string;                 // Ancho del control
}
```

### Ejemplo de configuración:
```typescript
const filters: FilterConfig[] = [
  {
    key: 'category',
    label: 'Categoría',
    type: 'select',
    options: [
      { value: 'tech', label: 'Tecnología' },
      { value: 'sales', label: 'Ventas' }
    ]
  },
  {
    key: 'createdAt',
    label: 'Fecha de Creación',
    type: 'daterange'
  },
  {
    key: 'active',
    label: 'Estado',
    type: 'boolean'
  }
];
```

## 📊 Configuración de Paginación

```typescript
interface PaginationConfig {
  pageSize: number;               // Elementos por página
  totalItems: number;             // Total de elementos
  currentPage: number;            // Página actual
  pageSizeOptions?: number[];     // Opciones de tamaño de página
  showInfo?: boolean;             // Mostrar información de registros
  showPageSizeSelector?: boolean; // Mostrar selector de tamaño
  maxVisiblePages?: number;       // Máximo de páginas visibles
}
```

## 🎯 Acciones en Lote

```typescript
interface BulkAction {
  key: string;                    // Identificador único
  label: string;                  // Texto del botón
  icon: string;                   // Icono Material Symbols
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;             // Si está deshabilitado
  requiresConfirmation?: boolean; // Si requiere confirmación
  confirmationMessage?: string;   // Mensaje de confirmación
}
```

### Ejemplo de acciones:
```typescript
const bulkActions: BulkAction[] = [
  {
    key: 'activate',
    label: 'Activar',
    icon: 'check_circle',
    variant: 'success'
  },
  {
    key: 'delete',
    label: 'Eliminar',
    icon: 'delete',
    variant: 'danger',
    requiresConfirmation: true,
    confirmationMessage: 'Esta acción eliminará permanentemente los elementos seleccionados.'
  }
];
```

## 📤 Configuración de Exportación

```typescript
interface ExportFormat {
  key: string;                    // Identificador del formato
  label: string;                  // Nombre mostrado
  icon: string;                   // Icono Material Symbols
  extension: string;              // Extensión del archivo
  mimeType: string;               // Tipo MIME
}

interface ExportConfig {
  filename?: string;              // Nombre base del archivo
  includeHeaders?: boolean;       // Incluir encabezados
  selectedOnly?: boolean;         // Solo elementos seleccionados
  formats?: ExportFormat[];       // Formatos disponibles
}
```

## 🏗️ Implementación Completa

### 1. Importar en tu componente:
```typescript
import {
  InstitutionalTableComponent,
  TablePaginationComponent,
  TableFiltersComponent,
  TableBulkActionsComponent,
  TableExportComponent,
  TableColumn,
  TableConfig,
  // ... otras interfaces
} from '../shared/components';
```

### 2. Configurar en el módulo/componente:
```typescript
@Component({
  imports: [
    CommonModule,
    InstitutionalTableComponent,
    TablePaginationComponent,
    TableFiltersComponent,
    TableBulkActionsComponent,
    TableExportComponent
  ]
})
```

### 3. Ejemplo de uso completo:
```typescript
export class MyComponent {
  data = [/* tus datos */];
  columns: TableColumn[] = [/* configuración */];
  config: TableConfig = {
    variant: 'default',
    responsive: true,
    selectable: true,
    striped: true
  };
  
  selectedItems: any[] = [];
  currentPage = 1;
  pageSize = 10;
  
  onSort(event: SortEvent) {
    // Implementar lógica de ordenamiento
  }
  
  onSelectionChange(event: SelectionEvent) {
    this.selectedItems = event.selectedItems;
  }
  
  onPageChange(event: PageChangeEvent) {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    // Recargar datos
  }
}
```

## 🎨 Clases CSS Disponibles

### Tabla Principal
- `.institucional-table` - Tabla base
- `.institucional-table-compact` - Variante compacta
- `.institucional-table-dense` - Variante densa
- `.institucional-table-spacious` - Variante amplia
- `.institucional-table-responsive` - Tabla responsiva
- `.institucional-table-fixed-header` - Header fijo

### Filas y Celdas
- `.institucional-table-row` - Fila de tabla
- `.institucional-table-row-selected` - Fila seleccionada
- `.institucional-table-row-striped` - Filas rayadas
- `.institucional-table-cell` - Celda de tabla
- `.institucional-table-header` - Encabezado de columna

### Acciones
- `.institucional-table-actions` - Contenedor de acciones
- `.institucional-table-action-btn` - Botón de acción base
- `.institucional-table-action-btn-primary` - Botón primario
- `.institucional-table-action-btn-secondary` - Botón secundario
- `.institucional-table-action-btn-danger` - Botón de peligro
- `.institucional-table-action-btn-success` - Botón de éxito

### Estados
- `.institucional-table-loading` - Estado de carga
- `.institucional-table-empty` - Estado vacío
- `.institucional-table-sortable` - Columna ordenable
- `.institucional-table-sort-asc` - Ordenado ascendente
- `.institucional-table-sort-desc` - Ordenado descendente

## 📱 Responsividad

Las tablas se adaptan automáticamente a diferentes tamaños de pantalla:

- **Desktop (>768px)**: Tabla completa con todas las columnas
- **Tablet (768px-1024px)**: Tabla con scroll horizontal si es necesario
- **Mobile (<768px)**: Transformación automática a cards (opcional)

### Activar modo cards en mobile:
```typescript
const config: TableConfig = {
  responsive: true,
  mobileCards: true  // Convierte filas en cards en móvil
};
```

## 🔍 Funcionalidades Avanzadas

### 1. Templates Personalizados
```typescript
<app-institutional-table [columns]="columns">
  <ng-template #customCell let-item="$implicit" let-column="column">
    <span [ngClass]="getStatusClass(item.status)">
      {{ item.status }}
    </span>
  </ng-template>
</app-institutional-table>
```

### 2. Filas Expandibles
```typescript
const config: TableConfig = {
  expandable: true
};

// En el template
<app-institutional-table [config]="config">
  <ng-template #expandedContent let-item="$implicit">
    <div class="expanded-details">
      <!-- Contenido expandido -->
    </div>
  </ng-template>
</app-institutional-table>
```

### 3. Indicadores Visuales
```typescript
// Usar clases de estado
<span class="institucional-table-status-indicator institucional-table-priority-high"></span>
<span class="institucional-table-status-indicator institucional-table-priority-medium"></span>
<span class="institucional-table-status-indicator institucional-table-priority-low"></span>
```

## 🚀 Demo y Ejemplos

Para ver todos los componentes en acción, visita el componente de demostración:

```bash
# Navegar a la ruta de demo
/demo-tablas
```

El componente de demo incluye:
- ✅ Tabla simple con datos básicos
- ✅ Variantes de estilo y tamaño
- ✅ Ordenamiento de columnas
- ✅ Selección múltiple y acciones en lote
- ✅ Sistema de filtros avanzados
- ✅ Paginación inteligente
- ✅ Exportación en múltiples formatos
- ✅ Tabla completa con todas las funcionalidades
- ✅ Estados especiales (carga, vacío)

## 🛠️ Personalización

### Colores Institucionales
Los componentes utilizan las variables CSS institucionales:
- `--institucional-primario` (#8B1538)
- `--institucional-secundario` (#D63384)
- `--institucional-terciario` (#722F37)
- `--stats4`, `--stats5`, `--stats2`, etc.

### Fuentes
Utiliza la fuente institucional Montserrat con `font-family: 'Montserrat', sans-serif !important;`

### Sombras y Bordes
- `--shadow-institucional` para sombras principales
- `--border-radius-lg` para bordes redondeados
- `--transition-normal` para transiciones

## 📝 Notas de Desarrollo

1. **Performance**: Los componentes usan `OnPush` change detection para mejor rendimiento
2. **Accessibility**: Incluyen atributos ARIA y navegación por teclado
3. **Memory Management**: Uso de `trackBy` functions para optimizar la renderización
4. **Type Safety**: Interfaces TypeScript completas para mejor desarrollo
5. **Error Handling**: Manejo de estados de error y loading

## 🐛 Troubleshooting

### Problema: Las tablas no se muestran correctamente
**Solución**: Verificar que se han importado todos los componentes y que los datos tienen la estructura correcta.

### Problema: Los estilos no se aplican
**Solución**: Verificar que el archivo CSS global esté importado y que no hay conflictos de especificidad.

### Problema: La paginación no funciona
**Solución**: Asegurarse de manejar correctamente el evento `pageChange` y actualizar los datos mostrados.

### Problema: Los filtros no filtran
**Solución**: Implementar la lógica de filtrado en el componente padre al recibir el evento `filtersChange`.

---

## 📞 Soporte

Para dudas o problemas con los componentes de tabla, revisar:
1. Esta documentación
2. El componente de demo para ejemplos
3. Los comentarios en el código fuente
4. Los tipos TypeScript para ver las interfaces completas
