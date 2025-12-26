// Exportar todos los componentes modales para fácil importación
export { ConfirmationModalComponent, ConfirmationConfig } from './confirmation-modal.component';
export { AlertModalComponent, AlertConfig, AlertAction } from './alert-modal.component';
export { LoadingModalComponent, LoadingConfig } from './loading-modal.component';
export { GalleryModalComponent, GalleryItem } from './gallery-modal.component';
export { SelectionModalComponent, SelectionOption, SelectionConfig } from './selection-modal.component';
export { DrawerModalComponent, DrawerConfig } from './drawer-modal.component';
export { ModalComponent, ModalConfig } from './modal.component';
export { TabModalComponent, TabModalTab, TabModalConfig } from './tab-modal.component';
export { SettingsModalComponent, SettingsSection, SettingsModalConfig } from './settings-modal.component';
export { DemoModalesComponent } from './demo-modales.component';

// Exportar el modal de formulario existente
export { ModalFormComponent } from '../forms/modal-form.component';

// Constantes útiles para tipos de modal
export const MODAL_TYPES = {
  CONFIRMATION: 'confirmation',
  ALERT: 'alert',
  LOADING: 'loading',
  GALLERY: 'gallery',
  SELECTION: 'selection',
  DRAWER: 'drawer',
  FULLSCREEN: 'fullscreen',
  TAB: 'tab',
  SETTINGS: 'settings',
  FORM: 'form'
} as const;

export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
} as const;

export const DRAWER_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
} as const;

export const TAB_POSITIONS = {
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom'
} as const;

export const CONFIRMATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success'
} as const;

export const ALERT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

// Tipo utilitario para configuraciones de modal base
export interface BaseModalConfig {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  preventClose?: boolean;
  showCloseButton?: boolean;
  overlayClose?: boolean;
  escapeKeyClose?: boolean;
}

// Configuración global para todos los modales
export interface GlobalModalConfig {
  defaultSize: 'sm' | 'md' | 'lg' | 'xl';
  enableAnimations: boolean;
  overlayClickToClose: boolean;
  escapeKeyToClose: boolean;
  focusTrap: boolean;
  restoreFocus: boolean;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
}

// Servicio utilitario para gestión global de modales (para implementación futura)
export interface ModalService {
  openConfirmation(config: any): Promise<boolean>;
  openAlert(config: any): Promise<void>;
  openLoading(config: any): { close: () => void; updateProgress: (progress: number) => void };
  closeAll(): void;
  getOpenModals(): string[];
}

// Eventos de modal estándar
export interface ModalEvent {
  type: 'open' | 'close' | 'confirm' | 'cancel' | 'action';
  modalId: string;
  data?: any;
  timestamp: Date;
}

// Configuración de accesibilidad
export interface ModalAccessibilityConfig {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  focusTrap?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string; // selector del elemento que debe recibir el foco inicial
}

// Hook para gestión de estado de modales (para implementación futura)
export interface ModalState {
  isOpen: boolean;
  isLoading: boolean;
  data: any;
  error?: string;
}

// Configuración de animaciones
export interface ModalAnimationConfig {
  enter?: string;
  exit?: string;
  duration?: number;
  easing?: string;
}

/**
 * Guía de uso de los componentes modales:
 * 
 * 1. MODAL DE CONFIRMACIÓN
 *    - Uso: Confirmar acciones críticas o destructivas
 *    - Ejemplo: Eliminar registros, cerrar sin guardar
 * 
 * 2. MODAL DE ALERTA
 *    - Uso: Mostrar información importante al usuario
 *    - Ejemplo: Mensajes de éxito, errores, notificaciones
 * 
 * 3. MODAL DE CARGA
 *    - Uso: Indicar progreso de operaciones largas
 *    - Ejemplo: Subir archivos, procesar datos, exportar reportes
 * 
 * 4. MODAL DE GALERÍA
 *    - Uso: Mostrar imágenes en pantalla completa
 *    - Ejemplo: Galerías de fotos, visualizador de documentos
 * 
 * 5. MODAL DE SELECCIÓN
 *    - Uso: Seleccionar elementos de una lista
 *    - Ejemplo: Elegir usuarios, categorías, opciones múltiples
 * 
 * 6. MODAL DRAWER
 *    - Uso: Panel lateral para navegación o detalles
 *    - Ejemplo: Menús de navegación, paneles de propiedades
 * 
 * 7. MODAL FULLSCREEN
 *    - Uso: Contenido que requiere toda la pantalla
 *    - Ejemplo: Editores, visualizadores, dashboards
 * 
 * 8. MODAL CON TABS
 *    - Uso: Organizar contenido en pestañas
 *    - Ejemplo: Configuraciones, formularios complejos
 * 
 * 9. MODAL DE CONFIGURACIONES
 *    - Uso: Paneles de configuración complejos
 *    - Ejemplo: Preferencias de usuario, configuración del sistema
 */

/**
 * Ejemplo de importación:
 * 
 * // Importar componentes específicos
 * import { 
 *   ConfirmationModalComponent, 
 *   AlertModalComponent,
 *   LoadingModalComponent 
 * } from './shared/components/modals';
 * 
 * // Importar todas las constantes
 * import { MODAL_TYPES, CONFIRMATION_TYPES } from './shared/components/modals';
 * 
 * // Importar el componente de demostración
 * import { DemoModalesComponent } from './shared/components/modals';
 */
