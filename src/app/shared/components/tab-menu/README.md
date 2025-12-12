# TabMenuComponent

Componente reutilizable para crear menús de pestañas con estilos institucionales MORENA.

## Características

- ✅ Estilos institucionales MORENA
- ✅ Responsive con scroll horizontal en móviles
- ✅ Accesibilidad completa (ARIA)
- ✅ Soporte para pestañas deshabilitadas
- ✅ Proyección de contenido con `ng-content`
- ✅ Eventos de cambio de pestaña

## Uso Básico

```typescript
import { TabMenuComponent, TabItem } from '../../shared/components/tab-menu/tab-menu.component';

@Component({
  imports: [TabMenuComponent],
  template: `
    <app-tab-menu 
      [tabs]="tabs"
      [activeTabId]="activeTab"
      (tabChange)="onTabChange($event)">
      
      <!-- Contenido de la pestaña 1 -->
      <div *ngIf="activeTab === 'tab1'">
        <h3>Contenido de la primera pestaña</h3>
      </div>
      
      <!-- Contenido de la pestaña 2 -->
      <div *ngIf="activeTab === 'tab2'">
        <h3>Contenido de la segunda pestaña</h3>
      </div>
    </app-tab-menu>
      
      <!-- Contenido de la pestaña 2 -->
      <div *ngIf="activeTab === 'tab2'">
        <h3>Contenido de la segunda pestaña</h3>
      </div>
    </app-tab-menu>
  `
})
export class MiComponente {
  activeTab = 'tab1';
  
  tabs: TabItem[] = [
    { id: 'tab1', label: 'Primera Pestaña' },
    { id: 'tab2', label: 'Segunda Pestaña' },
    { id: 'tab3', label: 'Pestaña Deshabilitada', disabled: true }
  ];
  
  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }
}
```

## Props

### Inputs

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `tabs` | `TabItem[]` | ✅ | Array de pestañas a mostrar |
| `activeTabId` | `string` | ✅ | ID de la pestaña activa |

### Outputs

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `tabChange` | `string` | Emite el ID de la pestaña cuando cambia |

## Interfaces

```typescript
export interface TabItem {
  id: string;           // Identificador único
  label: string;        // Texto a mostrar
  disabled?: boolean;   // Si está deshabilitada (opcional)
}
```

## Contenido

El contenido de cada pestaña se controla usando `*ngIf` con el `activeTab`:

```html
<app-tab-menu [tabs]="tabs" [activeTabId]="activeTab" (tabChange)="onTabChange($event)">
  <div *ngIf="activeTab === 'info'">Contenido de información</div>
  <div *ngIf="activeTab === 'config'">Contenido de configuración</div>
</app-tab-menu>
```

## Accesibilidad

- ✅ Roles ARIA correctos (`tablist`, `tab`, `tabpanel`)
- ✅ Atributos `aria-selected`, `aria-controls`, `aria-labelledby`
- ✅ IDs únicos para cada pestaña y panel
- ✅ Soporte para navegación por teclado

## Estilos

El componente utiliza las clases de utilidad de Tailwind CSS y los colores institucionales MORENA:

- Pestaña activa: fondo blanco, texto morena-guinda, borde inferior
- Pestaña inactiva: texto blanco semi-transparente con hover
- Contenedor: fondo morena-vino con bordes redondeados

## Ejemplo Completo

```typescript
// mi-formulario.component.ts
import { Component } from '@angular/core';
import { TabMenuComponent, TabItem } from '../shared/components/tab-menu/tab-menu.component';

@Component({
  selector: 'app-mi-formulario',
  standalone: true,
  imports: [TabMenuComponent],
  template: `
    <app-tab-menu 
      [tabs]="formTabs"
      [activeTabId]="currentTab"
      (tabChange)="changeTab($event)">
      
      <div *ngIf="currentTab === 'general'" class="space-y-4">
        <h3 class="text-xl font-bold">Información General</h3>
        <!-- Formulario general -->
      </div>
      
      <div *ngIf="currentTab === 'config'" class="space-y-4">
        <h3 class="text-xl font-bold">Configuración</h3>
        <!-- Configuraciones -->
      </div>
      
      <div *ngIf="currentTab === 'advanced'" class="space-y-4">
        <h3 class="text-xl font-bold">Opciones Avanzadas</h3>
        <!-- Opciones avanzadas -->
      </div>
    </app-tab-menu>
  `
})
export class MiFormularioComponent {
  currentTab = 'general';
  
  formTabs: TabItem[] = [
    { id: 'general', label: 'General' },
    { id: 'config', label: 'Configuración' },
    { id: 'advanced', label: 'Avanzado', disabled: !this.hasAdvancedPermissions() }
  ];
  
  changeTab(tabId: string): void {
    this.currentTab = tabId;
  }
  
  private hasAdvancedPermissions(): boolean {
    // Lógica para verificar permisos
    return true;
  }
}
```
