import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarjetones-list',
  template: `<!-- Componente obsoleto: redirigiendo a templates -->`,
})
export class TarjetonesListComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    // Redirigir a la lista de templates
    this.router.navigate(['/documentos/templates']);
  }
}
