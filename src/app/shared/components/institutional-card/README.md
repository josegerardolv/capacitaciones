# Institutional Card Component

## Descripción

El `InstitutionalCardComponent` es un componente reutilizable de cartas para Angular que proporciona una estructura flexible con header, body y footer, donde cada sección acepta cualquier tipo de contenido dinámico utilizando `ng-content`.

## Características Principales

### ✅ Estructura Flexible
- Header, body y footer como slots abiertos
- Permite colocar texto, tablas, botones, formularios, imágenes, iconos u otros componentes
- Soporte para mostrar/ocultar header y footer mediante propiedades

### ✅ Estilo Institucional
- Integración con las clases globales de estilos de la app
- Footer preparado para integrar `app-institutional-button`
- Colores y tipografía consistentes con el diseño institucional

### ✅ Funcionalidades Adicionales
- Variantes de tamaño y estilo (estándar, compacta, destacada)
- Propiedades para manejar sombra, borde y estados
- Configuración responsiva automática
- Animaciones suaves

## Configuración

### Interfaz CardConfig

\`\`\`typescript
export interface CardConfig {
  variant?: 'standard' | 'compact' | 'highlighted';
  size?: 'small' | 'medium' | 'large' | 'auto';
  state?: 'default' | 'active' | 'disabled' | 'selected';
  showHeader?: boolean;
  showFooter?: boolean;
  showShadow?: boolean;
  showBorder?: boolean;
  customClass?: string;
  headerClass?: string;
  bodyClass?: string;
  footerClass?: string;
  ariaLabel?: string;
  title?: string;
}
\`\`\`

### Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `variant` | `'standard' \| 'compact' \| 'highlighted'` | `'standard'` | Variante visual de la carta |
| `size` | `'small' \| 'medium' \| 'large' \| 'auto'` | `'auto'` | Tamaño de la carta |
| `state` | `'default' \| 'active' \| 'disabled' \| 'selected'` | `'default'` | Estado visual de la carta |
| `showHeader` | `boolean` | `true` | Mostrar/ocultar header |
| `showFooter` | `boolean` | `true` | Mostrar/ocultar footer |
| `showShadow` | `boolean` | `true` | Aplicar sombra |
| `showBorder` | `boolean` | `false` | Aplicar borde |

## Ejemplos de Uso

### 1. Carta Básica con Todo el Contenido

\`\`\`html
<app-institutional-card>
  <div slot="header">
    <h3 class="text-xl font-semibold text-institucional-primario">
      Título de la Carta
    </h3>
    <p class="text-sm text-gray-600">Subtítulo opcional</p>
  </div>
  
  <div class="space-y-4">
    <p>Contenido principal de la carta. Aquí puedes colocar cualquier tipo de contenido.</p>
    <div class="bg-gray-50 p-3 rounded">
      <p class="text-sm">Información adicional en un contenedor</p>
    </div>
  </div>
  
  <div slot="footer">
    <app-institutional-button
      [config]="{
        variant: 'secondary',
        size: 'small'
      }">
      Cancelar
    </app-institutional-button>
    
    <app-institutional-button
      [config]="{
        variant: 'primary',
        size: 'small'
      }">
      Confirmar
    </app-institutional-button>
  </div>
</app-institutional-card>
\`\`\`

### 2. Carta Compacta Solo con Body

\`\`\`html
<app-institutional-card
  [config]="{
    variant: 'compact',
    showHeader: false,
    showFooter: false,
    size: 'medium'
  }">
  <div class="text-center">
    <div class="w-16 h-16 bg-institucional-primario rounded-full mx-auto mb-3 flex items-center justify-center">
      <span class="material-symbols-outlined text-white text-2xl">notifications</span>
    </div>
    <h4 class="font-semibold mb-2">Notificación Importante</h4>
    <p class="text-sm text-gray-600">Mensaje breve de notificación</p>
  </div>
</app-institutional-card>
\`\`\`

### 3. Carta Destacada con Tabla

\`\`\`html
<app-institutional-card
  [config]="{
    variant: 'highlighted',
    size: 'large',
    state: 'active'
  }">
  <div slot="header">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold">Reporte de Usuarios</h3>
      <span class="bg-stats4 text-white px-2 py-1 rounded text-xs">Activo</span>
    </div>
  </div>
  
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b">
          <th class="text-left p-2">Nombre</th>
          <th class="text-left p-2">Email</th>
          <th class="text-left p-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b">
          <td class="p-2">Juan Pérez</td>
          <td class="p-2">juan@example.com</td>
          <td class="p-2">Activo</td>
        </tr>
        <!-- Más filas... -->
      </tbody>
    </table>
  </div>
  
  <div slot="footer">
    <app-institutional-button
      [config]="{
        variant: 'ghost',
        size: 'small',
        icon: 'download',
        iconPosition: 'left'
      }">
      Exportar
    </app-institutional-button>
    
    <app-institutional-button
      [config]="{
        variant: 'primary',
        size: 'small',
        icon: 'refresh',
        iconPosition: 'left'
      }">
      Actualizar
    </app-institutional-button>
  </div>
</app-institutional-card>
\`\`\`

### 4. Carta con Formulario

\`\`\`html
<app-institutional-card
  [config]="{
    variant: 'standard',
    size: 'medium',
    showShadow: true,
    showBorder: true
  }">
  <div slot="header">
    <h3 class="text-lg font-semibold text-institucional-primario">
      Nuevo Usuario
    </h3>
  </div>
  
  <form class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Nombre</label>
      <input 
        type="text" 
        class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none">
    </div>
    
    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input 
        type="email" 
        class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none">
    </div>
    
    <div>
      <label class="block text-sm font-medium mb-1">Rol</label>
      <select class="w-full p-2 border rounded focus:border-institucional-primario focus:outline-none">
        <option>Administrador</option>
        <option>Usuario</option>
        <option>Invitado</option>
      </select>
    </div>
  </form>
  
  <div slot="footer">
    <app-institutional-button
      [config]="{
        variant: 'secondary',
        size: 'medium'
      }"
      type="button">
      Cancelar
    </app-institutional-button>
    
    <app-institutional-button
      [config]="{
        variant: 'primary',
        size: 'medium'
      }"
      type="submit">
      Guardar Usuario
    </app-institutional-button>
  </div>
</app-institutional-card>
\`\`\`

### 5. Grid de Cartas Responsivo

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Carta de Estadística -->
  <app-institutional-card
    [config]="{
      variant: 'compact',
      showHeader: false,
      showFooter: false,
      state: 'active'
    }">
    <div class="text-center">
      <div class="text-3xl font-bold text-stats1 mb-2">1,234</div>
      <div class="text-sm text-gray-600">Usuarios Registrados</div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div class="bg-stats1 h-2 rounded-full" style="width: 75%"></div>
      </div>
    </div>
  </app-institutional-card>
  
  <!-- Carta de Acción Rápida -->
  <app-institutional-card
    [config]="{
      variant: 'standard',
      size: 'auto'
    }">
    <div slot="header">
      <h4 class="font-semibold">Acciones Rápidas</h4>
    </div>
    
    <div class="space-y-2">
      <button class="w-full text-left p-2 hover:bg-gray-50 rounded">
        Crear Usuario
      </button>
      <button class="w-full text-left p-2 hover:bg-gray-50 rounded">
        Ver Reportes
      </button>
      <button class="w-full text-left p-2 hover:bg-gray-50 rounded">
        Configuración
      </button>
    </div>
  </app-institutional-card>
  
  <!-- Carta de Notificación -->
  <app-institutional-card
    [config]="{
      variant: 'highlighted',
      state: 'selected'
    }">
    <div slot="header">
      <div class="flex items-center">
        <span class="material-symbols-outlined text-institucional-primario mr-2">
          campaign
        </span>
        <span class="font-semibold">Anuncios</span>
      </div>
    </div>
    
    <div>
      <p class="text-sm mb-3">Nueva actualización del sistema disponible</p>
      <div class="bg-institucional-primario bg-opacity-10 p-3 rounded">
        <p class="text-xs text-institucional-primario">
          Versión 2.1.0 lista para instalar
        </p>
      </div>
    </div>
    
    <div slot="footer">
      <app-institutional-button
        [config]="{
          variant: 'primary',
          size: 'small',
          fullWidth: true
        }">
        Ver Detalles
      </app-institutional-button>
    </div>
  </app-institutional-card>
</div>
\`\`\`

## Importación del Componente

Para usar el componente en tu módulo o componente standalone:

\`\`\`typescript
import { InstitutionalCardComponent } from '@shared/components/institutional-card/institutional-card.component';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    CommonModule,
    InstitutionalCardComponent,
    // otros imports...
  ],
  // ...
})
export class MiComponente {
  // ...
}
\`\`\`

## Clases CSS Disponibles

### Variantes
- `.institutional-card-standard` - Carta estándar (altura mínima: 200px)
- `.institutional-card-compact` - Carta compacta (altura mínima: 120px)
- `.institutional-card-highlighted` - Carta destacada (altura mínima: 250px, borde primario)

### Tamaños
- `.institutional-card-small` - Ancho máximo: 300px
- `.institutional-card-medium` - Ancho máximo: 500px
- `.institutional-card-large` - Ancho máximo: 800px
- `.institutional-card-auto` - Ancho 100%, sin máximo

### Estados
- `.institutional-card-default` - Estado por defecto
- `.institutional-card-active` - Estado activo (elevación, borde primario)
- `.institutional-card-disabled` - Estado deshabilitado (opacidad reducida)
- `.institutional-card-selected` - Estado seleccionado (fondo ligeramente tintado)

## Consideraciones de Accesibilidad

- El componente incluye atributos ARIA apropiados
- Soporte para lectores de pantalla con `role="region"`
- Estados visuales claros para interacciones con teclado
- Contraste de colores apropiado según estándares WCAG

## Diseño Responsivo

- **Móvil (< 640px)**: Footer se convierte en columna, padding reducido
- **Tablet (640px - 1024px)**: Layout optimizado para pantallas medianas
- **Desktop (> 1024px)**: Layout completo con todas las características

## Integración con Otros Componentes

El componente está diseñado para trabajar perfectamente con:
- `app-institutional-button` - Para acciones en el footer
- `app-universal-icon` - Para iconos en header y body
- Componentes de formulario existentes
- Tablas institucionales
- Sistema de notificaciones

## Personalización Avanzada

### CSS Custom Properties
Puedes personalizar colores utilizando las variables CSS institucionales:

\`\`\`css
:root {
  --institucional-primario: #621132;
  --institucional-secundario: #9D2449;
  /* etc... */
}
\`\`\`

### Clases Personalizadas
Utiliza las propiedades `customClass`, `headerClass`, `bodyClass`, y `footerClass` para aplicar estilos específicos.

## Mejores Prácticas

1. **Usa slots apropiados**: Coloca contenido del header en `slot="header"` y del footer en `slot="footer"`
2. **Mantén consistencia**: Usa las variantes y tamaños de manera consistente en tu aplicación
3. **Accesibilidad**: Siempre proporciona `ariaLabel` para cartas interactivas
4. **Responsive**: Prueba el comportamiento en diferentes tamaños de pantalla
5. **Performance**: Evita cartas anidadas profundamente para mejor rendimiento