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
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'house',
    iconType: 'bootstrap',
    route: '/dashboard',
    roles: ['ADMIN', 'SUPER_ADMINISTRADOR', 'CAPTURISTA', 'CONSULTA', 'SUPERVISOR']
  },
  {
    id: 'cursos',
    label: 'Cursos',
    icon: 'people',
    iconType: 'bootstrap',
    route: '/cursos',
    roles: ['ADMIN', 'SUPER_ADMINISTRADOR', 'CAPTURISTA', 'SUPERVISOR']
  },
  {
    id: 'busqueda',
    label: 'Busqueda',
    icon: 'search',
    iconType: 'bootstrap',
    route: '/busqueda',
    roles: ['ADMIN', 'SUPER_ADMINISTRADOR', 'CAPTURISTA', 'CONSULTA', 'SUPERVISOR']
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'file-text',
    iconType: 'bootstrap',
    route: '/documentos/templates',
    roles: ['ADMIN', 'SUPER_ADMINISTRADOR', 'SUPERVISOR']
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'gear',
    iconType: 'bootstrap',
    roles: ['ADMIN', 'SUPER_ADMINISTRADOR'],
    children: [
      {
        id: 'encuesta',
        label: 'Encuesta',
        icon: 'clipboard-data',
        iconType: 'bootstrap',
        route: '/config/encuesta',
        roles: ['ADMIN', 'SUPER_ADMINISTRADOR']
      },
      {
        id: 'cursos',
        label: 'Tipo de curso',
        icon: 'person',
        iconType: 'bootstrap',
        route: '/config/tipos-cursos',
        roles: ['ADMIN', 'SUPER_ADMINISTRADOR']
      },
      {
        id: 'concepto',
        label: 'Concepto',
        icon: 'file-text',
        iconType: 'bootstrap',
        route: '/config/concepto',
        roles: ['ADMIN', 'SUPER_ADMINISTRADOR']
      }


    ]
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
