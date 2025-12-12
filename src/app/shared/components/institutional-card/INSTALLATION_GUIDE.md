# 🎯 Guía de Integración: Institutional Card Component

## 🚀 Instalación y Configuración

### Paso 1: Verificar Estructura de Archivos

Asegúrate de que los siguientes archivos estén en su lugar:

```
src/app/shared/components/institutional-card/
├── institutional-card.component.ts
├── card-examples.component.ts (opcional)
├── README.md
└── installation-guide.md (este archivo)
```

### Paso 2: Actualizar Exports

El componente ya está exportado en `src/app/shared/components/index.ts`:

```typescript
// Componentes de cartas institucionales
export * from './institutional-card/institutional-card.component';
```

### Paso 3: Importar en tu Componente

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstitutionalCardComponent } from '@shared/components/institutional-card/institutional-card.component';
import { InstitutionalButtonComponent } from '@shared/components/buttons/institutional-button.component';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    CommonModule,
    InstitutionalCardComponent,
    InstitutionalButtonComponent, // Para botones en el footer
    // otros imports...
  ],
  template: \`
    <app-institutional-card [config]="cardConfig">
      <div slot="header">
        <h3>Mi Título</h3>
      </div>
      <div>
        <p>Contenido principal</p>
      </div>
      <div slot="footer">
        <app-institutional-button [config]="{ variant: 'primary' }">
          Acción
        </app-institutional-button>
      </div>
    </app-institutional-card>
  \`
})
export class MiComponente {
  cardConfig = {
    variant: 'standard' as const,
    size: 'auto' as const,
    showShadow: true
  };
}
```

## 🎨 Ejemplos Rápidos de Implementación

### 1. Reemplazar Cartas Existentes

**Antes (carta tradicional):**
```html
<div class="bg-white rounded-lg shadow-md p-6">
  <div class="mb-4">
    <h3 class="text-lg font-semibold">Título</h3>
  </div>
  <div class="mb-4">
    <p>Contenido...</p>
  </div>
  <div class="flex justify-end space-x-2">
    <button class="btn btn-primary">Acción</button>
  </div>
</div>
```

**Después (institutional-card):**
```html
<app-institutional-card>
  <div slot="header">
    <h3 class="text-lg font-semibold">Título</h3>
  </div>
  <div>
    <p>Contenido...</p>
  </div>
  <div slot="footer">
    <app-institutional-button [config]="{ variant: 'primary' }">
      Acción
    </app-institutional-button>
  </div>
</app-institutional-card>
```

### 2. Dashboard Widgets

```html
<!-- Widget de Estadística -->
<app-institutional-card
  [config]="{
    variant: 'compact',
    showHeader: false,
    showFooter: false,
    state: 'active'
  }">
  <div class="text-center">
    <div class="text-4xl font-bold text-stats1 mb-2">{{ totalUsers }}</div>
    <div class="text-sm text-gray-600">Usuarios Totales</div>
  </div>
</app-institutional-card>
```

### 3. Formularios Modales

```html
<app-institutional-card
  [config]="{
    variant: 'standard',
    showBorder: true,
    size: 'medium'
  }">
  <div slot="header">
    <h3 class="text-xl font-semibold text-institucional-primario">
      {{ isEdit ? 'Editar' : 'Crear' }} Usuario
    </h3>
  </div>
  
  <form [formGroup]="userForm" class="space-y-4">
    <!-- Campos del formulario -->
  </form>
  
  <div slot="footer">
    <app-institutional-button
      [config]="{ variant: 'secondary' }"
      (buttonClick)="cancel()">
      Cancelar
    </app-institutional-button>
    
    <app-institutional-button
      [config]="{ 
        variant: 'primary',
        disabled: userForm.invalid,
        loading: isSubmitting
      }"
      (buttonClick)="save()">
      {{ isEdit ? 'Actualizar' : 'Crear' }}
    </app-institutional-button>
  </div>
</app-institutional-card>
```

### 4. Listas de Elementos

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <app-institutional-card
    *ngFor="let item of items; trackBy: trackByFn"
    [config]="{
      variant: 'standard',
      state: item.isSelected ? 'selected' : 'default',
      size: 'auto'
    }"
    (click)="selectItem(item)">
    
    <div slot="header">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold">{{ item.title }}</h4>
        <span [class]="getStatusClass(item.status)">
          {{ item.status }}
        </span>
      </div>
    </div>
    
    <div>
      <p class="text-gray-600 text-sm">{{ item.description }}</p>
      <div class="mt-3">
        <div class="text-xs text-gray-500">Última actualización:</div>
        <div class="text-sm">{{ item.lastUpdate | date:'short' }}</div>
      </div>
    </div>
    
    <div slot="footer">
      <app-institutional-button
        [config]="{
          variant: 'ghost',
          size: 'small',
          icon: 'edit',
          iconPosition: 'left'
        }"
        (buttonClick)="editItem(item)">
        Editar
      </app-institutional-button>
      
      <app-institutional-button
        [config]="{
          variant: 'primary',
          size: 'small',
          icon: 'visibility',
          iconPosition: 'left'
        }"
        (buttonClick)="viewItem(item)">
        Ver Detalles
      </app-institutional-button>
    </div>
  </app-institutional-card>
</div>
```

## 🔧 Configuraciones Recomendadas por Caso de Uso

### Dashboard Widgets
```typescript
const dashboardCardConfig = {
  variant: 'compact' as const,
  showHeader: false,
  showFooter: false,
  state: 'active' as const,
  showShadow: true
};
```

### Formularios
```typescript
const formCardConfig = {
  variant: 'standard' as const,
  size: 'medium' as const,
  showBorder: true,
  showShadow: true
};
```

### Listas/Grid de Elementos
```typescript
const listItemCardConfig = {
  variant: 'standard' as const,
  size: 'auto' as const,
  showShadow: true,
  state: 'default' as const // cambia dinámicamente según selección
};
```

### Notificaciones/Alertas
```typescript
const alertCardConfig = {
  variant: 'highlighted' as const,
  showHeader: false,
  showFooter: false,
  state: 'selected' as const,
  customClass: 'border-l-4 border-stats2'
};
```

## 📱 Consideraciones Responsive

### Breakpoints Automáticos

El componente incluye breakpoints automáticos:

- **Mobile (< 640px)**: Footer se convierte en columna, padding reducido
- **Tablet (640px - 1024px)**: Layout optimizado
- **Desktop (> 1024px)**: Layout completo

### Grid Responsive Recomendado

```html
<!-- Para widgets de dashboard -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- cartas aquí -->
</div>

<!-- Para contenido principal -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- cartas aquí -->
</div>

<!-- Para listas de elementos -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  <!-- cartas aquí -->
</div>
```

## 🎭 Personalización Avanzada

### CSS Custom Properties

Puedes personalizar colores sobrescribiendo las variables:

```css
:root {
  --institucional-primario: #621132;
  --institucional-secundario: #9D2449;
  /* personaliza según necesites */
}
```

### Clases Personalizadas

```typescript
// En tu componente
const customCardConfig = {
  variant: 'standard' as const,
  customClass: 'my-custom-card border-2 border-dashed',
  headerClass: 'bg-gradient-to-r from-blue-50 to-purple-50',
  bodyClass: 'p-8',
  footerClass: 'justify-center'
};
```

### Estilos CSS Adicionales

```css
/* En tu componente.css */
:host ::ng-deep .my-custom-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
}

:host ::ng-deep .my-custom-card .institutional-card-header {
  border-bottom: 2px solid #3b82f6;
}
```

## ✅ Checklist de Migración

### Preparación
- [ ] Verificar que todos los archivos del componente están en su lugar
- [ ] Confirmar que el export está en `index.ts`
- [ ] Revisar dependencias de `InstitutionalButtonComponent`

### Migración por Fases
- [ ] **Fase 1**: Migrar widgets de dashboard simples
- [ ] **Fase 2**: Migrar formularios y modales
- [ ] **Fase 3**: Migrar listas y grids complejos
- [ ] **Fase 4**: Optimizar y personalizar

### Testing
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Verificar accesibilidad con lectores de pantalla
- [ ] Validar performance con muchas cartas
- [ ] Confirmar que los estilos son consistentes

## 🚨 Problemas Comunes y Soluciones

### Problema: Estilos no se aplican
**Solución**: Verificar que las variables CSS institucionales estén definidas en `styles.css`

### Problema: Componente no se encuentra
**Solución**: Verificar rutas de importación y que esté exportado en `index.ts`

### Problema: Footer se desborda en móvil
**Solución**: Usar botones con `size: 'small'` y considerar `fullWidth: true`

### Problema: Contenido se corta
**Solución**: Verificar que el contenido del body no tenga alturas fijas

## 📈 Optimización de Performance

### Lazy Loading de Cartas
```typescript
// Para listas largas, considera usar virtual scrolling
// o paginación con el componente institutional-table
```

### TrackBy Functions
```typescript
trackByFn(index: number, item: any): any {
  return item.id; // usa un identificador único
}
```

### OnPush Change Detection
```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiComponente {
  // Usar para mejor performance con muchas cartas
}
```

## 🎯 Próximos Pasos

1. **Migrar componentes existentes** siguiendo los ejemplos
2. **Crear tus propias variantes** según necesidades específicas
3. **Documentar casos de uso** específicos de tu aplicación
4. **Contribuir mejoras** al componente base si es necesario

¡El componente está listo para usar! 🚀