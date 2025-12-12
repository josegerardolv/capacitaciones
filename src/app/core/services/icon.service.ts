import { Injectable } from '@angular/core';
import { IconType, ICON_MAPPINGS, getIconName, hasIconMapping, convertIcon } from '../../shared/utils/icon-utils';

/**
 * Servicio para gestión centralizada de iconos
 * Permite configurar globalmente el tipo de iconos preferido y realizar conversiones
 */
@Injectable({
  providedIn: 'root'
})
export class IconService {
  private _defaultIconType: IconType = 'bootstrap';
  private _enableAutoConversion = true;

  /**
   * Establece el tipo de icono por defecto para toda la aplicación
   */
  setDefaultIconType(type: IconType): void {
    this._defaultIconType = type;
  }

  /**
   * Obtiene el tipo de icono por defecto
   */
  getDefaultIconType(): IconType {
    return this._defaultIconType;
  }

  /**
   * Habilita o deshabilita la conversión automática de iconos
   */
  setAutoConversion(enabled: boolean): void {
    this._enableAutoConversion = enabled;
  }

  /**
   * Obtiene el icono apropiado basado en la configuración del servicio
   */
  getIcon(iconName: string, preferredType?: IconType): { name: string; type: IconType } {
    const targetType = preferredType || this._defaultIconType;
    
    // Si la auto-conversión está habilitada, intentar convertir
    if (this._enableAutoConversion && hasIconMapping(iconName)) {
      return {
        name: getIconName(iconName, targetType),
        type: targetType
      };
    }
    
    // Si no hay mapeo o la auto-conversión está deshabilitada, usar el icono tal como viene
    return {
      name: iconName,
      type: targetType
    };
  }

  /**
   * Convierte un icono de un tipo a otro
   */
  convertIcon(iconName: string, fromType: IconType, toType: IconType): string {
    return convertIcon(iconName, fromType, toType);
  }

  /**
   * Verifica si un icono tiene mapeo disponible
   */
  hasMapping(iconName: string): boolean {
    return hasIconMapping(iconName);
  }

  /**
   * Obtiene información completa del icono incluyendo alternativas
   */
  getIconInfo(iconName: string): {
    original: string;
    bootstrap: string;
    material: string;
    hasMapping: boolean;
  } {
    const hasMap = hasIconMapping(iconName);
    
    return {
      original: iconName,
      bootstrap: hasMap ? getIconName(iconName, 'bootstrap') : iconName,
      material: hasMap ? getIconName(iconName, 'material') : iconName,
      hasMapping: hasMap
    };
  }

  /**
   * Configuración de iconos para diferentes contextos de la aplicación
   */
  getContextualIcon(context: 'navigation' | 'action' | 'status', iconName: string): { name: string; type: IconType; size: number } {
    const contextConfig = {
      navigation: { type: 'material' as IconType, size: 24 },
      action: { type: 'bootstrap' as IconType, size: 16 },
      status: { type: 'material' as IconType, size: 20 }
    };

    const config = contextConfig[context];
    const icon = this.getIcon(iconName, config.type);

    return {
      name: icon.name,
      type: icon.type,
      size: config.size
    };
  }
}
