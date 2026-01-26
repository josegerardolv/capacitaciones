# Documentación Técnica del Sistema de Capacitaciones

Este documento describe el estado actual de la plataforma y define los requerimientos técnicos necesarios para la integración con el Backend.

## 1. Autenticación y Perfil de Usuario
Actualmente, el Frontend utiliza un adaptador temporal para el login.
*   **Situación Actual:** El endpoint `/auth/login` nos devuelve el ID y Rol, pero no la información personal completa.
*   **Solución Temporal:** Estamos utilizando un parche en el código para simular nombre y apellidos en la interfaz.
*   **Requerimiento:** Necesitamos que el login devuelva el objeto `person` completo (integrado con el servicio de RRHH/Identidad), utilizando el formato `camelCase` (`firstName`, `lastName`) para que coincida con nuestros modelos de Angular.

## 2. Módulos de Inscripción

### A. Registro Público (Ciudadanía)
*   **Ruta:** `/public/register/:id`
*   **Estado:** Visualmente completo.
*   **Funcionamiento:**
    1.  El sistema consulta la configuración del grupo.
    2.  Renderiza el formulario dinámicamente según el "Tipo de Curso" (ocultando licencia si es escolar, etc.).
    3.  Al enviar, actualmente solo mostramos los datos por consola.
*   **Integración:** Necesitamos conectar la función `finalizeRegistration()` con el endpoint `POST /api/public/register`.

### B. Registro Administrativo (Interno)
*   **Ruta:** `/cursos/:id/grupos/:groupId/conductores`
*   **Estado:** Funcional (con datos simulados).
*   **Funcionamiento:**
    1.  Permite buscar personas o registrar nuevas manualmente.
    2.  Reutiliza la misma lógica de campos dinámicos que la vista pública.
*   **Integración:** El backend debe recibir estos registros en `POST /api/groups/{id}/drivers` con estatus `Pendiente`.

## 3. Flujo de Estados y Validación

Hemos implementado una máquina de estados para controlar el ciclo de vida del conductor:

1.  **Inscripción:** El registro nace con estatus `Pendiente`.
2.  **Revisión:** El instructor revisa y aprueba (`Aprobado`). Esto se enviará vía `PUT /api/drivers/{id}`.
3.  **Pagos (SIOX):**
    *   Para descargar constancias, el sistema verifica que el `paymentStatus` sea `Pagado`.
    *   **Requerimiento:** Un endpoint `GET /api/payments/status` que consulte a Finanzas en tiempo real.

## 4. Generación de Documentos

La lógica de documentos es dinámica y se basa en la configuración del curso:
*   Si el documento es **Permanente** (`isMandatory: true`), es el diploma base.
*   El botón de descarga se activa solo si el conductor está Aprobado y ha pagado.
*   Al descargar, llamaremos a `POST /api/certificates/generate` para que el servidor genere el PDF oficial.

## 5. Endpoints Pendientes

Para liberar la versión productiva, necesitamos que el equipo de Backend habilite las siguientes rutas:

| Módulo | Endpoint Necesario | Prioridad |
| :--- | :--- | :--- |
| **Login** | `POST /auth/login` (con perfil completo) | Alta |
| **Config** | `POST /api/course-types` (JSON de configuración) | Alta |
| **Registro** | `POST /api/public/register` | Alta |
| **Personas** | `GET /api/groups/{id}/drivers` | Media |
| **Pagos** | `GET /api/payments/verification` | Media |
| **PDFs** | `POST /api/certificates/generate` | Media |

## 6. Lógica de Negocio y Estructura de Datos

Es fundamental mantener la flexibilidad que hemos programado en el Frontend.

### Herencia de Configuración
La configuración viaja en cadena:
`Tipo de Curso` -> `Curso` -> `Grupo`.
Esto significa que si cambiamos la configuración del Tipo de Curso (ej. ahora pedimos Licencia), los nuevos cursos heredarán esa regla automáticamente.

### Casos de Uso Verificados

Hemos validado 3 escenarios principales que el sistema soporta correctamente:

#### Caso 1: Licencia Transporte Público
*   **Campos:** Pedimos TODO (Licencia, NUC, CURP, Dirección...).
*   **Documentos:** Cobra la "Constancia Básica" ($473) obligatoriamente.
*   **Flujo:** Pago obligatorio inicial.

#### Caso 2: Capacitación Escolar
*   **Campos:** Solo pedimos Nombre, CURP, Teléfono y Correo.
*   **Opcional:** El campo "Sexo" es visible pero no obligatorio (para facilitar el registro rápido).
*   **Ocultos:** Licencia, NUC y Dirección.
*   **Documentos:** Diploma Gratuito por defecto. Opción de comprar Diploma de Honor.

#### Caso 3: Curso Simple
*   **Campos:** Datos de contacto básicos.
*   **Documentos:** 100% Gratuito.

**Nota para Backend:** Es vital que la base de datos permita guardar registros con campos nulos (ej. un niño sin licencia), ya que el Frontend no enviará esos datos en los casos 2 y 3.
