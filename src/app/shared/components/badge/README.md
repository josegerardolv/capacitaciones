# Componente Badge Institucional

## Descripción

El componente `InstitutionalBadgeComponent` es un componente reutilizable de badges (etiquetas) diseñado para mantener coherencia con el diseño institucional del sistema. Ofrece múltiples variantes, tamaños, estados interactivos y opciones de personalización.

## Características

✅ **Variantes de color**: Primary, Secondary, Success, Warning, Danger, Info, Light, Dark, Ghost, Outline  
✅ **Múltiples tamaños**: Small, Medium, Large  
✅ **Iconos**: Soporte para iconos a la izquierda o derecha  
✅ **Interactividad**: Clickables, con cierre, tooltips  
✅ **Estados**: Hover, Focus, Disabled, Active  
✅ **Accesibilidad**: ARIA labels, navegación por teclado  
✅ **Responsivo**: Adaptable a diferentes tamaños de pantalla  
✅ **Animaciones**: Transiciones suaves CSS  
✅ **Agrupación**: Componente adicional para agrupar badges  

## Instalación

El componente está ubicado en:
```
src/app/shared/components/badge/
```

Para usarlo, impórtalo desde el barrel export:
```typescript
import { InstitutionalBadgeComponent, BadgeGroupComponent } from './shared/components';
// o específicamente
import { InstitutionalBadgeComponent } from './shared/components/badge';
```

## Uso Básico

### Badge Simple
```html
<app-institutional-badge>Texto del badge</app-institutional-badge>
```

### Badge con Configuración
```html
<app-institutional-badge 
  [config]="{ variant: 'success', size: 'large', icon: 'check', iconPosition: 'left' }">
  Completado
</app-institutional-badge>
```

### Badge Interactivo
```html
<app-institutional-badge 
  [config]="{ 
    variant: 'primary', 
    clickable: true, 
    closable: true,
    tooltip: 'Click para interactuar' 
  }"
  (badgeClick)="onBadgeClick($event)"
  (badgeClose)="onBadgeClose($event)">
  Badge Interactivo
</app-institutional-badge>
```

## Interfaz BadgeConfig

```typescript
interface BadgeConfig {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: string;                    // Nombre del icono Material Symbols
  iconPosition?: 'left' | 'right';  // Posición del icono
  closable?: boolean;               // Muestra botón de cierre
  disabled?: boolean;               // Badge deshabilitado
  clickable?: boolean;              // Badge clickeable
  ariaLabel?: string;               // Etiqueta ARIA para accesibilidad
  title?: string;                   // Título HTML (fallback para tooltip)
  customClass?: string;             // Clases CSS adicionales
  tooltip?: string;                 // Texto del tooltip
}
```

## Eventos

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `badgeClick` | Se emite cuando se hace click en un badge clickeable | `Event` |
| `badgeClose` | Se emite cuando se hace click en el botón de cierre | `Event` |

## Variantes

### Colores
- **primary**: Color institucional principal
- **secondary**: Color institucional secundario  
- **success**: Verde para estados positivos
- **warning**: Naranja para advertencias
- **danger**: Rojo para errores o estados críticos
- **info**: Azul para información
- **light**: Gris claro con texto oscuro
- **dark**: Gris oscuro con texto blanco
- **ghost**: Transparente con bordes
- **outline**: Solo bordes, se puede combinar con otros colores

### Tamaños
- **small**: 12px padding, 0.75rem font-size
- **medium**: 16px padding, 0.875rem font-size *(por defecto)*
- **large**: 20px padding, 1rem font-size

## Agrupación de Badges

### Componente BadgeGroup

```html
<app-badge-group 
  [badges]="badgeItems"
  [config]="groupConfig"
  (badgeClick)="onGroupBadgeClick($event)"
  (badgeClose)="onGroupBadgeClose($event)"
  (showMore)="onShowMore($event)">
</app-badge-group>
```

### Configuración del Grupo

```typescript
interface BadgeGroupConfig {
  orientation?: 'horizontal' | 'vertical';  // Orientación del grupo
  spacing?: 'tight' | 'normal' | 'loose';   // Espaciado entre badges
  wrap?: boolean;                           // Permitir wrap en múltiples líneas
  maxItems?: number;                        // Máximo de badges visibles
  showMoreText?: string;                    // Texto del badge "Ver más"
  customClass?: string;                     // Clases CSS adicionales
}

interface BadgeItem extends BadgeConfig {
  id: string;        // Identificador único
  content: string;   // Contenido del badge
  visible?: boolean; // Visibilidad del badge
}
```

## Ejemplos de Uso

### Estados de Usuario
```typescript
const userStatuses = [
  { id: '1', content: 'Activo', variant: 'success', icon: 'verified_user', iconPosition: 'left' },
  { id: '2', content: 'Pendiente', variant: 'warning', icon: 'schedule', iconPosition: 'left' },
  { id: '3', content: 'Bloqueado', variant: 'danger', icon: 'block', iconPosition: 'left' },
];
```

### Roles y Permisos
```typescript
const userRoles = [
  { id: '1', content: 'Admin', variant: 'primary', icon: 'admin_panel_settings' },
  { id: '2', content: 'Supervisor', variant: 'secondary', icon: 'supervisor_account' },
  { id: '3', content: 'Usuario', variant: 'info', icon: 'person' },
];
```

### Categorías Dinámicas con Cierre
```typescript
const categories = [
  { id: '1', content: 'Urgente', variant: 'danger', closable: true, clickable: true },
  { id: '2', content: 'En revisión', variant: 'warning', closable: true, clickable: true },
  { id: '3', content: 'Aprobado', variant: 'success', closable: true, clickable: true },
];
```

### Badges con Outline
```html
<app-institutional-badge 
  [config]="{ variant: 'primary', customClass: 'institutional-badge-outline' }">
  Primary Outline
</app-institutional-badge>
```

## Accesibilidad

### Características de Accesibilidad

- **Navegación por teclado**: Los badges clickeables responden a Enter y Espacio
- **ARIA roles**: `button` para clickeables, `status` para informativos
- **ARIA labels**: Soporte para etiquetas descriptivas
- **Focus management**: Indicadores visuales de foco
- **Screen reader**: Compatibilidad con lectores de pantalla

### Mejores Prácticas

```html
<!-- Badge informativo -->
<app-institutional-badge 
  [config]="{ ariaLabel: 'Estado: Usuario activo' }">
  Activo
</app-institutional-badge>

<!-- Badge clickeable -->
<app-institutional-badge 
  [config]="{ 
    clickable: true, 
    ariaLabel: 'Filtrar por categoría urgente',
    tooltip: 'Click para filtrar tickets urgentes'
  }">
  Urgente
</app-institutional-badge>

<!-- Badge con cierre -->
<app-institutional-badge 
  [config]="{ 
    closable: true,
    ariaLabel: 'Categoría: En revisión, presiona para eliminar'
  }">
  En revisión
</app-institutional-badge>
```

## Responsividad

El componente se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop**: Tamaños completos
- **Tablet**: Tamaños ligeramente reducidos
- **Mobile**: Tamaños más compactos, texto más pequeño

## Personalización

### Clases CSS Personalizadas

```typescript
// Badge con estilos personalizados
const customBadge = {
  variant: 'primary',
  customClass: 'my-custom-badge-class'
};
```

### Variables CSS Disponibles

El componente utiliza las variables CSS institucionales:
- `--institucional-primario`
- `--institucional-secundario`
- `--success`, `--warning`, `--error`, `--info`
- `--gray-*` para variantes light/dark
- `--border-radius`
- `--transition-fast`
- `--shadow-md`

## Casos de Uso Comunes

### 1. Filtros de Estado
```html
<app-badge-group 
  [badges]="statusFilters"
  [config]="{ spacing: 'normal' }"
  (badgeClick)="filterByStatus($event)">
</app-badge-group>
```

### 2. Tags de Categorías
```html
<app-badge-group 
  [badges]="articleCategories"
  [config]="{ maxItems: 5, showMoreText: 'Ver más categorías' }"
  (badgeClose)="removeCategory($event)"
  (showMore)="showAllCategories()">
</app-badge-group>
```

### 3. Indicadores de Progreso
```html
<app-institutional-badge 
  [config]="{ 
    variant: getProgressVariant(progress), 
    icon: getProgressIcon(progress),
    iconPosition: 'left'
  }">
  {{ getProgressText(progress) }}
</app-institutional-badge>
```

### 4. Notificaciones
```html
<app-institutional-badge 
  [config]="{ 
    variant: 'danger', 
    clickable: true,
    closable: true,
    tooltip: 'Click para ver detalles'
  }"
  (badgeClick)="viewNotification(notification)"
  (badgeClose)="dismissNotification(notification)">
  {{ notification.count }} nuevas notificaciones
</app-institutional-badge>
```

## Testing

El componente incluye tests unitarios completos. Para ejecutar las pruebas:

```bash
ng test
```

### Pruebas Incluidas

- ✅ Renderizado básico
- ✅ Aplicación de variantes y tamaños
- ✅ Manejo de eventos
- ✅ Estados de accesibilidad
- ✅ Navegación por teclado
- ✅ Configuración de iconos
- ✅ Estados disabled

## Consideraciones de Rendimiento

- **Standalone Component**: No requiere módulos adicionales
- **OnPush Strategy**: Optimización de change detection (si se implementa)
- **Lazy Loading**: Compatible con carga diferida
- **Tree Shaking**: Solo importa lo necesario

## Changelog

### v1.0.0
- ✅ Implementación inicial del componente badge
- ✅ Soporte para todas las variantes de color institucionales
- ✅ Múltiples tamaños y estados
- ✅ Funcionalidad interactiva completa
- ✅ Componente de agrupación
- ✅ Accesibilidad completa
- ✅ Animaciones CSS
- ✅ Tests unitarios

## Soporte

Para dudas o problemas con el componente, consulta:
1. Esta documentación
2. Los ejemplos en `badge-demo.component.ts`
3. Los tests en `*.spec.ts`
4. El equipo de desarrollo frontend