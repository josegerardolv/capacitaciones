import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-component-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="component-loader" [ngClass]="containerClass">
      <div class="loader-content" [ngClass]="contentClass">
        <!-- Skeleton loader for component -->
        <div *ngIf="type === 'skeleton'" class="skeleton-loader">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-text"></div>
          <div class="skeleton-line skeleton-text short"></div>
        </div>
        
        <!-- Spinner loader -->
        <div *ngIf="type === 'spinner'" class="spinner-loader">
          <div class="spinner"></div>
          <p *ngIf="message" class="loading-message">{{ message }}</p>
        </div>
        
        <!-- Calendar skeleton -->
        <div *ngIf="type === 'calendar'" class="calendar-skeleton">
          <div class="skeleton-header">
            <div class="skeleton-nav"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-nav"></div>
          </div>
          <div class="skeleton-weekdays">
            <div *ngFor="let day of [1,2,3,4,5,6,7]" class="skeleton-weekday"></div>
          </div>
          <div class="skeleton-days">
            <div *ngFor="let day of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]" 
                 class="skeleton-day"></div>
          </div>
        </div>
        
        <!-- Select skeleton -->
        <div *ngIf="type === 'select'" class="select-skeleton">
          <div class="skeleton-select-field"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .component-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      width: 100%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      position: relative;
    }

    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    /* Skeleton Loader */
    .skeleton-loader {
      width: 100%;
      max-width: 300px;
    }

    .skeleton-line {
      height: 12px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .skeleton-title {
      height: 20px;
      width: 60%;
    }

    .skeleton-text {
      width: 100%;
    }

    .skeleton-text.short {
      width: 75%;
    }

    /* Spinner Loader */
    .spinner-loader {
      text-align: center;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--institucional-secundario-light, #E85AA0);
      border-top: 3px solid var(--institucional-primario, #8B1538);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    .loading-message {
      margin-top: 12px;
      color: var(--gray-600, #6b7280);
      font-size: 14px;
      font-weight: 500;
    }

    /* Calendar Skeleton */
    .calendar-skeleton {
      width: 280px;
      padding: 16px;
    }

    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .skeleton-nav {
      width: 32px;
      height: 32px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 6px;
    }

    .skeleton-title {
      width: 120px;
      height: 24px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 6px;
    }

    .skeleton-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    }

    .skeleton-weekday {
      height: 20px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .skeleton-day {
      width: 32px;
      height: 32px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 6px;
    }

    /* Select Skeleton */
    .select-skeleton {
      width: 200px;
    }

    .skeleton-select-field {
      height: 40px;
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    /* Animations */
    @keyframes skeleton-loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .calendar-skeleton {
        width: 260px;
        padding: 12px;
      }
      
      .skeleton-day {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class ComponentLoaderComponent {
  @Input() isLoading = true;
  @Input() type: 'skeleton' | 'spinner' | 'calendar' | 'select' = 'skeleton';
  @Input() message?: string;
  @Input() containerClass?: string;
  @Input() contentClass?: string;
}