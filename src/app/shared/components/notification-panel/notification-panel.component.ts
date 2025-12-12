import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
}

/**
 * NotificationPanelComponent - Panel de notificaciones funcional
 * 
 * Características:
 * - Lista dinámica de notificaciones
 * - Animaciones de apertura/cierre
 * - Soporte para scroll en listas largas
 * - Botón para marcar todas como leídas
 * - Acciones directas desde las notificaciones
 * - Diseño profesional con paleta institucional
 */
@Component({
    selector: 'app-notification-panel',
    imports: [CommonModule, RouterModule],
    template: `
    <!-- Overlay para cerrar panel -->
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 transition-opacity duration-300"
      (click)="onClosePanel()">
    </div>

    <!-- Panel de notificaciones -->
    <div 
      class="fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen">
      
      <!-- Header del panel -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-700 text-white">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
          <h3 class="text-lg font-medium">Notificaciones</h3>
          <span 
            *ngIf="getUnreadCount() > 0"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {{ getUnreadCount() }}
          </span>
        </div>
        
        <button
          (click)="onClosePanel()"
          class="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200 transition-colors duration-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Acciones del panel -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            {{ notifications.length }} notificaciones
          </div>
          
          <button
            *ngIf="getUnreadCount() > 0"
            (click)="onMarkAllAsRead()"
            class="text-sm text-primary-700 hover:text-primary-800 font-medium focus:outline-none focus:underline transition-colors duration-200">
            Marcar todas como leídas
          </button>
        </div>
      </div>

      <!-- Lista de notificaciones -->
      <div class="flex-1 overflow-y-auto max-h-[calc(100vh-180px)]">
        <div *ngIf="notifications.length === 0" class="p-6 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5V17h-5l5-5v5zM3 12h8m-8 4h6m2-8V4a1 1 0 011-1h1m0 0V1a1 1 0 011-1h2a1 1 0 011 1v2m0 0h1a1 1 0 011 1v4H9V4a1 1 0 011-1z"/>
          </svg>
          <p class="mt-2 text-sm text-gray-500">No hay notificaciones</p>
        </div>

        <div *ngFor="let notification of notifications; trackBy: trackByNotificationId" 
             class="relative">
          
          <!-- Indicador de no leída -->
          <div 
            *ngIf="!notification.read"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full">
          </div>

          <div 
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            [class.bg-blue-50]="!notification.read"
            (click)="onNotificationClick(notification)">
            
            <div class="flex items-start space-x-3">
              <!-- Ícono según tipo -->
              <div class="flex-shrink-0">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  [ngClass]="{
                    'bg-blue-100 text-blue-600': notification.type === 'info',
                    'bg-green-100 text-green-600': notification.type === 'success',
                    'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                    'bg-red-100 text-red-600': notification.type === 'error'
                  }">
                  
                  <!-- Ícono Info -->
                  <svg *ngIf="notification.type === 'info'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  
                  <!-- Ícono Success -->
                  <svg *ngIf="notification.type === 'success'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  
                  <!-- Ícono Warning -->
                  <svg *ngIf="notification.type === 'warning'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  
                  <!-- Ícono Error -->
                  <svg *ngIf="notification.type === 'error'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>

              <!-- Contenido de la notificación -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                  {{ notification.message }}
                </p>
                
                <!-- Botón de acción si existe -->
                <button
                  *ngIf="notification.actionUrl && notification.actionText"
                  (click)="onActionClick(notification, $event)"
                  class="mt-2 text-xs text-primary-700 hover:text-primary-800 font-medium focus:outline-none focus:underline">
                  {{ notification.actionText }}
                </button>
                
                <p class="text-xs text-gray-400 mt-2">
                  {{ getRelativeTime(notification.createdAt) }}
                </p>
              </div>

              <!-- Botón marcar como leída -->
              <div class="flex-shrink-0">
                <button
                  *ngIf="!notification.read"
                  (click)="onMarkAsRead(notification.id, $event)"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                  title="Marcar como leída">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con link a todas las notificaciones -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <a
          routerLink="/notifications"
          (click)="onClosePanel()"
          class="block w-full text-center text-sm text-primary-700 hover:text-primary-800 font-medium focus:outline-none focus:underline transition-colors duration-200">
          Ver todas las notificaciones
        </a>
      </div>
    </div>
  `,
    styles: []
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() notifications: Notification[] = [];
  @Output() closePanel = new EventEmitter<void>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<string>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escuchar eventos de teclado para cerrar con ESC
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }

  /**
   * Maneja eventos de teclado
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.onClosePanel();
    }
  }

  /**
   * Trackby function para optimizar rendimiento de la lista
   */
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  /**
   * Obtiene el número de notificaciones no leídas
   */
  getUnreadCount(): number {
    return this.notifications.filter(notification => !notification.read).length;
  }

  /**
   * Obtiene el tiempo relativo de una fecha
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }

    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Maneja el click en cerrar panel
   */
  onClosePanel(): void {
    this.closePanel.emit();
  }

  /**
   * Maneja el click en marcar todas como leídas
   */
  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  /**
   * Maneja el click en marcar una notificación como leída
   */
  onMarkAsRead(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.markAsRead.emit(notificationId);
  }

  /**
   * Maneja el click en una notificación
   */
  onNotificationClick(notification: Notification): void {
    // Marcar como leída si no lo está
    if (!notification.read) {
      this.onMarkAsRead(notification.id, new Event('click'));
    }

    // Navegar si tiene URL de acción
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.onClosePanel();
    }
  }

  /**
   * Maneja el click en el botón de acción
   */
  onActionClick(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.onClosePanel();
    }
  }
}
