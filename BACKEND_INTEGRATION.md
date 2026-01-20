# Especificación Técnica de Backend - Proyecto Capacitaciones

Este documento define **oficialmente** los endpoints y estructuras de datos requeridos para que el Backend soporte el flujo completo de la aplicación Angular (Frontend).
**Esta versión es la definitiva para la reestructuración de la Base de Datos.**

## 0. Estándares Generales (Backend Structure)

Para mantener la compatibilidad con el trabajo previo:
1.  **Protección:** Todos los endpoints (excepto los marcados como PÚBLICOS) requieren `Bearer Token` (JWT).
2.  **Formato de Respuesta:** JSON estándar.
3.  **Convención de Nombres:**
    *   **Módulos Legacy (Auth):** Mantener `snake_case` (`usuario_id`) si la base de datos lo requiere.
    *   **Nuevos Módulos (Cursos, Templates, Personas):** Usar **`camelCase`** (`firstName`, `courseId`) en las respuestas JSON para alinearse con el Frontend.
4.  **Búsqueda y Paginación (NUEVO REQUERIMIENTO):**
    *   Todas las tablas (Grupos, Solicitudes, Cursos) manejarán altos volúmenes de datos.
    *   **Estándar:** Todos los endpoints `GET` de listas deben soportar:
        *   `?q=termino` (Búsqueda general por nombre, folio, etc.)
        *   `?page=1&limit=10` (Paginación estándar)

---

## 1. Módulos de Inscripción (Flujo Crítico)

### A. Registro Público (Nuevo Endpoint)
*   **Caso de Uso:** Un ciudadano se inscribe desde su casa sin estar logueado.
*   **Seguridad:** Endpoint **PÚBLICO** (Sin Token).
*   **Método:** `POST`
*   **Ruta:** `/api/public/register`
*   **Payload (JSON):**
    ```json
    {
      "groupId": 123,
      "person": {
        "name": "Juan",
        "firstSurname": "Perez",
        "secondSurname": "Lopez",
        "curp": "PELJ900101HDFR05",
        "license": "A12345678",
        "email": "juan@mail.com",
        "phone": "5544332211",
        "address": "Calle Reforma 1, Centro",
        "sex": "H",
        "nuc": "12345678" // Opcional
      },
      "requestedDocuments": ["doc_tarjeton", "doc_constancia"] // IDs de documentos marcados
    }
    ```
*   **Comportamiento Backend:**
    1.  Validar cupo del grupo.
    2.  Crear registro en tabla `persons` (o `personas_inscritas`) con status **`Pendiente`**.
    3.  Responder `200 OK` con mensaje de éxito.

### B. Registro Administrativo (Privado)
*   **Caso de Uso:** Un funcionario inscribe a alguien desde el panel.
*   **Seguridad:** Requiere Token.
*   **Método:** `POST`
*   **Ruta:** `/api/groups/{id}/persons`
*   **Payload:** Mismo objeto `person` completo que el registro público.
*   **Comportamiento:**
    1.  Crear registro con status `Pendiente` (o `Aprobado` si el admin lo decide).

---

## 2. Gestión de Aceptación y Estatus

El frontend maneja una máquina de estados estricta. El backend debe soportar actualizar estos estados.

### A. Aprobar/Reprobar Persona
*   **Ruta:** `/api/persons/{id}/status`
*   **Método:** `PUT` (o `PATCH`)
*   **Payload:** `{ "status": "Aprobado" }` o `{ "status": "No Aprobado" }`
*   **Efecto:** Desbloquea las acciones de certificados en el frontend.

### B. Listar Personas (Con Filtros)
*   **Ruta:** `/api/groups/{id}/persons`
*   **Método:** `GET`
*   **Respuesta Esperada:** Array de objetos.
    *   **Importante:** Incluir campos `status` (Pendiente/Aprobado), `paymentStatus` (Pagado/Pendiente) y `coursePaymentStatus`.

---

## 3. Integración con Pagos y SIOX

El frontend necesita validar pagos antes de entregar documentos.

### A. Validar Pago (Simulación SIOX)
*   **Ruta:** `/api/payments/check` (o `/api/siox/check`)
*   **Método:** `GET`
*   **Params:** `?reference=LINEA_CAPTURA` o `?curp=XYZ`
*   **Comportamiento Backend:**
    1.  Consultar servicio de Finanzas/SIOX.
    2.  Si está pagado, actualizar el `paymentStatus` local de la `person` a `Pagado`.
    3.  Devolver `{ "paymentStatus": "Pagado", "date": "2026-02-15T10:00:00Z" }`.

---

## 4. Requerimientos de Base de Datos (JSON Fields)

**¡ATENCIÓN!** Para que el frontend funcione como se demostró, la Base de Datos **TIENE** que soportar guardar estructuras JSON completas en estas dos tablas. Si intentan normalizar estos campos en tablas relacionales rígidas, el sistema perderá la flexibilidad dinámica.

### A. Tabla `templates` (Certificados)
Debe tener una columna tipo **JSON** (o TEXT/LONGTEXT si es MySQL antiguo) para guardar el diseño visual.
*   **Columna sugerida:** `elements` (JSON) o `canvas_json` (JSON).
*   **Qué guarda:** Un array de objetos con coordenadas X, Y, fuente, tamaño, color.
    *   *Si no guardan esto tal cual, el editor visual no podrá volver a cargar el diseño después de guardarlo.*

### B. Tabla `course_types` (Configuración)
Debe tener columnas **JSON** para la configuración de campos y documentos.
*   **Columna 1:** `registration_fields` (JSON). Guarda qué campos ("Curp", "Licencia") se muestran en el formulario.
*   **Columna 2:** `available_documents` (JSON). Guarda qué diplomas se pueden entregar y su costo.

---

## 5. Resumen de Endpoints (API Contract)

| Acción | Método | Ruta | Nota |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | **Debe devolver objeto `person` completo.** |
| **Lista Cursos** | `GET` | `/api/courses` | Catálogo general. |
| **Público** | `GET` | `/api/courses/public` | Lista reducida para la web pública (sin token). |
| **Inscripción** | `POST` | `/api/public/register` | **Nuevo:** Registro externo. |
| **Grupos** | `GET` | `/api/groups?q=...` | Gestión de grupos (Soporte búsqueda). |
| **Personas** | `GET` | `/api/groups/{id}/persons?q=...` | Lista de inscritos (Soporte búsqueda). |
| **Aprobar** | `PUT` | `/api/persons/{id}/status` | Cambio de estatus. |
| **Validar Pago**| `GET` | `/api/payments/check` | Conexión a SIOX. |
| **Certificados**| `POST` | `/api/certificates/generate` | Generador de PDF. |

---

## 6. Ejemplos de JSON (Payloads Reales)

Para facilitar el desarrollo, aquí están los ejemplos exactos de lo que el Frontend envía y espera recibir.

### A. Tipos de Curso (`POST /api/course-types`)
Aquí configuramos qué campos preguntar en el formulario.

```json
{
  "name": "Curso de Manejo Tipo A",
  "description": "Curso para transporte público",
  "paymentType": "De Paga",
  "status": "Activo",
  "registrationFields": [
    {
      "fieldName": "license",
      "label": "Número de Licencia",
      "visible": true,
      "required": true
    },
    {
      "fieldName": "curp",
      "label": "CURP",
      "visible": true,
      "required": true
    },
    {
      "fieldName": "schoolKey",
      "label": "CCT Escuela",
      "visible": false,
      "required": false
    }
  ],
  "availableDocuments": [
    {
      "id": "doc_constancia",
      "name": "Constancia de Aprobación",
      "templateId": 10,
      "isMandatory": true,
      "cost": 0
    },
    {
      "id": "doc_tarjeton",
      "name": "Tarjetón Tipo A",
      "templateId": 12,
      "isMandatory": false,
      "cost": 300
    }
  ]
}
```

### B. Template / Diploma (`POST /api/templates`)
Este JSON define el diseño gráfico. El Backend debe guardarlo TEXTUALMENTE (string o blob JSON) para poder regenerarlo luego.

```json
{
  "name": "Diploma Estándar 2026",
  "claveConcepto": "4001",
  "pageConfig": {
    "width": 297,
    "height": 210,
    "orientation": "landscape",
    "margins": { "top": 10, "right": 10, "bottom": 10, "left": 10 }
  },
  "elements": [
    {
      "id": "el_1",
      "type": "text",
      "name": "Nombre Participante",
      "transform": { "x": 50, "y": 100, "width": 200, "height": 20 },
      "textConfig": {
        "content": "{{name}} {{firstSurname}}",
        "isDynamic": true,
        "fontSize": 24,
        "fontFamily": "Roboto",
        "textAlign": "center"
      }
    },
    {
      "id": "el_2",
      "type": "qr",
      "name": "QR Validación",
      "transform": { "x": 10, "y": 10, "width": 30, "height": 30 },
      "qrConfig": {
        "content": "https://valida.semovi.oaxaca.gob.mx/{{curp}}",
        "isDynamic": true
      }
    }
  ]
}
```

### C. Persona (`POST /api/public/register`)
Datos que envía el formulario de registro.

```json
{
  "groupId": 55,
  "person": {
    "name": "María",
    "firstSurname": "López",
    "secondSurname": "Sánchez",
    "curp": "LOSM900101HDFR05",
    "license": "A00123456",
    "email": "maria@example.com",
    "phone": "5512345678",
    "sex": "Mujer",
    "address": "Calle Reforma 222, Centro"
  },
  "requestedDocuments": ["doc_tarjeton"]
}
```
