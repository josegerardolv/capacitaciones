# Documentación Técnica del Sistema de Capacitaciones

Este documento describe el estado actual de la plataforma y define los requerimientos técnicos necesarios para la integración con el Backend.

## 1. Autenticación y Perfil de Usuario
Actualmente, el Frontend utiliza un adaptador temporal para el login.
*   **Situación Actual:** El endpoint `/auth/login` nos devuelve el ID y Rol, pero no la información personal completa.
*   **Solución Temporal:** Estamos utilizando un mapeo en `auth.service.ts` para simular el objeto `User` completo.
*   **Estado:** Funcional (Permite continuar desarrollo).
*   **Requerimiento:** Eventualmente, el login debe devolver el objeto `person` completo en formato estándar.

## 2. Módulos de Inscripción

### A. Registro Público (Ciudadanía)
*   **Ruta:** `/public/register/:id`
*   **Estado:** Visualmente completo. Lógica de campos dinámicos integrada.
*   **Funcionamiento:**
    1.  El sistema consulta la configuración del grupo.
    2.  Renderiza el formulario dinámicamente según lo configurado en el Tipo de Curso (IDs 4-8 mapeados).
*   **Integración:** Pendiente conectar `finalizeRegistration()` con `POST /api/public/register`.

### B. Registro Administrativo (Interno)
*   **Ruta:** `/cursos/:id/grupos/:groupId/conductores`
*   **Estado:** Funcional (con datos simulados/reales híbridos).
*   **Integración:** Pendiente validar flujo completo de guardado en servidor.

## 3. Flujo de Estados y Validación
(Sin cambios mayores en lógica, pendiente backend de pagos)

## 4. Generación de Documentos
*   Lógica de "Documentos Obligatorios" vs "Opcionales" implementada en frontend.

## 5. Endpoints Pendientes / Estado

| Módulo | Endpoint Necesario | Estado Frontend | Observación |
| :--- | :--- | :--- | :--- |
| **Login** | `POST /auth/login` | **Simulado** | Funciona con lógica temporal. |
| **Config** | `POST /api/course-type` | **Completo** | IDs mapeados (4-8) y validado. |
| **Config** | `PATCH /api/course-type/{id}` | **Completo** | Corregido método (era PUT) y payload (`typeCourse`). |
| **Registro** | `POST /api/public/register` | Pendiente | Falta conectar. |
| **Personas** | `GET /api/groups/{id}/drivers` | Pendiente | Falta validar respuesta real. |

## 6. Lógica de Negocio y Estructura de Datos

Es fundamental mantener la flexibilidad que hemos programado en el Frontend.

### Herencia de Configuración
La configuración viaja en cadena:
`Concepto` -> `Template` ->`Tipo de Curso` -> `Curso` -> `Grupo` -> `Persona`.
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
