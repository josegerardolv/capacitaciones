import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  component?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentLoadingService {
  private loadingStates = new Map<string, LoadingState>();
  private globalLoadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observa el estado de carga global
   */
  get globalLoading$(): Observable<boolean> {
    return this.globalLoadingSubject.asObservable();
  }

  /**
   * Establece el estado de carga para un componente específico
   */
  setLoading(componentId: string, isLoading: boolean, message?: string): void {
    if (isLoading) {
      this.loadingStates.set(componentId, {
        isLoading: true,
        component: componentId,
        message
      });
    } else {
      this.loadingStates.delete(componentId);
    }
    
    // Actualizar estado global
    this.updateGlobalLoading();
  }

  /**
   * Obtiene el estado de carga de un componente específico
   */
  getComponentLoading(componentId: string): boolean {
    return this.loadingStates.get(componentId)?.isLoading || false;
  }

  /**
   * Obtiene todos los estados de carga activos
   */
  getActiveLoadingStates(): LoadingState[] {
    return Array.from(this.loadingStates.values());
  }

  /**
   * Limpia todos los estados de carga
   */
  clearAll(): void {
    this.loadingStates.clear();
    this.updateGlobalLoading();
  }

  /**
   * Helper para simular inicialización con delay
   */
  simulateInitialization(componentId: string, delay: number = 100): Promise<void> {
    this.setLoading(componentId, true, 'Inicializando componente...');
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.setLoading(componentId, false);
        resolve();
      }, delay);
    });
  }

  private updateGlobalLoading(): void {
    const hasAnyLoading = this.loadingStates.size > 0;
    this.globalLoadingSubject.next(hasAnyLoading);
  }
}