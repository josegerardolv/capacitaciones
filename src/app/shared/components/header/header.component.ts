import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UniversalIconComponent } from '../universal-icon/universal-icon.component';

/**
 * HeaderComponent - Barra superior del sistema
 * 
 * Proporciona:
 * - Toggle del sidebar responsive
 * - Información del sistema
 * - Panel de notificaciones con contador
 * - Menú de usuario con avatar
 * - Botón de acción rápida "Nuevo Ticket"
 * - Paleta institucional institucional
*/

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterModule, UniversalIconComponent],
    template: `
  <header class="bg-white shadow-md border-b border-gray-300 select-none">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center min-h-[85px]">
          
          <!-- Lado izquierdo: Toggle sidebar -->
          <div class="flex items-center space-x-4">
            <!-- Botones de control del sidebar -->
            <div class="flex items-center space-x-2">
              <!-- Botón principal de toggle - siempre visible -->
              <button
                (click)="onToggleSidebar(); $any($event.currentTarget)?.blur()"
                class="p-2 text-gray-500 hover:text-institucional-primario focus:outline-none focus:text-institucional-primario focus:bg-institucional-primario focus:bg-opacity-10 rounded-md transition-colors duration-200"
                [attr.aria-label]="getToggleAriaLabel()"
                [title]="getToggleTitle()">
                <app-universal-icon 
                  [name]="getToggleIcon()" 
                  [type]="'bootstrap'"
                  [size]="20" 
                  customClass="h-6 w-6" 
                  aria-hidden="true">
                </app-universal-icon>
              </button>
              
              <!-- Botón rápido de colapso (solo desktop cuando el sidebar está visible) -->
              <button
                *ngIf="!isMobile && sidebarOpen"
                (click)="onCollapseSidebar(); $any($event.currentTarget)?.blur()"
                class="p-2 text-gray-400 hover:text-institucional-primario focus:outline-none focus:text-institucional-primario focus:bg-institucional-primario focus:bg-opacity-10 rounded-md transition-colors duration-200"
                [attr.aria-label]="sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
                [title]="sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'">
                <app-universal-icon 
                  [name]="sidebarCollapsed ? 'expand' : 'collapse'" 
                  [type]="'bootstrap'"
                  [size]="18" 
                  customClass="h-5 w-5" 
                  aria-hidden="true">
                </app-universal-icon>
              </button>
            </div>
          </div>

          <!-- Lado derecho: Acciones + Usuario -->
          <div class="flex items-center space-x-4">
            

            <!-- Menú de usuario -->
            <div class="relative" #userMenuRef>
              <button
                #userToggleButton
                id="user-menu-button"
                (click)="toggleUserMenu()"
                (keydown.enter)="toggleUserMenu()"
                [attr.aria-expanded]="userMenuOpen"
                aria-haspopup="true"
                aria-controls="user-menu"
                aria-label="Abrir menú de usuario"
                title="Abrir menú de usuario"
                class="group user-menu-toggle flex items-center text-sm text-gray-700 hover:text-institucional-primario focus:outline-none focus:text-institucional-primario rounded-xl px-2 py-2 hover:bg-gradient-to-r hover:from-institucional-primario/5 hover:to-institucional-secundario/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-institucional-primario/50 hover:shadow-lg border border-gray-100 hover:border-institucional-primario/20 bg-gray-50/50 hover:bg-white transform hover:scale-[1.02] min-w-0 w-auto"
                [style.width]="getMinButtonWidth() + 'px'"
                [style.max-width]="'600px'">
                
                <!-- Avatar mejorado -->
                <div class="relative w-8 h-8 avatar-shimmer rounded-full flex items-center justify-center shadow-institucional-lg ring-2 ring-white group-hover:ring-institucional-primario/20 transition-all duration-300 flex-shrink-0">
                  <span class="text-xs font-bold text-white drop-shadow-sm">
                    {{ getUserInitials() }}
                  </span>
                  <!-- Indicador de status online -->
                  <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-stats4 rounded-full border-2 border-white shadow-sm status-pulse"></div>
                </div>
                
                <!-- Información del usuario mejorada -->
                <div class="hidden md:flex flex-col text-left min-w-0 flex-1 mx-2 overflow-hidden">
                  <div class="font-semibold text-gray-900 group-hover:text-institucional-primario transition-colors duration-200 text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ getFullUserName() }}
                  </div>
                  <div class="mt-0.5">
                    <span
                      class="role-badge inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold text-institucional-primario bg-institucional-primario/10 border border-institucional-primario/20 whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                      [attr.aria-label]="'Rol: ' + getRoleDisplayName()"
                      [title]="getRoleDisplayName()">
                      <app-universal-icon
                        name="shield-check"
                        [type]="'bootstrap'"
                        [size]="12"
                        customClass="h-3 w-3 text-institucional-primario flex-shrink-0"
                        aria-hidden="true">
                      </app-universal-icon>
                      <span class="truncate">{{ getRoleDisplayName() }}</span>
                    </span>
                  </div>
                </div>
                
                <!-- Ícono dropdown mejorado -->
                <div class="flex-shrink-0 ml-1">
                  <app-universal-icon 
                    name="chevron-down" 
                    [type]="'bootstrap'"
                    [size]="14" 
                    [customClass]="'h-3.5 w-3.5 transition-all duration-300 text-institucional-primario group-hover:text-institucional-secundario ' + (userMenuOpen ? 'rotate-180 scale-110' : '')" 
                    aria-hidden="true">
                  </app-universal-icon>
                </div>
              </button>
              
              <!-- Dropdown del menú de usuario mejorado -->
              <div
                *ngIf="userMenuOpen"
                #userMenu
                id="user-menu"
                role="menu"
                aria-label="Menú de usuario"
                aria-labelledby="user-menu-button"
                tabindex="-1"
                (keydown)="onMenuKeydown($event)"
                class="absolute right-0 mt-2 glass-effect rounded-xl border border-gray-200 shadow-xl ring-1 ring-gray-100 z-50 overflow-hidden transform origin-top-right focus:outline-none dropdown-appear bg-white"
                [style.width]="getDropdownWidth() + 'px'"
                [style.min-width]="'280px'"
                [style.max-width]="'400px'">
                
                <!-- Header del usuario con gradiente -->
                <div class="bg-gradient-institucional-header p-4 text-white">
                  <div class="flex items-center space-x-3">
                    <!-- Avatar compacto -->
                    <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ring-2 ring-white/30 flex-shrink-0">
                      <span class="text-sm font-bold text-white drop-shadow-sm">
                        {{ getUserInitials() }}
                      </span>
                    </div>
                    
                    <!-- Información compacta -->
                    <div class="flex-1 min-w-0 overflow-hidden">
                      <h3 class="font-semibold text-sm text-white drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {{ getFullUserName() }}
                      </h3>
                      <p class="text-xs text-white/90 drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {{ currentUser?.email }}
                      </p>
                      <div class="mt-1">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                          <app-universal-icon 
                            name="shield-check" 
                            [type]="'bootstrap'"
                            [size]="10" 
                            customClass="mr-1 h-2.5 w-2.5 flex-shrink-0" 
                            aria-hidden="true">
                          </app-universal-icon>
                          <span class="overflow-hidden text-ellipsis">{{ getRoleDisplayName() }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


                <!-- Menú de opciones compacto -->
                <div class="">
                  <!-- Mis Tickets -->
                  <a
                    routerLink="/tickets"
                    (click)="closeUserMenu()"
                    role="menuitem"
                    tabindex="0"
                    class="menu-item group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-institucional-primario/8 hover:to-institucional-secundario/8 hover:text-institucional-primario transition-all duration-200 focus:bg-institucional-primario/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-institucional-primario/50">
                    <div class="p-1.5 bg-institucional-primario/10 rounded-lg mr-3 group-hover:bg-institucional-primario/20 transition-colors duration-200 flex-shrink-0">
                      <app-universal-icon 
                        name="list-task" 
                        [type]="'bootstrap'"
                        [size]="14" 
                        customClass="h-3.5 w-3.5 text-institucional-primario icon-hover" 
                        aria-hidden="true">
                      </app-universal-icon>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-sm">Mis Tickets</div>
                      <div class="text-xs text-gray-500 group-hover:text-institucional-secundario truncate">Gestionar solicitudes</div>
                    </div>
                  </a>

                  <!-- Mi Perfil -->
                  <a
                    routerLink="/profile"
                    (click)="closeUserMenu()"
                    role="menuitem"
                    tabindex="0"
                    class="menu-item group flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-institucional-primario/8 hover:to-institucional-secundario/8 hover:text-institucional-primario transition-all duration-200 focus:bg-institucional-primario/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-institucional-primario/50">
                    <div class="p-1.5 bg-institucional-secundario/10 rounded-lg mr-3 group-hover:bg-institucional-secundario/20 transition-colors duration-200 flex-shrink-0">
                      <app-universal-icon 
                        name="person-circle" 
                        [type]="'bootstrap'"
                        [size]="14" 
                        customClass="h-3.5 w-3.5 text-institucional-secundario icon-hover" 
                        aria-hidden="true">
                      </app-universal-icon>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="font-medium text-sm">Mi Perfil</div>
                      <div class="text-xs text-gray-500 group-hover:text-institucional-secundario truncate">Configurar cuenta</div>
                    </div>
                  </a>

                  <!-- Separador elegante -->
                  <div class="my-1 mx-4">
                    <div class="gradient-divider"></div>
                  </div>

                  <!-- Cerrar Sesión -->
                  <button
                    (click)="logout()"
                    role="menuitem"
                    tabindex="0"
                    class="menu-item group flex items-center w-full px-4 py-2.5 text-sm text-stats5 hover:bg-gradient-to-r hover:from-stats5/8 hover:to-red-500/8 hover:text-red-600 transition-all duration-200 focus:bg-stats5/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-stats5/50">
                    <div class="p-1.5 bg-stats5/10 rounded-lg mr-3 group-hover:bg-red-500/20 transition-colors duration-200 flex-shrink-0">
                      <app-universal-icon 
                        name="box-arrow-right" 
                        [type]="'bootstrap'"
                        [size]="14" 
                        customClass="h-3.5 w-3.5 text-stats5 group-hover:text-red-600 icon-hover" 
                        aria-hidden="true">
                      </app-universal-icon>
                    </div>
                    <div class="min-w-0 flex-1 text-left">
                      <div class="font-medium text-sm">Cerrar Sesión</div>
                      <div class="text-xs text-gray-500 group-hover:text-red-500 truncate">Finalizar sesión</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
    styles: [
        `
    /* Animaciones del dropdown mejoradas */
    .dropdown-appear {
      animation: dropdownIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      transform-origin: top right;
    }

    @keyframes dropdownIn {
      from { 
        opacity: 0; 
        transform: translateY(-8px) scale(0.95); 
        filter: blur(4px);
      }
      to   { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
        filter: blur(0px);
      }
    }

    /* Efectos hover mejorados para menu items */
    .menu-item {
      position: relative;
      overflow: hidden;
    }

    .menu-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(98, 17, 50, 0.05),
        transparent
      );
      transition: left 0.5s;
    }

    .menu-item:hover::before {
      left: 100%;
    }

    .menu-item:focus {
      outline: none;
      background: linear-gradient(
        135deg, 
        rgba(98, 17, 50, 0.06) 0%, 
        rgba(157, 36, 73, 0.06) 100%
      );
    }

    /* Efecto shimmer para el avatar */
    .avatar-shimmer {
      background: linear-gradient(
        45deg,
        var(--institucional-primario),
        var(--institucional-secundario),
        var(--institucional-vino),
        var(--institucional-primario)
      );
      background-size: 400% 400%;
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    /* Efectos de glassmorphism */
    .glass-effect {
      backdrop-filter: blur(12px) saturate(150%);
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Indicador de status pulsante */
    .status-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Transiciones suaves para el botón principal */
    .user-menu-toggle {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .user-menu-toggle:hover {
      backdrop-filter: blur(8px);
    }

    /* Efecto de separador con gradiente */
    .gradient-divider {
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        rgba(98, 17, 50, 0.2),
        rgba(157, 36, 73, 0.2),
        rgba(98, 17, 50, 0.2),
        transparent
      );
    }

    /* Mejora de accesibilidad con focus visible */
    .menu-item:focus-visible {
      outline: 2px solid var(--institucional-primario);
      outline-offset: -2px;
      border-radius: 8px;
    }

    /* Efecto hover para iconos */
    .icon-hover {
      transition: all 0.2s ease-in-out;
    }

    .icon-hover:hover {
      transform: scale(1.1) rotate(5deg);
    }
    
    /* Badge del rol mejorado */
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      background: linear-gradient(90deg, rgba(98,17,50,0.06), rgba(157,36,73,0.04));
      border-radius: 9999px;
      border: 1px solid rgba(98,17,50,0.12);
      color: var(--institucional-primario);
      white-space: nowrap;
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.18s ease-in-out;
      box-shadow: 0 1px 2px rgba(98,17,50,0.04);
    }

    .role-badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(98,17,50,0.08);
      background: linear-gradient(90deg, rgba(98,17,50,0.08), rgba(157,36,73,0.06));
    }

    .role-badge .truncate {
      display: inline-block;
      max-width: calc(12rem - 1.4rem);
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    `
    ]
})
export class HeaderComponent {
  @Input() sidebarOpen = false;
  @Input() sidebarCollapsed = false;
  @Input() isMobile = false;
  @Input() notificationCount = 0;
  @Input() currentUser: any = null;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() collapseSidebar = new EventEmitter<void>();
  @Output() toggleNotifications = new EventEmitter<void>();

  userMenuOpen = false;


  @ViewChild('userMenuRef', { static: false }) userMenuRef!: ElementRef;
  @ViewChild('userMenu', { static: false }) userMenuElement!: ElementRef;
  @ViewChild('userToggleButton', { static: false }) userToggleButton!: ElementRef;

  constructor(private authService: AuthService) {}

  /**
   * Emite evento para toggle del sidebar
   */
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Emite evento para colapsar el sidebar
   */
  onCollapseSidebar(): void {
    this.collapseSidebar.emit();
  }

  /**
   * Obtiene el icono apropiado para el botón toggle
   */
  getToggleIcon(): string {
    if (this.isMobile) {
      return this.sidebarOpen ? 'x-lg' : 'list';
    } else {

  // En desktop el botón principal muestra/oculta el sidebar
    return this.sidebarOpen ? 'layout-sidebar-inset' : 'layout-sidebar';
    }
  }

  /**
   * Obtiene el aria-label apropiado para el botón toggle
   */
  getToggleAriaLabel(): string {
    if (this.isMobile) {
      return this.sidebarOpen ? 'Cerrar menú' : 'Abrir menú';
    } else {
  // En desktop: botón principal show/hide
  return this.sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar';
    }
  }

  /**
   * Obtiene el title apropiado para el botón toggle
   */
  getToggleTitle(): string {
    return this.getToggleAriaLabel();
  }

  /**
   * Emite evento para toggle de notificaciones
   */
  onToggleNotifications(): void {
    this.toggleNotifications.emit();
  }

  /**
   * Calcula el ancho mínimo del botón basado en el contenido del usuario
   */
  getMinButtonWidth(): number {
    if (!this.currentUser) {
      return 180; // Ancho mínimo por defecto
    }

    const userName = this.getFullUserName();
    const userEmail = this.currentUser?.email || '';
    const roleName = this.getRoleDisplayName();

    // Estimación más precisa de ancho basada en la longitud de caracteres
    // Considerando la tipografía del sistema (text-sm = 14px, text-xs = 12px)
    const nameWidth = userName.length * 8.5; // font-semibold text-sm
    const emailWidth = userEmail.length * 6.5; // no se muestra en el botón, pero influye
    const roleWidth = roleName.length * 6; // text-xs en badge

    // Tomar el mayor de los textos mostrados (nombre y rol)
    const contentWidth = Math.max(emailWidth, nameWidth);
    const fixedElementsWidth = 90; // Avatar (32px) + icono (14px) + padding (16px) + espacios y margins (28px)
    
    // Permitir mayor ancho para nombres largos
    return Math.min(Math.max(contentWidth + fixedElementsWidth, 180), 600);
  }

  /**
   * Calcula el ancho del dropdown basado en el contenido del usuario
   */
  getDropdownWidth(): number {
    if (!this.currentUser) {
      return 280; // Ancho mínimo por defecto
    }

    const userName = this.getFullUserName();
    const userEmail = this.currentUser?.email || '';
    const roleName = this.getRoleDisplayName();

    // Estimación para el dropdown con tipografías específicas
    const nameWidth = userName.length * 8; // font-semibold text-sm en header
    const emailWidth = userEmail.length * 7; // text-xs en header  
    const roleWidth = roleName.length * 6.5; // text-xs en badge

    // Considerar también el ancho de los elementos del menú (text-sm)
    const menuItemsWidth = Math.max(
      'Mis Tickets'.length * 7.5,
      'Mi Perfil'.length * 7.5,
      'Cerrar Sesión'.length * 7.5,
      'Gestionar solicitudes'.length * 6.5, // text-xs subtitle
      'Configurar cuenta'.length * 6.5,
      'Finalizar sesión'.length * 6.5
    );

    // Tomar el mayor de todos los textos
    const contentWidth = Math.max(nameWidth, emailWidth, roleWidth, menuItemsWidth);
    const fixedElementsWidth = 130; // Avatar (40px) + iconos containers (48px) + padding total (32px) + margins (10px)
    
    // Asegurar que dropdown sea al menos tan ancho como el botón calculado
    const buttonWidth = this.getMinButtonWidth();
    const computed = Math.min(Math.max(contentWidth + fixedElementsWidth, 280), 800);
    return Math.max(computed, buttonWidth);
  }

  /**
   * Toggle del menú de usuario
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;

    // Si se abre, mover foco al contenedor del menú para accesibilidad
    if (this.userMenuOpen) {
      // pequeño delay para esperar a que el DOM renderice el menú
      setTimeout(() => {
        try {
          // mover foco al primer elemento focusable dentro del menú
          const menuEl = this.userMenuElement?.nativeElement as HTMLElement;
          if (menuEl) {
            const firstFocusable = menuEl.querySelectorAll<HTMLElement>('[tabindex="0"], a, button')[0];
            if (firstFocusable) {
              firstFocusable.focus();
            } else {
              menuEl.focus();
            }
          }
        } catch (e) {
          // noop
        }
      }, 0);
    } else {
      // Si se cierra, regresar foco al botón toggle
      try {
        this.userToggleButton?.nativeElement?.focus();
      } catch (e) {
        // noop
      }
    }
  }

  /**
   * Maneja teclado dentro del menú: Escape, ArrowUp y ArrowDown para navegar
   */
  onMenuKeydown(event: KeyboardEvent): void {
    const menuEl = this.userMenuElement?.nativeElement as HTMLElement;
    if (!menuEl) return;

    const focusable = Array.from(menuEl.querySelectorAll<HTMLElement>('[tabindex="0"], a, button'))
      .filter(el => !el.hasAttribute('disabled'));
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'Escape':
        this.closeUserMenu();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (focusable.length === 0) return;
        const nextIndex = (currentIndex + 1) % focusable.length;
        focusable[nextIndex].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (focusable.length === 0) return;
        const prevIndex = (currentIndex - 1 + focusable.length) % focusable.length;
        focusable[prevIndex].focus();
        break;
      default:
        break;
    }
  }

  /**
   * Cierra el menú de usuario
   */
  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  /**
   * Obtiene las iniciales del usuario para el avatar
   * Toma la primera letra del nombre y la primera letra del apellido
   */
  getUserInitials(): string {
    if (!this.currentUser) {
      return 'U';
    }

    let person = this.currentUser.person;
    if (!person) {
      return 'U';
    }
    
    // Usar first_name y last_name si están disponibles, o nombre como fallback
    const firstName = person.first_name || '';
    const lastName = person.last_name || '';

    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    
    // Fallback al campo nombre si existe
    if (this.currentUser.full_name) {
      const nameParts = this.currentUser.full_name.trim().split(' ').filter((part: string) => part.length > 0);
      if (nameParts.length === 0) {
        return '';
      }
      
      if (nameParts.length === 1) {
        const name = nameParts[0];
        return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name[0].toUpperCase();
      }
      
      const firstNamePart = nameParts[0];
      const lastNamePart = nameParts[1];
      return (firstNamePart[0] + lastNamePart[0]).toUpperCase();
    }
    
    return 'U';
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullUserName(): string {
    if (!this.currentUser) {
      return 'Usuario';
    }

    let person = this.currentUser.person; 
    
    if (!person) {
      return 'Usuario';
    }

    // Usar first_name y last_name si están disponibles
    if (person.first_name && person.last_name) {
      let fullName = `${person.first_name} ${person.last_name}`;
      if (person.second_last_name) {
        fullName += ` ${person.second_last_name}`;
      }
      return fullName;
    }
    
    // Fallback al campo nombre
    return person.full_name || 'Usuario';
  }

  /**
   * Obtiene el nombre display del rol
   */
  getRoleDisplayName(): string {
    //console.log(this.currentUser);
    
    const roleMap: { [key: string]: string } = {
      'CALLCENTER_TI': 'Call Center TI'
    };
    const role = this.currentUser?.role;
    if (!role || role.trim() === '') {
      return 'Usuario';
    }
    return roleMap[role] || role.toUpperCase();
  }

  /**
   * Verifica si el usuario puede acceder a configuración
   */
  canAccessSettings(): boolean {
    const allowedRoles = ['SUPERUSUARIO', 'ADMINISTRADOR'];
    return allowedRoles.includes(this.currentUser?.role);
  }

  /**
   * Cierra sesión del usuario
   */
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout exitoso');
      this.closeUserMenu();
      // Redirigir al login después del logout exitoso
      window.location.href = '/login';
    } catch (error) {
      console.error('Error durante logout:', error);
      this.closeUserMenu();
      // Incluso si hay error, redirigir al login ya que los tokens se limpian localmente
      window.location.href = '/login';
    }
  }

  /**
   * Cierra el menú de usuario cuando se hace clic fuera de él
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userMenuOpen) return;

    try {
      const clickedInside = this.userMenuRef && this.userMenuRef.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.userMenuOpen = false;
      }
    } catch (err) {
      // En caso de error (por ejemplo en SSR o referencias no resueltas), simplemente cerrar
      this.userMenuOpen = false;
    }
  }

  /**
   * Cierra el menú si se presiona Escape en cualquier parte del documento
   */
  @HostListener('document:keydown.escape', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (this.userMenuOpen) {
      this.closeUserMenu();
    }
  }

}
