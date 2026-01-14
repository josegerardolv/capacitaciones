# Especificaciones de Integración Backend - Módulo de Capacitaciones

Este documento detalla los endpoints y estructuras de datos requeridos para integrar el Frontend (Angular) con el Backend. Actualmente, el frontend utiliza datos simulados (Mock Data) en los servicios que deben ser reemplazados por llamadas HTTP reales.

## 1. Servicios a Integrar

Los siguientes servicios de Angular contienen la lógica de datos y deben ser conectados a la API:

### A. CourseTypeService (Tipos de Curso)
*   **Archivo:** `src/app/core/services/course-type.service.ts`
*   **Responsabilidad:** Gestionar las configuraciones de los tipos de cursos (reglas de negocio, campos visibles, documentos asociados).

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getCourseTypes()` | `/api/course-types` | `GET` | Obtener lista de todos los tipos de curso configurados. |
| `getCourseTypeById(id)` | `/api/course-types/{id}` | `GET` | Obtener detalle de una configuración específica. |
| `createCourseType(data)` | `/api/course-types` | `POST` | Crear nueva configuración de tipo de curso. |
| `updateCourseType(id, data)` | `/api/course-types/{id}` | `PUT` | Actualizar configuración existente. |
| `deleteCourseType(id)` | `/api/course-types/{id}` | `DELETE` | Eliminar (o desactivar) un tipo de curso. |

**Estructura Crítica (JSON de CourseTypeConfig):**
El backend debe ser capaz de almacenar y devolver un objeto JSON para `registrationFields`, que define qué campos del formulario son visibles/requeridos.
```json
{
  "id": 1,
  "name": "Licencia Tipo A",
  "registrationFields": [
    { "fieldName": "curp", "visible": true, "required": true },
    { "fieldName": "license", "visible": false, "required": false }
    // ... otros campos
  ],
  "availableDocuments": [
    { "templateId": 2, "name": "Certificado Final", "cost": 100 }
  ]
}
```

---

### B. CoursesService (Catálogo de Cursos)
*   **Archivo:** `src/app/features/cursos/services/courses.service.ts`
*   **Responsabilidad:** Gestionar el catálogo de cursos disponibles para programar (la "clase" del curso, no la instancia/grupo).

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getCourses()` | `/api/courses` | `GET` | Listar cursos del catálogo. |
| `createCourse(data)` | `/api/courses` | `POST` | Registrar nuevo curso en el catálogo. |
| `updateCourse(id, data)` | `/api/courses/{id}` | `PUT` | Modificar datos del curso. |
| `deleteCourse(id)` | `/api/courses/{id}` | `DELETE` | Eliminar curso del catálogo. |

**Relación:** `course.courseTypeId` debe ser una llave foránea válida hacia `CourseTypes`.

---

### C. GroupsService (Grupos / Instancias)
*   **Archivo:** `src/app/features/cursos/services/groups.service.ts`
*   **Responsabilidad:** Gestionar los grupos abiertos donde se inscriben las personas.

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getGroups()` | `/api/groups` | `GET` | Listar grupos activos o históricos. |
| `getGroupById(id)` | `/api/groups/{id}` | `GET` | Detalle del grupo y configuración. |
| `getDriversByGroupId(id)` | `/api/groups/{id}/drivers` | `GET` | Listar personas inscritas en el grupo. |
| `createGroup(data)` | `/api/groups` | `POST` | Abrir un nuevo grupo. |

**Nota Importante:** El endpoint `getGroupById` debe retornar el `courseTypeId` correcto para que el frontend sepa qué formulario pintar (la vista pública consume esto).

---

### D. TemplateService (Formatos de Documentos)
*   **Archivo:** `src/app/features/templates/services/template.service.ts`
*   **Responsabilidad:** Gestionar los diseños de diplomas/certificados.

| Método Frontend | Endpoint Sugerido | Método HTTP | Descripción |
| :--- | :--- | :--- | :--- |
| `getTemplates()` | `/api/templates` | `GET` | Listado de formatos disponibles. |
| `generateCertificate(data)` | `/api/certificates/generate` | `POST` | Solicitar generación de PDF. **Debe retornar URL del PDF.** |

---

## 2. Consideraciones Generales

1.  **Manejo de Fechas:** El frontend espera fechas en formato ISO string (`2026-10-15T09:00:00Z`) o formato string local consistente. Ideal estandarizar a ISO 8601.
2.  **Paginación:** Actualmente las tablas del frontend soportan paginación en cliente. Para grandes volúmenes, se sugiere implementar paginación en servidor (parámetros `?page=1&limit=10`).
3.  **Cors:** Asegurar que el backend permita peticiones desde el dominio donde se despliegue Angular (o `localhost:4200` para desarrollo).

Cualquier duda sobre la estructura exacta de los objetos, favor de referirse a las interfaces en `src/app/core/models`.
