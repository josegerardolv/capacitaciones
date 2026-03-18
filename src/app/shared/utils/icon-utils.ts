/**
 * Utilidades para iconos - mapeos y conversiones entre diferentes librerías de iconos
 */

export type IconType = 'bootstrap' | 'material';

/**
 * Mapeo de iconos comunes entre Bootstrap Icons y Material Icons
 * Facilita la migración y conversión entre librerías
 */
export const ICON_MAPPINGS = {
  // Navegación
  home: { bootstrap: 'house', material: 'home' },
  dashboard: { bootstrap: 'speedometer2', material: 'dashboard' },
  menu: { bootstrap: 'list', material: 'menu' },
  close: { bootstrap: 'x', material: 'close' },
  back: { bootstrap: 'arrow-left', material: 'arrow_back' },
  forward: { bootstrap: 'arrow-right', material: 'arrow_forward' },

  // Controles de sidebar  
  'arrow-bar-left': { bootstrap: 'arrow-bar-left', material: 'keyboard_arrow_left' },
  'arrow-bar-right': { bootstrap: 'arrow-bar-right', material: 'keyboard_arrow_right' },
  'chevron-double-left': { bootstrap: 'chevron-double-left', material: 'keyboard_double_arrow_left' },
  'chevron-double-right': { bootstrap: 'chevron-double-right', material: 'keyboard_double_arrow_right' },
  'x-lg': { bootstrap: 'x-lg', material: 'close' },
  list: { bootstrap: 'list', material: 'menu' },

  // Usuarios y personas
  user: { bootstrap: 'person', material: 'person' },
  users: { bootstrap: 'people', material: 'people' },
  groups: { bootstrap: 'people-fill', material: 'groups' },
  userAdd: { bootstrap: 'person-add', material: 'person_add' },
  userRemove: { bootstrap: 'person-dash', material: 'person_remove' },

  // Acciones
  add: { bootstrap: 'plus', material: 'add' },
  edit: { bootstrap: 'pencil', material: 'edit' },
  delete: { bootstrap: 'trash', material: 'delete' },
  save: { bootstrap: 'check', material: 'save' },
  cancel: { bootstrap: 'x', material: 'cancel' },
  search: { bootstrap: 'search', material: 'search' },
  filter: { bootstrap: 'funnel', material: 'filter_list' },

  // Aplicaciones y sistemas
  apps: { bootstrap: 'grid-3x3-gap', material: 'apps' },
  settings: { bootstrap: 'gear', material: 'settings' },
  tools: { bootstrap: 'tools', material: 'build' },

  // Seguridad
  security: { bootstrap: 'shield-check', material: 'security' },
  lock: { bootstrap: 'lock', material: 'lock' },
  unlock: { bootstrap: 'unlock', material: 'lock_open' },
  verified: { bootstrap: 'patch-check', material: 'verified_user' },

  // Reportes y análisis
  reports: { bootstrap: 'file-earmark-bar-graph', material: 'assessment' },
  analytics: { bootstrap: 'bar-chart-line', material: 'analytics' },
  chart: { bootstrap: 'graph-up', material: 'show_chart' },

  // Estados
  success: { bootstrap: 'check-circle', material: 'check_circle' },
  error: { bootstrap: 'x-circle', material: 'error' },
  warning: { bootstrap: 'exclamation-triangle', material: 'warning' },
  info: { bootstrap: 'info-circle', material: 'info' },

  // Navegación UI
  chevronDown: { bootstrap: 'chevron-down', material: 'keyboard_arrow_down' },
  chevronUp: { bootstrap: 'chevron-up', material: 'keyboard_arrow_up' },
  chevronLeft: { bootstrap: 'chevron-left', material: 'keyboard_arrow_left' },
  chevronRight: { bootstrap: 'chevron-right', material: 'keyboard_arrow_right' },

  // Archivos y documentos
  file: { bootstrap: 'file-earmark', material: 'description' },
  folder: { bootstrap: 'folder', material: 'folder' },
  download: { bootstrap: 'download', material: 'download' },
  upload: { bootstrap: 'upload', material: 'upload' },
  print: { bootstrap: 'printer', material: 'print' },
  send: { bootstrap: 'send', material: 'send' },

  // Comunicación
  email: { bootstrap: 'envelope', material: 'email' },
  phone: { bootstrap: 'telephone', material: 'phone' },
  chat: { bootstrap: 'chat', material: 'chat' },

  // Tiempo
  calendar: { bootstrap: 'calendar', material: 'event' },
  clock: { bootstrap: 'clock', material: 'schedule' },

  // Otros
  visibility: { bootstrap: 'eye', material: 'visibility' },
  visibilityOff: { bootstrap: 'eye-slash', material: 'visibility_off' },
  refresh: { bootstrap: 'arrow-clockwise', material: 'refresh' },
  expand: { bootstrap: 'arrow-bar-right', material: 'arrow_menu_open' },
  // "close_fullscreen" no siempre existe en la familia de Material Icons; usar "fullscreen_exit" que es la convención estándar
  collapse: { bootstrap: 'arrow-bar-left', material: 'left_panel_close' },
  logout: { bootstrap: 'box-arrow-right', material: 'logout' },
} as const;

/**
 * Obtiene el nombre del icono para el tipo especificado
 */
export function getIconName(iconKey: keyof typeof ICON_MAPPINGS, type: IconType): string {
  return ICON_MAPPINGS[iconKey][type];
}

/**
 * Verifica si existe un mapeo para la clave de icono dada
 */
export function hasIconMapping(iconKey: string): iconKey is keyof typeof ICON_MAPPINGS {
  return iconKey in ICON_MAPPINGS;
}

/**
 * Convierte un icono de un tipo a otro usando los mapeos disponibles
 */
export function convertIcon(iconName: string, fromType: IconType, toType: IconType): string {
  // Buscar la clave que coincida con el icono actual
  for (const [key, mapping] of Object.entries(ICON_MAPPINGS)) {
    if (mapping[fromType] === iconName) {
      return mapping[toType];
    }
  }

  // Si no hay mapeo, devolver el icono original
  return iconName;
}

/**
 * Obtiene todos los iconos disponibles para un tipo específico
 */
export function getAvailableIcons(type: IconType): string[] {
  return Object.values(ICON_MAPPINGS).map(mapping => mapping[type]);
}

/**
 * Configuración predeterminada para diferentes contextos
 */
export const ICON_CONTEXTS = {
  navigation: {
    preferredType: 'material' as IconType,
    size: 24
  },
  actions: {
    preferredType: 'bootstrap' as IconType,
    size: 16
  },
  status: {
    preferredType: 'material' as IconType,
    size: 20
  }
} as const;
