import { CanvasElement, PageConfig, TemplateVariable } from './template.model';

// Template embebido en el certificado
export interface EmbeddedTemplate {
    pageConfig: PageConfig;
    elements: CanvasElement[];
    variables: TemplateVariable[];
}

export interface Certificate {
    id: number;
    name: string;
    description: string;
    template: EmbeddedTemplate; // Template embebido único para este certificado
    createdAt?: string;
}

export interface Tarjeton {
    id: number;
    name: string;
    description: string;
    template: EmbeddedTemplate; // Template embebido único para este tarjetón
    createdAt?: string;
}
