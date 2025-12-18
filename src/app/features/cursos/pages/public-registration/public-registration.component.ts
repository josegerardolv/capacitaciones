import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverFormComponent } from '../../components/driver-form/driver-form.component';

@Component({
    selector: 'app-public-registration',
    standalone: true,
    imports: [CommonModule, DriverFormComponent],
    templateUrl: './public-registration.component.html'
})
export class PublicRegistrationComponent implements OnInit {

    // Datos del Grupo (Simulados por ahora, luego vendrán del backend usando el ID de la URL)
    groupInfo = {
        courseName: 'Manejo Defensivo',
        groupName: 'Grupo A05',
        slotsAvailable: 5,
        deadline: '20 Oct 2025'
    };

    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        const groupId = this.route.snapshot.paramMap.get('id');
        // Aquí llamaríamos al servicio: this.groupsService.getPublicGroupInfo(groupId)...
        console.log('Cargando información pública para el grupo:', groupId);
    }

    onDriverRegistered(driverData: any) {
        console.log('Solicitud de registro pública:', driverData);
        alert('¡Solicitud enviada con éxito! Revisa tu correo para más instrucciones.');
        // Aquí podrías redirigir a una página de "Gracias"
    }
}
