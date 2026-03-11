import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardStatisticsResponseDto {
    coursesCreatedCurrentYear: number;
    acceptedEnrollmentsTotal: number;
    activeUpcomingGroups: number;
    enrollmentApprovalRate: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/statistics/dashboard`;

    constructor(private http: HttpClient) { }

    getDashboardStatistics(): Observable<DashboardStatisticsResponseDto> {
        return this.http.get<DashboardStatisticsResponseDto>(this.apiUrl);
    }
}
