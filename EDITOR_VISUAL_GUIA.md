# 📐 Guía del Editor Visual de Certificados y Tarjetones

## ✨ Funcionalidades Principales

### 🎨 Panel de Herramientas (Izquierda)

#### **Información del Documento**
- **Nombre**: Identifica el certificado o tarjetón
- **Descripción**: Añade detalles adicionales

#### **Fondo del Certificado**
- **Cargar Imagen**: Sube una imagen de fondo (JPG, PNG)
- **Ajustes de imagen**:
  - **Cover**: La imagen cubre todo el espacio (puede recortarse)
  - **Contain**: La imagen se ajusta completa sin recortar
  - **Fill**: La imagen se estira para llenar el espacio
- **Quitar imagen**: Elimina la imagen de fondo

#### **Agregar Elementos**
- 📝 **Texto**: Agrega bloques de texto personalizables
- 🖼️ **Imagen**: Inserta imágenes (logos, sellos, etc.)
- ▭ **Rectángulo**: Crea formas rectangulares
- ⭕ **Círculo**: Crea formas circulares

#### **Variables Disponibles**
Variables dinámicas que se reemplazan al generar el documento:
- `{{nombre}}` - Nombre completo del destinatario
- `{{curso}}` - Nombre del curso
- `{{fecha}}` - Fecha de emisión

**Uso**: Selecciona un elemento de texto y haz clic en la variable deseada

#### **Acciones**
- **Duplicar**: Crea una copia del elemento seleccionado
- **Eliminar**: Borra el elemento seleccionado

---

### 🖱️ Canvas Central - Área de Diseño

#### **Interacciones Básicas**
- **Clic**: Selecciona un elemento
- **Arrastrar**: Mueve el elemento por el canvas
- **Handles (cuadrados)**: Redimensiona el elemento
  - 8 handles: esquinas y bordes
  - Mantén proporciones usando las esquinas

#### **Controles de Teclado**
- **Delete** o **Backspace**: Elimina elemento seleccionado
- **Escape**: Deselecciona elemento actual

#### **Cursores**
- ✋ **Mano abierta**: Sobre el canvas vacío
- 👆 **Mano cerrada/Move**: Sobre un elemento (arrastra)
- ↔️ **Redimensionar**: Sobre los handles (8 direcciones)

---

### ⚙️ Panel de Propiedades (Derecha)

Aparece automáticamente cuando seleccionas un elemento.

#### **Propiedades Comunes**
- **Nombre del Elemento**: Identificador interno
- **Posición (X, Y)**: Coordenadas exactas en píxeles
- **Tamaño (Ancho, Alto)**: Dimensiones precisas

#### **Propiedades de Texto**
- **Contenido**: El texto a mostrar (multi-línea soportado)
  - Inserta variables como `{{nombre}}`
- **Tamaño**: Tamaño de fuente en puntos
- **Color**: Selector de color visual
- **Fuente**: Arial, Times New Roman, Courier, Georgia, Verdana, Montserrat
- **Alineación**: Izquierda ◀ | Centro ▪ | Derecha ▶

#### **Propiedades de Forma**
- **Color de Relleno**: Interior de la forma
- **Color de Borde**: Contorno de la forma
- **Grosor de Borde**: Ancho del contorno en píxeles

#### **Propiedades de Imagen**
- **URL de Imagen**: Dirección de la imagen (http:// o data:)
- **Ajuste**: 
  - **Contain**: Imagen completa visible
  - **Cover**: Imagen cubre el espacio (puede recortarse)
  - **Fill**: Imagen estirada

---

## 🔄 Flujo de Trabajo Recomendado

### 1️⃣ **Preparar el Fondo**
1. Carga una imagen de fondo (diseño previo del certificado)
2. Ajusta el modo de visualización (Cover/Contain/Fill)

### 2️⃣ **Añadir Estructura Visual**
1. Agrega formas (rectángulos/círculos) para crear marcos o secciones
2. Personaliza colores y bordes

### 3️⃣ **Insertar Contenido**
1. Añade elementos de texto
2. Configura fuentes, tamaños y colores
3. Inserta variables donde corresponda (ej: `{{nombre}}`, `{{curso}}`)

### 4️⃣ **Añadir Imágenes**
1. Agrega elementos de imagen (logos, sellos, firmas)
2. Proporciona URLs o rutas de las imágenes
3. Ajusta el fit según necesites

### 5️⃣ **Ajustar Posicionamiento**
1. Arrastra elementos para posicionarlos
2. Usa los handles para redimensionar
3. Usa el panel de propiedades para ajustes finos

### 6️⃣ **Guardar**
1. Verifica el diseño completo
2. Haz clic en **"Guardar Diseño"**
3. El template se guarda embebido en el certificado/tarjetón

---

## 💡 Tips y Mejores Prácticas

### ✅ Recomendaciones

- **Usa el fondo de imagen**: Diseña el certificado en Photoshop/Illustrator y úsalo como base
- **Variables para contenido dinámico**: Todo lo que cambie por usuario debe ser una variable
- **Texto estático directo**: Títulos, textos fijos, etc. van directamente en los elementos
- **Duplica elementos similares**: Más rápido que crear desde cero
- **Nomenclatura clara**: Nombra los elementos descriptivamente (ej: "Título Principal", "Firma Director")

### ⚠️ Evitar

- ❌ No uses variables en imágenes (aún no soportado en esta versión)
- ❌ No pongas textos muy largos en un solo elemento (usa varios)
- ❌ No superpongas muchos elementos sin necesidad (afecta rendimiento)

---

## 🎯 Casos de Uso Comunes

### Certificado de Curso Estándar
```
Fondo: Imagen del diseño oficial
Elementos:
  - Texto "Se certifica que" (estático)
  - Texto "{{nombre}}" (variable, fuente grande)
  - Texto "Ha completado satisfactoriamente el curso" (estático)
  - Texto "{{curso}}" (variable, fuente mediana)
  - Texto "Fecha: {{fecha}}" (variable)
  - Imagen de logo institucional
  - Imagen de firma
```

### Tarjetón de Identificación
```
Fondo: Imagen corporativa
Elementos:
  - Rectángulo de fondo para foto
  - Texto "{{nombre}}" (variable)
  - Texto "ID: {{folio}}" (variable)
  - Texto "Vigencia: {{vigencia}}" (variable)
  - Círculo para marco de foto
  - Logo institucional
```

---

## 🐛 Solución de Problemas

**Problema**: No puedo arrastrar el elemento
- ✅ **Solución**: Asegúrate de hacer clic sobre el elemento (no en el espacio vacío)

**Problema**: La imagen no se muestra
- ✅ **Solución**: Verifica que la URL sea correcta y accesible (CORS)

**Problema**: Las variables no se ven bien
- ✅ **Solución**: Ajusta el tamaño y fuente del elemento de texto

**Problema**: El fondo se ve cortado
- ✅ **Solución**: Cambia el ajuste de Cover a Contain

**Problema**: Borré un elemento por error
- ✅ **Solución**: Cancela y vuelve a entrar (no hay deshacer aún)

---

## 📦 Características Técnicas

- **Resolución del Canvas**: 1122 × 794 píxeles
- **Formato**: A4 Landscape (279.4mm × 215.9mm @ 96 DPI)
- **Tipos de Elementos**: Texto, Imagen, Rectángulo, Círculo
- **Formatos de Imagen**: JPG, PNG, SVG
- **Fuentes Disponibles**: 6 familias tipográficas
- **Persistencia**: Los diseños se guardan automáticamente al hacer clic en "Guardar Diseño"

---

## 🔜 Próximas Mejoras (Roadmap)

- [ ] Deshacer/Rehacer (Ctrl+Z / Ctrl+Y)
- [ ] Copiar/Pegar (Ctrl+C / Ctrl+V)
- [ ] Alineación automática (guías)
- [ ] Capas y orden Z
- [ ] Grupos de elementos
- [ ] Plantillas predefinidas
- [ ] Exportación a PDF directo
- [ ] Vista previa con datos reales

---

¿Preguntas o sugerencias? Contacta al equipo de desarrollo.
