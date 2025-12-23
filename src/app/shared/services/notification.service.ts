import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  read?: boolean;     // New: For history
  visible?: boolean;  // New: For active toasts
  createdAt?: Date;   // New: For ordering
  action?: {
    label: string;
    callback: () => void;
  };
  actionUrl?: string; // Compatible with Panel
  actionText?: string; // Compatible with Panel
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor(private ngZone: NgZone) { }

  /**
   * Obtiene todas las notificaciones (History + Active)
   */
  getNotifications() {
    return this.notifications$.asObservable();
  }

  /**
   * Obtiene solo las notificaciones "vivas" para los Toasts
   */
  getActiveNotifications() {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.visible !== false))
    );
  }

  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
      read: false,
      visible: true,
      createdAt: new Date()
    };

    const currentNotifications = this.notifications$.value;
    // Add to top
    this.notifications$.next([newNotification, ...currentNotifications]);

    // Auto-dismiss (Hide from Toast, Keep in History)
    if (newNotification.duration && newNotification.duration > 0) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.dismiss(id);
          });
        }, newNotification.duration);
      });
    }

    return id;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration: duration ?? 8000 });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  /**
   * Oculta la notificación de la pantalla (Toast), pero la deja en el historial.
   */
  dismiss(id: string): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, visible: false } : n
    );
    this.notifications$.next(updatedNotifications);
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: string): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications$.next(updatedNotifications);
  }

  /**
   * Marca todas como leídas
   */
  markAllAsRead(): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.notifications$.next(updatedNotifications);
  }

  /**
   * Elimina completamente del historial
   */
  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  dismissAll(): void {
    // Hide all
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, visible: false }));
    this.notifications$.next(updatedNotifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }


}
