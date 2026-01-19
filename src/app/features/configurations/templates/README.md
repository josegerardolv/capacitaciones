# Sistema de Diseño de Constancias

Sistema completo para crear, diseñar y gestionar constancias/certificados personalizados con editor visual profesional tipo Word.

## 🎯 Características Principales

### Editor Visual Profesional (Fabric.js)
- **Canvas HTML5 interactivo** con Fabric.js para edición visual avanzada
- **Edición inline de texto** como en Word (doble clic para editar)
- **Drag & drop** con guías de alineación
- **Redimensionar y rotar** con controles visuales
- **Sistema de capas** con panel de gestión
- **Historial completo** (Undo/Redo con Ctrl+Z/Y)
- **Atajos de teclado** profesionales

### Barra de Herramientas Tipo Word
- Formateo de texto: **Negrita**, *Cursiva*, <u>Subrayado</u>
- Alineación: Izquierda, Centro, Derecha, Justificado
- Selector de fuentes y tamaños
- Paleta de colores institucionales
- Controles de alineación de elementos
- Ordenamiento de capas (Frente/Fondo)

### Elementos Disponibles
- ✏️ **Texto**: Edición inline, fuentes personalizadas, variables dinámicas
- 🔠 **Títulos**: Textos destacados con estilos predefinidos
- 🖼️ **Imágenes**: Subir, ajustar, redimensionar
- 📱 **Código QR**: Generación automática con qrcode
- ⬛ **Formas**: Rectángulos, círculos, elipses, triángulos, líneas
- 🎨 **Fondo**: Imagen de fondo con ajustes (cover/contain/fill)

### Gestión de Templates
- Crear nuevos templates desde cero
- Editar templates existentes
- Duplicar templates para crear variaciones
- Eliminar templates obsoletos
- Vista previa antes de usar

### Variables Dinámicas
- Inserción visual de variables en textos
- Panel dedicado con variables disponibles
- Separación clara entre diseño y datos
- Compatible con generación masiva

### Atajos de Teclado
- `Ctrl+Z` - Deshacer
- `Ctrl+Y` / `Ctrl+Shift+Z` - Rehacer
- `Ctrl+C` - Copiar
- `Ctrl+V` - Pegar
- `Ctrl+X` - Cortar
- `Ctrl+D` - Duplicar
- `Delete` / `Backspace` - Eliminar
- `Escape` - Deseleccionar
- `Flechas` - Mover elemento (1px)
- `Shift+Flechas` - Mover elemento (10px)

## 📦 Dependencias

```json
{
  "fabric": "^6.x",        // Editor de canvas profesional
  "qrcode": "^1.5.x",      // Generación de códigos QR
  "@types/fabric": "^5.x"  // Tipos TypeScript para Fabric.js
}
```

## 📁 Estructura de Archivos

```
src/app/features/documents/
├── components/
│   ├── certificate-form/          # Formulario crear certificado
│   ├── certificate-edit-form/     # Formulario editar certificado
│   ├── tarjeton-form/             # Formulario crear tarjetón
│   └── tarjeton-edit-form/        # Formulario editar tarjetón
├── pages/
│   ├── certificates-list/         # Lista de formatos certificados
│   ├── tarjetones-list/           # Lista de formatos tarjetones
│   ├── templates-list/            # Lista de templates de constancias
│   ├── template-editor/           # Editor visual drag & drop
│   └── template-preview/          # Vista previa de templates
├── services/
│   ├── documents.service.ts       # CRUD certificados/tarjetones
│   └── template.service.ts        # CRUD y gestión de templates
└── documents.routes.ts            # Configuración de rutas

src/app/core/models/
├── document.model.ts              # Modelos Certificate y Tarjeton
└── template.model.ts              # Modelos del sistema de diseño
```

## 🎨 Modelos de Datos

### CertificateTemplate
```typescript
interface CertificateTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  pageConfig: PageConfig;        // Configuración de página
  elements: CanvasElement[];     // Elementos del diseño
  variables: TemplateVariable[]; // Variables dinámicas
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
}
```

### CanvasElement
```typescript
interface CanvasElement {
  id: string;
  type: ElementType;             // 'text' | 'image' | 'shape' | 'qr'
  name: string;
  transform: Transform;          // x, y, width, height, rotation, zIndex
  visualStyle?: VisualStyle;     // Estilos visuales
  locked?: boolean;
  visible?: boolean;
  
  // Configuraciones específicas por tipo
  textConfig?: TextConfig;
  imageConfig?: ImageConfig;
  shapeConfig?: ShapeConfig;
  qrConfig?: QRConfig;
}
```

## 🚀 Uso del Sistema

### 1. Crear un Nuevo Template

```bash
Navegar a: /documentos/templates
Click en: "Crear Template"
```

El editor visual se abrirá con un canvas en blanco donde puedes:
- Agregar elementos desde el panel izquierdo
- Configurar nombre, descripción y categoría
- Diseñar libremente la constancia

### 2. Agregar Elementos

**Panel de Herramientas (Izquierda)**:
- **Texto**: Click en "Texto" → Se agrega al canvas
- **Imagen**: Click en "Imagen" → Placeholder para imagen
- **Formas**: Click en "Rectángulo" o "Círculo"

**Interacción con Elementos**:
- Click para seleccionar
- Seleccionado = borde rojo punteado
- Botones: Duplicar / Eliminar

### 3. Guardar el Template

- Completar información (nombre, descripción)
- Click en "Guardar Template"
- El template se guarda y queda disponible para reutilizar

### 4. Editar Template Existente

```bash
Desde /documentos/templates:
Click en icono de editar (lápiz) → Abre el editor
```

### 5. Duplicar Template

Útil para crear variaciones:
- Click en icono "Duplicar"
- Se crea una copia con "(Copia)" en el nombre
- Editar la copia independientemente

## 🔧 Configuración de Página

```typescript
pageConfig: {
  width: 279.4,          // A4 landscape en mm
  height: 215.9,         // A4 landscape en mm
  orientation: 'landscape',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  backgroundColor: '#ffffff'
}
```

## 📊 Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/documentos/templates` | Lista de templates |
| `/documentos/templates/editor` | Crear nuevo template |
| `/documentos/templates/editor/:id` | Editar template existente |
| `/documentos/templates/preview/:id` | Vista previa template |
| `/documentos/certificados` | Gestión de certificados (legacy) |
| `/documentos/tarjetones` | Gestión de tarjetones (legacy) |

## 🎯 Próximas Mejoras

### Fase 1 - Editor Avanzado ✅ (Actual)
- [x] Canvas básico con elementos
- [x] Selección de elementos
- [x] Panel de herramientas
- [x] Guardado de templates

### Fase 2 - Interactividad
- [ ] Drag & drop real de elementos
- [ ] Redimensionar elementos
- [ ] Rotar elementos
- [ ] Sistema de grillas y guías
- [ ] Alineación automática
- [ ] Deshacer/Rehacer

### Fase 3 - Propiedades Avanzadas
- [ ] Panel de propiedades dinámico
- [ ] Edición de tipografía completa
- [ ] Paleta de colores
- [ ] Gestión de imágenes (upload)
- [ ] Capas visuales

### Fase 4 - Variables y Datos
- [ ] Editor de variables dinámicas
- [ ] Mapeo de variables a elementos
- [ ] Vista previa con datos reales
- [ ] Validación de datos requeridos

### Fase 5 - Generación de Documentos
- [ ] Integración con jsPDF o similar
- [ ] Generación de PDFs desde templates
- [ ] Generación masiva (batch)
- [ ] Descarga individual y masiva
- [ ] Envío por email

### Fase 6 - Impresión
- [ ] Vista previa de impresión
- [ ] Configuración de márgenes
- [ ] Soporte para diferentes tamaños de papel
- [ ] Impresión directa desde el navegador

## 🛠️ Tecnologías Utilizadas

- **Angular 20+** (Standalone Components)
- **TypeScript**
- **Canvas HTML5** para rendering
- **Tailwind CSS** para estilos
- **RxJS** para manejo de estado
- Componentes institucionales del proyecto

## 📝 Notas de Implementación

### Canvas y Coordenadas
El canvas usa píxeles pero los templates se configuran en milímetros:
- Conversión: `píxeles = mm * 96 / 25.4`
- A4 Landscape: 1122x794 píxeles a 96 DPI

### Sistema de Renderizado
1. Limpiar canvas
2. Dibujar fondo
3. Ordenar elementos por zIndex
4. Renderizar cada elemento según su tipo
5. Dibujar selección si hay elemento activo

### Guardado de Estado
Todo el estado del diseño se serializa en el modelo `CertificateTemplate`:
- Información del template
- Configuración de página
- Array de elementos con sus transformaciones y estilos
- Variables dinámicas disponibles

## 🤝 Contribuir

Para extender el sistema:

1. **Nuevos tipos de elementos**: Agregar en `ElementType` y crear configuración correspondiente
2. **Nuevas herramientas**: Agregar botón en panel izquierdo y método en componente
3. **Renderizado custom**: Extender métodos `renderElement()` del editor

## 📧 Soporte

Para dudas o sugerencias sobre el sistema de diseño de constancias, contactar al equipo de desarrollo.
