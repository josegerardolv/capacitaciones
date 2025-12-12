import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private notificationId = 0;

  constructor() {
    // Crear algunas notificaciones de prueba para desarrollo
    this.createSampleNotifications();
  }

  /**
   * Crear notificaciones de prueba para desarrollo
   */
  private createSampleNotifications(): void {
    const sampleNotifications: Notification[] = [
      {
        id: 'notification_1',
        type: 'info',
        title: 'Nuevo ticket asignado',
        message: 'Se te ha asignado el ticket #TK-2024-001 sobre problemas de conectividad.',
        duration: 0, // Permanente
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        read: false
      },
      {
        id: 'notification_2',
        type: 'success',
        title: 'Ticket resuelto',
        message: 'El ticket #TK-2024-002 ha sido marcado como resuelto exitosamente.',
        duration: 0,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
        read: false
      },
      {
        id: 'notification_3',
        type: 'warning',
        title: 'Ticket próximo a vencer',
        message: 'El ticket #TK-2024-003 vencerá en 2 horas. Se requiere atención urgente.',
        duration: 0,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // Hace 4 horas
        read: true
      },
      {
        id: 'notification_4',
        type: 'error',
        title: 'Sistema de respaldo falló',
        message: 'El sistema de respaldo automático falló anoche. Se requiere intervención inmediata.',
        duration: 0,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // Hace 12 horas
        read: false
      },
      {
        id: 'notification_5',
        type: 'info',
        title: 'Mantenimiento programado',
        message: 'Se realizará mantenimiento del servidor el próximo domingo de 2:00 AM a 6:00 AM.',
        duration: 0,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
        read: true
      }
    ];

    this.notificationsSubject.next(sampleNotifications);
  }

  /**
   * Mostrar notificación de éxito
   */
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: new Date(),
      read: false
    });
  }

  /**
   * Mostrar notificación de error
   */
  showError(title: string, message: string, duration: number = 8000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: new Date(),
      read: false
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  showWarning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: new Date(),
      read: false
    });
  }

  /**
   * Mostrar notificación de información
   */
  showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: new Date(),
      read: false
    });
  }

  /**
   * Agregar notificación
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-remover después del tiempo especificado
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Remover notificación
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  /**
   * Generar ID único para notificación
   */
  private generateId(): string {
    return `notification_${++this.notificationId}_${Date.now()}`;
  }

  /**
   * Obtener notificaciones actuales
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  /**
   * Obtener actualizaciones de notificaciones en tiempo real
   */
  getNotificationUpdates(): Observable<Notification> {
    // Para implementar más tarde con WebSockets
    // Por ahora retornamos un observable vacío
    return new Observable<Notification>(subscriber => {
      // Implementación temporal para desarrollo
    });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<void> {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      ({ ...notification, read: true })
    );
    this.notificationsSubject.next(updatedNotifications);
    
    return new Observable<void>(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Marcar notificación como leída (versión Observable)
   */
  markAsRead(id: string): Observable<void> {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    this.notificationsSubject.next(updatedNotifications);
    
    return new Observable<void>(subscriber => {
      subscriber.next();
      subscriber.complete();
    });
  }
}
