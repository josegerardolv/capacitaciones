import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';
import { MetricCardComponent, MetricCardData } from '../../shared/components/metric-card/metric-card.component';
import { Subscription, interval, forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { InstitutionalTableComponent, TableColumn, TableConfig } from '../../shared/components/institutional-table/institutional-table.component';
import { GroupsService } from '../cursos/services/groups.service';
import { CoursesService } from '../cursos/services/courses.service';

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
        private coursesService: CoursesService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getCurrentUser();
        this.startClock();
        this.initMetrics();
        this.initTableData();
    }

    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    private startClock() {
        const updateTime = () => {
            const now = new Date();
            this.timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            this.dateString = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        };

        updateTime(); // Llamada inicial
        this.timerSubscription = interval(1000).subscribe(updateTime);
    }

    private initMetrics() {
        this.graduationMetric = {
            title: 'Cursos impartidos',
            value: '125',
            subtitle: 'Cursos impartidos',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>') as any,
            color: 'guinda'
        };

        this.personMetric = {
            title: 'Total de participantes',
            value: '1,284',
            subtitle: 'Total de participantes',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>') as any,
            color: 'guinda'
        };

        this.finishMetric = {
            title: 'Porcentaje de aprobación',
            value: '82%',
            subtitle: 'Porcentaje de aprobación',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>') as any,
            color: 'guinda',
            progress: {
                percentage: 82,
                label: 'Porcentaeje de aprobación'
            }
        };

        this.calendarMetric = {
            title: 'Grupos activos actualmente',
            value: '18',
            subtitle: 'Grupos activos actualmente',
            icon: this.sanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>') as any,
            color: 'guinda'
        };
    }

    private initTableData() {
        this.tableColumns = [
            { key: 'course', label: 'Curso', sortable: true, minWidth: '100px' },
            { key: 'group', label: 'Grupo', sortable: true, minWidth: '100px' },
            { key: 'location', label: 'Ubicación', sortable: true },
            { key: 'participants', label: 'Cantidad', sortable: true },
            { key: 'date', label: 'Fecha', sortable: true },
            { key: 'time', label: 'Hora' },
            { key: 'status', label: 'Estatus', template: this.statusTemplate }
        ];

        // Cargar datos reales desde el servicio
        this.tableConfig.loading = true;
        forkJoin({
            groups: this.groupsService.getGroups(),
            courses: this.coursesService.getCourses()
        }).subscribe({
            next: ({ groups, courses }) => {
                console.log('Datos cargados en Dashboard:', { groups, courses });

                // Actualizar métrica de grupos activos con el total real obtenido
                this.calendarMetric = { ...this.calendarMetric, value: groups.length.toString() };

                // Actualizar métrica de cursos impartidos (Total de cursos en catálogo)
                this.graduationMetric = { ...this.graduationMetric, value: courses.length.toString() };

                // Actualizar métrica de participantes (Suma de cupos/participantes de todos los grupos)
                const totalParticipants = groups.reduce((sum, g) => sum + (Number((g as any).limitStudents) || 0), 0);
                this.personMetric = { ...this.personMetric, value: totalParticipants.toLocaleString() };

                // Mapeamos los cursos al formato de la tabla del dashboard
                // Nota: Usamos datos simulados para campos que aún no vienen en el modelo Course (como grupo o ubicación)
                this.upcomingCourses = groups.map(g => {
                    const dateTimeParts = g.dateTime ? g.dateTime.split(',') : [''];
                    
                    // Lógica robusta para encontrar el nombre del curso (soporta anidado, camelCase y snake_case)
                    const gAny = g as any;
                    let courseName = 'Curso no encontrado';

                    if (gAny.course && gAny.course.name) {
                        courseName = gAny.course.name;
                    } else {
                        const courseId = gAny.courseId || gAny.course_id || gAny.id_course;
                        const found = courses.find(c => c.id == courseId);
                        if (found) courseName = found.name;
                    }

                    return {
                        course: courseName,
                        group: g.name,
                        location: g.location,
                        participants: g.limitStudents,
                        date: dateTimeParts[0].trim(),
                        time: dateTimeParts[1] ? dateTimeParts[1].trim() : '',
                        status: g.status
                    };
                }).slice(0, 5); // Mostramos solo los 5 más recientes
                this.tableConfig.loading = false;
            },
            error: (err) => {
                console.error('Error cargando cursos en dashboard', err);
                this.tableConfig.loading = false;
            }
        });
    }
}
