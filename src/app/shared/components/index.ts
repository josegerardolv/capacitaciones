// Componentes de inputs
export * from './inputs';

// Componentes de formularios
export * from './forms';

// Componentes de selección de fechas
export * from './date-pickers';

// Componentes de badges
export * from './badge';

// Componentes de cartas institucionales
export * from './institutional-card/institutional-card.component';

// Componentes de tablas institucionales
export * from './institutional-table/institutional-table.component';
export * from './table-pagination/table-pagination.component';
export * from './table-filters/table-filters.component';
export * from './table-bulk-actions/table-bulk-actions.component';
export * from './table-export/table-export.component';

// Otros componentes compartidos
export * from './loading-spinner/loading-spinner.component';
export * from './notification/notification.component';
export * from './page-header/page-header.component';
export * from './sidebar/sidebar.component';
export * from './universal-icon/universal-icon.component';
export * from './universal-metric/universal-metric.component';
export * from './file-upload/file-upload.component';
export * from './alert-card/alert-card.component';
export * from './metric-card/metric-card.component';
export * from './tooltip/tooltip.component';
export * from './tab-menu/tab-menu.component';

// Interfaces y tipos para tablas
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  template?: any;
  /** Pin column during horizontal scroll. Use 'left' or 'right' to pin to that side. */
  pin?: 'left' | 'right';
}

export interface TableConfig {
  variant?: 'default' | 'compact' | 'dense' | 'spacious';
  striped?: boolean;
  hoverable?: boolean;
  responsive?: boolean;
  fixedHeader?: boolean;
  stickyHeader?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

export interface SortEvent {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface SelectionEvent {
  selectedItems: any[];
  allSelected: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'boolean';
  placeholder?: string;
  options?: { value: any; label: string }[];
  multiple?: boolean;
  width?: string;
}

export interface FilterValue {
  [key: string]: any;
}

export interface PaginationConfig {
  pageSize: number;
  totalItems: number;
  currentPage: number;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  maxVisiblePages?: number;
}

export interface PageChangeEvent {
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkActionEvent {
  action: string;
  selectedItems: any[];
}

export interface ExportFormat {
  key: string;
  label: string;
  icon: string;
  extension: string;
  mimeType: string;
}

export interface ExportConfig {
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
  formats?: ExportFormat[];
}

export interface ExportEvent {
  format: string;
  config: ExportConfig;
  data: any[];
}
