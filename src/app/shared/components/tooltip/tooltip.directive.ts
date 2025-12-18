import { Directive, ElementRef, HostListener, Input, ComponentRef, ViewContainerRef, ApplicationRef, Injector, createComponent } from '@angular/core';
import { TooltipComponent, TooltipItem } from './tooltip.component';

@Directive({
    selector: '[appTooltip]',
    standalone: true
})
export class TooltipDirective {
    @Input('appTooltip') tooltipText: string = '';
    @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    private componentRef: ComponentRef<TooltipComponent> | null = null;
    private showTimeout: any;

    constructor(
        private elementRef: ElementRef,
        private appRef: ApplicationRef,
        private injector: Injector
    ) { }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        if (!this.tooltipText) return;

        this.showTimeout = setTimeout(() => {
            this.showTooltip();
        }, 200); // Pequeño delay para evitar parpadeos
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        clearTimeout(this.showTimeout);
        this.hideTooltip();
    }

    private showTooltip(): void {
        if (this.componentRef) return;

        // Crear el componente tooltip dinámicamente
        this.componentRef = createComponent(TooltipComponent, {
            environmentInjector: this.appRef.injector,
            elementInjector: this.injector
        });

        // Configurar Inputs
        const item: TooltipItem = { label: this.tooltipText };
        this.componentRef.instance.item = item;

        // Calcular Posición
        const { left, top } = this.calculatePosition();
        this.componentRef.instance.position = { x: left, y: top };
        this.componentRef.instance.visible = true;

        // Adjuntar al body para evitar problemas de z-index/clipping
        document.body.appendChild(this.componentRef.location.nativeElement);
        this.appRef.attachView(this.componentRef.hostView);
    }

    private hideTooltip(): void {
        if (!this.componentRef) return;

        this.appRef.detachView(this.componentRef.hostView);
        this.componentRef.destroy();
        this.componentRef = null;
    }

    private calculatePosition(): { left: number, top: number } {
        const el = this.elementRef.nativeElement.getBoundingClientRect();
        const tooltipHeight = 40; // Aproximado, el componente lo recalcula
        const tooltipWidth = 100; // Aproximado

        // Centro del elemento
        const centerX = el.left + el.width / 2;
        const centerY = el.top + el.height / 2;

        let left = 0;
        let top = 0;

        switch (this.tooltipPosition) {
            case 'top':
                left = centerX - (tooltipWidth / 2); // Ajuste fino lo hace el componente
                top = el.top - tooltipHeight;
                break;
            case 'bottom':
                left = centerX - (tooltipWidth / 2);
                top = el.bottom + 8;
                break;
            case 'left':
                left = el.left - tooltipWidth - 8;
                top = centerY - (tooltipHeight / 2);
                break;
            case 'right':
                left = el.right + 8;
                top = centerY - (tooltipHeight / 2);
                break;
        }

        // El componente TooltipComponent tiene lógica para ajustar si se sale de pantalla,
        // así que pasamos la posición deseada inicial.
        return { left, top };
    }

    ngOnDestroy(): void {
        this.hideTooltip();
    }
}
