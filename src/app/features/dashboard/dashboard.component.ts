import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { MetricCardComponent, MetricCardData } from '../../shared/components/metric-card/metric-card.component';
import { Subscription, interval } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../shared/components/institutional-table/institutional-table.component';
import { GroupsService } from '../cursos/services/groups.service';
import { DashboardService } from './services/dashboard.service';
import { Group } from '../../core/models/group.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MetricCardComponent, InstitutionalTableComponent],
    templateUrl: './dashboard.component.html',
    styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {
    user: User | null = null;
    @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
    @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;

    private timerSubscription!: Subscription;
    timeString: string = '';
    dateString: string = '';

    // Definimos los datos aquí para mantener el HTML limpio
    graduationMetric!: MetricCardData;
    personMetric!: MetricCardData;
    finishMetric!: MetricCardData;
    calendarMetric!: MetricCardData;

    // Configuración de la tabla
    upcomingCourses: any[] = [];
    tableColumns: TableColumn[] = [];
    tableConfig: TableConfig = {
        loading: false,
        striped: true,
        hoverable: true,
        localSort: true
    };

    constructor(
        private authService: AuthService,
        private sanitizer: DomSanitizer,
        private groupsService: GroupsService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.startClock();
        this.initMetrics();
        this.initTableData();
        this.loadStatistics();
    }

    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    private startClock() {
        const updateTime = () => {
            const now = new Date();
            this.timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
            this.dateString = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        };

        updateTime(); // Llamada inicial
        this.timerSubscription = interval(1000).subscribe(updateTime);
    }

    private initMetrics() {
        this.graduationMetric = {
            title: 'Cursos Creados',
            value: '0',
            subtitle: 'Cursos creados',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>') as any,
            color: 'guinda'
        };

        this.personMetric = {
            title: 'Participantes Aceptados',
            value: '0',
            subtitle: 'Personas aceptadas',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>') as any,
            color: 'guinda'
        };

        this.finishMetric = {
            title: 'Índice de Aprobación',
            value: '0%',
            subtitle: 'Aprobación',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>') as any,
            color: 'guinda',
            progress: {
                percentage: 0,
                label: 'Aprobación Promedio'
            }
        };

        this.calendarMetric = {
            title: 'Grupos Próximos',
            value: '0',
            subtitle: 'Grupos activos',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>') as any,
            color: 'guinda'
        };
    }

    private loadStatistics() {
        this.dashboardService.getDashboardStatistics().subscribe({
            next: (stats) => {
                this.graduationMetric = { ...this.graduationMetric, value: stats.coursesCreatedCurrentYear.toString() };
                this.personMetric = { ...this.personMetric, value: stats.acceptedEnrollmentsTotal.toLocaleString() };

                const parsedRate = isNaN(stats.enrollmentApprovalRate) ? 0 : Number(stats.enrollmentApprovalRate).toFixed(1);
                this.finishMetric = {
                    ...this.finishMetric,
                    value: `${parsedRate}%`,
                    progress: {
                        percentage: Number(parsedRate),
                        label: 'Porcentaje de aprobación'
                    }
                };

                this.calendarMetric = { ...this.calendarMetric, value: stats.activeUpcomingGroups.toString() };
            },
            error: (err) => {
                console.error('Error fetching dashboard statistics:', err);
            }
        });
    }

    getDynamicGroupStatus(group: Group): { text: string, type: 'success' | 'warning' | 'danger' | 'info' | 'neutral' } {
        if (!group.groupStartDate) return { text: 'Sin fecha', type: 'neutral' };

        // 1. Obtener "Hoy" a medianoche local
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 2. Obtener "Fecha del Curso" a medianoche local (forzando parseo local si es string ISO)
        let rawDate = group.groupStartDate;
        let d: Date;
        
        if (typeof rawDate === 'string') {
            const datePart = rawDate.split('T')[0]; // Extraer YYYY-MM-DD
            const [y, m, day] = datePart.split('-').map(Number);
            d = new Date(y, m - 1, day);
        } else {
            d = new Date(rawDate);
        }
        
        const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        // 3. Comparación por días de calendario
        const diffTime = startDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Finalizado', type: 'neutral' }; // Gris
        }
        
        if (diffDays === 0) {
            return { text: 'En curso', type: 'info' }; // Azul
        }

        if (diffDays === 1) {
            return { text: 'Inicia mañana', type: 'warning' }; // Amarillo
        }

        if (diffDays <= 3) {
            return { text: `Inicia en ${diffDays} días`, type: 'warning' };
        }

        return { text: 'Abierto', type: 'success' }; // Verde
    }

    private initTableData() {
        this.tableColumns = [
            { key: 'group', label: 'Grupo', sortable: true, minWidth: '100px' },
            { key: 'course', label: 'Curso', sortable: true, minWidth: '100px' },
            { key: 'location', label: 'Ubicación', sortable: true },
            { key: 'participants', label: 'Cantidad', sortable: true },
            { key: 'date', label: 'Fecha', sortable: true, template: this.dateTemplate },
            { key: 'time', label: 'Hora' },
            { key: 'status.text', label: 'Estatus', sortable: true, template: this.statusTemplate }
        ];

        this.tableConfig.loading = true;
        
        // El backend maneja el filtrado de 'incoming' y el ordenamiento.
        this.groupsService.getGroups(1, 10, '', undefined, true).subscribe({
            next: (response) => {
                let groups: Group[] = [];
                if (Array.isArray(response)) {
                    groups = response;
                } else if (response.data && Array.isArray(response.data)) {
                    groups = response.data;
                } else if (response.items && Array.isArray(response.items)) {
                    groups = response.items;
                }

                // 2. Filtrado (No mostrar finalizados) y Ordenamiento (Cercanos a vencer primero)
                groups = groups.filter(g => this.getDynamicGroupStatus(g).text !== 'Finalizado');
                
                groups.sort((a, b) => {
                    if (a.endInscriptionDate && b.endInscriptionDate) {
                        return new Date(a.endInscriptionDate).getTime() - new Date(b.endInscriptionDate).getTime();
                    }
                    if (a.endInscriptionDate) return -1;
                    if (b.endInscriptionDate) return 1;
                    if (a.groupStartDate && b.groupStartDate) {
                        return new Date(a.groupStartDate).getTime() - new Date(b.groupStartDate).getTime();
                    }
                    return 0;
                });

                // 3. Mapeo para Tabla (Solo 10 más recientes)
                this.upcomingCourses = groups.map((g: Group) => {
                    const courseName = (g.course && typeof g.course === 'object') 
                        ? (g.course.name || 'Sin nombre') 
                        : 'Curso no encontrado';

                    return {
                        course: this.toTitleCase(courseName),
                        group: this.toTitleCase(g.name),
                        location: this.toTitleCase(g.location),
                        participants: g.limitStudents,
                        date: g.groupStartDate,
                        time: g.schedule,
                        status: this.getDynamicGroupStatus(g)
                    };
                }).slice(0, 10);
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error cargando cursos entrantes en dashboard', err);
                this.tableConfig.loading = false;
            }
        });
    }

    // Helper para Capitalizar cada palabra (Title Case)
    private toTitleCase(str: string | undefined | null): string {
        if (!str) return '';
        return String(str).toLowerCase().split(' ').map(word => 
            word ? word.charAt(0).toUpperCase() + word.slice(1) : ''
        ).join(' ');
    }
}
