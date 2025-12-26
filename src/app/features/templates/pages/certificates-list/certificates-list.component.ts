import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificates-list',
  template: `<!-- Componente obsoleto: redirigiendo a templates -->`,
})
export class CertificatesListComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    // Redirigir a la lista de templates
    this.router.navigate(['/documentos/templates']);
  }
}
