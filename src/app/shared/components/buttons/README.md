# Sistema de Botones Institucionales - SEMOVI

Un sistema completo de botones reutilizables que sigue la identidad visual institucional de Morena, optimizado para accesibilidad, responsividad y facilidad de uso.

## 🚀 Características

- **13 variantes de estilo** incluidas (primary, secondary, success, warning, danger, info, light, dark, link, ghost)
- **4 tamaños predefinidos** (small, medium, large, extra-large)
- **Soporte completo de íconos** (izquierda, derecha, solo ícono)
- **Estados avanzados** (disabled, loading, full-width)
- **Propiedades personalizables** (width, height, font-size)
- **Accesibilidad WCAG** completa
- **Animaciones y efectos** institucionales
- **Responsivo** en todos los dispositivos

## 📦 Instalación

Los componentes ya están integrados en el proyecto. Solo necesitas importar donde los uses:

```typescript
import { InstitutionalButtonComponent } from '../../shared/components/buttons/institutional-button.component';

@Component({
  // ...
  imports: [InstitutionalButtonComponent]
})
```

## 🎯 Uso Básico

### Botón Simple
```html
<app-institutional-button 
  [config]="{ variant: 'primary' }"
  (buttonClick)="handleClick()">
  Mi Botón
</app-institutional-button>
```

### Botón con Ícono
```html
<app-institutional-button 
  [config]="{
    variant: 'success',
    icon: 'check_circle',
    iconPosition: 'left'
  }"
  (buttonClick)="handleSave()">
  Guardar
</app-institutional-button>
```

### Botón Solo Ícono
```html
<app-institutional-button 
  [config]="{
    variant: 'danger',
    icon: 'delete',
    iconPosition: 'only',
    ariaLabel: 'Eliminar elemento'
  }"
  (buttonClick)="handleDelete()">
</app-institutional-button>
```

## 🎨 Variantes Disponibles

### Principales
- **primary**: Acción principal (color guinda institucional)
- **secondary**: Acción complementaria (color rosa institucional)
- **ghost**: Sin fondo, solo borde y texto

### Estados
- **success**: Confirmaciones (verde)
- **warning**: Alertas preventivas (amarillo)
- **danger**: Acciones destructivas (rojo)
- **info**: Mostrar detalles (azul)

### Estilos
- **light**: Fondo neutro con texto institucional
- **dark**: Fondo oscuro con texto claro
- **link**: Estilo de texto con subrayado

## 📏 Tamaños

```html
<!-- Pequeño -->
<app-institutional-button [config]="{ size: 'small' }">Pequeño</app-institutional-button>

<!-- Mediano (por defecto) -->
<app-institutional-button [config]="{ size: 'medium' }">Mediano</app-institutional-button>

<!-- Grande -->
<app-institutional-button [config]="{ size: 'large' }">Grande</app-institutional-button>

<!-- Extra Grande -->
<app-institutional-button [config]="{ size: 'extra-large' }">Extra Grande</app-institutional-button>
```

## 🔧 Configuración Avanzada

### Propiedades del ButtonConfig

```typescript
interface ButtonConfig {
  variant?: ButtonVariant;           // Tipo de botón
  size?: ButtonSize;                 // Tamaño predefinido
  fullWidth?: boolean;               // Ancho completo
  disabled?: boolean;                // Deshabilitado
  loading?: boolean;                 // Estado de carga
  icon?: string;                     // Nombre del ícono (Material Symbols)
  iconPosition?: IconPosition;       // Posición del ícono
  type?: 'button' | 'submit' | 'reset'; // Tipo HTML
  ariaLabel?: string;                // Etiqueta de accesibilidad
  title?: string;                    // Tooltip
  customClass?: string;              // Clases CSS adicionales
  customWidth?: string;              // Ancho personalizado
  customHeight?: string;             // Alto personalizado
  customFontSize?: string;           // Tamaño de fuente personalizado
}
```

### Estados Especiales

```html
<!-- Botón de carga -->
<app-institutional-button 
  [config]="{
    variant: 'primary',
    loading: true,
    disabled: false
  }">
  Guardando...
</app-institutional-button>

<!-- Botón deshabilitado -->
<app-institutional-button 
  [config]="{
    variant: 'primary',
    disabled: true
  }">
  No disponible
</app-institutional-button>

<!-- Botón ancho completo -->
<app-institutional-button 
  [config]="{
    variant: 'primary',
    fullWidth: true
  }">
  Botón completo
</app-institutional-button>
```

### Personalización de Estilos

```html
<!-- Tamaño personalizado -->
<app-institutional-button 
  [config]="{
    variant: 'primary',
    customWidth: '200px',
    customHeight: '60px',
    customFontSize: '18px'
  }">
  Botón Custom
</app-institutional-button>

<!-- Clases adicionales -->
<app-institutional-button 
  [config]="{
    variant: 'secondary',
    customClass: 'shadow-2xl transform rotate-1'
  }">
  Botón con Efectos
</app-institutional-button>
```

## 🎨 Paleta de Colores Institucional

El sistema utiliza las variables CSS institucionales definidas en el proyecto:

```css
/* Colores principales */
--institucional-primario: #8B1538;
--institucional-primario-dark: #6B1028;
--institucional-primario-light: #A61E42;
--institucional-secundario: #D63384;
--institucional-secundario-dark: #B02A57;
--institucional-secundario-light: #E85AA0;

/* Estados */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #06b6d4;
```

## 🚀 Demo y Ejemplos

Visita `/demo-botones` para ver todos los botones en acción con ejemplos interactivos.

### Ejemplos de Casos de Uso Reales

```html
<!-- Formulario típico -->
<div class="flex justify-end gap-3">
  <app-institutional-button 
    [config]="{ variant: 'ghost' }"
    (buttonClick)="cancel()">
    Cancelar
  </app-institutional-button>
  
  <app-institutional-button 
    [config]="{ 
      variant: 'primary',
      type: 'submit',
      loading: isSubmitting,
      disabled: form.invalid
    }">
    Guardar
  </app-institutional-button>
</div>

<!-- Acciones de tabla -->
<div class="flex gap-2">
  <app-institutional-button 
    [config]="{
      variant: 'info',
      icon: 'visibility',
      iconPosition: 'only',
      size: 'small',
      ariaLabel: 'Ver detalles'
    }"
    (buttonClick)="view(item.id)">
  </app-institutional-button>
  
  <app-institutional-button 
    [config]="{
      variant: 'warning',
      icon: 'edit',
      iconPosition: 'only',
      size: 'small',
      ariaLabel: 'Editar'
    }"
    (buttonClick)="edit(item.id)">
  </app-institutional-button>
  
  <app-institutional-button 
    [config]="{
      variant: 'danger',
      icon: 'delete',
      iconPosition: 'only',
      size: 'small',
      ariaLabel: 'Eliminar'
    }"
    (buttonClick)="delete(item.id)">
  </app-institutional-button>
</div>
```

## ♿ Accesibilidad

- **Contraste WCAG AA**: Todos los colores cumplen estándares
- **Navegación por teclado**: Soporte completo
- **Screen readers**: Etiquetas aria apropiadas
- **Estados visuales**: Focus, hover, active claramente definidos

```html
<!-- Ejemplo con accesibilidad completa -->
<app-institutional-button 
  [config]="{
    variant: 'primary',
    icon: 'save',
    iconPosition: 'left',
    ariaLabel: 'Guardar documento actual',
    title: 'Ctrl+S para guardar rápido'
  }"
  (buttonClick)="save()">
  Guardar
</app-institutional-button>
```

## 📱 Responsividad

Los botones se adaptan automáticamente:

- **Móvil**: Tamaños y espaciados optimizados
- **Tablet**: Mantiene proporciones
- **Desktop**: Tamaño completo con efectos

## 🔄 Migración desde Botones Legacy

### Antes (botón legacy)
```html
<button class="btn-institucional-primary">
  <app-bootstrap-icon name="save"></app-bootstrap-icon>
  Guardar
</button>
```

### Después (nuevo componente)
```html
<app-institutional-button 
  [config]="{
    variant: 'primary',
    icon: 'save',
    iconPosition: 'left'
  }"
  (buttonClick)="save()">
  Guardar
</app-institutional-button>
```

## 🛠️ Desarrollo

### Agregar Nueva Variante

1. Agregar color en `styles.css`:
```css
--btn-nueva-variante: #color;
--btn-nueva-variante-hover: #color-hover;
--btn-nueva-variante-active: #color-active;
```

2. Agregar estilos:
```css
.institutional-btn-nueva-variante {
  background-color: var(--btn-nueva-variante);
  /* ... más estilos */
}
```

3. Actualizar tipos:
```typescript
export type ButtonVariant = 
  | 'primary' 
  | 'secondary'
  | 'nueva-variante'  // <- Agregar aquí
  | ...
```

## 📄 Licencia

Parte del Sistema OAuth SEMOVI - Uso interno institucional.