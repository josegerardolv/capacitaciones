# Implementación de Labels Flotantes en Selectores del Day-Picker

## Cambios Realizados

### Archivo Modificado: `day-picker.component.ts`

Se agregaron etiquetas flotantes (`floating labels`) a los componentes `app-select` del selector de mes y año en el componente `day-picker`.

### Antes:
```typescript
<app-select
  [options]="monthOptions"
  [control]="monthControl"
  placeholder="Mes"
  width="140px"
  extraClasses="text-sm">
</app-select>

<app-select
  [options]="yearOptions"
  [control]="yearControl"
  placeholder="Año"
  width="90px"
  extraClasses="text-sm">
</app-select>
```

### Después:
```typescript
<app-select
  [options]="monthOptions"
  [control]="monthControl"
  label="Mes"
  [floating]="true"
  placeholder="Seleccionar mes"
  width="140px"
  extraClasses="text-sm">
</app-select>

<app-select
  [options]="yearOptions"
  [control]="yearControl"
  label="Año"
  [floating]="true"
  placeholder="Seleccionar año"
  width="90px"
  extraClasses="text-sm">
</app-select>
```

## Características Implementadas

### 1. **Labels Flotantes Activados**
- Se agregó `[floating]="true"` a ambos selectores
- Esto activa el comportamiento de etiqueta flotante del componente `app-select`

### 2. **Etiquetas Descriptivas**
- **Selector de Mes**: `label="Mes"`
- **Selector de Año**: `label="Año"`

### 3. **Placeholders Mejorados**
- **Selector de Mes**: `placeholder="Seleccionar mes"`
- **Selector de Año**: `placeholder="Seleccionar año"`

## Comportamiento Visual

### Estados de las Etiquetas:

1. **Estado Inicial** (sin valor seleccionado):
   - La etiqueta aparece centrada dentro del campo
   - Texto en color gris claro
   - Placeholder visible

2. **Estado Focused** (cuando se hace clic o se enfoca):
   - La etiqueta se mueve hacia arriba y se hace más pequeña
   - Cambia a color guinda institucional
   - El campo obtiene borde y sombra de enfoque

3. **Estado Filled** (con valor seleccionado):
   - La etiqueta permanece arriba en tamaño pequeño
   - Color guinda institucional
   - El valor seleccionado se muestra en el campo

## Compatibilidad

### ✅ **Mantiene toda la funcionalidad existente:**
- Navegación del calendario por selectores
- Sincronización con el estado del calendario
- Eventos de cambio de mes/año
- Dropdown que se cierra correctamente

### ✅ **Mejora la experiencia de usuario:**
- Interfaz más moderna y consistente
- Etiquetas siempre visibles
- Mejor accesibilidad
- Diseño coherente con otros componentes institucionales

### ✅ **Responsive y accesible:**
- Funciona en dispositivos móviles
- Compatible con lectores de pantalla
- Mantiene navegación por teclado

## Resultado

Los selectores de mes y año en el `day-picker` ahora tienen un aspecto más profesional y moderno con etiquetas flotantes que:

- Se animan suavemente al interactuar con el campo
- Mantienen el contexto visual siempre visible
- Siguen el patrón de diseño institucional
- Proporcionan una mejor experiencia de usuario

Este cambio es completamente retrocompatible y no afecta ninguna funcionalidad existente del componente.