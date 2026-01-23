# 🗳️ Sistema de Capacitaciones - SEMOVI

Bienvenido al repositorio del frontend para la gestión de capacitaciones. Este proyecto maneja todo el flujo operativo de los cursos impartidos por la SEMOVI, desde la creación de la oferta académica hasta la emisión de constancias.

Tecnologías clave: **Angular 18+ (Standalone)** y **TailwindCSS**.

## � Rutas Principales

###  Panel Administrativo (Requiere Login)
El núcleo de la operación. Aquí gestionamos los cursos y grupos.

| Ruta | Descripción |
|------|-------------|
| `/cursos/lista` | Catálogo general de cursos disponibles. |
| `/cursos/grupos` | Gestión de fechas y apertura de grupos. |
| `/cursos/grupos/:id/personas` | **Control de Asistencia:** Aquí aprobamos exámenes y documentos. |

###  Acceso Público (Personas)
Rutas accesibles para usuarios externos (no requieren autenticación).

| Ruta | Descripción |
|------|-------------|
| `/registro-publico/:id` | **Formulario de Registro:** Donde los personas se inscriben usando un ID de grupo. |

---

##  Cómo correr el proyecto

Si eres nuevo en el equipo, solo necesitas Node.js y Angular CLI.

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Levantar el servidor de desarrollo:**
    ```bash
    npm start
    # O también: ng serve
    ```

3.  Visita `http://localhost:4200` y loguéate (Credenciales en 1Password o pregunta al Admin).

---

## 🏛️ Estructura del Código

Nos hemos movido a una arquitectura modular basada en **Features**:

*   **`src/app/features/cursos`**: Aquí vive toda la lógica del negocio.
    *   Usamos componentes *Smart* (Páginas) y *Dumb* (Componentes reutilizables como tablas y formularios).
*   **`src/app/shared`**: UI Kit Institucional.
    *   Si necesitas un botón color vino o una tabla con paginación, búscala aquí primero.
    *   *Nota:* El modal de registro (`driver-form`) se diseñó para ser híbrido (funciona tanto en el admin como en la vista pública).

---

##  Flujo de Trabajo (Cheat Sheet)

### Para aprobar a un conductor:
1.  Ve a "Grupos" -> Click en "Ver Personas".
2.  Busca al conductor en la lista.
3.  Usa el botón **Check Verde (✅)** para aprobar su examen.
4.  *Automáticamente* se desbloquearán los botones de **Constancia, Tarjetón y Orden de Pago**.

---

> **Nota:** Este proyecto utiliza componentes Standalone, por lo que no depende de AppModule tradicional. Las importaciones se gestionan directamente en cada componente.
