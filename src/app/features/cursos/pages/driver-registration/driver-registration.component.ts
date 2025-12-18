import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DriverFormComponent } from '../../components/driver-form/driver-form.component';

@Component({
    selector: 'app-driver-registration',
    standalone: true,
    imports: [CommonModule, RouterModule, DriverFormComponent],
    templateUrl: './driver-registration.component.html'
})
export class DriverRegistrationComponent implements OnInit {
    groupId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.groupId = this.route.snapshot.paramMap.get('id');
    }

    onDriverSaved(driverData: any) {
        console.log('Driver Saved (Admin):', driverData);
        // TODO: Call backend service to save
        alert('Conductor registrado exitosamente (Simulación)');
        this.router.navigate(['../../'], { relativeTo: this.route });
    }

    onCancel() {
        this.router.navigate(['../../'], { relativeTo: this.route });
    }
}
