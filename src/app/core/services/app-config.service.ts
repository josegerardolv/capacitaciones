import { Injectable } from '@angular/core';

export interface AppConfig {
  title: string;
  subtitle?: string;
  logo?: string;
  logoLogin?: string;
  footerLogo?: string;
  orgName?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  navScheduleLabel?: string;
  navValidateLabel?: string;
  footerCopyrightTemplate?: string;
  footerTagline?: string;
  version?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: AppConfig = {
    title: 'Sistema de Capacitaciones', // TODO: Cambiar por el nombre del sistema
    subtitle: 'SEMOVI Oaxaca',
    logo: 'assets/images/icons/icon-capacitaciones.svg', 
    footerLogo: 'assets/images/icons/logo-semovi-principal.svg',
    logoLogin: 'assets/images/icons/icon-capacitaciones.svg',
    orgName: 'Secretaría de Movilidad, Gobierno del Estado de Oaxaca',
    headerTitle: 'SEMOVI Oaxaca',
    headerSubtitle: 'Sistema de Capacitaciones', // TODO: Cambiar por el nombre del sistema
    navScheduleLabel: 'Agendar',
    navValidateLabel: 'Validar',
    footerCopyrightTemplate: '© {{year}} {{org}}. Todos los derechos reservados.',
    footerTagline: 'Sistema de Capacitaciones', // TODO: Cambiar por el nombre del sistema
    version: '1.0.0'
  };

  constructor() { }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  set(config: Partial<AppConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
