import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div *ngFor="let notification of notifications"
           class="bg-white rounded-lg shadow-lg p-4 border-l-4 flex items-start space-x-3 transform transition-all duration-300 ease-in-out opacity-100 translate-x-0"
           [class.border-green-500]="notification.type === 'success'"
           [class.border-red-500]="notification.type === 'error'"
           [class.border-yellow-500]="notification.type === 'warning'"
           [class.border-blue-500]="notification.type === 'info'">
        
        <!-- Icono según el tipo -->
        <div class="flex-shrink-0">
          <svg *ngIf="notification.type === 'success'" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="notification.type === 'error'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="notification.type === 'warning'" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <svg *ngIf="notification.type === 'info'" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-900 mb-1">{{ notification.title }}</h4>
          <p class="text-sm text-gray-600">{{ notification.message }}</p>
          
          <!-- Barra de progreso para notificaciones con duración -->
          <div *ngIf="notification.duration && notification.duration > 0" 
               class="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
            <div class="bg-blue-500 h-1 rounded-full animate-shrink" 
                 [style.animation-duration.ms]="notification.duration"></div>
          </div>
        </div>

        <button (click)="dismiss(notification.id)" 
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 transition-colors duration-200">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-shrink {
      animation: shrink linear forwards;
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.getActiveNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  executeAction(notification: Notification): void {
    if (notification.action) {
      notification.action.callback();
      this.dismiss(notification.id);
    }
  }

  trackNotification(index: number, notification: Notification): string {
    return notification.id;
  }
}
