# 🗳️ Sistema de Capacitaciones - SEMOVI

Este proyecto es el frontend para la gestión de capacitaciones, cursos, grupos y conductores de la SEMOVI. Está construido con **Angular (Standalone Components)** y **TailwindCSS**.

## 📋 Descripción General

El sistema permite al personal administrativo gestionar el ciclo de vida de una capacitación:
1.  **Cursos:** Crear y administrar la oferta educativa.
2.  **Grupos:** Gestionar fechas y cupos.
3.  **Solicitudes:** Aceptar o rechazar conductores interesados.
4.  **Conductores:** Calificar exámenes y expedir documentación oficial.

## 🚀 Guía de Inicio Rápido

### Prerrequisitos
- Node.js (v18 o superior recomendado)
- Angular CLI

### Instalación
```bash
npm install
```

### Ejecución (Entorno Local)
```bash
npm start
# O comando estándar:
ng serve
```
La aplicación estará disponible en: `http://localhost:4200`

---

## 🏛️ Arquitectura del Proyecto

El proyecto sigue una arquitectura modular en `src/app/features`:

*   **🗂️ features/cursos:** Módulo principal.
    *   `pages/course-list`: Catálogo de cursos.
    *   `pages/group-list`: Gestión de grupos activos/inactivos.
    *   `pages/group-drivers`: **(Nuevo)** Lista detallada de conductores por grupo.
    *   `components/group-requests`: Modal para aceptar solicitudes.
*   **📊 features/dashboard:** Vista resumen principal.
*   **🧱 shared:** Componentes reutilizables.
    *   `institutional-table`: Tabla estándar con ordenamiento y paginación.
    *   `institutional-button`: Botones con los colores oficiales (Vino #8B1538, Café #6D282E).

---

## 🔄 Flujo de Negocio y Lógica Clave

### 1. Gestión de Estatus de Conductores
En la vista de **Lista de Conductores** (`GroupDriversComponent`), el flujo de un conductor es:

1.  **Pendiente:**
    *   El conductor ha sido aceptado en el grupo pero no ha hecho el examen.
    *   **Acción Admin:** Aparecen botones para **Aprobar (✅)** o **Reprobar (❌)** el examen.
    *   *Restricción:* No puede descargar Constancia ni Tarjetón.
2.  **Aprobado:**
    *   El conductor pasó el examen.
    *   **Acción Admin:** Se habilitan los botones para descargar:
        *   📄 **Constancia** (Verde)
        *   🪪 **Tarjetón** (Azul)
        *   🖨️ **Orden de Pago** (Amarillo)
3.  **No Aprobado:**
    *   El conductor reprobó.
    *   **Restricción:** Los botones de documentación se bloquean (se ven opacos).
    *   **Nota:** El botón de **Eliminar** siempre está activo para correcciones, independientemente del estatus.

### 2. Validaciones de UI
*   **Componentes Compartidos:** Se prioriza el uso de `app-institutional-table` para mantener consistencia visual.
*   **Acciones Condicionales:** Los botones de acción en las tablas usan directivas `[disabled]` basadas en la regla de negocio: *"Si no aprueba, no tiene privilegios de documentación"*.

---

## 🛠️ Comandos de Desarrollo

*   `ng generate component feature/nombre`: Crear nuevo componente.
*   `ng build`: Compilar para producción.

---

> **Nota:** Este proyecto utiliza componentes Standalone, por lo que no depende de `AppModule` tradicional. Las importaciones se gestionan directamente en cada componente.
