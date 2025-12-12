# LoadingSpinnerComponent

Componente reutilizable para mostrar estados de carga con un diseño institucional consistente del gobierno de Oaxaca.

## Uso

```typescript
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

// En el componente
@Component({
  imports: [LoadingSpinnerComponent],
  // ...
})
```

```html
<!-- Uso básico -->
<app-loading-spinner *ngIf="loading"></app-loading-spinner>

<!-- Con título y mensaje personalizado -->
<app-loading-spinner 
  *ngIf="loading"
  title="Cargando Datos"
  message="Obteniendo información del servidor...">
</app-loading-spinner>

<!-- Con altura reducida -->
<app-loading-spinner 
  *ngIf="loading"
  title="Procesando"
  message="Por favor espere..."
  [fullHeight]="false">
</app-loading-spinner>
```

## Propiedades

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `title` | `string` | `'Cargando'` | Título principal del loading |
| `message` | `string` | `'Por favor espere...'` | Mensaje descriptivo |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño del spinner |
| `fullHeight` | `boolean` | `true` | Si debe ocupar altura completa (h-96) |

## Características

- ✅ Diseño institucional con colores oficiales de institucional
- ✅ Spinner animado con rotación suave
- ✅ Puntos animados con colores institucionales
- ✅ Diseño responsive
- ✅ Completamente reutilizable
- ✅ Configuración flexible de tamaño y altura

## Ejemplos de Uso Implementados

### TicketListComponent
```html
<app-loading-spinner 
  *ngIf="loading"
  title="Cargando Tickets"
  message="Obteniendo la lista de tickets...">
</app-loading-spinner>
```

### TicketFormComponent
```html
<app-loading-spinner 
  *ngIf="loading"
  title="Cargando Formulario"
  message="Preparando el formulario de ticket..."
  [fullHeight]="false">
</app-loading-spinner>
```

## Colores Institucionales

El componente utiliza la paleta oficial:
- **institucional Guinda**: `#722F37` - Color principal del spinner
- **institucional Rosa**: `#C1272D` - Punto animado central
- **institucional Vino**: `#8B1538` - Punto animado final

## Animaciones

- **Spinner**: Rotación continua de 360° en 1 segundo
- **Puntos**: Efecto bounce con delays escalonados (0s, 0.1s, 0.2s)
