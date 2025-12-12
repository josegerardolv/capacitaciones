# FormattedInput Component

## 📝 Descripción

`FormattedInputComponent` es un componente genérico y altamente reutilizable para Angular que aplica formateo automático a inputs de texto. Permite formatear valores mientras el usuario escribe y mantiene separados el valor mostrado (formateado) del valor almacenado (crudo).

## ✨ Características Principales

- **🎯 Formateo Dinámico**: Aplica formatos automáticamente mientras el usuario escribe
- **📱 Formatos Predefinidos**: Teléfono, tarjeta de crédito, fecha, código postal, RFC, CURP
- **🛠️ Formatos Personalizados**: Permite definir formatos completamente customizados
- **💾 Dual Value**: Mantiene el valor formateado para UI y el valor crudo para almacenar
- **✅ Validación Integrada**: Validación de caracteres y formato completo
- **🎨 Consistencia Visual**: Estilos idénticos a `input-enhanced`
- **♿ Accesibilidad**: Compatible con screen readers y navegación por teclado
- **🔧 Extensible**: Fácil agregar nuevos formatos

## 🚀 Instalación y Uso Básico

### Importar el Componente

```typescript
import { FormattedInputComponent } from '@/app/shared/components/inputs/formatted-input.component';

@Component({
  imports: [FormattedInputComponent],
  // ...
})
```

### Uso Básico con Formato Predefinido

```html
<!-- Teléfono -->
<app-formatted-input
  format="phone"
  label="Teléfono"
  controlName="telefono"
  required="true">
</app-formatted-input>

<!-- Tarjeta de Crédito -->
<app-formatted-input
  format="creditCard"
  label="Número de tarjeta"
  controlName="tarjeta">
</app-formatted-input>

<!-- Fecha -->
<app-formatted-input
  format="date"
  label="Fecha de nacimiento"
  controlName="fecha_nacimiento">
</app-formatted-input>
```

## 📋 Formatos Predefinidos

| Formato | Clave | Patrón | Ejemplo |
|---------|-------|--------|---------|
| Teléfono | `phone` | `### ### ####` | `555 123 4567` |
| Tarjeta de Crédito | `creditCard` | `#### #### #### ####` | `1234 5678 9012 3456` |
| Código Postal | `postalCode` | `#####` | `12345` |
| Código Postal Ext. | `postalCodeExtended` | `#####-####` | `12345-6789` |
| Fecha | `date` | `##/##/####` | `25/12/2023` |
| RFC | `rfc` | `AAAA######AAA` | `ABCD123456ABC` |
| CURP | `curp` | `AAAA######AAAAAA##` | `ABCD123456HIJKLM12` |

## ⚙️ Propiedades (Inputs)

### Propiedades Principales

| Propiedad | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `format` | `string` | Formato predefinido a usar | `undefined` |
| `customFormat` | `InputFormat` | Formato personalizado (prioridad sobre format) | `undefined` |
| `emitFormatted` | `boolean` | Emitir valor formateado en lugar de crudo | `false` |
| `realTimeFormatting` | `boolean` | Aplicar formateo en tiempo real | `true` |
| `showProgress` | `boolean` | Mostrar indicador de progreso | `false` |

### Propiedades Comunes (Heredadas de InputEnhanced)

| Propiedad | Tipo | Descripción | Valor por defecto |
|-----------|------|-------------|-------------------|
| `label` | `string` | Etiqueta del campo | `undefined` |
| `placeholder` | `string` | Placeholder (se toma del formato si no se especifica) | `undefined` |
| `required` | `boolean` | Si el campo es requerido | `false` |
| `readonly` | `boolean` | Si el campo es de solo lectura | `false` |
| `disabled` | `boolean` | Si el campo está deshabilitado | `false` |
| `helperText` | `string` | Texto de ayuda | `undefined` |
| `helperPosition` | `'top' \| 'bottom'` | Posición del texto de ayuda | `'bottom'` |
| `floating` | `boolean` | Si usa label flotante | `true` |
| `controlName` | `string` | Nombre del FormControl | `''` |
| `iconRight` | `string` | Icono en el lado derecho | `undefined` |

## 📤 Eventos (Outputs)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `valueChange` | `FormattedInputEvent` | Emite cuando cambia el valor |
| `formatComplete` | `FormattedInputEvent` | Emite cuando se completa el formato |
| `validationChange` | `boolean` | Emite cuando cambia el estado de validación |
| `focus` | `void` | Emite cuando el input recibe focus |
| `blur` | `void` | Emite cuando el input pierde focus |

## 💡 Ejemplos de Uso

### Ejemplo 1: Teléfono Básico

```html
<app-formatted-input
  format="phone"
  label="Teléfono"
  controlName="telefono"
  required="true"
  helperText="Formato automático: 555 123 4567">
</app-formatted-input>
```

**Comportamiento:**
- Input: `5551234567` → Display: `555 123 4567`
- Valor emitido: `5551234567` (crudo)

### Ejemplo 2: Tarjeta con Valor Formateado

```html
<app-formatted-input
  format="creditCard"
  [emitFormatted]="true"
  label="Número de tarjeta"
  controlName="numero_tarjeta"
  (formatComplete)="onCardComplete($event)">
</app-formatted-input>
```

**Comportamiento:**
- Input: `1234567890123456` → Display: `1234 5678 9012 3456`
- Valor emitido: `1234 5678 9012 3456` (formateado)

### Ejemplo 3: RFC con Validación

```html
<app-formatted-input
  format="rfc"
  label="RFC"
  controlName="rfc"
  required="true"
  helperText="13 caracteres: ABCD123456ABC"
  (validationChange)="onRfcValidation($event)">
</app-formatted-input>
```

### Ejemplo 4: Formato Personalizado

```typescript
// En el componente
customPhoneFormat: InputFormat = {
  type: 'custom',
  pattern: '(###) ###-####',
  mask: '(###) ###-####',
  maxLength: 10,
  allowedChars: 'numeric',
  placeholder: '(555) 123-4567',
  separators: ['(', ')', ' ', '-'],
  validator: (value: string) => value.length === 10,
  errorMessage: 'Ingrese un teléfono válido'
};
```

```html
<app-formatted-input
  [customFormat]="customPhoneFormat"
  label="Teléfono Personalizado"
  controlName="telefono_custom">
</app-formatted-input>
```

## 🔧 Crear Formatos Personalizados

### Interfaz InputFormat

```typescript
interface InputFormat {
  type: FormatType;
  pattern: string;           // Patrón con # (números), A (letras), * (alfanumérico)
  mask: string;             // Máscara visual
  maxLength: number;        // Longitud máxima sin formato
  allowedChars: 'numeric' | 'alphabetic' | 'alphanumeric' | 'custom';
  customCharValidator?: RegExp;  // Validador personalizado de caracteres
  placeholder: string;
  separators: string[];     // Caracteres separadores
  validator?: (value: string) => boolean;  // Validador del valor completo
  errorMessage?: string;
}
```

### Ejemplo: Formato de Matrícula

```typescript
const MATRICULA_FORMAT: InputFormat = {
  type: 'custom',
  pattern: 'AAA-###',
  mask: 'ABC-123',
  maxLength: 6,
  allowedChars: 'alphanumeric',
  customCharValidator: /^[A-Z0-9]$/,
  placeholder: 'ABC-123',
  separators: ['-'],
  validator: (value: string) => {
    return value.length === 6 && 
           /^[A-Z]{3}[0-9]{3}$/.test(value);
  },
  errorMessage: 'Formato: 3 letras + 3 números'
};
```

## 📖 Métodos Públicos

| Método | Descripción | Retorno |
|--------|-------------|---------|
| `getRawValue()` | Obtiene el valor sin formato | `string` |
| `getFormattedValue()` | Obtiene el valor formateado | `string` |
| `getState()` | Obtiene el estado completo | `FormattedInputState` |
| `updateFormat(format)` | Cambia el formato dinámicamente | `void` |
| `clear()` | Limpia el input | `void` |

## 🔄 Integración con Reactive Forms

```typescript
@Component({
  template: `
    <form [formGroup]="userForm">
      <app-formatted-input
        format="phone"
        controlName="telefono"
        label="Teléfono">
      </app-formatted-input>
      
      <app-formatted-input
        format="rfc"
        controlName="rfc"
        label="RFC">
      </app-formatted-input>
    </form>
  `
})
export class UserComponent {
  userForm = this.fb.group({
    telefono: ['', [Validators.required]], // Recibe valor crudo
    rfc: ['', [Validators.required]]
  });

  onSubmit() {
    const formData = this.userForm.value;
    // formData.telefono = "5551234567" (crudo)
    // formData.rfc = "ABCD123456ABC" (crudo)
  }
}
```

## 🎨 Personalización de Estilos

El componente hereda todos los estilos de `input-enhanced` para mantener consistencia visual. Los estilos se pueden personalizar usando las mismas variables CSS:

```css
:root {
  --institucional-primario: #8b1538;
  --error: #ef4444;
  --gray-300: #d1d5db;
  /* ... otras variables ... */
}
```

## 🚨 Casos de Uso Especiales

### Valor Formateado para APIs

```html
<!-- Para APIs que esperan el valor formateado -->
<app-formatted-input
  format="creditCard"
  [emitFormatted]="true"
  controlName="numero_tarjeta">
</app-formatted-input>
```

### Cambio Dinámico de Formato

```typescript
@Component({
  template: `
    <select (change)="changeFormat($event)">
      <option value="phone">Teléfono</option>
      <option value="rfc">RFC</option>
    </select>
    
    <app-formatted-input
      #dynamicInput
      [format]="currentFormat"
      controlName="dynamic_field">
    </app-formatted-input>
  `
})
export class DynamicComponent {
  currentFormat = 'phone';
  
  changeFormat(event: any) {
    this.currentFormat = event.target.value;
  }
}
```

## ⚠️ Limitaciones y Consideraciones

1. **Límite de Caracteres**: Cada formato tiene un límite máximo definido
2. **Validación de Formato**: La validación es básica, considera usar validadores adicionales para casos complejos
3. **Caracteres Especiales**: Los separadores se excluyen automáticamente del valor crudo
4. **Performance**: Para listas grandes, considera usar `OnPush` change detection

## 🔧 Troubleshooting

### Error: Formato no encontrado
```
FormattedInput: No se pudo resolver el formato 'miFormato'
```
**Solución**: Verificar que el formato existe en `PREDEFINED_FORMATS` o usar `customFormat`

### El valor no se formatea
**Causas posibles:**
- `realTimeFormatting` está en `false`
- Caracteres no permitidos en el valor inicial
- Formato personalizado mal configurado

### Errores de validación
**Verificar:**
- La longitud máxima del formato
- El validador personalizado
- Los caracteres permitidos

## 📝 Changelog

### v1.0.0
- ✅ Implementación inicial
- ✅ Formatos predefinidos: phone, creditCard, date, postalCode, rfc, curp
- ✅ Motor de formateo con validación
- ✅ Integración con Reactive Forms
- ✅ Compatibilidad con input-enhanced

---

**¡El componente FormattedInput está listo para usar!** 🎉

Para más información o reportar bugs, contacta al equipo de desarrollo.