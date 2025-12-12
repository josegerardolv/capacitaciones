/**
 * Configuración de Menús del Sidebar
 * Sistema de Soporte Técnico SEMOVI
 */

export type IconType = 'bootstrap' | 'material';

export interface MenuItem {
  id: string;
  label: string;
  icon: string; // nombre del ícono
  iconType?: IconType; // tipo de ícono (bootstrap por defecto)
  route?: string;
  children?: MenuItem[];
  roles?: string[];
  expanded?: boolean;
}

/**
 * Configuración completa de los elementos del menú del sidebar
 * Organizada por secciones y con control de permisos por roles
 */
export const SIDEBAR_MENU_CONFIG: MenuItem[] = [
  // Rutas públicas / cliente
  {
    id: 'agendar-cita',
    label: 'Agendar cita',
    icon: 'calendar_plus',
    iconType: 'bootstrap',
    route: '/agendar-cita'
  },
  {
    id: 'validar-cita',
    label: 'Validar cita',
    icon: 'check_circle',
    iconType: 'material',
    route: '/validar-cita'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    iconType: 'material',
    route: '/admin/dashboard',
    roles: ['admin', 'operador', 'consulta']
  },
  {
    id: 'tipos-servicio',
    label: 'Tipos de servicio',
    icon: 'list',
    iconType: 'bootstrap',
    route: '/admin/tipos-servicio',
    roles: ['admin', 'operador']
  },
  {
    id: 'tramites',
    label: 'Trámites',
    icon: 'description',
    iconType: 'material',
    route: '/admin/tramites',
    roles: ['admin', 'operador']
  },
  {
    id: 'modulos',
    label: 'Módulos',
    icon: 'widgets',
    iconType: 'bootstrap',
    route: '/admin/modulos',
    roles: ['admin', 'operador']
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'settings',
    iconType: 'bootstrap',
    route: '/admin/configuracion',
    roles: ['admin', 'operador']
  },
  {
    id: 'citas',
    label: 'Citas',
    icon: 'event_available',
    iconType: 'material',
    route: '/admin/citas',
    roles: ['admin', 'operador']
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'bar_chart',
    iconType: 'bootstrap',
    route: '/admin/reportes',
    roles: ['admin', 'operador', 'consulta']
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: 'group',
    iconType: 'material',
    route: '/admin/usuarios',
    roles: ['admin']

  },

  // Otras rutas útiles
  {
    id: 'login',
    label: 'Iniciar sesión',
    icon: 'login',
    iconType: 'material',
    route: '/login'
  },
  {
    id: 'unauthorized',
    label: 'Acceso denegado',
    icon: 'block',
    iconType: 'material',
    route: '/unauthorized'
  },
  {
    id: 'not-found',
    label: 'No encontrado',
    icon: 'error',
    iconType: 'material',
    route: '/404'
  }
];

/**
 * Función para obtener un item del menú por su ID
 */
export function getMenuItemById(id: string): MenuItem | undefined {
  function findInMenu(items: MenuItem[], targetId: string): MenuItem | undefined {
    for (const item of items) {
      if (item.id === targetId) {
        return item;
      }
      if (item.children) {
        const found = findInMenu(item.children, targetId);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  return findInMenu(SIDEBAR_MENU_CONFIG, id);
}

/**
 * Función para expandir automáticamente el menú padre basado en la ruta actual
 */
export function expandMenuForRoute(route: string): void {
  // Limpiar la ruta eliminando query params y fragments
  const cleanRoute = route.split('?')[0].split('#')[0];
  
  // Función recursiva para encontrar y expandir el menú padre
  function findAndExpandParent(items: MenuItem[], targetRoute: string): boolean {
    for (const item of items) {
      // Si es un item con hijos, verificar si algún hijo coincide con la ruta
      if (item.children && item.children.length > 0) {
        const hasMatchingChild = item.children.some(child => {
          if (child.route) {
            // Verificar coincidencia exacta o si la ruta actual comienza con la ruta del hijo
            return targetRoute === child.route || targetRoute.startsWith(child.route + '/');
          }
          return false;
        });
        
        if (hasMatchingChild) {
          item.expanded = true;
          return true;
        }
        
        // Verificar recursivamente en subniveles
        if (findAndExpandParent(item.children, targetRoute)) {
          item.expanded = true;
          return true;
        }
      }
      
      // Si es un item simple, verificar si coincide
      if (item.route && (targetRoute === item.route || targetRoute.startsWith(item.route + '/'))) {
        return true;
      }
    }
    return false;
  }
  
  // Primero, colapsar todos los menús
  function collapseAll(items: MenuItem[]) {
    items.forEach(item => {
      if (item.children) {
        item.expanded = false;
        collapseAll(item.children);
      }
    });
  }
  
  // Colapsar todos y luego expandir el relevante
  collapseAll(SIDEBAR_MENU_CONFIG);
  findAndExpandParent(SIDEBAR_MENU_CONFIG, cleanRoute);
}

/**
 * Función para obtener el item padre de una ruta específica
 */
export function getParentItemForRoute(route: string): MenuItem | null {
  const cleanRoute = route.split('?')[0].split('#')[0];
  
  function findParent(items: MenuItem[]): MenuItem | null {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const hasMatchingChild = item.children.some(child => {
          if (child.route) {
            return cleanRoute === child.route || cleanRoute.startsWith(child.route + '/');
          }
          return false;
        });
        
        if (hasMatchingChild) {
          return item;
        }
        
        // Buscar recursivamente
        const parent = findParent(item.children);
        if (parent) return parent;
      }
    }
    return null;
  }
  
  return findParent(SIDEBAR_MENU_CONFIG);
}
