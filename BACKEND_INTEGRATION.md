## 0. Autenticación (Paso Obligatorio)

Todas las rutas de la API están protegidas. Antes de consumir cualquier endpoint es necesario autenticarse.

### Endpoint de Login
*   **URL:** `/auth/login`
*   **Método:** `POST`
*   **Body (JSON):**
    ```json
    {
      "email": "administrador@semovioaxaca.gob.mx",
      "password": "123456"
    }

## 1. Servicios a Integrar

Aquí les detallo los servicios de Angular que necesitan conectarse a la API:

### A. Tipos de Curso / Configuración
**Responsabilidad:** Manejar las reglas de la configuración de cursos (qué campos pedir y qué documentos entregar).

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getCourseTypes()` | `/api/course-types` | `GET` | Obtener lista de todos los tipos de curso configurados. |
| `getCourseTypeById(id)` | `/api/course-types/{id}` | `GET` | Obtener detalle de una configuración específica. |
| `createCourseType(data)` | `/api/course-types` | `POST` | Crear nueva configuración de tipo de curso. |
| `updateCourseType(id, data)` | `/api/course-types/{id}` | `PUT` | Actualizar configuración existente. |
| `deleteCourseType(id)` | `/api/course-types/{id}` | `DELETE` | Eliminar (o desactivar) un tipo de curso. |

**Dato Importante (JSON de Configuración):**
Necesitamos que el backend guarde y devuelva el objeto `registrationFields` para saber qué pintar en el formulario. Sería algo así:
```json
{
  "id": 1,
  "name": "Licencia Tipo A",
  "registrationFields": [
    { "fieldName": "curp", "visible": true, "required": true },
    { "fieldName": "license", "visible": false, "required": false }
  ],
  "availableDocuments": [
    { "templateId": 2, "name": "Certificado Final", "cost": 100 }
  ]
}
```

---

### B. Catálogo de Cursos
**Responsabilidad:** El catálogo de cursos disponibles para programar (la "materia").

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getCourses()` | `/api/courses` | `GET` | Listar cursos del catálogo. |
| `createCourse(data)` | `/api/courses` | `POST` | Registrar nuevo curso en el catálogo. |
| `updateCourse(id, data)` | `/api/courses/{id}` | `PUT` | Modificar datos del curso. |
| `deleteCourse(id)` | `/api/courses/{id}` | `DELETE` | Eliminar curso del catálogo. |

**Nota:** El `course.courseTypeId` debe ser una llave foránea válida hacia la tabla de Tipos de Curso de arriba.

---

### C. Grupos / Instancias
**Responsabilidad:** Los grupos abiertos donde la gente se inscribe.

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getGroups()` | `/api/groups` | `GET` | Listar grupos activos o históricos. |
| `getGroupById(id)` | `/api/groups/{id}` | `GET` | Detalle del grupo y configuración. |
| `getDriversByGroupId(id)` | `/api/groups/{id}/drivers` | `GET` | Listar personas inscritas en el grupo. |
| `createGroup(data)` | `/api/groups` | `POST` | Abrir un nuevo grupo. |

**Ojo aquí:** Cuando pidamos un grupo por ID, es súper importante que venga el `courseTypeId` correcto para saber qué formulario mostrarle al usuario en la vista pública.

---

### D. Templates y Documentos
**Responsabilidad:** Gestionar los diseños de los diplomas.

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getTemplates()` | `/api/templates` | `GET` | Listado de formatos disponibles. |
| `generateCertificate(data)` | `/api/certificates/generate` | `POST` | Solicitar generación de PDF. **Debe retornar URL del PDF.** |

---

### E. Conceptos de Cobro (SIOX)
**Responsabilidad:** El catálogo de costos y claves.

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getConcepts()` | `/api/concepts` | `GET` | Listar catálogo de conceptos. |
| `createConcept(data)` | `/api/concepts` | `POST` | Crear nuevo concepto de cobro. |
| `updateConcept(id, data)` | `/api/concepts/{id}` | `PUT` | Actualizar costo o descripción. |
| `deleteConcept(id)` | `/api/concepts/{id}` | `DELETE` | Eliminar concepto. |

---

## 2. Actualizaciones Recientes

Les comparto unos ajustes que hicimos en la estructura de datos:

### Documentos Obligatorios
Agregamos `isMandatory` para documentos obligatorios y `cost` para los gratuitos.
```json
"availableDocuments": [
  { 
    "templateId": 2, 
    "name": "Certificado Final", 
    "cost": 100,
    "isMandatory": true, // Si es true, el usuario no puede desmarcarlo
    "requiresApproval": true 
  }
]
```

### Unificación de Solicitudes
Las solicitudes ahora son simplemente un **Driver (Participante)** con status `Pendiente`.
*   Flujo: `Pendiente` -> `Aprobado` | `Rechazado`.
*   El backend debe permitir crear un Driver directamente con status `Pendiente`.

---

## 3. Puntos Generales

Para facilitar la integración:

1.  **Fechas:** Idealmente en formato ISO (`2026-10-15T09:00:00Z`).
2.  **Paginación:** Si pueden, soporte para `?page=1&limit=10`.
3.  **Seguridad:** Todo con JWT (Bearer token).
4.  **CORS:** Habilitar el dominio de Angular.
5.  **Nombres de Variables (Case):**
    *   **Legacy (Auth):** Mantenemos `snake_case` (`first_name`) como lo tienen actualmente.
    *   **Nuevos Módulos:** Para todo lo nuevo (Cursos, Templates), usar **`camelCase`** (`firstName`, `createdAt`, `conceptId`) para alinearnos con el estándar de frontend.
    *   **Roles:** Usar minúsculas (`admin`, `instructor`).

---

### Estado Actual de Autenticación (Reporte Técnico)

Actualmente, el Frontend implementa un **"Adaptador de Autenticación"** temporal.

**Situación Actual:**
*   El endpoint `/auth/login` devuelve Token, ID y Rol.
*   **Dato Clave:** La información del perfil (`person`) proviene de un **Servidor Externo** y actualmente no se está reenviando al login de Capacitaciones.

**Estrategia de Código (Frontend):**
Se ha implementado un bloque de código temporal identificado claramente (`// --- DATOS TEMPORALES ---`) en `AuthService`.
Este bloque rellena los datos faltantes manualmente.

**Acción Futura (Manual):**
Cuando el Backend integre el servicio externo y envíe el objeto `person`:
1.  El desarrollador frontend eliminará el bloque temporal.
2.  El código pasará a mapear directamente los datos reales recibidos.

**Acción Requerida para Backend:**
Cuando se integre el servicio externo, el objeto `person` debe cumplir con la estructura estándar de nuestra interfaz `Person` (camelCase: `first_name`, `last_name`, etc.) para que el mapeo sea automático conforma a nuestros modelos (`User`).

**Nota:**
Usamos `BackendLoginResponse` como un "puente" porque el login nos entrega `usuario_id` y `rol` (nombres de base de datos legacy), pero nuestra aplicación Angular trabaja internamente con modelos limpios (`id`, `role`, `Person`).

**Sobre otros endpoints:**
Los demás servicios (Cursos, Grupos) funcionan con la base de datos local y su estructura es estándar.
---

